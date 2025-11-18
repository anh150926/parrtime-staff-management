/*
 * file: backend/src/main/java/com/company/ptsm/service/AuthService.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI IMPORT]
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.auth.AuthRequest;
import com.company.ptsm.dto.auth.AuthResponse;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.model.StaffProfile;
import com.company.ptsm.model.User;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.StaffProfileRepository;
import com.company.ptsm.repository.UserRepository; // <-- [SỬA LỖI] THÊM IMPORT NÀY
import com.company.ptsm.security.jwt.JwtService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

        private final UserRepository userRepository; // <-- (Sẽ hết lỗi ở đây)
        private final StaffProfileRepository staffProfileRepository;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        public AuthService(
                        UserRepository userRepository, // <-- (Sẽ hết lỗi ở đây)
                        StaffProfileRepository staffProfileRepository,
                        JwtService jwtService,
                        @Lazy AuthenticationManager authenticationManager) {
                this.userRepository = userRepository;
                this.staffProfileRepository = staffProfileRepository;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }

        @Transactional(readOnly = true)
        public AuthResponse login(AuthRequest request) {

                Authentication authentication;
                try {
                        authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        request.getEmail(),
                                                        request.getPassword()));
                } catch (AuthenticationException e) {
                        throw new BusinessRuleException("Email hoặc mật khẩu không chính xác");
                }

                User user = (User) authentication.getPrincipal();
                String jwtToken = jwtService.generateToken(user);

                String fullName = "Super Admin";
                Integer branchId = null;

                if (user.getRole() == Role.ROLE_MANAGER || user.getRole() == Role.ROLE_STAFF) {
                        StaffProfile profile = staffProfileRepository.findById(user.getId())
                                        .orElse(null);

                        if (profile != null) {
                                fullName = profile.getFullName();
                        } else {
                                fullName = user.getEmail();
                        }

                        if (user.getBranch() != null) {
                                branchId = user.getBranch().getId();
                        }
                }

                return AuthResponse.builder()
                                .token(jwtToken)
                                .id(user.getId())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .fullName(fullName)
                                .branchId(branchId)
                                .build();
        }
}