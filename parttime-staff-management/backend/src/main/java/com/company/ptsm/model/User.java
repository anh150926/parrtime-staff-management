/*
 * file: backend/src/main/java/com/company/ptsm/model/User.java
 * [CẢI TIẾN] - Thay thế Employee.java (Hỗ trợ 3 vai trò)
 */
package com.company.ptsm.model;

import com.company.ptsm.model.enums.EmployeeStatus;
import com.company.ptsm.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails { // Implement UserDetails cho Spring Security

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; // ROLE_SUPER_ADMIN, ROLE_MANAGER, ROLE_STAFF

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    // --- Liên kết 1-1 ---
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private StaffProfile staffProfile;

    // --- Liên kết 1-N ---
    @OneToMany(mappedBy = "user")
    private Set<ScheduleAssignment> assignments;
    @OneToMany(mappedBy = "user")
    private Set<WorkLog> workLogs;
    @OneToMany(mappedBy = "user")
    private Set<Payroll> payrolls;
    @OneToMany(mappedBy = "user")
    private Set<LeaveRequest> leaveRequests;
    @OneToMany(mappedBy = "user")
    private Set<StaffAvailability> staffAvailabilities;
    @OneToMany(mappedBy = "user")
    private Set<Contract> contracts;
    @OneToMany(mappedBy = "createdBy")
    private Set<KnowledgeArticle> knowledgeArticles;
    @OneToMany(mappedBy = "author") // Manager/SuperAdmin
    private Set<Announcement> announcements;
    @OneToMany(mappedBy = "staffUser") // Staff
    private Set<Complaint> complaints;
    @OneToMany(mappedBy = "user")
    private Set<TaskLog> taskLogs;
    @OneToMany(mappedBy = "user")
    private Set<AuditLog> auditLogs;
    @OneToMany(mappedBy = "manager")
    private Set<LeaveRequest> approvedLeaveRequests;
    @OneToMany(mappedBy = "offeringUser")
    private Set<ShiftMarket> offeredShifts;
    @OneToMany(mappedBy = "claimingUser")
    private Set<ShiftMarket> claimedShifts;
    @OneToMany(mappedBy = "manager")
    private Set<ShiftMarket> approvedShifts;
    @OneToMany(mappedBy = "editedByManager")
    private Set<WorkLog> editedWorkLogs;
    @OneToMany(mappedBy = "user")
    private Set<PayrollAdjustment> adjustmentsOwned;
    @OneToMany(mappedBy = "manager")
    private Set<PayrollAdjustment> adjustmentsManaged;
    @OneToMany(mappedBy = "author")
    private Set<Poll> polls;
    @OneToMany(mappedBy = "user")
    private Set<PollVote> pollVotes;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (status == null) {
            status = EmployeeStatus.ACTIVE;
        }
    }

    // --- Các hàm bắt buộc của Spring Security (UserDetails) ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.status == EmployeeStatus.ACTIVE;
    }
}