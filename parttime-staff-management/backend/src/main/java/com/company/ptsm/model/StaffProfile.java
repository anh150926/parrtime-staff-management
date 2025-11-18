/*
 * file: backend/src/main/java/com/company/ptsm/model/StaffProfile.java
 * [MỚI] - Hỗ trợ Đề 2 (Mã NV, Lương cơ bản)
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "staff_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffProfile {

    @Id
    @Column(name = "user_id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Đánh dấu ID của bảng này chính là khóa ngoại của bảng User
    @JoinColumn(name = "user_id")
    private User user;

    @Column(unique = true)
    private String employeeCode; // "HN1-QL-0001"

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(precision = 12, scale = 2)
    private BigDecimal baseSalary; // Lương cơ bản (cho Manager)

    @Column(unique = true)
    private String cccd;

    private LocalDate dateOfBirth;

    private String address;

    private String education;

    @Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}