/*
 * file: backend/src/main/java/com/company/ptsm/service/DashboardService.java
 *
 * [MỚI]
 * Service này chuyên tổng hợp dữ liệu cho 3 trang Dashboard.
 * Đây là Service "chỉ đọc" (Read-Only) phức tạp nhất.
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.dashboard.BranchPerformanceDto;
import com.company.ptsm.dto.dashboard.ManagerDashboardDto;
import com.company.ptsm.dto.dashboard.StaffDashboardDto;
import com.company.ptsm.dto.dashboard.SuperAdminDashboardDto;
import com.company.ptsm.dto.schedule.ScheduleAssignmentDto;
import com.company.ptsm.dto.schedule.ScheduleViewDto;
import com.company.ptsm.model.*;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Hầu hết các hàm là "chỉ đọc"
public class DashboardService {

    // Tiêm (Inject) RẤT NHIỀU Repository
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleAssignmentRepository assignmentRepository;
    private final ShiftMarketRepository shiftMarketRepository;
    private final ComplaintRepository complaintRepository;
    private final WorkLogRepository workLogRepository;
    private final PayrollRepository payrollRepository;

    // (Tiêm các Service khác để tái sử dụng hàm map DTO)
    private final RequestService requestService;
    private final ScheduleService scheduleService;

    /**
     * VAI TRÒ 3: Lấy dữ liệu Dashboard cho Nhân viên
     */
    public StaffDashboardDto getStaffDashboard(User staff) {
        LocalDate today = LocalDate.now();
        List<ScheduleAssignment> assignments = assignmentRepository
                .findByUserIdAndDateRange(staff.getId(), today, today.plusDays(7));

        Optional<ScheduleAssignment> upcoming = assignments.stream()
                .filter(a -> a.getSchedule().getScheduleDate().isAfter(LocalDate.now()) ||
                        (a.getSchedule().getScheduleDate().isEqual(LocalDate.now()) &&
                                a.getSchedule().getShiftTemplate().getStartTime().isAfter(LocalTime.now())))
                .findFirst();

        int pendingLeaves = leaveRequestRepository.findByUserId(staff.getId()).stream()
                .filter(l -> "PENDING".equals(l.getStatus())).toList().size();

        return StaffDashboardDto.builder()
                .upcomingShift(upcoming.map(scheduleService::mapToScheduleAssignmentDto).orElse(null))
                .pendingLeaveRequests(pendingLeaves)
                .pendingShiftMarketRequests(0) // (Tạm)
                .unreadAnnouncements(0) // (Tạm)
                .build();
    }

    /**
     * VAI TRÒ 2: Lấy dữ liệu Dashboard cho Quản lý
     */
    public ManagerDashboardDto getManagerDashboard(User manager) {
        Integer branchId = manager.getBranch().getId();
        LocalDate today = LocalDate.now();

        int pendingLeaves = leaveRequestRepository.findPendingRequestsByBranch(branchId).size();
        int pendingShifts = shiftMarketRepository.findClaimedShiftsByBranch(branchId).size();
        int pendingRegs = requestService.getPendingRegistrations(manager).size();
        int pendingComplaints = complaintRepository.findByBranchIdOrderByCreatedAtDesc(branchId).stream()
                .filter(c -> "SUBMITTED".equals(c.getStatus())).toList().size();

        int totalStaff = userRepository.findByBranchIdAndRole(branchId, Role.ROLE_STAFF).size();

        List<ScheduleViewDto> todaySchedules = scheduleRepository
                .findByBranchIdAndScheduleDateBetweenOrderByScheduleDateAsc(branchId, today, today)
                .stream()
                .map(scheduleService::mapToScheduleViewDto)
                .collect(Collectors.toList());

        return ManagerDashboardDto.builder()
                .pendingLeaveRequests(pendingLeaves)
                .pendingShiftMarket(pendingShifts)
                .pendingRegistrations(pendingRegs)
                .pendingComplaints(pendingComplaints)
                .totalStaff(totalStaff)
                .totalHoursThisWeek(0.0) // (Tạm)
                .attendanceRate(100.0) // (Tạm)
                .todaySchedules(todaySchedules)
                .unreadAnnouncements(0) // (Tạm)
                .build();
    }

    /**
     * VAI TRÒ 1: Lấy dữ liệu Dashboard cho Super Admin
     */
    public SuperAdminDashboardDto getSuperAdminDashboard(User superAdmin) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        OffsetDateTime startOfMonthOffset = startOfMonth.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfMonthOffset = endOfMonth.plusDays(1).atStartOfDay()
                .atOffset(OffsetDateTime.now().getOffset());

        List<Branch> branches = branchRepository.findAll();
        List<BranchPerformanceDto> performanceList = new ArrayList<>();

        BigDecimal totalPayroll = BigDecimal.ZERO;
        double totalHours = 0.0;

        for (Branch branch : branches) {
            int staffCount = userRepository.findByBranchIdAndRole(branch.getId(), Role.ROLE_STAFF).size();

            List<Payroll> payrolls = payrollRepository
                    .findByBranchAndMonth(branch.getId(), currentMonth.getMonthValue(), currentMonth.getYear());
            BigDecimal branchPayroll = payrolls.stream()
                    .map(Payroll::getFinalPay)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<WorkLog> logs = workLogRepository
                    .findByBranchIdAndCheckInBetweenOrderByCheckInDesc(branch.getId(), startOfMonthOffset,
                            endOfMonthOffset);
            double branchHours = logs.stream()
                    .mapToDouble(l -> l.getActualHours() != null ? l.getActualHours().doubleValue() : 0.0)
                    .sum();

            performanceList.add(BranchPerformanceDto.builder()
                    .branchId(branch.getId())
                    .branchName(branch.getName())
                    .staffCount(staffCount)
                    .payrollCost(branchPayroll)
                    .workHours(branchHours)
                    .attendanceRate(0.0) // (Tạm)
                    .build());

            totalPayroll = totalPayroll.add(branchPayroll);
            totalHours += branchHours;
        }

        int totalStaff = (int) userRepository.count();

        return SuperAdminDashboardDto.builder()
                .totalBranches(branches.size())
                .totalManagers(userRepository.findByRole(Role.ROLE_MANAGER).size())
                .totalStaff(totalStaff)
                .totalPayrollCostThisMonth(totalPayroll)
                .totalHoursThisMonth(totalHours)
                .branchPerformance(performanceList)
                .build();
    }
}