/*
 * file: backend/src/main/java/com/company/ptsm/model/KnowledgeArticle.java
 *
 * [MỚI]
 * Bảng Sổ tay Vận hành / Kiến thức (VAI TRÒ 2, Mục 7).
 */
package com.company.ptsm.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "knowledge_articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title; // "Công thức pha Cà phê Nâu"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Nội dung (HTML hoặc Markdown)

    private String category; // "Công thức pha chế", "Quy trình"

    // Người tạo (Manager hoặc Super Admin)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}