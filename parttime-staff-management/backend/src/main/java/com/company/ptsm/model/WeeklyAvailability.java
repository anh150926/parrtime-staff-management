package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "weekly_availabilities", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "employee_id", "week_start_date" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;
    @Column(nullable = false)
    private LocalDate weekStartDate;
    @Column(nullable = false)
    private String status;
    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<AvailabilitySlot> slots;
}