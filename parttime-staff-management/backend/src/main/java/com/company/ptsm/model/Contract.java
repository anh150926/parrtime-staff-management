/*
 * file: backend/src/main/java/com/company/ptsm/model/Contract.java
 * [MỚI] - (VAI TRÒ 2, Mục 8)
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    private String contractType; // "Thử việc", "Chính thức"

    private String fileUrl;

    private LocalDate healthDocExpiry; // Ngày hết hạn GKSK
}