/*
 * file: backend/src/main/java/com/company/ptsm/model/AuditLog.java
 *
 * [MỚI]
 * Bảng Lịch sử Hoạt động (VAI TRÒ 2, Mục 9).
 * Ghi lại các hành động quan trọng của Manager.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Ai đã thực hiện
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // "CREATE_STAFF", "EDIT_TIMESHEET", "APPROVE_LEAVE"

    // ID của đối tượng bị tác động (ID của nhân viên, ID của đơn nghỉ...)
    private String targetId;

    @Column(columnDefinition = "TEXT")
    private String details; // "Đã sửa giờ check-in cho nv01 từ 8:00 thành 8:15"

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = OffsetDateTime.now();
    }
}