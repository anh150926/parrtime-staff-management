package com.company.ptsm.model;

import com.company.ptsm.model.enums.ShiftType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
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
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", unique = true)
    private ScheduleAssignment assignment;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime checkIn;
    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime checkOut;
    @Column(nullable = false)
    private LocalDate shiftDate;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftType shiftType;
    @Column(precision = 5, scale = 2)
    private BigDecimal actualHours;
    @Column(precision = 5, scale = 2)
    private BigDecimal baseHours;
    @Column(precision = 5, scale = 2)
    private BigDecimal overtimeHours;
    private Integer lateMinutes;
    private Integer earlyLeaveMinutes;
}