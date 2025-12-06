package com.coffee.management.dto.shift;

import com.coffee.management.entity.RegistrationStatus;
import com.coffee.management.entity.ShiftRegistration;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftRegistrationResponse {
    private Long id;
    private Long shiftId;
    private String shiftTitle;
    private Long userId;
    private String userName;
    private LocalDate registrationDate;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime cancelledAt;

    public static ShiftRegistrationResponse fromEntity(ShiftRegistration registration) {
        return ShiftRegistrationResponse.builder()
                .id(registration.getId())
                .shiftId(registration.getShift() != null ? registration.getShift().getId() : null)
                .shiftTitle(registration.getShift() != null ? registration.getShift().getTitle() : null)
                .userId(registration.getUser() != null ? registration.getUser().getId() : null)
                .userName(registration.getUser() != null ? registration.getUser().getFullName() : null)
                .registrationDate(registration.getRegistrationDate())
                .status(registration.getStatus())
                .registeredAt(registration.getRegisteredAt())
                .cancelledAt(registration.getCancelledAt())
                .build();
    }
}
