package com.company.ptsm.model;

import com.company.ptsm.model.enums.ShiftType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(nullable = false)
    private LocalDate assignmentDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftType shiftType;
    @OneToOne(mappedBy = "assignment")
    private WorkLog workLog;
}