package com.company.ptsm.model.enums;

import java.time.LocalTime;

public enum ShiftType {
    CA_1(LocalTime.of(8, 0), LocalTime.of(16, 0)),
    CA_2(LocalTime.of(16, 0), LocalTime.MIDNIGHT);

    private final LocalTime startTime;
    private final LocalTime endTime;

    ShiftType(LocalTime startTime, LocalTime endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public double getStandardHours() {
        return 8.0;
    }
}