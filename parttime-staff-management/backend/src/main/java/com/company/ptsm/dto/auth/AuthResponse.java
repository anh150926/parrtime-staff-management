package com.company.ptsm.dto.auth;

import com.company.ptsm.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Integer id;
    private String name;
    private String email;
    private Role role;
    private Integer restaurantId;
}