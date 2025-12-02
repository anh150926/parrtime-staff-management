package com.coffee.management.service;

import com.coffee.management.dto.shift.*;
import com.coffee.management.entity.*;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for shift management operations
 */
@Service
@Transactional
public class ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftAssignmentRepository assignmentRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    /**
     * Get shifts by store
     */
    public List<ShiftResponse> getShiftsByStore(Long storeId, LocalDateTime startDate, LocalDateTime endDate) {
        List<Shift> shifts;
        
        if (startDate != null && endDate != null) {
            shifts = shiftRepository.findByStoreAndDateRange(storeId, startDate, endDate);
        } else {
            shifts = shiftRepository.findByStoreId(storeId);
        }

        return shifts.stream()
                .map(ShiftResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get shift by ID
     */
    public ShiftResponse getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));
        return ShiftResponse.fromEntity(shift);
    }

    /**
     * Create a new shift
     */
    public ShiftResponse createShift(Long storeId, CreateShiftRequest request, UserPrincipal currentUser) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));

        // Manager can only create shifts for their store
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only create shifts for your store");
        }

        // Validate datetime
        if (request.getEndDatetime().isBefore(request.getStartDatetime())) {
            throw new BadRequestException("End time must be after start time");
        }

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Shift shift = Shift.builder()
                .store(store)
                .title(request.getTitle())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .requiredSlots(request.getRequiredSlots())
                .createdBy(creator)
                .build();

        Shift savedShift = shiftRepository.save(shift);
        
        auditService.log(currentUser.getId(), "CREATE", "SHIFT", savedShift.getId(), 
                "Created shift: " + savedShift.getTitle() + " at store " + store.getName());

        return ShiftResponse.fromEntity(savedShift);
    }

    /**
     * Update an existing shift
     */
    public ShiftResponse updateShift(Long id, CreateShiftRequest request, UserPrincipal currentUser) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (!shift.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only update shifts for your store");
            }
        }

        if (request.getTitle() != null) {
            shift.setTitle(request.getTitle());
        }
        if (request.getStartDatetime() != null) {
            shift.setStartDatetime(request.getStartDatetime());
        }
        if (request.getEndDatetime() != null) {
            shift.setEndDatetime(request.getEndDatetime());
        }
        if (request.getRequiredSlots() != null) {
            shift.setRequiredSlots(request.getRequiredSlots());
        }

        // Validate datetime
        if (shift.getEndDatetime().isBefore(shift.getStartDatetime())) {
            throw new BadRequestException("End time must be after start time");
        }

        Shift updatedShift = shiftRepository.save(shift);
        return ShiftResponse.fromEntity(updatedShift);
    }

    /**
     * Delete a shift
     */
    public void deleteShift(Long id, UserPrincipal currentUser) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", id));

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (!shift.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only delete shifts for your store");
            }
        }

        shiftRepository.delete(shift);
        
        auditService.log(currentUser.getId(), "DELETE", "SHIFT", id, 
                "Deleted shift: " + shift.getTitle());
    }

    /**
     * Assign staff to a shift
     */
    public ShiftResponse assignStaff(Long shiftId, AssignShiftRequest request, UserPrincipal currentUser) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (!shift.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only assign staff to shifts in your store");
            }
        }

        for (Long userId : request.getUserIds()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            // Verify user belongs to same store
            if (user.getStore() == null || !user.getStore().getId().equals(shift.getStore().getId())) {
                throw new BadRequestException("User " + user.getFullName() + " does not belong to this store");
            }

            // Check if already assigned
            if (!assignmentRepository.existsByShiftIdAndUserId(shiftId, userId)) {
                ShiftAssignment assignment = ShiftAssignment.builder()
                        .shift(shift)
                        .user(user)
                        .status(AssignmentStatus.ASSIGNED)
                        .build();
                assignmentRepository.save(assignment);

                // Send notification
                notificationService.sendNotification(userId, 
                        "Ca làm mới được phân công",
                        "Bạn đã được phân công ca " + shift.getTitle() + " vào " + shift.getStartDatetime().toLocalDate(),
                        "/my-shifts");
            }
        }

        // Refresh shift data
        Shift updatedShift = shiftRepository.findById(shiftId).orElseThrow();
        return ShiftResponse.fromEntity(updatedShift);
    }

    /**
     * Update assignment status (confirm/decline)
     */
    public ShiftAssignmentResponse updateAssignmentStatus(Long shiftId, UpdateAssignmentRequest request, UserPrincipal currentUser) {
        ShiftAssignment assignment = assignmentRepository.findByShiftIdAndUserId(shiftId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for this shift"));

        assignment.setStatus(request.getStatus());
        ShiftAssignment updated = assignmentRepository.save(assignment);

        return ShiftAssignmentResponse.fromEntity(updated);
    }

    /**
     * Get shifts assigned to a user
     */
    public List<ShiftResponse> getMyShifts(Long userId, LocalDateTime startDate) {
        LocalDateTime start = startDate != null ? startDate : LocalDateTime.now().minusDays(7);
        
        return shiftRepository.findByUserAssignment(userId, start).stream()
                .map(ShiftResponse::fromEntity)
                .collect(Collectors.toList());
    }
}








