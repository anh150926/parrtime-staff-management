package com.coffee.management.service;

import com.coffee.management.dto.payroll.PayrollResponse;
import com.coffee.management.dto.payroll.UpdatePayrollRequest;
import com.coffee.management.entity.*;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for payroll management operations
 */
@Service
@Transactional
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private AuditService auditService;

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
    
    // Cấu hình khấu trừ - có thể chuyển vào application.yml sau
    private static final BigDecimal LATE_PENALTY_PER_OCCURRENCE = new BigDecimal("10000"); // 10.000 VNĐ mỗi lần đi muộn
    private static final int LATE_THRESHOLD_MINUTES = 15; // Trễ > 15 phút tính là đi muộn
    private static final BigDecimal COMPLAINT_PENALTY = new BigDecimal("50000"); // 50.000 VNĐ mỗi khiếu nại xác nhận

    /**
     * Generate payroll for a month
     */
    public List<PayrollResponse> generatePayroll(String month, Long storeId, UserPrincipal currentUser) {
        YearMonth yearMonth = YearMonth.parse(month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<User> users;
        if (storeId != null) {
            // Manager can only generate for their store
            if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only generate payroll for your store");
            }
            users = userRepository.findByStoreIdAndRole(storeId, Role.STAFF);
        } else {
            // Only owner can generate for all stores
            if (!currentUser.getRole().equals("OWNER")) {
                throw new ForbiddenException("Only owner can generate payroll for all stores");
            }
            users = userRepository.findByRole(Role.STAFF);
        }

        return users.stream()
                .map(user -> generatePayrollForUser(user, month, startDate, endDate))
                .collect(Collectors.toList());
    }

    private PayrollResponse generatePayrollForUser(User user, String month, LocalDateTime startDate, LocalDateTime endDate) {
        // Check if payroll already exists
        Payroll existingPayroll = payrollRepository.findByUserIdAndMonth(user.getId(), month).orElse(null);
        
        // Calculate total minutes worked
        Long totalMinutes = timeLogRepository.sumDurationByUserAndDateRange(user.getId(), startDate, endDate);
        totalMinutes = totalMinutes != null ? totalMinutes : 0L;

        // Convert to hours
        BigDecimal totalHours = BigDecimal.valueOf(totalMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        // Calculate gross pay
        BigDecimal hourlyRate = user.getHourlyRate() != null ? user.getHourlyRate() : BigDecimal.ZERO;
        BigDecimal grossPay = totalHours.multiply(hourlyRate);

        // Calculate auto-deductions
        DeductionResult deductions = calculateAutoDeductions(user, startDate, endDate);

        Payroll payroll;
        if (existingPayroll != null) {
            // Update existing payroll if it's still draft
            if (existingPayroll.getStatus() != PayrollStatus.DRAFT) {
                return PayrollResponse.fromEntity(existingPayroll);
            }
            existingPayroll.setTotalHours(totalHours);
            existingPayroll.setGrossPay(grossPay);
            
            // Update adjustments with auto-deductions if no manual adjustment was made
            if (existingPayroll.getAdjustmentNote() == null || existingPayroll.getAdjustmentNote().isEmpty() ||
                existingPayroll.getAdjustmentNote().startsWith("[Tự động]")) {
                existingPayroll.setAdjustments(deductions.totalDeduction.negate());
                existingPayroll.setAdjustmentNote(deductions.note);
            }
            
            payroll = payrollRepository.save(existingPayroll);
        } else {
            payroll = Payroll.builder()
                    .user(user)
                    .month(month)
                    .totalHours(totalHours)
                    .grossPay(grossPay)
                    .adjustments(deductions.totalDeduction.negate())
                    .adjustmentNote(deductions.note)
                    .status(PayrollStatus.DRAFT)
                    .build();
            payroll = payrollRepository.save(payroll);
        }

        return PayrollResponse.fromEntity(payroll);
    }

    /**
     * Calculate auto-deductions from late check-ins and complaints
     */
    private DeductionResult calculateAutoDeductions(User user, LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal totalDeduction = BigDecimal.ZERO;
        List<String> deductionNotes = new ArrayList<>();

        // 1. Calculate late check-in penalties
        List<TimeLog> timeLogsWithShift = timeLogRepository.findByUserIdAndDateRangeWithShift(
                user.getId(), startDate, endDate);
        
        int lateCount = 0;
        for (TimeLog timeLog : timeLogsWithShift) {
            if (timeLog.getShift() != null && timeLog.getCheckIn() != null) {
                LocalDateTime shiftStart = timeLog.getShift().getStartDatetime();
                long minutesLate = ChronoUnit.MINUTES.between(shiftStart, timeLog.getCheckIn());
                
                if (minutesLate > LATE_THRESHOLD_MINUTES) {
                    lateCount++;
                }
            }
        }
        
        if (lateCount > 0) {
            BigDecimal latePenalty = LATE_PENALTY_PER_OCCURRENCE.multiply(BigDecimal.valueOf(lateCount));
            totalDeduction = totalDeduction.add(latePenalty);
            deductionNotes.add(String.format("Đi muộn %d lần (-%s)", lateCount, formatCurrency(latePenalty)));
        }

        // 2. Calculate complaint penalties
        long complaintCount = complaintRepository.countResolvedComplaintsAgainstUser(
                user.getId(), startDate, endDate);
        
        if (complaintCount > 0) {
            BigDecimal complaintPenalty = COMPLAINT_PENALTY.multiply(BigDecimal.valueOf(complaintCount));
            totalDeduction = totalDeduction.add(complaintPenalty);
            deductionNotes.add(String.format("Khiếu nại bị xác nhận %d vụ (-%s)", complaintCount, formatCurrency(complaintPenalty)));
        }

        // Build final note
        String finalNote = "";
        if (!deductionNotes.isEmpty()) {
            finalNote = "[Tự động] " + String.join("; ", deductionNotes);
        }

        return new DeductionResult(totalDeduction, finalNote);
    }

    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0f VNĐ", amount);
    }

    /**
     * Helper class to hold deduction calculation results
     */
    private static class DeductionResult {
        BigDecimal totalDeduction;
        String note;

        DeductionResult(BigDecimal totalDeduction, String note) {
            this.totalDeduction = totalDeduction;
            this.note = note;
        }
    }

    /**
     * Get payroll by user and month
     */
    public PayrollResponse getPayrollByUserAndMonth(Long userId, String month, UserPrincipal currentUser) {
        // Check permission
        if (!currentUser.getRole().equals("OWNER") && !currentUser.getRole().equals("MANAGER")) {
            if (!currentUser.getId().equals(userId)) {
                throw new ForbiddenException("You can only view your own payroll");
            }
        }

        Payroll payroll = payrollRepository.findByUserIdAndMonth(userId, month)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found for user " + userId + " and month " + month));

        return PayrollResponse.fromEntity(payroll);
    }

    /**
     * Get payrolls by store and month
     */
    public List<PayrollResponse> getPayrollsByStoreAndMonth(Long storeId, String month, UserPrincipal currentUser) {
        // Check permission
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only view payrolls from your store");
        }

        return payrollRepository.findByStoreAndMonth(storeId, month).stream()
                .map(PayrollResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get all payrolls by month
     */
    public List<PayrollResponse> getPayrollsByMonth(String month) {
        return payrollRepository.findByMonth(month).stream()
                .map(PayrollResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update payroll (adjustments, status)
     */
    public PayrollResponse updatePayroll(Long id, UpdatePayrollRequest request, UserPrincipal currentUser) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll", "id", id));

        // Only owner can approve payroll
        if (request.getStatus() != null && 
                (request.getStatus() == PayrollStatus.APPROVED || request.getStatus() == PayrollStatus.PAID)) {
            if (!currentUser.getRole().equals("OWNER")) {
                throw new ForbiddenException("Only owner can approve or mark payroll as paid");
            }
        }

        if (request.getAdjustments() != null) {
            payroll.setAdjustments(request.getAdjustments());
        }
        if (request.getAdjustmentNote() != null) {
            payroll.setAdjustmentNote(request.getAdjustmentNote());
        }
        if (request.getStatus() != null) {
            payroll.setStatus(request.getStatus());
        }

        Payroll updated = payrollRepository.save(payroll);

        if (request.getStatus() == PayrollStatus.APPROVED) {
            auditService.log(currentUser.getId(), "APPROVE", "PAYROLL", id,
                    "Approved payroll for user: " + payroll.getUser().getUsername() + " - " + payroll.getMonth());
        }

        if (request.getStatus() == PayrollStatus.PAID) {
            auditService.log(currentUser.getId(), "PAID", "PAYROLL", id,
                    "Marked payroll as paid for user: " + payroll.getUser().getUsername() + " - " + payroll.getMonth());
        }

        return PayrollResponse.fromEntity(updated);
    }

    /**
     * Get total payroll amount by month
     */
    public BigDecimal getTotalPayrollByMonth(String month) {
        BigDecimal total = payrollRepository.sumTotalPayByMonth(month);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get total payroll amount by store and month
     */
    public BigDecimal getTotalPayrollByStoreAndMonth(Long storeId, String month) {
        BigDecimal total = payrollRepository.sumTotalPayByStoreAndMonth(storeId, month);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get payroll history for a user (for staff to view their own payrolls)
     */
    public List<PayrollResponse> getPayrollHistoryForUser(Long userId, UserPrincipal currentUser) {
        // Staff can only view their own payroll history
        if (!currentUser.getRole().equals("OWNER") && !currentUser.getRole().equals("MANAGER")) {
            if (!currentUser.getId().equals(userId)) {
                throw new ForbiddenException("You can only view your own payroll history");
            }
        }

        return payrollRepository.findByUserId(userId).stream()
                .map(PayrollResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Batch approve payrolls
     */
    public List<PayrollResponse> batchApprovePayrolls(List<Long> ids, UserPrincipal currentUser) {
        if (!currentUser.getRole().equals("OWNER")) {
            throw new ForbiddenException("Only owner can approve payrolls");
        }

        List<PayrollResponse> results = new ArrayList<>();
        for (Long id : ids) {
            Payroll payroll = payrollRepository.findById(id).orElse(null);
            if (payroll != null && payroll.getStatus() == PayrollStatus.DRAFT) {
                payroll.setStatus(PayrollStatus.APPROVED);
                payrollRepository.save(payroll);
                auditService.log(currentUser.getId(), "APPROVE", "PAYROLL", id,
                        "Batch approved payroll for user: " + payroll.getUser().getUsername() + " - " + payroll.getMonth());
                results.add(PayrollResponse.fromEntity(payroll));
            }
        }
        return results;
    }

    /**
     * Batch mark payrolls as paid
     */
    public List<PayrollResponse> batchMarkPaid(List<Long> ids, UserPrincipal currentUser) {
        if (!currentUser.getRole().equals("OWNER")) {
            throw new ForbiddenException("Only owner can mark payrolls as paid");
        }

        List<PayrollResponse> results = new ArrayList<>();
        for (Long id : ids) {
            Payroll payroll = payrollRepository.findById(id).orElse(null);
            if (payroll != null && payroll.getStatus() == PayrollStatus.APPROVED) {
                payroll.setStatus(PayrollStatus.PAID);
                payrollRepository.save(payroll);
                auditService.log(currentUser.getId(), "PAID", "PAYROLL", id,
                        "Batch marked payroll as paid for user: " + payroll.getUser().getUsername() + " - " + payroll.getMonth());
                results.add(PayrollResponse.fromEntity(payroll));
            }
        }
        return results;
    }
}
