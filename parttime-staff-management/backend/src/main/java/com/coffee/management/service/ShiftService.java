package com.coffee.management.service;

import com.coffee.management.dto.shift.*;
import com.coffee.management.entity.*;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
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

    @Autowired
    private ShiftRegistrationRepository registrationRepository;

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

        // Check if this shift is based on a template and if anyone has registered
        LocalDate shiftDate = request.getStartDatetime().toLocalDate();
        java.time.DayOfWeek dayOfWeek = shiftDate.getDayOfWeek();
        int dayOfWeekValue = dayOfWeek.getValue(); // 1=Monday, 7=Sunday
        
        // Try to find matching template
        List<Shift> templates = shiftRepository.findByStoreIdAndIsTemplateTrue(storeId);
        Shift matchingTemplate = null;
        for (Shift template : templates) {
            if (template.getDayOfWeek() != null && template.getDayOfWeek().equals(dayOfWeekValue)) {
                // Check shift type by comparing time ranges
                LocalTime shiftStart = request.getStartDatetime().toLocalTime();
                LocalTime templateStart = template.getStartDatetime().toLocalTime();
                if (template.getShiftType() != null && 
                    Math.abs(shiftStart.toSecondOfDay() - templateStart.toSecondOfDay()) < 3600) { // Within 1 hour
                    matchingTemplate = template;
                    break;
                }
            }
        }
        
        // If template found, check if anyone has registered
        if (matchingTemplate != null) {
            List<com.coffee.management.entity.ShiftRegistration> registrations = registrationRepository
                    .findActiveRegistrationsByShiftAndDate(matchingTemplate.getId(), shiftDate);
            
            if (registrations.isEmpty()) {
                throw new BadRequestException(
                    "Chưa có nhân viên nào đăng ký ca làm này. Vui lòng đợi nhân viên đăng ký trước khi tạo ca."
                );
            }
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
            // Check if new requiredSlots is less than current assignments
            List<ShiftAssignment> currentAssignments = assignmentRepository.findByShiftId(id);
            int currentAssignmentCount = currentAssignments.size();
            
            if (request.getRequiredSlots() < currentAssignmentCount) {
                throw new BadRequestException(
                    String.format("Không thể giảm số người cần xuống %d. Hiện đã có %d người được phân công cho ca này.", 
                        request.getRequiredSlots(), currentAssignmentCount)
                );
            }
            
            if (request.getRequiredSlots() < 1) {
                throw new BadRequestException("Số người cần phải lớn hơn hoặc bằng 1");
            }
            
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

        // Get current assignments count
        List<ShiftAssignment> currentAssignments = assignmentRepository.findByShiftId(shiftId);
        int currentCount = currentAssignments.size();
        int requiredSlots = shift.getRequiredSlots() != null ? shift.getRequiredSlots() : 1;

        // Count how many new users will be added
        int newUsersCount = 0;
        for (Long userId : request.getUserIds()) {
            if (!assignmentRepository.existsByShiftIdAndUserId(shiftId, userId)) {
                newUsersCount++;
            }
        }

        // Check if adding new users would exceed required slots
        if (currentCount + newUsersCount > requiredSlots) {
            throw new BadRequestException(
                String.format("Không thể phân công thêm nhân viên. Ca này chỉ cần %d người, hiện đã có %d người được phân công.", 
                    requiredSlots, currentCount)
            );
        }

        // Check if shift is based on a template and if anyone has registered
        LocalDate shiftDate = shift.getStartDatetime().toLocalDate();
        java.time.DayOfWeek dayOfWeek = shiftDate.getDayOfWeek();
        int dayOfWeekValue = dayOfWeek.getValue(); // 1=Monday, 7=Sunday
        
        // Try to find matching template
        List<Shift> templates = shiftRepository.findByStoreIdAndIsTemplateTrue(shift.getStore().getId());
        Shift matchingTemplate = null;
        for (Shift template : templates) {
            if (template.getDayOfWeek() != null && template.getDayOfWeek().equals(dayOfWeekValue)) {
                // Check shift type by comparing time ranges
                LocalTime shiftStart = shift.getStartDatetime().toLocalTime();
                LocalTime templateStart = template.getStartDatetime().toLocalTime();
                if (template.getShiftType() != null && 
                    Math.abs(shiftStart.toSecondOfDay() - templateStart.toSecondOfDay()) < 3600) { // Within 1 hour
                    matchingTemplate = template;
                    break;
                }
            }
        }
        
        // If template found, check if anyone has registered
        if (matchingTemplate != null) {
            List<com.coffee.management.entity.ShiftRegistration> registrations = registrationRepository
                    .findActiveRegistrationsByShiftAndDate(matchingTemplate.getId(), shiftDate);
            
            if (registrations.isEmpty()) {
                throw new BadRequestException(
                    String.format("Chưa có nhân viên nào đăng ký ca làm này. Vui lòng đợi nhân viên đăng ký trước khi phân công.")
                );
            }
        }

        for (Long userId : request.getUserIds()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

            // Verify user belongs to same store
            if (user.getStore() == null || !user.getStore().getId().equals(shift.getStore().getId())) {
                throw new BadRequestException("User " + user.getFullName() + " does not belong to this store");
            }

            // If template found, check if this specific user has registered
            if (matchingTemplate != null) {
                boolean hasRegistered = registrationRepository
                        .findByShiftIdAndUserIdAndRegistrationDate(matchingTemplate.getId(), userId, shiftDate)
                        .map(reg -> reg.getStatus() == com.coffee.management.entity.RegistrationStatus.REGISTERED)
                        .orElse(false);
                
                if (!hasRegistered) {
                    throw new BadRequestException(
                        String.format("Nhân viên %s chưa đăng ký ca làm này. Chỉ có thể phân công cho nhân viên đã đăng ký.", 
                            user.getFullName())
                    );
                }
            }

            // Check if already assigned
            if (!assignmentRepository.existsByShiftIdAndUserId(shiftId, userId)) {
                ShiftAssignment assignment = ShiftAssignment.builder()
                        .shift(shift)
                        .user(user)
                        .status(AssignmentStatus.CONFIRMED) // Bắt buộc làm khi quản lý phân công
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
     * Remove staff assignment from a shift
     */
    public ShiftResponse removeAssignment(Long shiftId, Long userId, UserPrincipal currentUser) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));

        // Check permission
        if (currentUser.getRole().equals("MANAGER")) {
            if (!shift.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only remove assignments from shifts in your store");
            }
        }

        // Check if assignment exists
        ShiftAssignment assignment = assignmentRepository.findByShiftIdAndUserId(shiftId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        // Get shift title and date before deleting (to avoid lazy loading issues)
        String shiftTitle = shift.getTitle();
        String shiftDate = shift.getStartDatetime().toLocalDate().toString();

        // Delete assignment
        assignmentRepository.delete(assignment);

        // Send notification to user (userId is already available, no need to load user object)
        try {
            notificationService.sendNotification(userId,
                    "Ca làm đã bị hủy phân công",
                    "Bạn đã bị gỡ khỏi ca " + shiftTitle + " vào " + shiftDate,
                    "/my-shifts");
        } catch (Exception e) {
            // Log error but don't fail the deletion if notification fails
            // This ensures assignment is still deleted even if notification service has issues
        }

        // Refresh shift data with all relationships loaded to avoid LazyInitializationException
        Shift updatedShift = shiftRepository.findByIdWithRelations(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));
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








