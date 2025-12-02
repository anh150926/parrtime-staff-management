package com.coffee.management.repository;

import com.coffee.management.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    
    Optional<Store> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT s FROM Store s LEFT JOIN FETCH s.manager")
    List<Store> findAllWithManager();
    
    Optional<Store> findByManagerId(Long managerId);
}








