package com.coffee.management.dto.store;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStoreRequest {
    
    @Size(max = 100, message = "Store name must not exceed 100 characters")
    private String name;
    
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
    
    private LocalTime openingTime;
    
    private LocalTime closingTime;
    
    private Long managerId;
}








