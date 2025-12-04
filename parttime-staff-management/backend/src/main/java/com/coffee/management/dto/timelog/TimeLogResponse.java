package com.coffee.management.dto.timelog;

import com.coffee.management.entity.RecordedBy;
import com.coffee.management.entity.TimeLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private Long shiftId;
    private String shiftTitle;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer durationMinutes;
    private String durationFormatted;
    private RecordedBy recordedBy;
    private LocalDateTime createdAt;
    private Boolean isLate; // Đánh dấu đi muộn (check-in sau 5 phút nhưng trước hết ca)
    
    public static TimeLogResponse fromEntity(TimeLog timeLog) {
        String durationFormatted = null;
        if (timeLog.getDurationMinutes() != null) {
            int hours = timeLog.getDurationMinutes() / 60;
            int minutes = timeLog.getDurationMinutes() % 60;
            durationFormatted = String.format("%dh %dm", hours, minutes);
        }
        
        // Tính toán isLate: check-in sau 5 phút so với giờ bắt đầu ca nhưng trước hết ca
        Boolean isLate = null;
        if (timeLog.getShift() != null && timeLog.getCheckIn() != null) {
            LocalDateTime shiftStart = timeLog.getShift().getStartDatetime();
            LocalDateTime shiftEnd = timeLog.getShift().getEndDatetime();
            LocalDateTime lateThreshold = shiftStart.plusMinutes(5);
            isLate = timeLog.getCheckIn().isAfter(lateThreshold) && timeLog.getCheckIn().isBefore(shiftEnd);
        }
        
        return TimeLogResponse.builder()
                .id(timeLog.getId())
                .userId(timeLog.getUser().getId())
                .userName(timeLog.getUser().getFullName())
                .shiftId(timeLog.getShift() != null ? timeLog.getShift().getId() : null)
                .shiftTitle(timeLog.getShift() != null ? timeLog.getShift().getTitle() : null)
                .checkIn(timeLog.getCheckIn())
                .checkOut(timeLog.getCheckOut())
                .durationMinutes(timeLog.getDurationMinutes())
                .durationFormatted(durationFormatted)
                .recordedBy(timeLog.getRecordedBy())
                .createdAt(timeLog.getCreatedAt())
                .isLate(isLate)
                .build();
    }
}








