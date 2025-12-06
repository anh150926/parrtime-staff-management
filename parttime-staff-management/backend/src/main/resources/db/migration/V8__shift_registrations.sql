-- =====================================================
-- Coffee Shop Staff Management System - Shift Registrations
-- Version 8: Add Shift Registration System
-- =====================================================

-- =====================================================
-- Add is_template field to shifts table
-- =====================================================
ALTER TABLE shifts
    ADD COLUMN is_template BOOLEAN DEFAULT FALSE COMMENT 'Ca mẫu cho đăng ký' AFTER required_slots,
    ADD COLUMN shift_type ENUM('MORNING', 'AFTERNOON', 'EVENING') NULL COMMENT 'Loại ca: sáng, chiều, tối' AFTER is_template,
    ADD COLUMN day_of_week INT NULL COMMENT 'Ngày trong tuần (1=Monday, 7=Sunday)' AFTER shift_type;

-- =====================================================
-- Shift Registrations table
-- =====================================================
CREATE TABLE shift_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL COMMENT 'ID ca mẫu',
    user_id BIGINT NOT NULL COMMENT 'ID nhân viên đăng ký',
    registration_date DATE NOT NULL COMMENT 'Ngày đăng ký (ngày cụ thể trong tuần)',
    status ENUM('REGISTERED', 'CANCELLED') NOT NULL DEFAULT 'REGISTERED' COMMENT 'Trạng thái đăng ký',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian đăng ký',
    cancelled_at DATETIME NULL COMMENT 'Thời gian hủy đăng ký',
    CONSTRAINT fk_registrations_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_registration_shift_user_date (shift_id, user_id, registration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_registrations_shift ON shift_registrations(shift_id);
CREATE INDEX idx_registrations_user ON shift_registrations(user_id);
CREATE INDEX idx_registrations_date ON shift_registrations(registration_date);
CREATE INDEX idx_registrations_status ON shift_registrations(status);
CREATE INDEX idx_shifts_template ON shifts(is_template);
CREATE INDEX idx_shifts_type ON shifts(shift_type);
CREATE INDEX idx_shifts_day_of_week ON shifts(day_of_week);
