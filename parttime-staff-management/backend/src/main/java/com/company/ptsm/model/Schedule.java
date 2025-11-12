package com.company.ptsm.model;

import com.company.ptsm.model.enums.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "schedules", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "restaurant_id", "week_start_date" })
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private LocalDate weekStartDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime publishedAt;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ScheduleAssignment> assignments;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ScheduleStatus.DRAFT;
        }
    }
}