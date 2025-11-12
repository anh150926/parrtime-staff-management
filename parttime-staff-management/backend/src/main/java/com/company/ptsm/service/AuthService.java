package com.company.ptsm.service;

import com.company.ptsm.dto.auth.AuthRequest;
import com.company.ptsm.dto.auth.AuthResponse;
import com.company.ptsm.dto.auth.RegisterRequest;
import com.company.ptsm.exception.BusinessRuleException;
import com.company.ptsm.exception.NotFoundException;
import com.company.ptsm.model.Employee;
import com.company.ptsm.model.Restaurant;
import com.company.ptsm.model.enums.EmployeeStatus;
import com.company.ptsm.model.enums.Role;
import com.company.ptsm.repository.EmployeeRepository;
import com.company.ptsm.repository.RestaurantRepository;
import com.company.ptsm.security.jwt.JwtService;
import org.springframework.context.annotation.Lazy; // <-- Thêm
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
// @RequiredArgsConstructor // <-- Xóa
public class AuthService {

        private final EmployeeRepository employeeRepository;
        private final RestaurantRepository restaurantRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        // --- SỬA LỖI: Thêm Constructor với @Lazy ---
        public AuthService(
                        EmployeeRepository employeeRepository,
                        RestaurantRepository restaurantRepository,
                        @Lazy PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        @Lazy AuthenticationManager authenticationManager) {
                this.employeeRepository = employeeRepository;
                this.restaurantRepository = restaurantRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtService = jwtService;
                this.authenticationManager = authenticationManager;
        }
        // --- KẾT THÚC SỬA LỖI ---

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                employeeRepository.findByEmail(request.getEmail())
                                .ifPresent(employee -> {
                                        throw new BusinessRuleException("Email " + request.getEmail() + " đã tồn tại");
                                });

                Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                                .orElseThrow(() -> new NotFoundException(
                                                "Không tìm thấy nhà hàng với ID: " + request.getRestaurantId()));

                String hashedPassword = passwordEncoder.encode(request.getPassword());

                Employee newEmployee = Employee.builder()
                                .name(request.getName())
                                .phoneNumber(request.getPhoneNumber())
                                .email(request.getEmail())
                                .password(hashedPassword)
                                .restaurant(restaurant)
                                .role(Role.ROLE_EMPLOYEE)
                                .status(EmployeeStatus.ACTIVE)
                                .build();

                Employee savedEmployee = employeeRepository.save(newEmployee);
                String jwtToken = jwtService.generateToken(savedEmployee);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .id(savedEmployee.getId())
                                .name(savedEmployee.getName())
                                .email(savedEmployee.getEmail())
                                .role(savedEmployee.getRole())
                                .restaurantId(savedEmployee.getRestaurant().getId())
                                .build();
        }

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

                Employee employee = (Employee) authentication.getPrincipal();
                String jwtToken = jwtService.generateToken(employee);

                return AuthResponse.builder()
                                .token(jwtToken)
                                .id(employee.getId())
                                .name(employee.getName())
                                .email(employee.getEmail())
                                .role(employee.getRole())
                                .restaurantId(employee.getRestaurant() != null ? employee.getRestaurant().getId()
                                                : null)
                                .build();
        }
}