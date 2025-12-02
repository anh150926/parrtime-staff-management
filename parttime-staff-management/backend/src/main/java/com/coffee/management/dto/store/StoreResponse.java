package com.coffee.management.dto.store;

import com.coffee.management.entity.Store;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreResponse {
    
    private Long id;
    private String name;
    private String address;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Long managerId;
    private String managerName;
    private int staffCount;
    private LocalDateTime createdAt;
    
    public static StoreResponse fromEntity(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .address(store.getAddress())
                .openingTime(store.getOpeningTime())
                .closingTime(store.getClosingTime())
                .managerId(store.getManager() != null ? store.getManager().getId() : null)
                .managerName(store.getManager() != null ? store.getManager().getFullName() : null)
                .staffCount(store.getStaff() != null ? store.getStaff().size() : 0)
                .createdAt(store.getCreatedAt())
                .build();
    }
}








