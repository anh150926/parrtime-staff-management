-- =====================================================
-- Coffee House Staff Management System
-- FILE TỔNG HỢP: Tạo Database + Schema + Data
-- Chạy file này trong VS Code với MySQL Extension
-- =====================================================

-- =====================================================
-- PHẦN 1: TẠO DATABASE
-- =====================================================
CREATE DATABASE IF NOT EXISTS coffee_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE coffee_management;

-- =====================================================
-- PHẦN 2: TẠO CẤU TRÚC BẢNG
-- =====================================================

-- Drop tables nếu tồn tại
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

-- Bảng stores - Các cơ sở cà phê
CREATE TABLE stores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    manager_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng users - Người dùng
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('OWNER', 'MANAGER', 'STAFF') NOT NULL,
    store_id BIGINT,
    hourly_rate DECIMAL(10, 2),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE stores ADD CONSTRAINT fk_stores_manager FOREIGN KEY (manager_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Bảng shifts - Ca làm việc
CREATE TABLE shifts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    required_slots INT DEFAULT 1,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shifts_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT fk_shifts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng shift_assignments - Phân công ca
CREATE TABLE shift_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    status ENUM('ASSIGNED', 'CONFIRMED', 'DECLINED') NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shift_assignments_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    CONSTRAINT fk_shift_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_shift_user (shift_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng time_logs - Chấm công
CREATE TABLE time_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    shift_id BIGINT,
    check_in DATETIME,
    check_out DATETIME,
    duration_minutes INT,
    recorded_by ENUM('SYSTEM', 'MANUAL') NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_time_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_time_logs_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng requests - Yêu cầu nghỉ/đổi ca
CREATE TABLE requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('LEAVE', 'SHIFT_CHANGE') NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    review_note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng payrolls - Bảng lương
CREATE TABLE payrolls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    month VARCHAR(7) NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    gross_pay DECIMAL(15, 2) DEFAULT 0,
    adjustments DECIMAL(15, 2) DEFAULT 0,
    adjustment_note VARCHAR(500),
    status ENUM('DRAFT', 'APPROVED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payrolls_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_month (user_id, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng notifications - Thông báo
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng audit_log - Nhật ký
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store ON users(store_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_shifts_store ON shifts(store_id);
CREATE INDEX idx_shifts_datetime ON shifts(start_datetime, end_datetime);
CREATE INDEX idx_time_logs_user ON time_logs(user_id);
CREATE INDEX idx_requests_user ON requests(user_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_payrolls_month ON payrolls(month);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- =====================================================
-- PHẦN 3: THÊM DỮ LIỆU MẪU
-- Password: password123 (BCrypt hash)
-- =====================================================

-- 3 Cơ sở
INSERT INTO stores (id, name, address, opening_time, closing_time) VALUES
(1, 'Coffee House - Hoàn Kiếm', '15 Hàng Bài, Quận Hoàn Kiếm, Hà Nội', '07:00:00', '22:00:00'),
(2, 'Coffee House - Cầu Giấy', '120 Xuân Thủy, Quận Cầu Giấy, Hà Nội', '07:00:00', '23:00:00'),
(3, 'Coffee House - Đống Đa', '25 Tây Sơn, Quận Đống Đa, Hà Nội', '06:30:00', '22:30:00');

-- 1 Owner
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(1, 'owner', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Nguyễn Văn An', 'owner@coffee.vn', '0901234567', 'OWNER', NULL, NULL, 'ACTIVE');

-- 3 Managers
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(2, 'managerA', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Trần Thị Bình', 'managerA@coffee.vn', '0912345678', 'MANAGER', 1, 80000.00, 'ACTIVE'),
(3, 'managerB', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Lê Văn Cường', 'managerB@coffee.vn', '0923456789', 'MANAGER', 2, 80000.00, 'ACTIVE'),
(4, 'managerC', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Phạm Thị Dung', 'managerC@coffee.vn', '0934567890', 'MANAGER', 3, 80000.00, 'ACTIVE');

UPDATE stores SET manager_user_id = 2 WHERE id = 1;
UPDATE stores SET manager_user_id = 3 WHERE id = 2;
UPDATE stores SET manager_user_id = 4 WHERE id = 3;

-- 10 Staff Store A (Hoàn Kiếm)
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(5, 'staff_a01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Hoàng Minh Đức', 'staff_a01@coffee.vn', '0945678901', 'STAFF', 1, 35000.00, 'ACTIVE'),
(6, 'staff_a02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Vũ Thị Hương', 'staff_a02@coffee.vn', '0956789012', 'STAFF', 1, 35000.00, 'ACTIVE'),
(7, 'staff_a03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Đỗ Văn Giang', 'staff_a03@coffee.vn', '0967890123', 'STAFF', 1, 38000.00, 'ACTIVE'),
(8, 'staff_a04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Ngô Thị Hạnh', 'staff_a04@coffee.vn', '0978901234', 'STAFF', 1, 35000.00, 'ACTIVE'),
(9, 'staff_a05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Bùi Văn Khoa', 'staff_a05@coffee.vn', '0989012345', 'STAFF', 1, 36000.00, 'ACTIVE'),
(10, 'staff_a06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Lý Thị Lan', 'staff_a06@coffee.vn', '0990123456', 'STAFF', 1, 35000.00, 'ACTIVE'),
(11, 'staff_a07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Mai Văn Long', 'staff_a07@coffee.vn', '0901234568', 'STAFF', 1, 37000.00, 'ACTIVE'),
(12, 'staff_a08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Đinh Thị Ngọc', 'staff_a08@coffee.vn', '0912345679', 'STAFF', 1, 35000.00, 'ACTIVE'),
(13, 'staff_a09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Trịnh Văn Phong', 'staff_a09@coffee.vn', '0923456780', 'STAFF', 1, 36000.00, 'ACTIVE'),
(14, 'staff_a10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Võ Thị Quỳnh', 'staff_a10@coffee.vn', '0934567891', 'STAFF', 1, 35000.00, 'ACTIVE');

-- 10 Staff Store B (Cầu Giấy)
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(15, 'staff_b01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Đặng Văn Sơn', 'staff_b01@coffee.vn', '0945678902', 'STAFF', 2, 35000.00, 'ACTIVE'),
(16, 'staff_b02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Hồ Thị Trang', 'staff_b02@coffee.vn', '0956789013', 'STAFF', 2, 35000.00, 'ACTIVE'),
(17, 'staff_b03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Lương Văn Uy', 'staff_b03@coffee.vn', '0967890124', 'STAFF', 2, 38000.00, 'ACTIVE'),
(18, 'staff_b04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Châu Thị Vân', 'staff_b04@coffee.vn', '0978901235', 'STAFF', 2, 35000.00, 'ACTIVE'),
(19, 'staff_b05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Tô Văn Xuân', 'staff_b05@coffee.vn', '0989012346', 'STAFF', 2, 36000.00, 'ACTIVE'),
(20, 'staff_b06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Kiều Thị Yến', 'staff_b06@coffee.vn', '0990123457', 'STAFF', 2, 35000.00, 'ACTIVE'),
(21, 'staff_b07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Cao Văn Bảo', 'staff_b07@coffee.vn', '0901234569', 'STAFF', 2, 37000.00, 'ACTIVE'),
(22, 'staff_b08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Dương Thị Chi', 'staff_b08@coffee.vn', '0912345680', 'STAFF', 2, 35000.00, 'ACTIVE'),
(23, 'staff_b09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Lâm Văn Đạt', 'staff_b09@coffee.vn', '0923456781', 'STAFF', 2, 36000.00, 'ACTIVE'),
(24, 'staff_b10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Trương Thị Em', 'staff_b10@coffee.vn', '0934567892', 'STAFF', 2, 35000.00, 'ACTIVE');

-- 10 Staff Store C (Đống Đa)
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(25, 'staff_c01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Phan Văn Giang', 'staff_c01@coffee.vn', '0945678903', 'STAFF', 3, 35000.00, 'ACTIVE'),
(26, 'staff_c02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Quách Thị Hoa', 'staff_c02@coffee.vn', '0956789014', 'STAFF', 3, 35000.00, 'ACTIVE'),
(27, 'staff_c03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Tạ Văn Khải', 'staff_c03@coffee.vn', '0967890125', 'STAFF', 3, 38000.00, 'ACTIVE'),
(28, 'staff_c04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Từ Thị Linh', 'staff_c04@coffee.vn', '0978901236', 'STAFF', 3, 35000.00, 'ACTIVE'),
(29, 'staff_c05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Vương Văn Minh', 'staff_c05@coffee.vn', '0989012347', 'STAFF', 3, 36000.00, 'ACTIVE'),
(30, 'staff_c06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Ân Thị Ngân', 'staff_c06@coffee.vn', '0990123458', 'STAFF', 3, 35000.00, 'ACTIVE'),
(31, 'staff_c07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Biện Văn Phú', 'staff_c07@coffee.vn', '0901234570', 'STAFF', 3, 37000.00, 'ACTIVE'),
(32, 'staff_c08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Cổ Thị Quyên', 'staff_c08@coffee.vn', '0912345681', 'STAFF', 3, 35000.00, 'ACTIVE'),
(33, 'staff_c09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Doãn Văn Sỹ', 'staff_c09@coffee.vn', '0923456782', 'STAFF', 3, 36000.00, 'ACTIVE'),
(34, 'staff_c10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'Giang Thị Thu', 'staff_c10@coffee.vn', '0934567893', 'STAFF', 3, 35000.00, 'ACTIVE');

-- Ca làm mẫu
INSERT INTO shifts (id, store_id, title, start_datetime, end_datetime, required_slots, created_by) VALUES
(1, 1, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 2),
(2, 1, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 3, 2),
(3, 1, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 22 HOUR, 2, 2),
(4, 2, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 3),
(5, 2, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 3, 3),
(6, 3, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 4),
(7, 3, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 3, 4);

-- Phân công ca
INSERT INTO shift_assignments (shift_id, user_id, status) VALUES
(1, 5, 'CONFIRMED'), (1, 6, 'CONFIRMED'), (1, 7, 'ASSIGNED'),
(2, 8, 'CONFIRMED'), (2, 9, 'ASSIGNED'), (2, 10, 'CONFIRMED'),
(3, 11, 'ASSIGNED'), (3, 12, 'CONFIRMED'),
(4, 15, 'CONFIRMED'), (4, 16, 'CONFIRMED'), (4, 17, 'ASSIGNED'),
(5, 18, 'CONFIRMED'), (5, 19, 'ASSIGNED'),
(6, 25, 'CONFIRMED'), (6, 26, 'CONFIRMED'),
(7, 28, 'CONFIRMED'), (7, 29, 'ASSIGNED');

-- Chấm công mẫu
INSERT INTO time_logs (user_id, check_in, check_out, duration_minutes, recorded_by) VALUES
(5, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR, 360, 'SYSTEM'),
(6, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, 360, 'SYSTEM'),
(15, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 14 HOUR, 420, 'SYSTEM'),
(25, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 390, 'MANUAL');

-- Yêu cầu mẫu
INSERT INTO requests (user_id, type, start_datetime, end_datetime, reason, status, reviewed_by, reviewed_at, review_note) VALUES
(5, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 'Có việc gia đình', 'APPROVED', 2, NOW(), 'Đã duyệt'),
(6, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 19 HOUR, 'Đi khám bệnh', 'PENDING', NULL, NULL, NULL),
(15, 'SHIFT_CHANGE', DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR, 'Muốn đổi ca', 'REJECTED', 3, NOW(), 'Không đủ người');

-- Bảng lương mẫu
INSERT INTO payrolls (user_id, month, total_hours, gross_pay, adjustments, adjustment_note, status) VALUES
(5, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 80.50, 2817500.00, 50000.00, 'Thưởng chuyên cần', 'APPROVED'),
(6, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 72.00, 2520000.00, 0.00, NULL, 'APPROVED'),
(15, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 85.00, 2975000.00, 100000.00, 'Thưởng xuất sắc', 'APPROVED'),
(25, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 82.00, 2870000.00, 0.00, NULL, 'DRAFT');

-- Thông báo mẫu
INSERT INTO notifications (user_id, title, message, is_read, link) VALUES
(5, 'Ca làm mới', 'Bạn được phân công ca sáng ngày mai', FALSE, '/my-shifts'),
(6, 'Nhắc ca làm', 'Ca chiều sắp bắt đầu', FALSE, '/my-shifts'),
(2, 'Yêu cầu mới', 'Có yêu cầu nghỉ phép cần duyệt', FALSE, '/requests');

-- Audit log
INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES
(1, 'CREATE', 'STORE', 1, 'Tạo cơ sở Hoàn Kiếm'),
(1, 'CREATE', 'USER', 2, 'Tạo tài khoản Manager A'),
(2, 'APPROVE', 'REQUEST', 1, 'Duyệt yêu cầu nghỉ phép');

-- =====================================================
-- HOÀN TẤT
-- =====================================================
SELECT '✅ Database đã được tạo thành công!' AS Status;
SELECT CONCAT('📊 Tổng: ', COUNT(*), ' users (1 Owner + 3 Managers + 30 Staff)') AS Summary FROM users;
SELECT CONCAT('🏪 ', COUNT(*), ' cơ sở') AS Stores FROM stores;

