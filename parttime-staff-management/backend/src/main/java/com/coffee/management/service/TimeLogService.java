package com.coffee.management.service;

import com.coffee.management.dto.timelog.ManualTimeLogRequest;
import com.coffee.management.dto.timelog.TimeLogResponse;
import com.coffee.management.entity.*;
import com.coffee.management.exception.BadRequestException;
import com.coffee.management.exception.ForbiddenException;
import com.coffee.management.exception.ResourceNotFoundException;
import com.coffee.management.repository.ShiftRepository;
import com.coffee.management.repository.TimeLogRepository;
import com.coffee.management.repository.UserRepository;
import com.coffee.management.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for time tracking (check-in/check-out) operations
 */
@Service
@Transactional
public class TimeLogService {

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Check in for work
     */
    public TimeLogResponse checkIn(Long shiftId, UserPrincipal currentUser) {
        // Check if already checked in
        if (timeLogRepository.findActiveCheckIn(currentUser.getId()).isPresent()) {
            throw new BadRequestException("Bạn đã check-in rồi. Vui lòng check-out trước.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        TimeLog timeLog = TimeLog.builder()
                .user(user)
                .checkIn(LocalDateTime.now())
                .recordedBy(RecordedBy.SYSTEM)
                .build();

        if (shiftId != null) {
            Shift shift = shiftRepository.findById(shiftId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));
            
            // Kiểm tra thời gian check-in: cho phép từ trước 10 phút đến hết giờ làm việc của ca
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime shiftStart = shift.getStartDatetime();
            LocalDateTime shiftEnd = shift.getEndDatetime();
            LocalDateTime allowedFrom = shiftStart.minusMinutes(10);  // Trước 10 phút
            
            if (now.isBefore(allowedFrom)) {
                throw new BadRequestException("Chưa đến giờ check-in. Bạn chỉ có thể check-in trước 10 phút so với giờ bắt đầu ca.");
            }
            if (now.isAfter(shiftEnd)) {
                throw new BadRequestException("Đã quá thời gian hết ca. Không thể check-in cho ca đã kết thúc.");
            }
            
            timeLog.setShift(shift);
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        
        // Gửi thông báo cho manager khi nhân viên check-in
        if (user.getStore() != null && saved.getShift() != null) {
            List<User> managers = userRepository.findByStoreIdAndRole(user.getStore().getId(), Role.MANAGER);
            String shiftTitle = saved.getShift().getTitle();
            String checkInTime = saved.getCheckIn().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            
            // Kiểm tra đi muộn (check-in sau 5 phút so với giờ bắt đầu ca)
            LocalDateTime shiftStart = saved.getShift().getStartDatetime();
            LocalDateTime lateThreshold = shiftStart.plusMinutes(5);
            boolean isLate = saved.getCheckIn().isAfter(lateThreshold);
            
            String message;
            if (isLate) {
                message = String.format("%s đã check-in ca \"%s\" lúc %s (Đi muộn)", 
                    user.getFullName(), shiftTitle, checkInTime);
            } else {
                message = String.format("%s đã check-in ca \"%s\" lúc %s", 
                    user.getFullName(), shiftTitle, checkInTime);
            }
            
            for (User manager : managers) {
                notificationService.sendNotification(
                    manager.getId(),
                    isLate ? "Nhân viên check-in (Đi muộn)" : "Nhân viên check-in",
                    message,
                    "/time-logs"
                );
            }
        }
        
        return TimeLogResponse.fromEntity(saved);
    }

    /**
     * Check out from work
     */
    public TimeLogResponse checkOut(UserPrincipal currentUser) {
        TimeLog timeLog = timeLogRepository.findActiveCheckIn(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("No active check-in found. Please check in first."));

        LocalDateTime checkOutTime = LocalDateTime.now();
        timeLog.setCheckOut(checkOutTime);
        
        // Calculate duration
        int durationMinutes = (int) ChronoUnit.MINUTES.between(timeLog.getCheckIn(), checkOutTime);
        timeLog.setDurationMinutes(durationMinutes);

        TimeLog saved = timeLogRepository.save(timeLog);
        
        // Gửi thông báo cho manager khi nhân viên check-out
        if (saved.getUser().getStore() != null && saved.getShift() != null) {
            List<User> managers = userRepository.findByStoreIdAndRole(
                saved.getUser().getStore().getId(), Role.MANAGER);
            String shiftTitle = saved.getShift().getTitle();
            String checkOutTimeStr = saved.getCheckOut().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            String message = String.format("%s đã check-out ca \"%s\" lúc %s", 
                saved.getUser().getFullName(), shiftTitle, checkOutTimeStr);
            
            for (User manager : managers) {
                notificationService.sendNotification(
                    manager.getId(),
                    "Nhân viên check-out",
                    message,
                    "/time-logs"
                );
            }
        }
        
        return TimeLogResponse.fromEntity(saved);
    }

    /**
     * Get current check-in status
     */
    public TimeLogResponse getCurrentCheckIn(UserPrincipal currentUser) {
        return timeLogRepository.findActiveCheckIn(currentUser.getId())
                .map(TimeLogResponse::fromEntity)
                .orElse(null);
    }

    /**
     * Get time logs for a user
     */
    public List<TimeLogResponse> getTimeLogsByUser(Long userId, LocalDateTime startDate, LocalDateTime endDate, UserPrincipal currentUser) {
        // Check permission
        if (!currentUser.getRole().equals("OWNER") && !currentUser.getRole().equals("MANAGER")) {
            if (!currentUser.getId().equals(userId)) {
                throw new ForbiddenException("You can only view your own time logs");
            }
        }

        // Manager can only view time logs from their store
        if (currentUser.getRole().equals("MANAGER")) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            if (user.getStore() == null || !user.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only view time logs from your store");
            }
        }

        List<TimeLog> logs;
        if (startDate != null && endDate != null) {
            logs = timeLogRepository.findByUserAndDateRange(userId, startDate, endDate);
        } else {
            logs = timeLogRepository.findByUserId(userId);
        }

        return logs.stream()
                .map(TimeLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get time logs for a store
     */
    public List<TimeLogResponse> getTimeLogsByStore(Long storeId, LocalDateTime startDate, LocalDateTime endDate, UserPrincipal currentUser) {
        // Check permission
        if (currentUser.getRole().equals("MANAGER") && !storeId.equals(currentUser.getStoreId())) {
            throw new ForbiddenException("You can only view time logs from your store");
        }

        return timeLogRepository.findByStoreAndDateRange(storeId, startDate, endDate).stream()
                .map(TimeLogResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Create manual time log (for corrections by Manager)
     */
    public TimeLogResponse createManualTimeLog(ManualTimeLogRequest request, UserPrincipal currentUser) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        // Manager can only create manual logs for their store staff
        if (currentUser.getRole().equals("MANAGER")) {
            if (user.getStore() == null || !user.getStore().getId().equals(currentUser.getStoreId())) {
                throw new ForbiddenException("You can only create time logs for your store staff");
            }
        }

        // Validate datetime
        if (request.getCheckOut().isBefore(request.getCheckIn())) {
            throw new BadRequestException("Check-out time must be after check-in time");
        }

        int durationMinutes = (int) ChronoUnit.MINUTES.between(request.getCheckIn(), request.getCheckOut());

        TimeLog timeLog = TimeLog.builder()
                .user(user)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .durationMinutes(durationMinutes)
                .recordedBy(RecordedBy.MANUAL)
                .build();

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", request.getShiftId()));
            timeLog.setShift(shift);
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        
        auditService.log(currentUser.getId(), "CREATE", "TIME_LOG", saved.getId(), 
                "Created manual time log for user: " + user.getUsername());

        return TimeLogResponse.fromEntity(saved);
    }

    /**
     * Get total hours worked by user in a date range
     */
    public Long getTotalMinutesByUser(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        Long total = timeLogRepository.sumDurationByUserAndDateRange(userId, startDate, endDate);
        return total != null ? total : 0L;
    }

    /**
     * Get total hours worked by store in a date range
     */
    public Long getTotalMinutesByStore(Long storeId, LocalDateTime startDate, LocalDateTime endDate) {
        Long total = timeLogRepository.sumDurationByStoreAndDateRange(storeId, startDate, endDate);
        return total != null ? total : 0L;
    }
}








