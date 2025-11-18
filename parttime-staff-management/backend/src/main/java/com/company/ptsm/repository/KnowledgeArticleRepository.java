/*
 * file: backend/src/main/java/com/company/ptsm/repository/KnowledgeArticleRepository.java
 *
 * [MỚI]
 * Repository cho Sổ tay Vận hành (KnowledgeArticle).
 */
package com.company.ptsm.repository;

import com.company.ptsm.model.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Integer> {

    /**
     * Lấy Sổ tay theo danh mục (Category).
     */
    List<KnowledgeArticle> findByCategory(String category);
}