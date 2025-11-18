/*
 * file: backend/src/main/java/com/company/ptsm/controller/SuperAdminController.java
 *
 * [CẢI TIẾN - ĐÃ SỬA LỖI IMPORT]
 * Controller này chứa các API dành riêng cho VAI TRÒ 1 (SUPER ADMIN).
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.branch.BranchDto;
import com.company.ptsm.dto.user.ManagerAccountDto;
import com.company.ptsm.dto.user.ManagerCreationRequest;
import com.company.ptsm.model.User; // <-- [SỬA LỖI] 'U' viết hoa
import com.company.ptsm.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.annotation.AuthenticationPrincipal; // <-- (Không cần nếu không dùng)
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin") // Tiền tố /api/admin
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_SUPER_ADMIN')") // [Bảo mật] Chặn toàn bộ Controller
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // --- API Quản lý Cơ sở (Branch) ---

    /**
     * VAI TRÒ 1 (Mục 2): Lấy danh sách tất cả cơ sở
     */
    @GetMapping("/branches")
    public ResponseEntity<List<BranchDto>> getAllBranches() {
        return ResponseEntity.ok(superAdminService.getAllBranches());
    }

    /**
     * VAI TRÒ 1 (Mục 2): Tạo cơ sở mới
     */
    @PostMapping("/branches")
    public ResponseEntity<BranchDto> createBranch(@Valid @RequestBody BranchDto dto) {
        BranchDto newBranch = superAdminService.createBranch(dto);
        return new ResponseEntity<>(newBranch, HttpStatus.CREATED);
    }

    // (Thêm @PutMapping và @DeleteMapping cho Sửa/Xóa cơ sở...)

    // --- API Quản lý Tài khoản Manager ---

    /**
     * VAI TRÒ 1 (Mục 2): Lấy danh sách tài khoản Quản lý
     */
    @GetMapping("/managers")
    public ResponseEntity<List<ManagerAccountDto>> getManagerAccounts() {
        return ResponseEntity.ok(superAdminService.getManagerAccounts());
    }

    /**
     * VAI TRÒ 1 (Mục 2): Tạo tài khoản Quản lý mới
     */
    @PostMapping("/managers")
    public ResponseEntity<ManagerAccountDto> createManagerAccount(
            @Valid @RequestBody ManagerCreationRequest request) {
        ManagerAccountDto newManager = superAdminService.createManagerAccount(request);
        return new ResponseEntity<>(newManager, HttpStatus.CREATED);
    }

    // (Thêm @PutMapping để Vô hiệu hóa/Kích hoạt tài khoản Manager...)
}