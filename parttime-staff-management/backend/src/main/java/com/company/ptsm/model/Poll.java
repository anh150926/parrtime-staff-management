/*
 * file: backend/src/main/java/com/company/ptsm/model/Poll.java
 *
 * [MỚI]
 * Bảng Khảo sát (VAI TRÒ 2, Mục 6).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.Set;

@Entity
@Table(name = "polls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Poll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Manager tạo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    private String question; // "Nên đổi mẫu đồng phục mới không?"

    @Column(nullable = false)
    private String[] options; // Mảng: {"Đồng ý", "Không đồng ý"}

    @Column(nullable = false)
    private boolean isActive;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "poll", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PollVote> votes;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        isActive = true;
    }
}