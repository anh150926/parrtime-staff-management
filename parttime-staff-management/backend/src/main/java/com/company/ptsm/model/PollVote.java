/*
 * file: backend/src/main/java/com/company/ptsm/model/PollVote.java
 *
 * [MỚI]
 * Bảng Phiếu bầu (VAI TRÒ 3, Mục 8).
 * Ghi lại ai đã bầu chọn gì.
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poll_votes", uniqueConstraints = {
        // Đảm bảo 1 user chỉ vote 1 lần cho 1 poll
        @UniqueConstraint(columnNames = { "poll_id", "user_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Nhân viên bầu

    @Column(nullable = false)
    private String selectedOption; // "Đồng ý"
}