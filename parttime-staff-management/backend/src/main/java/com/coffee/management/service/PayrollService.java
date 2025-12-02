package com.coffee.management.service;

import com.coffee.management.dto.payroll.PayrollResponse;
import com.coffee.management.dto.payroll.UpdatePayrollRequest;
import com.coffee.management.entity.Payroll;
import com.coffee.management.entity.PayrollStatus;
import com.coffee.management.entity.Role;
import com.coffee.management.entity.User;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.PayrollRepository;
import com.coffee.management.repository.TimeLogRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
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
    private AuditService auditService;

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

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

        Payroll payroll;
        if (existingPayroll != null) {
            // Update existing payroll if it's still draft
            if (existingPayroll.getStatus() != PayrollStatus.DRAFT) {
                return PayrollResponse.fromEntity(existingPayroll);
            }
            existingPayroll.setTotalHours(totalHours);
            existingPayroll.setGrossPay(grossPay);
            payroll = payrollRepository.save(existingPayroll);
        } else {
            payroll = Payroll.builder()
                    .user(user)
                    .month(month)
                    .totalHours(totalHours)
                    .grossPay(grossPay)
                    .adjustments(BigDecimal.ZERO)
                    .status(PayrollStatus.DRAFT)
                    .build();
            payroll = payrollRepository.save(payroll);
        }

        return PayrollResponse.fromEntity(payroll);
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
}








