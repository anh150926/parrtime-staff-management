package com.coffee.management.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a coffee shop store
 */
@Entity
@Table(name = "stores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;

    @Column(name = "min_hours_before_give")
    private Integer minHoursBeforeGive;

    @Column(name = "max_staff_per_shift")
    private Integer maxStaffPerShift;

    @Column(name = "allow_cross_store_swap")
    private Boolean allowCrossStoreSwap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_user_id")
    private User manager;

    @OneToMany(mappedBy = "store", fetch = FetchType.LAZY)
    @Builder.Default
    private List<User> staff = new ArrayList<>();

    @OneToMany(mappedBy = "store", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Shift> shifts = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Explicit getters for IDE recognition (Lombok @Getter also generates these)
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public java.time.LocalTime getOpeningTime() {
        return openingTime;
    }

    public java.time.LocalTime getClosingTime() {
        return closingTime;
    }

    public Integer getMinHoursBeforeGive() {
        return minHoursBeforeGive;
    }

    public Integer getMaxStaffPerShift() {
        return maxStaffPerShift;
    }

    public Boolean getAllowCrossStoreSwap() {
        return allowCrossStoreSwap;
    }

    public User getManager() {
        return manager;
    }

    public List<User> getStaff() {
        return staff;
    }

    public List<Shift> getShifts() {
        return shifts;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
