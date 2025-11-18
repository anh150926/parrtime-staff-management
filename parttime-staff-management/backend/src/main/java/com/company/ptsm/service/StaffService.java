/*
 * file: backend/src/main/java/com/company/ptsm/service/StaffService.java
 *
 * [CẢI TIẾN]
 * Service này thay thế EmployeeService cũ.
 * Chứa logic nghiệp vụ để CRUD Staff và Staff tự cập nhật hồ sơ.
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.staff.StaffCreationRequest;
import com.company.ptsm.dto.staff.StaffProfileDto;
import com.company.ptsm.dto.staff.StaffProfileUpdateRequest;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.Branch;
import com.company.ptsm.model.Position;
import com.company.ptsm.model.StaffProfile;
import com.company.ptsm.model.User;
import com.company.ptsm.model.enums.EmployeeStatus;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.BranchRepository;
import com.company.ptsm.repository.PositionRepository;
import com.company.ptsm.repository.StaffProfileRepository;
import com.company.ptsm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    // (Chúng ta sẽ dùng SuperAdminService để lấy hàm generateEmployeeCode,
    // nhưng để đơn giản, chúng ta copy hàm đó sang đây)

    /**
     * VAI TRÒ 2 (Manager), Mục 3: "Thêm Nhân viên mới".
     *
     * @param request DTO chứa thông tin nhân viên mới.
     * @param creator (Manager) Người đang tạo tài khoản này.
     * @return Hồ sơ chi tiết của nhân viên vừa được tạo.
     */
    @Transactional
    public StaffProfileDto createStaff(StaffCreationRequest request, User creator) {

        // 1. Kiểm tra xem email đã tồn tại chưa
        userRepository.findByEmail(request.getEmail())
                .ifPresent(user -> {
                    throw new BusinessRuleException("Email " + request.getEmail() + " đã tồn tại");
                });

        // 2. Lấy Cơ sở (Branch) từ chính người Quản lý đang tạo
        Branch staffBranch = creator.getBranch();
        if (staffBranch == null) {
            throw new BusinessRuleException("Tài khoản quản lý không thuộc cơ sở nào.");
        }

        // 3. Tìm Chức vụ (Position)
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy chức vụ với ID: " + request.getPositionId()));

        // (Bảo mật) Đảm bảo Manager chỉ tạo NV cho chức vụ TẠI CƠ SỞ CỦA MÌNH
        if (!position.getBranch().getId().equals(staffBranch.getId())) {
            throw new BusinessRuleException("Chức vụ không thuộc cơ sở của bạn.");
        }

        // 4. Tạo mật khẩu mặc định
        String defaultPassword = "password123";
        String hashedPassword = passwordEncoder.encode(defaultPassword);

        // 5. [MỚI] Tạo Mã NV (Logic Đề 2)
        String employeeCode = generateEmployeeCode(staffBranch, position);

        // 6. Tạo đối tượng User (để đăng nhập)
        User newUser = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .role(Role.ROLE_STAFF) // Mặc định là Staff
                .branch(staffBranch)
                .position(position)
                .status(EmployeeStatus.ACTIVE)
                .build();

        // 7. Tạo đối tượng StaffProfile (Hồ sơ cá nhân)
        StaffProfile newProfile = StaffProfile.builder()
                .user(newUser)
                .employeeCode(employeeCode) // Gán mã NV
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .baseSalary(BigDecimal.ZERO) // [Đề 1] Staff lương cơ bản = 0
                .cccd(request.getCccd())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .education(request.getEducation())
                .build();

        // 8. Liên kết 2 chiều
        newUser.setStaffProfile(newProfile);

        // 9. Lưu User (do có cascade, Profile sẽ tự động được lưu theo)
        User savedUser = userRepository.save(newUser);

        // 10. Chuyển đổi (Map) sang DTO để trả về
        return mapToStaffProfileDto(savedUser);
    }

    /**
     * VAI TRÒ 2 (Manager), Mục 3: "Danh sách Nhân viên".
     * Lấy tất cả nhân viên (STAFF) tại cơ sở của Manager.
     */
    @Transactional(readOnly = true)
    public List<StaffProfileDto> getStaffForBranch(Integer branchId) {
        List<User> staffUsers = userRepository
                .findByBranchIdAndRole(branchId, Role.ROLE_STAFF);

        return staffUsers.stream()
                .map(this::mapToStaffProfileDto)
                .collect(Collectors.toList());
    }

    /**
     * Lấy hồ sơ chi tiết của 1 user (cho cả Manager và Staff).
     */
    @Transactional(readOnly = true)
    public StaffProfileDto getStaffProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng: " + userId));

        return mapToStaffProfileDto(user);
    }

    /**
     * VAI TRÒ 3 (Staff): Tự cập nhật hồ sơ cá nhân.
     */
    @Transactional
    public StaffProfileDto updateMyProfile(User staff, StaffProfileUpdateRequest request) {
        // 1. Lấy User và Profile
        User userToUpdate = userRepository.findById(staff.getId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy tài khoản."));
        StaffProfile profileToUpdate = userToUpdate.getStaffProfile();

        if (profileToUpdate == null) {
            throw new NotFoundException("Không tìm thấy hồ sơ để cập nhật.");
        }

        // 2. Kiểm tra Email (nếu thay đổi)
        if (!userToUpdate.getEmail().equals(request.getEmail())) {
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(userToUpdate.getId())) {
                            throw new BusinessRuleException("Email " + request.getEmail() + " đã được sử dụng.");
                        }
                    });
            userToUpdate.setEmail(request.getEmail());
        }

        // 3. Cập nhật các trường Profile
        profileToUpdate.setPhoneNumber(request.getPhoneNumber());
        profileToUpdate.setAddress(request.getAddress());

        // 4. Cập nhật mật khẩu (Nếu có)
        if (StringUtils.hasText(request.getNewPassword())) {
            if (request.getNewPassword().length() < 6) {
                throw new BusinessRuleException("Mật khẩu mới phải có ít nhất 6 ký tự.");
            }
            userToUpdate.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        // 5. Lưu (Lưu User sẽ tự động cập nhật Profile)
        staffProfileRepository.save(profileToUpdate);
        User updatedUser = userRepository.save(userToUpdate);

        return mapToStaffProfileDto(updatedUser);
    }

    // --- Hàm tiện ích (Helpers) ---

    private String generateEmployeeCode(Branch branch, Position position) {
        String branchCode = "B" + branch.getId();
        String posCode = position.getPositionCode();
        String prefix = branchCode + "-" + posCode + "-";
        long count = userRepository.countByEmployeeCodeStartingWith(prefix);
        String sequence = String.format("%04d", count + 1);
        return prefix + sequence;
    }

    private StaffProfileDto mapToStaffProfileDto(User user) {
        StaffProfile profile = user.getStaffProfile();

        if (profile == null) {
            return StaffProfileDto.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .fullName(user.getRole().name())
                    .build();
        }

        return StaffProfileDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : "N/A")
                .positionId(user.getPosition() != null ? user.getPosition().getId() : null)
                .positionName(user.getPosition() != null ? user.getPosition().getName() : "N/A")
                .employeeCode(profile.getEmployeeCode())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .baseSalary(profile.getBaseSalary())
                .cccd(profile.getCccd())
                .dateOfBirth(profile.getDateOfBirth())
                .address(profile.getAddress())
                .education(profile.getEducation())
                .build();
    }
}