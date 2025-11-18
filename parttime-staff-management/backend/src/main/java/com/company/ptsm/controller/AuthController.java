/*
 * file: backend/src/main/java/com/company/ptsm/controller/AuthController.java
 *
 * [CẢI TIẾN]
 * Controller này giờ CHỈ xử lý API /login công khai.
 * API /register đã bị xóa (sẽ được thay thế bằng API nội bộ của Manager).
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.auth.AuthRequest;
import com.company.ptsm.dto.auth.AuthResponse;
import com.company.ptsm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * API Endpoint cho chức năng Đăng nhập (dùng cho cả 3 vai trò).
     *
     * @param request Dữ liệu JSON (AuthRequest: email, password)
     * @return ResponseEntity chứa AuthResponse (token và thông tin user)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AuthRequest request) {
        // Gọi service đã được cải tiến (AuthService)
        AuthResponse authResponse = authService.login(request);

        // Trả về HTTP 200 (OK) kèm theo dữ liệu
        return ResponseEntity.ok(authResponse);
    }
}