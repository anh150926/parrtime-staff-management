package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a work shift at a store
 */
@Entity
@Table(name = "shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "required_slots")
    @Builder.Default
    private Integer requiredSlots = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "shift", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShiftAssignment> assignments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit getters for IDE recognition (Lombok @Getter also generates these)
    public Long getId() {
        return id;
    }

    public Store getStore() {
        return store;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getStartDatetime() {
        return startDatetime;
    }

    public LocalDateTime getEndDatetime() {
        return endDatetime;
    }

    public Integer getRequiredSlots() {
        return requiredSlots;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public List<ShiftAssignment> getAssignments() {
        return assignments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}








