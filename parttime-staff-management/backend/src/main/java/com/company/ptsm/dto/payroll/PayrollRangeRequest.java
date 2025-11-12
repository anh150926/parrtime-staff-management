package com.company.ptsm.dto.payroll;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PayrollRangeRequest {
    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}