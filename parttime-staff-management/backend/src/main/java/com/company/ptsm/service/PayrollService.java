/*
 * file: backend/src/main/java/com/company/ptsm/service/PayrollService.java
 *
 * [CẢI TIẾN]
 * Service này thay thế PayrollService cũ.
 * Xử lý nghiệp vụ Tính Lương (cho cả 2 loại: Staff/Manager), Thưởng, Phạt.
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.payroll.PayrollAdjustmentDto;
import com.company.ptsm.dto.payroll.PayrollAdjustmentRequest;
import com.company.ptsm.dto.payroll.PayrollDto;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

        // Repositories
        private final PayrollRepository payrollRepository;
        private final PayrollAdjustmentRepository adjustmentRepository;
        private final WorkLogRepository workLogRepository;
        private final UserRepository userRepository;
        private final GlobalConfigRepository configRepository;
        private final AuditLogService auditLogService; // <-- [MỚI] Tiêm AuditLog

        /**
         * VAI TRÒ 2 (Manager): Tạo một khoản Thưởng hoặc Phạt.
         */
        @Transactional
        public PayrollAdjustmentDto createAdjustment(PayrollAdjustmentRequest request, User manager) {
                User staff = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhân viên."));

                if (staff.getBranch() == null || !staff.getBranch().getId().equals(manager.getBranch().getId())) {
                        throw new BusinessRuleException("Không có quyền tạo thưởng/phạt cho cơ sở khác.");
                }

                PayrollAdjustment adjustment = PayrollAdjustment.builder()
                                .user(staff)
                                .manager(manager)
                                .type(request.getType())
                                .amount(request.getAmount())
                                .reason(request.getReason())
                                .build();

                PayrollAdjustment savedAdjustment = adjustmentRepository.save(adjustment);

                // Ghi lại lịch sử
                String details = String.format("Tạo %s: %s VNĐ cho NV (ID: %d). Lý do: %s",
                                request.getType().name(), request.getAmount(), request.getUserId(),
                                request.getReason());
                auditLogService.logAction(manager, "CREATE_ADJUSTMENT", "User_" + request.getUserId(), details);

                // Tính toán lại lương của tháng đó ngay lập tức
                LocalDate today = LocalDate.now();
                runPayrollCalculationForUser(staff, today.getMonthValue(), today.getYear());

                return mapToAdjustmentDto(savedAdjustment);
        }

        /**
         * VAI TRÒ 2 (Manager): Chạy tính lương cho TOÀN BỘ user
         * (cả Staff và Manager) trong cơ sở của Manager.
         */
        @Transactional
        public List<PayrollDto> runPayrollForBranch(int month, int year, User manager) {
                Integer branchId = manager.getBranch().getId();

                // Lấy tất cả user (cả Staff và Manager) tại cơ sở
                List<User> usersInBranch = userRepository.findByBranchIdAndRole(branchId, Role.ROLE_STAFF);
                usersInBranch.addAll(userRepository.findByBranchIdAndRole(branchId, Role.ROLE_MANAGER));

                List<Payroll> payrolls = usersInBranch.stream()
                                .map(user -> runPayrollCalculationForUser(user, month, year))
                                .collect(Collectors.toList());

                return payrolls.stream()
                                .map(this::mapToPayrollDto)
                                .collect(Collectors.toList());
        }

        /**
         * VAI TRÒ 2 (Manager): Xem bảng lương của cơ sở (sau khi đã tính).
         */
        @Transactional(readOnly = true)
        public List<PayrollDto> getPayrollForBranch(int month, int year, User manager) {
                List<Payroll> payrolls = payrollRepository
                                .findByBranchAndMonth(manager.getBranch().getId(), month, year);

                return payrolls.stream()
                                .map(this::mapToPayrollDto)
                                .collect(Collectors.toList());
        }

        /**
         * VAI TRÒ 3 (Staff): Xem phiếu lương của bản thân.
         */
        @Transactional(readOnly = true)
        public PayrollDto getMyPayroll(int month, int year, User staff) {
                Payroll payroll = payrollRepository.findByUserIdAndMonthAndYear(staff.getId(), month, year)
                                .orElseThrow(() -> new NotFoundException("Chưa có dữ liệu lương cho tháng này."));

                return mapToPayrollDto(payroll);
        }

        // --- HÀM NỘI BỘ (CORE LOGIC) ---

        /**
         * [LOGIC KẾT HỢP ĐỀ 1 & ĐỀ 2]
         * Hàm nội bộ: Tính lương cho 1 User (Staff hoặc Manager).
         */
        @Transactional
        public Payroll runPayrollCalculationForUser(User user, int month, int year) {

                // 1. Lấy TẤT CẢ Thưởng/Phạt trong tháng
                List<PayrollAdjustment> adjustments = adjustmentRepository
                                .findByUserIdAndMonthAndYear(user.getId(), month, year);

                BigDecimal totalBonus = adjustments.stream()
                                .filter(adj -> adj.getType() == com.company.ptsm.model.enums.AdjustmentType.BONUS)
                                .map(PayrollAdjustment::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalPenalty = adjustments.stream()
                                .filter(adj -> adj.getType() == com.company.ptsm.model.enums.AdjustmentType.PENALTY)
                                .map(PayrollAdjustment::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal basePay = BigDecimal.ZERO;
                BigDecimal totalHours = BigDecimal.ZERO;
                Integer totalLateMinutes = 0;

                // 2. [LOGIC PHÂN NHÁNH THEO VAI TRÒ]
                if (user.getRole() == Role.ROLE_STAFF) {
                        // === LOGIC CHO NHÂN VIÊN (Đề 1 - Lương theo giờ) ===

                        BigDecimal hourlyWage = new BigDecimal(
                                        configRepository.findByConfigKey("HOURLY_WAGE")
                                                        .orElseThrow(() -> new NotFoundException(
                                                                        "Cấu hình HOURLY_WAGE không tồn tại"))
                                                        .getConfigValue());

                        YearMonth yearMonth = YearMonth.of(year, month);
                        OffsetDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay()
                                        .atOffset(OffsetDateTime.now().getOffset());
                        OffsetDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59)
                                        .atOffset(OffsetDateTime.now().getOffset());

                        List<WorkLog> logs = workLogRepository
                                        .findByUserIdAndCheckInBetween(user.getId(), startOfMonth, endOfMonth);

                        totalHours = logs.stream()
                                        .map(WorkLog::getActualHours)
                                        .filter(java.util.Objects::nonNull)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        totalLateMinutes = logs.stream()
                                        .mapToInt(log -> log.getLateMinutes() != null ? log.getLateMinutes() : 0)
                                        .sum();

                        basePay = totalHours.multiply(hourlyWage);

                } else if (user.getRole() == Role.ROLE_MANAGER) {
                        // === LOGIC CHO QUẢN LÝ (Đề 2 - Lương cố định) ===

                        StaffProfile profile = user.getStaffProfile();
                        if (profile != null && profile.getBaseSalary() != null) {
                                basePay = profile.getBaseSalary();
                        } else {
                                basePay = BigDecimal.ZERO; // (Manager chưa được set lương)
                        }
                        // (Manager không chấm công, nên totalHours/totalLateMinutes = 0)
                }

                // 3. Tính lương cuối cùng (Chung cho cả 2 vai trò)
                BigDecimal finalPay = basePay.add(totalBonus).subtract(totalPenalty);

                // 4. Tìm hoặc Tạo Phiếu lương
                Payroll payroll = payrollRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                                .orElseGet(() -> Payroll.builder()
                                                .user(user)
                                                .month(month)
                                                .year(year)
                                                .build());

                // 5. Cập nhật dữ liệu
                payroll.setTotalWorkHours(totalHours);
                payroll.setTotalLateMinutes(totalLateMinutes);
                payroll.setBasePay(basePay);
                payroll.setTotalBonus(totalBonus);
                payroll.setTotalPenalty(totalPenalty);
                payroll.setFinalPay(finalPay);
                payroll.setStatus("CALCULATED"); // Đã tính
                payroll.setAdjustments(Set.copyOf(adjustments));

                return payrollRepository.save(payroll);
        }

        // --- HÀM TIỆN ÍCH (MAPPER) ---

        private PayrollDto mapToPayrollDto(Payroll payroll) {
                List<PayrollAdjustmentDto> adjustmentDtos = payroll.getAdjustments().stream()
                                .map(this::mapToAdjustmentDto)
                                .collect(Collectors.toList());

                String staffName = "N/A";
                String employeeCode = "N/A";
                if (payroll.getUser() != null && payroll.getUser().getStaffProfile() != null) {
                        staffName = payroll.getUser().getStaffProfile().getFullName();
                        employeeCode = payroll.getUser().getStaffProfile().getEmployeeCode();
                } else if (payroll.getUser() != null) {
                        staffName = payroll.getUser().getEmail();
                }

                return PayrollDto.builder()
                                .id(payroll.getId())
                                .userId(payroll.getUser().getId())
                                .staffName(staffName)
                                .employeeCode(employeeCode)
                                .month(payroll.getMonth())
                                .year(payroll.getYear())
                                .status(payroll.getStatus())
                                .totalWorkHours(payroll.getTotalWorkHours())
                                .totalLateMinutes(payroll.getTotalLateMinutes())
                                .basePay(payroll.getBasePay())
                                .totalBonus(payroll.getTotalBonus())
                                .totalPenalty(payroll.getTotalPenalty())
                                .finalPay(payroll.getFinalPay())
                                .adjustments(adjustmentDtos)
                                .build();
        }

        private PayrollAdjustmentDto mapToAdjustmentDto(PayrollAdjustment adj) {
                String managerName = "N/A";
                if (adj.getManager() != null && adj.getManager().getStaffProfile() != null) {
                        managerName = adj.getManager().getStaffProfile().getFullName();
                } else if (adj.getManager() != null) {
                        managerName = adj.getManager().getEmail(); // Dự phòng
                }

                return PayrollAdjustmentDto.builder()
                                .id(adj.getId())
                                .type(adj.getType())
                                .amount(adj.getAmount())
                                .reason(adj.getReason())
                                .createdAt(adj.getCreatedAt())
                                .managerName(managerName)
                                .build();
        }
}