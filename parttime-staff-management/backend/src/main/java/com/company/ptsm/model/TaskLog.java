/*
 * file: backend/src/main/java/com/company/ptsm/model/TaskLog.java
 *
 * [MỚI]
 * Bảng Log hoàn thành Checklist (VAI TRÒ 3, Mục 7).
 * Ghi lại ai đã làm, khi nào.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "task_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Task nào đã được làm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private TaskChecklist task;

    // Nhân viên nào đã làm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private OffsetDateTime completedAt; // Thời điểm NV bấm "Hoàn thành"

    @PrePersist
    protected void onCreate() {
        completedAt = OffsetDateTime.now();
    }
}