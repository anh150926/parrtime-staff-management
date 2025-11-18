/*
 * file: backend/src/main/java/com/company/ptsm/model/StaffAvailability.java
 *
 * [MỚI]
 * Bảng này lưu các khung giờ bận CỐ ĐỊNH của nhân viên.
 * (VAI TRÒ 3, Mục 2: "Đăng ký Bất khả dụng" - VD: Lịch học).
 * (Thay thế WeeklyAvailability và AvailabilitySlot cũ).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "staff_availabilities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private OffsetDateTime startTime; // Giờ/Ngày bắt đầu bận

    @Column(nullable = false)
    private OffsetDateTime endTime; // Giờ/Ngày kết thúc bận

    private String reason; // "Lịch học T2, T4", "Việc gia đình"
}