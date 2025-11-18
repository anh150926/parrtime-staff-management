/*
 * file: backend/src/main/java/com/company/ptsm/config/SecurityConfig.java
 *
 * (CẢI TIẾN)
 * Cấu hình Spring Security chính.
 * Hỗ trợ 3 vai trò và đã sửa lỗi Circular Dependency.
 */
package com.company.ptsm.config;

import com.company.ptsm.security.jwt.JwtAuthFilter;
import com.company.ptsm.security.service.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy; // <-- [SỬA LỖI] Import @Lazy
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Bật bảo mật @PreAuthorize (để phân quyền SUPER_ADMIN, MANAGER)
// @RequiredArgsConstructor // <-- Xóa đi
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // --- [SỬA LỖI] Thêm Constructor với @Lazy để phá vỡ vòng lặp ---
    public SecurityConfig(@Lazy JwtAuthFilter jwtAuthFilter, @Lazy UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }
    // --- [KẾT THÚC SỬA LỖI] ---

    /**
     * Bean này định nghĩa "luật" bảo mật cho các request HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt CSRF (vì dùng JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Định nghĩa các API được phép truy cập
                .authorizeHttpRequests(authorize -> authorize
                        // Cho phép TẤT CẢ request đến '/api/auth/**' (chỉ có login)
                        .requestMatchers("/api/auth/**").permitAll()

                        // Cho phép truy cập Swagger
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        // Bất kỳ request nào khác đều BẮT BUỘC phải được xác thực
                        .anyRequest().authenticated())

                // 3. Không tạo Session (vì dùng JWT)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Chỉ định AuthenticationProvider
                .authenticationProvider(authenticationProvider())

                // 5. Thêm Filter JWT của chúng ta vào trước
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Bean này "dạy" Spring Security cách xác thực:
     * - Dùng UserDetailsServiceImpl để tìm User (bằng email).
     * - Dùng BCryptPasswordEncoder để so sánh mật khẩu.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Bean này quản lý quá trình xác thực (sẽ được AuthService sử dụng).
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Bean này định nghĩa thuật toán băm mật khẩu (BCrypt).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}