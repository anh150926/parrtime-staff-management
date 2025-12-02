package com.coffee.management.dto.user;

import com.coffee.management.entity.Role;
import com.coffee.management.entity.UserStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    @Size(max = 150, message = "Full name must not exceed 150 characters")
    private String fullName;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;
    
    private Role role;
    
    private Long storeId;
    
    @DecimalMin(value = "0.0", message = "Hourly rate must be positive")
    private BigDecimal hourlyRate;
    
    private UserStatus status;
    
    private String avatarUrl;
}








