/*
 * file: backend/src/main/java/com/company/ptsm/model/TaskChecklist.java
 *
 * [MỚI]
 * Bảng Quản lý Tác vụ (Checklist) (VAI TRÒ 2, Mục 7).
 * Manager tạo các đầu việc cho từng ca.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Table(name = "task_checklists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Checklist này cho cơ sở nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    // Checklist này cho Mẫu Ca nào (Sáng, Tối...)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    @Column(nullable = false)
    private String taskDescription; // "Vệ sinh máy pha cà phê", "Kiểm kho"

    private boolean isActive;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskLog> taskLogs;
}