package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payroll_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String ruleName;

    @Column(precision = 5, scale = 2)
    private BigDecimal overtimeMultiplier;

    @Column(precision = 10, scale = 2)
    private BigDecimal latePenaltyPerMinute;

    @Column(precision = 10, scale = 2)
    private BigDecimal earlyLeavePenaltyPerMinute;

    @Column(precision = 4, scale = 2)
    private BigDecimal dailyOvertimeThresholdHours;
}