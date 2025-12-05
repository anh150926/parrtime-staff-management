package com.coffee.management.dto.payroll;

import com.coffee.management.entity.Payroll;
import com.coffee.management.entity.PayrollStatus;
import com.coffee.management.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Role userRole;
    private Long storeId;
    private String storeName;
    private String month;
    private BigDecimal totalHours;
    private BigDecimal hourlyRate;
    private BigDecimal grossPay;
    private BigDecimal adjustments;
    private String adjustmentNote;
    private BigDecimal netPay;
    private PayrollStatus status;
    private LocalDateTime createdAt;
    
    public static PayrollResponse fromEntity(Payroll payroll) {
        BigDecimal netPay = payroll.getGrossPay().add(payroll.getAdjustments() != null ? payroll.getAdjustments() : BigDecimal.ZERO);
        
        return PayrollResponse.builder()
                .id(payroll.getId())
                .userId(payroll.getUser().getId())
                .userName(payroll.getUser().getFullName())
                .userEmail(payroll.getUser().getEmail())
                .userRole(payroll.getUser().getRole())
                .storeId(payroll.getUser().getStore() != null ? payroll.getUser().getStore().getId() : null)
                .storeName(payroll.getUser().getStore() != null ? payroll.getUser().getStore().getName() : null)
                .month(payroll.getMonth())
                .totalHours(payroll.getTotalHours())
                .hourlyRate(payroll.getUser().getHourlyRate())
                .grossPay(payroll.getGrossPay())
                .adjustments(payroll.getAdjustments())
                .adjustmentNote(payroll.getAdjustmentNote())
                .netPay(netPay)
                .status(payroll.getStatus())
                .createdAt(payroll.getCreatedAt())
                .build();
    }
}








