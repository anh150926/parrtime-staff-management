package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "restaurants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "restaurant")
    private Set<Employee> employees;

    @OneToMany(mappedBy = "restaurant")
    private Set<Schedule> schedules;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}