package com.coffee.management.repository;

import com.coffee.management.entity.Payroll;
import com.coffee.management.entity.PayrollStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    List<Payroll> findByUserId(Long userId);
    
    Optional<Payroll> findByUserIdAndMonth(Long userId, String month);
    
    List<Payroll> findByMonth(String month);
    
    List<Payroll> findByStatus(PayrollStatus status);
    
    List<Payroll> findByMonthAndStatus(String month, PayrollStatus status);
    
    @Query("SELECT p FROM Payroll p JOIN p.user u WHERE u.store.id = :storeId AND p.month = :month")
    List<Payroll> findByStoreAndMonth(@Param("storeId") Long storeId, @Param("month") String month);
    
    @Query("SELECT SUM(p.grossPay + p.adjustments) FROM Payroll p WHERE p.month = :month")
    java.math.BigDecimal sumTotalPayByMonth(@Param("month") String month);
    
    @Query("SELECT SUM(p.grossPay + p.adjustments) FROM Payroll p JOIN p.user u WHERE u.store.id = :storeId AND p.month = :month")
    java.math.BigDecimal sumTotalPayByStoreAndMonth(@Param("storeId") Long storeId, @Param("month") String month);
    
    boolean existsByUserIdAndMonth(Long userId, String month);
}








