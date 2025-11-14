package com.company.ptsm.model;

import com.company.ptsm.model.enums.DayOfWeekEnum;
import com.company.ptsm.model.enums.ShiftType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "availability_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private WeeklyAvailability availability;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeekEnum dayOfWeek;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShiftType shiftType;
}