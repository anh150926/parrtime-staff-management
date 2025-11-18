/*
 * file: backend/src/main/java/com/company/ptsm/model/ScheduleAssignment.java
 *
 * [CẢI TIẾN]
 * Bảng này liên kết một User (Nhân viên) với một Schedule (Ca làm).
 * Đây là kết quả của việc "Đăng ký ca" hoặc "Manager tự xếp".
 * (Thay thế ScheduleAssignment cũ).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "schedule_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết đến ca làm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    // Liên kết đến nhân viên
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String status; // 'PENDING' (NV đăng ký), 'CONFIRMED' (Manager duyệt)

    // Liên kết 1-1 với Chợ Ca (nếu ca này được "bán")
    @OneToOne(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private ShiftMarket shiftMarket;

    // Liên kết 1-1 với Chấm công (nếu ca này đã được chấm công)
    @OneToOne(mappedBy = "assignment")
    private WorkLog workLog;
}