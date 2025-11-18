/*
 * file: backend/src/main/java/com/company/ptsm/model/Payroll.java
 *
 * [CẢI TIẾN]
 * Bảng Phiếu lương (VAI TRÒ 2, Mục 5).
 * Đã nâng cấp để tính lương theo Tháng (thay vì Tuần).
 * Hỗ trợ cả 2 loại lương (theo giờ cho Staff, cố định cho Manager).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "payrolls", uniqueConstraints = {
        // 1 nhân viên chỉ có 1 phiếu lương / tháng / năm
        @UniqueConstraint(columnNames = { "user_id", "month", "year" })
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
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int month; // (ví dụ: 11)

    @Column(nullable = false)
    private int year; // (ví dụ: 2025)

    // --- Dữ liệu tổng hợp ---
    @Column(precision = 10, scale = 2)
    private BigDecimal totalWorkHours; // Tổng giờ làm (cho Staff)

    private Integer totalLateMinutes; // Tổng phút đi muộn (cho Staff)

    // --- Dữ liệu tiền ---
    @Column(precision = 12, scale = 2)
    private BigDecimal basePay; // Lương cơ bản (cho Manager) HOẶC Lương theo giờ (cho Staff)

    @Column(precision = 12, scale = 2)
    private BigDecimal totalBonus; // Tổng Thưởng

    @Column(precision = 12, scale = 2)
    private BigDecimal totalPenalty; // Tổng Phạt

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal finalPay; // Lương cuối cùng (base + bonus - penalty)

    @Column(nullable = false)
    private String status; // 'PENDING' (Chờ chốt), 'CALCULATED' (Đã chốt), 'PAID' (Đã trả)

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // Liên kết 1-N với các khoản Thưởng/Phạt
    @OneToMany(mappedBy = "payroll")
    private Set<PayrollAdjustment> adjustments;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}