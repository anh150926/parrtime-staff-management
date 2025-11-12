/*
 * file: frontend/src/models/Enums.ts
 *
 * Các Enums từ Backend.
 */

export enum Role {
  EMPLOYEE = "ROLE_EMPLOYEE",
  MANAGER = "ROLE_MANAGER",
  ADMIN = "ROLE_ADMIN",
}

export enum ShiftType {
  CA_1 = "CA_1", // 8h-16h
  CA_2 = "CA_2", // 16h-00h
}

export enum DayOfWeekEnum {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIFAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum ScheduleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
}
