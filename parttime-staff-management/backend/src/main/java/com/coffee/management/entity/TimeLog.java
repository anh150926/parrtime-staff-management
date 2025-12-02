package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing time tracking (check-in/check-out) records
 */
@Entity
@Table(name = "time_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "check_in")
    private LocalDateTime checkIn;

    @Column(name = "check_out")
    private LocalDateTime checkOut;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "recorded_by", nullable = false)
    @Builder.Default
    private RecordedBy recordedBy = RecordedBy.SYSTEM;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit getters for IDE recognition (Lombok @Getter also generates these)
    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Shift getShift() {
        return shift;
    }

    public LocalDateTime getCheckIn() {
        return checkIn;
    }

    public LocalDateTime getCheckOut() {
        return checkOut;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public RecordedBy getRecordedBy() {
        return recordedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}








