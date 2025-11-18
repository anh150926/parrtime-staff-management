/*
 * file: backend/src/main/java/com/company/ptsm/model/WorkLog.java
 *
 * [CẢI TIẾN]
 * Bảng Chấm công (Timesheet).
 * Đã thêm các trường để hỗ trợ "Hiệu chỉnh công" (VAI TRÒ 2, Mục 4).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "work_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Nhân viên chấm công
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Thuộc cơ sở nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private OffsetDateTime checkIn;

    private OffsetDateTime checkOut;

    // --- [MỚI] Các trường dành cho "Hiệu chỉnh công" ---
    @Column(nullable = false)
    private boolean isEdited;

    private String editReason; // Lý do sửa

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edited_by_manager_id") // Manager nào đã sửa
    private User editedByManager;
    // --- Kết thúc ---

    // (Các trường tính toán)
    private BigDecimal actualHours; // Số giờ làm thực tế
    private Integer lateMinutes; // Số phút đi muộn

    // (Trường này dùng để liên kết với Ca làm)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", unique = true)
    private ScheduleAssignment assignment; // (Có thể null nếu làm ngoài lịch)
}