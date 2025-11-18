/*
 * file: backend/src/main/java/com/company/ptsm/model/LeaveRequest.java
 *
 * [MỚI]
 * Bảng quản lý đơn xin nghỉ phép/ốm... (VAI TRÒ 2 & 3).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Nhân viên xin nghỉ
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private String reason; // "Nghỉ ốm", "Việc cá nhân"

    @Column(nullable = false)
    private String status; // 'PENDING', 'APPROVED', 'REJECTED'

    // Manager đã duyệt
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    private OffsetDateTime approvedAt;
}
