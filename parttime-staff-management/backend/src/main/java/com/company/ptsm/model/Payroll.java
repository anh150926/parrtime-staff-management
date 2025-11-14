package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payrolls", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "employee_id", "week_start_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(nullable = false)
    private LocalDate weekStartDate;
    @Column(nullable = false)
    private LocalDate weekEndDate;
    @Column(precision = 5, scale = 2)
    private BigDecimal totalBaseHours;
    @Column(precision = 5, scale = 2)
    private BigDecimal totalOvertimeHours;
    private Integer totalLateMinutes;
    private Integer totalEarlyLeaveMinutes;
    @Column(precision = 10, scale = 2)
    private BigDecimal basePay;
    @Column(precision = 10, scale = 2)
    private BigDecimal overtimePay;
    @Column(precision = 10, scale = 2)
    private BigDecimal penaltyAmount;
    @Column(precision = 10, scale = 2)
    private BigDecimal totalPay;
    @Column(nullable = false)
    private String status;
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = OffsetDateTime.now();
        if (status == null) {
            status = "CALCULATED";
        }
    }
}