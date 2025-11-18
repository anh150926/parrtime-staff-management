/*
 * file: backend/src/main/java/com/company/ptsm/model/ShiftTemplate.java
 *
 * [MỚI]
 * Bảng Mẫu Ca (VAI TRÒ 2, Mục 2).
 * Manager tạo các mẫu (Ca Sáng, Ca Chiều) để tái sử dụng.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "shift_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Mẫu ca này thuộc cơ sở nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private String name; // "Ca Sáng", "Ca Tối"

    @Column(nullable = false)
    private LocalTime startTime; // '07:00:00'

    @Column(nullable = false)
    private LocalTime endTime; // '15:00:00'

    @OneToMany(mappedBy = "shiftTemplate")
    private Set<Schedule> schedules;

    @OneToMany(mappedBy = "shiftTemplate")
    private Set<TaskChecklist> taskChecklists;
}