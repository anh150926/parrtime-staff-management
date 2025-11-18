/*
 * file: backend/src/main/java/com/company/ptsm/model/PayrollAdjustment.java
 *
 * [MỚI]
 * Bảng Thưởng/Phạt (VAI TRÒ 2, Mục 5).
 * Dùng để ghi lại các khoản cộng (BONUS) hoặc trừ (PENALTY) vào lương.
 */
package com.company.ptsm.model;

import com.company.ptsm.model.enums.AdjustmentType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payroll_adjustments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết với phiếu lương (nếu có - sẽ được cập nhật khi chốt lương)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_id")
    private Payroll payroll;

    // Nhân viên được Thưởng/Phạt
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Manager nào đã tạo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    @Enumerated(EnumType.STRING) // Dùng Enum
    @Column(nullable = false)
    private AdjustmentType type; // 'BONUS' (Thưởng) hoặc 'PENALTY' (Phạt)

    @Column(nullable = false)
    private BigDecimal amount; // Số tiền

    @Column(nullable = false)
    private String reason; // "Làm vỡ ly", "Thưởng lễ"

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}