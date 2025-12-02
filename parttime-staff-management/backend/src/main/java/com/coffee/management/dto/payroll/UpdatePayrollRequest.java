package com.coffee.management.dto.payroll;

import com.coffee.management.entity.PayrollStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePayrollRequest {
    
    private BigDecimal adjustments;
    
    @Size(max = 500, message = "Adjustment note must not exceed 500 characters")
    private String adjustmentNote;
    
    private PayrollStatus status;
}








