package com.company.ptsm.dto.schedule;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class ShiftMarketDto {
    private Integer marketId;
    private Integer assignmentId;
    private String shiftName;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer offeringUserId;
    private String offeringUserName;
    private Integer claimingUserId;
    private String claimingUserName;
    private String status; // POSTED, CLAIMED, APPROVED
}