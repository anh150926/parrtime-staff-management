/*
 * file: backend/src/main/java/com/company/ptsm/model/Branch.java
 * [CẢI TIẾN] - Thay thế Restaurant.java
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name; // "Cơ sở 1 (Hoàn Kiếm)"

    private String address;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // --- Liên kết 1-N ---
    @OneToMany(mappedBy = "branch")
    private Set<User> users;

    @OneToMany(mappedBy = "branch")
    private Set<Position> positions;

    @OneToMany(mappedBy = "branch")
    private Set<ShiftTemplate> shiftTemplates;

    @OneToMany(mappedBy = "branch")
    private Set<Schedule> schedules;

    @OneToMany(mappedBy = "branch")
    private Set<WorkLog> workLogs;

    @OneToMany(mappedBy = "branch")
    private Set<Complaint> complaints;

    @OneToMany(mappedBy = "branch")
    private Set<TaskChecklist> taskChecklists;

    @OneToMany(mappedBy = "branch")
    private Set<Announcement> announcements;

    @OneToMany(mappedBy = "branch")
    private Set<Poll> polls;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}