// file: backend/src/main/java/com/company/ptsm/util/PayrollFormula.java
package com.company.ptsm.util;

import java.math.RoundingMode; // <-- THÊM DÒNG NÀY
import com.company.ptsm.model.PayrollRule;
import com.company.ptsm.model.WorkLog;
import com.company.ptsm.model.enums.ShiftType;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
public class PayrollFormula {

    private BigDecimal actualHours = BigDecimal.ZERO;
    private BigDecimal baseHours = BigDecimal.ZERO;
    private BigDecimal overtimeHours = BigDecimal.ZERO;
    private Integer lateMinutes = 0;
    private Integer earlyLeaveMinutes = 0;

    private BigDecimal basePay = BigDecimal.ZERO;
    private BigDecimal overtimePay = BigDecimal.ZERO;
    private BigDecimal penaltyAmount = BigDecimal.ZERO;
    private BigDecimal totalPayForShift = BigDecimal.ZERO;

    public PayrollFormula(WorkLog log, PayrollRule rule, BigDecimal hourlyWage) {
        if (log.getCheckIn() == null || log.getCheckOut() == null) {
            return;
        }

        ShiftType shift = log.getShiftType();
        ZoneOffset zoneOffset = log.getCheckIn().getOffset();
        OffsetDateTime shiftStart = log.getShiftDate().atTime(shift.getStartTime()).atOffset(zoneOffset);
        OffsetDateTime shiftEnd;
        if (shift == ShiftType.CA_2) {
            shiftEnd = log.getShiftDate().plusDays(1).atTime(shift.getEndTime()).atOffset(zoneOffset);
        } else {
            shiftEnd = log.getShiftDate().atTime(shift.getEndTime()).atOffset(zoneOffset);
        }

        if (log.getCheckIn().isAfter(shiftStart)) {
            this.lateMinutes = (int) Duration.between(shiftStart, log.getCheckIn()).toMinutes();
        }
        if (log.getCheckOut().isBefore(shiftEnd)) {
            this.earlyLeaveMinutes = (int) Duration.between(log.getCheckOut(), shiftEnd).toMinutes();
        }

        OffsetDateTime effectiveCheckIn = log.getCheckIn().isBefore(shiftStart) ? shiftStart : log.getCheckIn();
        OffsetDateTime effectiveCheckOut = log.getCheckOut().isAfter(shiftEnd) ? shiftEnd : log.getCheckOut();

        if (effectiveCheckOut.isBefore(effectiveCheckIn)) {
            return;
        }

        Duration actualDuration = Duration.between(effectiveCheckIn, effectiveCheckOut);
        this.actualHours = BigDecimal.valueOf(actualDuration.toMinutes() / 60.0)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal overtimeThreshold = rule.getDailyOvertimeThresholdHours();

        if (this.actualHours.compareTo(overtimeThreshold) > 0) {
            this.overtimeHours = this.actualHours.subtract(overtimeThreshold);
            this.baseHours = overtimeThreshold;
        } else {
            this.baseHours = this.actualHours;
            this.overtimeHours = BigDecimal.ZERO;
        }

        this.basePay = this.baseHours.multiply(hourlyWage);
        this.overtimePay = this.overtimeHours
                .multiply(hourlyWage)
                .multiply(rule.getOvertimeMultiplier());

        BigDecimal latePenalty = rule.getLatePenaltyPerMinute()
                .multiply(BigDecimal.valueOf(this.lateMinutes));
        BigDecimal earlyLeavePenalty = rule.getEarlyLeavePenaltyPerMinute()
                .multiply(BigDecimal.valueOf(this.earlyLeaveMinutes));
        this.penaltyAmount = latePenalty.add(earlyLeavePenalty);

        this.totalPayForShift = this.basePay
                .add(this.overtimePay)
                .subtract(this.penaltyAmount);
    }
}