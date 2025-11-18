/*
 * file: backend/src/main/java/com/company/ptsm/model/Schedule.java
 *
 * [CẢI TIẾN]
 * Bảng này giờ đây đại diện cho MỘT CA TRỐNG CẦN NGƯỜI (Đề 2).
 * Manager tạo ra (VD: Cần 3 Phục vụ cho Ca Sáng ngày 20/11).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "schedules", uniqueConstraints = {
        // Đảm bảo không tạo trùng ca (1 cơ sở, 1 mẫu ca, 1 ngày)
        @UniqueConstraint(columnNames = { "branch_id", "shift_template_id", "schedule_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Ca này thuộc cơ sở nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    // Ca này dùng Mẫu Ca nào (Ca Sáng, Chiều...)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    @Column(nullable = false)
    private LocalDate scheduleDate; // Ngày diễn ra ca

    @Column(nullable = false)
    private int requiredStaff; // Số lượng nhân viên YÊU CẦU cho ca này

    // Các nhân viên đã được gán vào ca này
    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ScheduleAssignment> assignments;
}