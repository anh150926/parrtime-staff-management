-- =====================================================
-- Coffee House Staff Management System - Database Schema
-- Database: MySQL 8.x
-- =====================================================

-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS coffee_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE coffee_management;

-- =====================================================
-- Drop tables nếu tồn tại (theo thứ tự dependency)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payrolls;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS time_logs;
DROP TABLE IF EXISTS shift_assignments;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS stores;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Bảng stores - Các cơ sở cà phê
-- =====================================================
CREATE TABLE stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Tên cơ sở',
    address VARCHAR(255) NOT NULL COMMENT 'Địa chỉ',
    opening_time TIME COMMENT 'Giờ mở cửa',
    closing_time TIME COMMENT 'Giờ đóng cửa',
    manager_user_id BIGINT NULL COMMENT 'ID quản lý cơ sở',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng users - Người dùng (Owner, Manager, Staff)
-- =====================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Tên đăng nhập',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa BCrypt',
    full_name VARCHAR(150) NOT NULL COMMENT 'Họ và tên',
    email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email',
    phone VARCHAR(20) COMMENT 'Số điện thoại',
    role ENUM('OWNER', 'MANAGER', 'STAFF') NOT NULL COMMENT 'Vai trò',
    store_id BIGINT COMMENT 'ID cơ sở làm việc',
    hourly_rate DECIMAL(10, 2) COMMENT 'Lương theo giờ (VNĐ)',
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT 'Trạng thái',
    avatar_url VARCHAR(500) COMMENT 'URL ảnh đại diện',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm foreign key cho store manager sau khi tạo bảng users
ALTER TABLE stores 
ADD CONSTRAINT fk_stores_manager 
FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- =====================================================
-- Bảng shifts - Ca làm việc
-- =====================================================
CREATE TABLE shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL COMMENT 'ID cơ sở',
    title VARCHAR(100) NOT NULL COMMENT 'Tên ca (VD: Ca sáng)',
    start_datetime DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',
    end_datetime DATETIME NOT NULL COMMENT 'Thời gian kết thúc',
    required_slots INT DEFAULT 1 COMMENT 'Số nhân viên cần',
    created_by BIGINT COMMENT 'Người tạo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shifts_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT fk_shifts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng shift_assignments - Phân công ca làm
-- =====================================================
CREATE TABLE shift_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL COMMENT 'ID ca làm',
    user_id BIGINT NOT NULL COMMENT 'ID nhân viên',
    status ENUM('ASSIGNED', 'CONFIRMED', 'DECLINED') NOT NULL DEFAULT 'ASSIGNED' COMMENT 'Trạng thái',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shift_assignments_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    CONSTRAINT fk_shift_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_shift_user (shift_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng time_logs - Chấm công (Check-in/Check-out)
-- =====================================================
CREATE TABLE time_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'ID nhân viên',
    shift_id BIGINT COMMENT 'ID ca làm (nếu có)',
    check_in DATETIME COMMENT 'Thời gian check-in',
    check_out DATETIME COMMENT 'Thời gian check-out',
    duration_minutes INT COMMENT 'Thời gian làm (phút)',
    recorded_by ENUM('SYSTEM', 'MANUAL') NOT NULL DEFAULT 'SYSTEM' COMMENT 'Cách ghi nhận',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_time_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_logs_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng requests - Yêu cầu nghỉ/đổi ca
-- =====================================================
CREATE TABLE requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'ID nhân viên gửi yêu cầu',
    type ENUM('LEAVE', 'SHIFT_CHANGE') NOT NULL COMMENT 'Loại yêu cầu',
    start_datetime DATETIME NOT NULL COMMENT 'Thời gian bắt đầu',
    end_datetime DATETIME NOT NULL COMMENT 'Thời gian kết thúc',
    reason TEXT COMMENT 'Lý do',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'Trạng thái',
    reviewed_by BIGINT COMMENT 'Người duyệt',
    reviewed_at DATETIME COMMENT 'Thời gian duyệt',
    review_note VARCHAR(500) COMMENT 'Ghi chú khi duyệt',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng payrolls - Bảng lương
-- =====================================================
CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'ID nhân viên',
    month VARCHAR(7) NOT NULL COMMENT 'Tháng (YYYY-MM)',
    total_hours DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tổng giờ làm',
    gross_pay DECIMAL(15, 2) DEFAULT 0 COMMENT 'Tổng lương',
    adjustments DECIMAL(15, 2) DEFAULT 0 COMMENT 'Điều chỉnh (thưởng/phạt)',
    adjustment_note VARCHAR(500) COMMENT 'Ghi chú điều chỉnh',
    status ENUM('DRAFT', 'APPROVED', 'PAID') NOT NULL DEFAULT 'DRAFT' COMMENT 'Trạng thái',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payrolls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_month (user_id, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng notifications - Thông báo
-- =====================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'ID người nhận',
    title VARCHAR(200) NOT NULL COMMENT 'Tiêu đề',
    message TEXT COMMENT 'Nội dung',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Đã đọc chưa',
    link VARCHAR(500) COMMENT 'Link liên kết',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Bảng audit_log - Nhật ký hoạt động
-- =====================================================
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT 'ID người thực hiện',
    action VARCHAR(100) NOT NULL COMMENT 'Hành động',
    entity VARCHAR(100) NOT NULL COMMENT 'Đối tượng',
    entity_id BIGINT COMMENT 'ID đối tượng',
    details TEXT COMMENT 'Chi tiết',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tạo Indexes để tối ưu truy vấn
-- =====================================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_shifts_store ON shifts(store_id);
CREATE INDEX idx_shifts_datetime ON shifts(start_datetime, end_datetime);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_time_logs_checkin ON time_logs(check_in);
CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_payrolls_month ON payrolls(month);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity);

-- =====================================================
-- Hoàn tất
-- =====================================================
SELECT 'Schema đã được tạo thành công!' AS Message;








