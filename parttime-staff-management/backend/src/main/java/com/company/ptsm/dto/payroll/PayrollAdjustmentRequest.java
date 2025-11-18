package com.company.ptsm.dto.payroll;

import com.company.ptsm.model.enums.AdjustmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PayrollAdjustmentRequest {
    @NotNull
    private Integer userId;
    @NotNull
    private AdjustmentType type;
    @NotNull
    @Min(value = 1)
    private BigDecimal amount;
    @NotEmpty
    private String reason;
}