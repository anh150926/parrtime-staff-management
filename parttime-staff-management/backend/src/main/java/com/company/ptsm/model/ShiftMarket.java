/*
 * file: backend/src/main/java/com/company/ptsm/model/ShiftMarket.java
 *
 * [MỚI]
 * Bảng "Chợ Ca" (VAI TRÒ 2 & 3).
 * Nơi nhân viên "bán" ca và "nhận" ca.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shift_market")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftMarket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết 1-1 với ca đã được phân công (ScheduleAssignment)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false, unique = true)
    private ScheduleAssignment assignment;

    // Người "bán" ca (người được gán ca gốc)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_user_id", nullable = false)
    private User offeringUser;

    // Người "nhận" ca
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claiming_user_id") // Nullable khi mới đăng bán
    private User claimingUser;

    @Column(nullable = false)
    private String status; // 'POSTED' (Đang bán), 'CLAIMED' (Chờ duyệt), 'APPROVED'

    // Manager đã duyệt
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;
}