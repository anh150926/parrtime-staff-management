/*
 * file: backend/src/main/java/com/company/ptsm/security/jwt/JwtAuthFilter.java
 *
 * (CẢI TIẾN)
 * Bộ lọc (Filter) chặn mọi request để kiểm tra JWT token.
 * Đã được cập nhật để dùng UserDetailsServiceImpl mới.
 */
package com.company.ptsm.security.jwt;

import com.company.ptsm.security.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor // Tự động tiêm các service
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService; // <-- [CẢI TIẾN] Dùng service mới

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // 1. Lấy header "Authorization"
        final String authHeader = request.getHeader("Authorization");

        // 2. Kiểm tra xem header có tồn tại và bắt đầu bằng "Bearer " không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Cho đi tiếp (đến API công khai /login)
            return;
        }

        // 3. Lấy token (bỏ "Bearer " đi)
        final String jwt = authHeader.substring(7); // "Bearer ".length() == 7
        final String userEmail;

        try {
            // 4. Giải mã token để lấy email (username)
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token lỗi (hết hạn, sai chữ ký...)
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Token không hợp lệ: " + e.getMessage());
            return;
        }

        // 5. Kiểm tra email và trạng thái đăng nhập
        // Nếu email tồn tại VÀ user chưa được xác thực (chưa đăng nhập)
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // 6. [CẢI TIẾN] Lấy thông tin User (thay vì Employee) từ database
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // 7. Xác thực token (email khớp + chưa hết hạn)
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // 8. Nếu token hợp lệ, TẠO ra một "Authentication"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, // Principal (là User)
                        null, // Credentials (không cần khi dùng JWT)
                        userDetails.getAuthorities() // Quyền (ROLE_STAFF, ROLE_MANAGER...)
                );

                // 9. Ghi lại chi tiết (ví dụ: IP, session)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // 10. "Báo" cho Spring Security biết: "User này đã được xác thực"
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 11. Cho request đi tiếp
        filterChain.doFilter(request, response);
    }
}