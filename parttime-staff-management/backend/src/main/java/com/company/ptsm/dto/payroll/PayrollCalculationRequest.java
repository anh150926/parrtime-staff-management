package com.company.ptsm.dto.payroll;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayrollCalculationRequest {
    @NotNull
    @Min(1)
    @Max(12)
    private int month;
    @NotNull
    @Min(2020)
    private int year;
}