/*
 * file: backend/src/main/java/com/company/ptsm/service/SuperAdminService.java
 *
 * [MỚI]
 * Service này chứa logic nghiệp vụ dành riêng cho
 * VAI TRÒ 1 (SUPER ADMIN).
 */
package com.company.ptsm.service;

import com.company.ptsm.dto.branch.BranchDto;
import com.company.ptsm.dto.user.ManagerAccountDto;
import com.company.ptsm.dto.user.ManagerCreationRequest;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final PositionRepository positionRepository;
    private final PasswordEncoder passwordEncoder;

    // (Lưu ý: Chúng ta sẽ tiêm StaffService sau để dùng chung hàm
    // generateEmployeeCode)

    // --- Logic Quản lý Cơ sở (Branch Management) ---

    /**
     * VAI TRÒ 1: Lấy tất cả cơ sở.
     */
    @Transactional(readOnly = true)
    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToBranchDto)
                .collect(Collectors.toList());
    }

    /**
     * VAI TRÒ 1: Tạo cơ sở mới.
     */
    @Transactional
    public BranchDto createBranch(BranchDto dto) {
        Branch branch = Branch.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .build();
        Branch savedBranch = branchRepository.save(branch);
        return mapToBranchDto(savedBranch);
    }

    // (Thêm Sửa/Xóa cơ sở nếu cần...)

    // --- Logic Quản lý Tài khoản Manager ---

    /**
     * VAI TRÒ 1: Lấy danh sách tài khoản Quản lý.
     */
    @Transactional(readOnly = true)
    public List<ManagerAccountDto> getManagerAccounts() {
        List<User> managers = userRepository.findByRole(Role.ROLE_MANAGER);
        return managers.stream()
                .map(this::mapToManagerAccountDto)
                .collect(Collectors.toList());
    }

    /**
     * VAI TRÒ 1: Tạo tài khoản Quản lý mới.
     */
    @Transactional
    public ManagerAccountDto createManagerAccount(ManagerCreationRequest request) {
        // 1. Kiểm tra email
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new BusinessRuleException("Email đã tồn tại.");
                });

        // 2. Tìm cơ sở (branch)
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy cơ sở."));

        // 3. Tìm chức vụ (position)
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy chức vụ."));

        // (Bảo mật) Đảm bảo chức vụ này thuộc cơ sở
        if (!position.getBranch().getId().equals(branch.getId())) {
            throw new BusinessRuleException("Chức vụ không thuộc cơ sở đã chọn.");
        }

        // 4. Tạo mật khẩu mặc định
        String defaultPassword = "password123";
        String hashedPassword = passwordEncoder.encode(defaultPassword);

        // 5. [MỚI] Tạo Mã NV (Logic Đề 2)
        String employeeCode = generateEmployeeCode(branch, position);

        // 6. Tạo User
        User managerUser = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .role(Role.ROLE_MANAGER) // Gán vai trò Manager
                .branch(branch)
                .position(position)
                .status(EmployeeStatus.ACTIVE)
                .build();

        // 7. Tạo Profile (với Lương cơ bản)
        StaffProfile managerProfile = StaffProfile.builder()
                .user(managerUser)
                .employeeCode(employeeCode)
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .baseSalary(request.getBaseSalary()) // [Đề 2] Gán lương cơ bản
                .cccd(request.getCccd())
                .dateOfBirth(request.getDateOfBirth())
                .build();

        // 8. Liên kết 2 chiều
        managerUser.setStaffProfile(managerProfile);

        // 9. Lưu (User sẽ tự động lưu Profile do Cascade)
        User savedManager = userRepository.save(managerUser);

        return mapToManagerAccountDto(savedManager);
    }

    // (Thêm Sửa/Vô hiệu hóa Manager...)

    // --- Hàm tiện ích (Helpers) ---

    private BranchDto mapToBranchDto(Branch branch) {
        return BranchDto.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .build();
    }

    private ManagerAccountDto mapToManagerAccountDto(User user) {
        StaffProfile profile = user.getStaffProfile();
        return ManagerAccountDto.builder()
                .userId(user.getId())
                .fullName(profile != null ? profile.getFullName() : "N/A")
                .email(user.getEmail())
                .status(user.getStatus())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : "N/A")
                .build();
    }

    /**
     * [LOGIC MỚI] Tự động tạo Mã Nhân viên (Employee Code)
     * (Hỗ trợ Đề 2: PDTT0001)
     */
    private String generateEmployeeCode(Branch branch, Position position) {
        // Lấy mã (Code)
        String branchCode = "B" + branch.getId(); // Ví dụ: B1, B2
        String posCode = position.getPositionCode(); // Ví dụ: QL, PC

        // Đếm số lượng đã có
        String prefix = branchCode + "-" + posCode + "-";
        long count = userRepository.countByEmployeeCodeStartingWith(prefix);

        // Format 4 chữ số
        String sequence = String.format("%04d", count + 1); // 0001, 0002

        return prefix + sequence; // B1-QL-0001
    }
}