// file: backend/src/main/java/com/company/ptsm/repository/RestaurantRepository.java
package com.company.ptsm.repository;

import com.company.ptsm.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Integer> {
}