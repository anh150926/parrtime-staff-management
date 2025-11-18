/*
 * file: backend/src/main/java/com/company/ptsm/controller/StaffController.java
 *
 * [CẢI TIẾN]
 * Controller này thay thế EmployeeController cũ.
 * Xử lý các nghiệp vụ của Manager liên quan đến Nhân viên
 * và Staff tự cập nhật hồ sơ.
 */
package com.company.ptsm.controller;

import com.company.ptsm.dto.staff.StaffCreationRequest;
import com.company.ptsm.dto.staff.StaffProfileDto;
import com.company.ptsm.dto.staff.StaffProfileUpdateRequest;
import com.company.ptsm.model.User;
import com.company.ptsm.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    /**
     * API cho VAI TRÒ 2 (Manager), Mục 3: "Thêm Nhân viên mới".
     * Chỉ Manager mới có quyền gọi API này.
     *
     * @param request DTO chứa thông tin nhân viên (Họ tên, SĐT, Email...)
     * @param manager Người quản lý đang đăng nhập (được tự động tiêm)
     * @return Hồ sơ chi tiết của nhân viên vừa tạo
     */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<StaffProfileDto> createStaff(
            @Valid @RequestBody StaffCreationRequest request,
            @AuthenticationPrincipal User manager) {
        StaffProfileDto newStaff = staffService.createStaff(request, manager);
        return new ResponseEntity<>(newStaff, HttpStatus.CREATED);
    }

    /**
     * API cho VAI TRÒ 2 (Manager), Mục 3: "Danh sách Nhân viên".
     * Lấy tất cả nhân viên (STAFF) tại cơ sở của Manager đang đăng nhập.
     */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<List<StaffProfileDto>> getStaffForMyBranch(
            @AuthenticationPrincipal User manager) {
        List<StaffProfileDto> staffList = staffService.getStaffForBranch(manager.getBranch().getId());
        return ResponseEntity.ok(staffList);
    }

    /**
     * API cho VAI TRÒ 3 (Staff), Mục 5: "Hồ sơ Cá nhân" (Tự xem)
     * HOẶC VAI TRÒ 2 (Manager) xem hồ sơ của nhân viên.
     *
     * @param userId ID của người cần xem hồ sơ
     * @return Hồ sơ chi tiết
     */
    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF')")
    public ResponseEntity<StaffProfileDto> getStaffProfile(
            @PathVariable Integer userId,
            @AuthenticationPrincipal User currentUser) {
        // (Bảo mật bổ sung: Đảm bảo Staff chỉ xem được của mình,
        // Manager chỉ xem được của cơ sở mình)

        StaffProfileDto profile = staffService.getStaffProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * VAI TRÒ 3 (Staff): API Tự cập nhật hồ sơ cá nhân
     * (SĐT, Email, Mật khẩu...).
     */
    @PutMapping("/my-profile")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER', 'ROLE_STAFF')") // Manager cũng có thể tự sửa
    public ResponseEntity<StaffProfileDto> updateMyProfile(
            @Valid @RequestBody StaffProfileUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        StaffProfileDto updatedProfile = staffService.updateMyProfile(currentUser, request);
        return ResponseEntity.ok(updatedProfile);
    }

    // (Các API khác như Sửa/Vô hiệu hóa nhân viên sẽ được thêm vào đây...)
}