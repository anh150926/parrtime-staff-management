package com.coffee.management.service;

import com.coffee.management.entity.TimeLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for automatic check-out functionality
 * Automatically checks out employees 15 minutes after their shift ends if they forgot to check out
 */
@Service
public class AutoCheckOutService {

    private static final Logger logger = LoggerFactory.getLogger(AutoCheckOutService.class);
    private static final int AUTO_CHECKOUT_DELAY_MINUTES = 15;

    @Autowired
    private TimeLogService timeLogService;

    @Autowired
    private com.coffee.management.repository.TimeLogRepository timeLogRepository;

    /**
     * Scheduled task that runs every 5 minutes to check for time logs that need auto check-out
     * Checks for time logs where:
     * - Employee has checked in but not checked out
     * - Shift has ended more than 15 minutes ago
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes (300000 milliseconds)
    @Transactional
    public void autoCheckOutExpiredShifts() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // Find time logs with shifts that have ended (we'll check +15 minutes below)
            List<TimeLog> timeLogsToCheckOut = timeLogRepository.findTimeLogsNeedingAutoCheckOut(now);
            
            if (timeLogsToCheckOut.isEmpty()) {
                return; // No time logs need auto check-out
            }
            
            logger.info("Found {} time log(s) with ended shifts, checking for auto check-out", timeLogsToCheckOut.size());
            
            // Process each time log
            int autoCheckedOutCount = 0;
            for (TimeLog timeLog : timeLogsToCheckOut) {
                try {
                    // Check: ensure shift end time + 15 minutes has passed
                    if (timeLog.getShift() != null) {
                        LocalDateTime shiftEndTime = timeLog.getShift().getEndDatetime();
                        LocalDateTime autoCheckOutTime = shiftEndTime.plusMinutes(AUTO_CHECKOUT_DELAY_MINUTES);
                        
                        if (now.isAfter(autoCheckOutTime) || now.isEqual(autoCheckOutTime)) {
                            timeLogService.autoCheckOut(timeLog);
                            autoCheckedOutCount++;
                            logger.info("Auto checked out user {} for shift {} (shift ended at {}, auto checkout at {})", 
                                timeLog.getUser().getId(), 
                                timeLog.getShift().getId(),
                                shiftEndTime,
                                autoCheckOutTime);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error auto checking out time log {}: {}", timeLog.getId(), e.getMessage(), e);
                    // Continue with other time logs even if one fails
                }
            }
            
            if (autoCheckedOutCount > 0) {
                logger.info("Successfully auto checked out {} time log(s)", autoCheckedOutCount);
            }
        } catch (Exception e) {
            logger.error("Error in auto check-out scheduled task: {}", e.getMessage(), e);
        }
    }
}

