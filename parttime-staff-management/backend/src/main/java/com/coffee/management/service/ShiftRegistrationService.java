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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShiftRegistrationService {

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private ShiftRegistrationRepository registrationRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Create shift template for registration
     */
    public ShiftTemplateResponse createShiftTemplate(Long storeId, CreateShiftTemplateRequest request, UserPrincipal currentUser) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store", "id", storeId));

        // Check permission
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only create templates for your store");
        }

        // Validate day of week
        if (request.getDayOfWeek() < 1 || request.getDayOfWeek() > 7) {
            throw new BadRequestException("Day of week must be between 1 (Monday) and 7 (Sunday)");
        }

        // Validate time
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check if template already exists for this day and type
        List<Shift> existingTemplates = shiftRepository.findByStoreIdAndIsTemplateTrue(storeId);
        boolean exists = existingTemplates.stream()
                .anyMatch(s -> s.getDayOfWeek() != null && s.getDayOfWeek().equals(request.getDayOfWeek()) 
                        && s.getShiftType() != null && s.getShiftType().equals(request.getShiftType()));
        
        if (exists) {
            throw new BadRequestException("Template already exists for this day and shift type");
        }

        // Create a sample date for the template (use next Monday as base)
        LocalDate baseDate = LocalDate.now();
        while (baseDate.getDayOfWeek() != DayOfWeek.MONDAY) {
            baseDate = baseDate.plusDays(1);
        }
        LocalDate templateDate = baseDate.plusDays(request.getDayOfWeek() - 1);
        LocalDateTime startDatetime = LocalDateTime.of(templateDate, request.getStartTime());
        LocalDateTime endDatetime = LocalDateTime.of(templateDate, request.getEndTime());

        User creator = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Shift template = Shift.builder()
                .store(store)
                .title(request.getTitle())
                .startDatetime(startDatetime)
                .endDatetime(endDatetime)
                .requiredSlots(request.getRequiredSlots() != null ? request.getRequiredSlots() : 1)
                .isTemplate(true)
                .shiftType(request.getShiftType())
                .dayOfWeek(request.getDayOfWeek())
                .createdBy(creator)
                .build();

        Shift saved = shiftRepository.save(template);
        return ShiftTemplateResponse.fromEntity(saved);
    }

    /**
     * Get shift templates by store
     */
    public List<ShiftTemplateResponse> getShiftTemplates(Long storeId) {
        List<Shift> templates = shiftRepository.findByStoreIdAndIsTemplateTrue(storeId);
        return templates.stream()
                .map(ShiftTemplateResponse::fromEntity)
                .sorted((a, b) -> {
                    // Sort by day of week first, then by shift type
                    Integer dayA = a.getDayOfWeek() != null ? a.getDayOfWeek() : 0;
                    Integer dayB = b.getDayOfWeek() != null ? b.getDayOfWeek() : 0;
                    int dayCompare = Integer.compare(dayA, dayB);
                    if (dayCompare != 0) return dayCompare;
                    // MORNING < AFTERNOON < EVENING
                    if (a.getShiftType() == null && b.getShiftType() == null) return 0;
                    if (a.getShiftType() == null) return 1;
                    if (b.getShiftType() == null) return -1;
                    return a.getShiftType().compareTo(b.getShiftType());
                })
                .collect(Collectors.toList());
    }

    /**
     * Register for a shift
     */
    public ShiftRegistrationResponse registerShift(Long shiftTemplateId, RegisterShiftRequest request, UserPrincipal currentUser) {
        Shift template = shiftRepository.findById(shiftTemplateId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift template", "id", shiftTemplateId));

        if (template.getIsTemplate() == null || !template.getIsTemplate()) {
            throw new BadRequestException("This is not a shift template");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Verify user belongs to same store
        if (user.getStore() == null || !user.getStore().getId().equals(template.getStore().getId())) {
            throw new BadRequestException("You can only register for shifts in your store");
        }

        // Check if already registered
        if (registrationRepository.findByShiftIdAndUserIdAndRegistrationDate(
                shiftTemplateId, currentUser.getId(), request.getRegistrationDate()).isPresent()) {
            throw new BadRequestException("You have already registered for this shift on this date");
        }

        // Create registration
        ShiftRegistration registration = ShiftRegistration.builder()
                .shift(template)
                .user(user)
                .registrationDate(request.getRegistrationDate())
                .status(RegistrationStatus.REGISTERED)
                .build();

        ShiftRegistration saved = registrationRepository.save(registration);

        // Send notification to manager
        if (template.getStore().getManager() != null) {
            notificationService.sendNotification(template.getStore().getManager().getId(),
                    "Nhân viên đăng ký ca làm",
                    user.getFullName() + " đã đăng ký ca " + template.getTitle() + " vào " + request.getRegistrationDate(),
                    "/shifts");
        }

        return ShiftRegistrationResponse.fromEntity(saved);
    }

    /**
     * Get registrations for a week
     */
    public List<ShiftRegistrationResponse> getRegistrationsForWeek(Long storeId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<ShiftRegistration> registrations = registrationRepository
                .findActiveRegistrationsByStoreAndDateRange(storeId, weekStart, weekEnd);
        
        return registrations.stream()
                .map(ShiftRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get my registrations for a week
     */
    public List<ShiftRegistrationResponse> getMyRegistrationsForWeek(Long userId, LocalDate weekStart) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<ShiftRegistration> registrations = registrationRepository
                .findActiveRegistrationsByUserAndDateRange(userId, weekStart, weekEnd);
        
        return registrations.stream()
                .map(ShiftRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get registered users for a shift on a specific date
     */
    public List<ShiftRegistrationResponse> getRegisteredUsersForShift(Long shiftTemplateId, LocalDate date) {
        List<ShiftRegistration> registrations = registrationRepository
                .findActiveRegistrationsByShiftAndDate(shiftTemplateId, date);
        
        return registrations.stream()
                .map(ShiftRegistrationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Cancel registration
     */
    public void cancelRegistration(Long registrationId, UserPrincipal currentUser) {
        ShiftRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration", "id", registrationId));

        // Check permission
        if (!registration.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only cancel your own registrations");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());
        registrationRepository.save(registration);
    }
}
