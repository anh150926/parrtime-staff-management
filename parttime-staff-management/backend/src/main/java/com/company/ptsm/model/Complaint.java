/*
 * file: backend/src/main/java/com/company/ptsm/model/Complaint.java
 *
 * [MỚI]
 * Bảng Khiếu nại (VAI TRÒ 2, Mục 6 & VAI TRÒ 3, Mục 6).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Nhân viên gửi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false)
    private User staffUser;

    // Gửi đến cơ sở nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Nội dung khiếu nại

    @Column(columnDefinition = "TEXT")
    private String response; // Phản hồi của Manager (nullable)

    @Column(nullable = false)
    private String status; // 'SUBMITTED' (Đã gửi), 'RESOLVED' (Đã giải quyết)

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (status == null) {
            status = "SUBMITTED";
        }
    }
}