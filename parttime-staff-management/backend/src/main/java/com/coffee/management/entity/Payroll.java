package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing monthly payroll records
 */
@Entity
@Table(name = "payrolls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 7)
    private String month; // Format: YYYY-MM

    @Column(name = "total_hours", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalHours = BigDecimal.ZERO;

    @Column(name = "gross_pay", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grossPay = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal adjustments = BigDecimal.ZERO;

    @Column(name = "adjustment_note")
    private String adjustmentNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PayrollStatus status = PayrollStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit getters for IDE recognition (Lombok @Getter also generates these)
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public BigDecimal getGrossPay() {
        return grossPay;
    }

    public BigDecimal getAdjustments() {
        return adjustments;
    }

    public String getAdjustmentNote() {
        return adjustmentNote;
    }

    public PayrollStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}








