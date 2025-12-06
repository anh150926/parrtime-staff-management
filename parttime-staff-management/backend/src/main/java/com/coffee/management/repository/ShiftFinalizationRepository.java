package com.coffee.management.repository;

import com.coffee.management.entity.ShiftFinalization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftFinalizationRepository extends JpaRepository<ShiftFinalization, Long> {
    
    Optional<ShiftFinalization> findByShiftTemplateIdAndFinalizationDate(Long shiftTemplateId, LocalDate finalizationDate);
    
    @Query("SELECT f FROM ShiftFinalization f WHERE f.shiftTemplate.id = :templateId AND f.finalizationDate = :date")
    Optional<ShiftFinalization> findFinalization(@Param("templateId") Long templateId, @Param("date") LocalDate date);
    
    List<ShiftFinalization> findByShiftTemplateId(Long shiftTemplateId);
}

