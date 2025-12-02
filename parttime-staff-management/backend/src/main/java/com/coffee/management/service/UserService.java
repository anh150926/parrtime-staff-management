package com.coffee.management.service;

import com.coffee.management.dto.user.CreateUserRequest;
import com.coffee.management.dto.user.UpdateUserRequest;
import com.coffee.management.dto.user.UserResponse;
import com.coffee.management.entity.Role;
import com.coffee.management.entity.Store;
import com.coffee.management.entity.User;
import com.coffee.management.entity.UserStatus;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.StoreRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management operations
 */
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    /**
     * Get all users (Owner: all, Manager: own store only)
     */
    public List<UserResponse> getAllUsers(UserPrincipal currentUser) {
        List<User> users;
        
        if (currentUser.getRole().equals("OWNER")) {
            users = userRepository.findAll();
        } else if (currentUser.getRole().equals("MANAGER")) {
            if (currentUser.getStoreId() == null) {
                throw new BadRequestException("Manager is not assigned to any store");
            }
            users = userRepository.findByStoreId(currentUser.getStoreId());
        } else {
            throw new ForbiddenException("You don't have permission to view users");
        }

        return users.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(Long id, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check permission
        if (!currentUser.getRole().equals("OWNER")) {
            if (currentUser.getRole().equals("MANAGER")) {
                if (user.getStore() == null || !user.getStore().getId().equals(currentUser.getStoreId())) {
                    throw new ForbiddenException("You can only view users from your store");
                }
            } else if (!currentUser.getId().equals(id)) {
                throw new ForbiddenException("You can only view your own profile");
            }
        }

        return UserResponse.fromEntity(user);
    }

    /**
     * Create a new user
     */
    public UserResponse createUser(CreateUserRequest request, UserPrincipal currentUser) {
        // Validate unique constraints
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (request.getRole() != Role.STAFF) {
                throw new ForbiddenException("Managers can only create staff accounts");
            }
            if (request.getStoreId() != null && !request.getStoreId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("Managers can only create staff for their own store");
            }
            request.setStoreId(currentUser.getStoreId());
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(request.getRole())
                .hourlyRate(request.getHourlyRate())
                .status(UserStatus.ACTIVE)
                .build();

        if (request.getStoreId() != null) {
            Store store = storeRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Store", "id", request.getStoreId()));
            user.setStore(store);
        }

        User savedUser = userRepository.save(user);
        
        auditService.log(currentUser.getId(), "CREATE", "USER", savedUser.getId(), 
                "Created user: " + savedUser.getUsername());

        return UserResponse.fromEntity(savedUser);
    }

    /**
     * Update an existing user
     */
    public UserResponse updateUser(Long id, UpdateUserRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check permission
        boolean isSelfUpdate = currentUser.getId().equals(id);
        
        if (!currentUser.getRole().equals("OWNER")) {
            if (currentUser.getRole().equals("MANAGER")) {
                // Manager can update staff in their store, but not change role
                if (user.getRole() == Role.OWNER) {
                    throw new ForbiddenException("Cannot modify owner account");
                }
                if (user.getStore() == null || !user.getStore().getId().equals(currentUser.getStoreId())) {
                    throw new ForbiddenException("You can only update users from your store");
                }
                if (request.getRole() != null && request.getRole() != user.getRole()) {
                    throw new ForbiddenException("Managers cannot change user roles");
                }
            } else if (!isSelfUpdate) {
                throw new ForbiddenException("You can only update your own profile");
            } else {
                // Staff self-update: cannot change role or store
                if (request.getRole() != null || request.getStoreId() != null) {
                    throw new ForbiddenException("You cannot change your role or store");
                }
            }
        }

        // Update fields
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getRole() != null && currentUser.getRole().equals("OWNER")) {
            user.setRole(request.getRole());
        }
        if (request.getStoreId() != null && currentUser.getRole().equals("OWNER")) {
            Store store = storeRepository.findById(request.getStoreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Store", "id", request.getStoreId()));
            user.setStore(store);
        }
        if (request.getHourlyRate() != null) {
            user.setHourlyRate(request.getHourlyRate());
        }
        if (request.getStatus() != null && !isSelfUpdate) {
            user.setStatus(request.getStatus());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);
        
        auditService.log(currentUser.getId(), "UPDATE", "USER", updatedUser.getId(), 
                "Updated user: " + updatedUser.getUsername());

        return UserResponse.fromEntity(updatedUser);
    }

    /**
     * Delete a user (soft delete by setting status to INACTIVE)
     */
    public void deleteUser(Long id, UserPrincipal currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Cannot delete Owner
        if (user.getRole() == Role.OWNER) {
            throw new ForbiddenException("Cannot delete owner account");
        }

        // Manager can only delete staff in their store
        if (currentUser.getRole().equals("MANAGER")) {
            if (user.getStore() == null || !user.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only delete users from your store");
            }
            if (user.getRole() != Role.STAFF) {
                throw new ForbiddenException("Managers can only delete staff accounts");
            }
        }

        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
        
        auditService.log(currentUser.getId(), "DELETE", "USER", user.getId(), 
                "Deleted user: " + user.getUsername());
    }

    /**
     * Get users by store
     */
    public List<UserResponse> getUsersByStore(Long storeId) {
        return userRepository.findByStoreId(storeId).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get staff count by store
     */
    public long getStaffCountByStore(Long storeId) {
        return userRepository.countStaffByStore(storeId);
    }
}








