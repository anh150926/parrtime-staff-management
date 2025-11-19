/* file: frontend/src/models/Enums.ts */

export enum Role {
  SUPER_ADMIN = "ROLE_SUPER_ADMIN",
  MANAGER = "ROLE_MANAGER",
  STAFF = "ROLE_STAFF",
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum RequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum AdjustmentType {
  BONUS = "BONUS",
  PENALTY = "PENALTY",
}

// (Tùy chọn: Nếu bạn muốn dùng Enum cho loại ca thay vì string)
export enum ShiftType {
  MORNING = "CA_SANG",
  AFTERNOON = "CA_CHIEU",
  NIGHT = "CA_TOI",
}
