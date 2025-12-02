-- =====================================================
-- Coffee House Staff Management System - Sample Data
-- 1 Owner + 3 Managers + 30 Staff (10 mỗi cơ sở)
-- Password cho tất cả: password123
-- BCrypt hash: $2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu
-- =====================================================

USE coffee_management;

-- =====================================================
-- 1. Thêm 3 cơ sở (Stores)
-- =====================================================
INSERT INTO stores (id, name, address, opening_time, closing_time) VALUES
(1, 'Coffee House - Hoàn Kiếm', '15 Hàng Bài, Quận Hoàn Kiếm, Hà Nội', '07:00:00', '22:00:00'),
(2, 'Coffee House - Cầu Giấy', '120 Xuân Thủy, Quận Cầu Giấy, Hà Nội', '07:00:00', '23:00:00'),
(3, 'Coffee House - Đống Đa', '25 Tây Sơn, Quận Đống Đa, Hà Nội', '06:30:00', '22:30:00');

-- =====================================================
-- 2. Thêm Owner (1 tài khoản)
-- =====================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(1, 'owner', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Nguyễn Văn An', 'owner@coffee.vn', '0901234567', 'OWNER', NULL, NULL, 'ACTIVE');

-- =====================================================
-- 3. Thêm Managers (3 tài khoản - mỗi cơ sở 1 quản lý)
-- =====================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(2, 'managerA', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Trần Thị Bình', 'managerA@coffee.vn', '0912345678', 'MANAGER', 1, 80000.00, 'ACTIVE'),
(3, 'managerB', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Lê Văn Cường', 'managerB@coffee.vn', '0923456789', 'MANAGER', 2, 80000.00, 'ACTIVE'),
(4, 'managerC', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Phạm Thị Dung', 'managerC@coffee.vn', '0934567890', 'MANAGER', 3, 80000.00, 'ACTIVE');

-- Cập nhật manager cho các store
UPDATE stores SET manager_user_id = 2 WHERE id = 1;
UPDATE stores SET manager_user_id = 3 WHERE id = 2;
UPDATE stores SET manager_user_id = 4 WHERE id = 3;

-- =====================================================
-- 4. Thêm Staff Store A - Hoàn Kiếm (10 nhân viên)
-- =====================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(5, 'staff_a01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Hoàng Minh Đức', 'staff_a01@coffee.vn', '0945678901', 'STAFF', 1, 35000.00, 'ACTIVE'),
(6, 'staff_a02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Vũ Thị Hương', 'staff_a02@coffee.vn', '0956789012', 'STAFF', 1, 35000.00, 'ACTIVE'),
(7, 'staff_a03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Đỗ Văn Giang', 'staff_a03@coffee.vn', '0967890123', 'STAFF', 1, 38000.00, 'ACTIVE'),
(8, 'staff_a04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Ngô Thị Hạnh', 'staff_a04@coffee.vn', '0978901234', 'STAFF', 1, 35000.00, 'ACTIVE'),
(9, 'staff_a05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
   'Bùi Văn Khoa', 'staff_a05@coffee.vn', '0989012345', 'STAFF', 1, 36000.00, 'ACTIVE'),
(10, 'staff_a06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Lý Thị Lan', 'staff_a06@coffee.vn', '0990123456', 'STAFF', 1, 35000.00, 'ACTIVE'),
(11, 'staff_a07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Mai Văn Long', 'staff_a07@coffee.vn', '0901234568', 'STAFF', 1, 37000.00, 'ACTIVE'),
(12, 'staff_a08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Đinh Thị Ngọc', 'staff_a08@coffee.vn', '0912345679', 'STAFF', 1, 35000.00, 'ACTIVE'),
(13, 'staff_a09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Trịnh Văn Phong', 'staff_a09@coffee.vn', '0923456780', 'STAFF', 1, 36000.00, 'ACTIVE'),
(14, 'staff_a10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Võ Thị Quỳnh', 'staff_a10@coffee.vn', '0934567891', 'STAFF', 1, 35000.00, 'ACTIVE');

-- =====================================================
-- 5. Thêm Staff Store B - Cầu Giấy (10 nhân viên)
-- =====================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(15, 'staff_b01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Đặng Văn Sơn', 'staff_b01@coffee.vn', '0945678902', 'STAFF', 2, 35000.00, 'ACTIVE'),
(16, 'staff_b02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Hồ Thị Trang', 'staff_b02@coffee.vn', '0956789013', 'STAFF', 2, 35000.00, 'ACTIVE'),
(17, 'staff_b03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Lương Văn Uy', 'staff_b03@coffee.vn', '0967890124', 'STAFF', 2, 38000.00, 'ACTIVE'),
(18, 'staff_b04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Châu Thị Vân', 'staff_b04@coffee.vn', '0978901235', 'STAFF', 2, 35000.00, 'ACTIVE'),
(19, 'staff_b05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Tô Văn Xuân', 'staff_b05@coffee.vn', '0989012346', 'STAFF', 2, 36000.00, 'ACTIVE'),
(20, 'staff_b06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Kiều Thị Yến', 'staff_b06@coffee.vn', '0990123457', 'STAFF', 2, 35000.00, 'ACTIVE'),
(21, 'staff_b07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Cao Văn Bảo', 'staff_b07@coffee.vn', '0901234569', 'STAFF', 2, 37000.00, 'ACTIVE'),
(22, 'staff_b08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Dương Thị Chi', 'staff_b08@coffee.vn', '0912345680', 'STAFF', 2, 35000.00, 'ACTIVE'),
(23, 'staff_b09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Lâm Văn Đạt', 'staff_b09@coffee.vn', '0923456781', 'STAFF', 2, 36000.00, 'ACTIVE'),
(24, 'staff_b10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Trương Thị Em', 'staff_b10@coffee.vn', '0934567892', 'STAFF', 2, 35000.00, 'ACTIVE');

-- =====================================================
-- 6. Thêm Staff Store C - Đống Đa (10 nhân viên)
-- =====================================================
INSERT INTO users (id, username, password_hash, full_name, email, phone, role, store_id, hourly_rate, status) VALUES
(25, 'staff_c01', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Phan Văn Giang', 'staff_c01@coffee.vn', '0945678903', 'STAFF', 3, 35000.00, 'ACTIVE'),
(26, 'staff_c02', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Quách Thị Hoa', 'staff_c02@coffee.vn', '0956789014', 'STAFF', 3, 35000.00, 'ACTIVE'),
(27, 'staff_c03', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Tạ Văn Khải', 'staff_c03@coffee.vn', '0967890125', 'STAFF', 3, 38000.00, 'ACTIVE'),
(28, 'staff_c04', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Từ Thị Linh', 'staff_c04@coffee.vn', '0978901236', 'STAFF', 3, 35000.00, 'ACTIVE'),
(29, 'staff_c05', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Vương Văn Minh', 'staff_c05@coffee.vn', '0989012347', 'STAFF', 3, 36000.00, 'ACTIVE'),
(30, 'staff_c06', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Ân Thị Ngân', 'staff_c06@coffee.vn', '0990123458', 'STAFF', 3, 35000.00, 'ACTIVE'),
(31, 'staff_c07', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Biện Văn Phú', 'staff_c07@coffee.vn', '0901234570', 'STAFF', 3, 37000.00, 'ACTIVE'),
(32, 'staff_c08', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Cổ Thị Quyên', 'staff_c08@coffee.vn', '0912345681', 'STAFF', 3, 35000.00, 'ACTIVE'),
(33, 'staff_c09', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Doãn Văn Sỹ', 'staff_c09@coffee.vn', '0923456782', 'STAFF', 3, 36000.00, 'ACTIVE'),
(34, 'staff_c10', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 
    'Giang Thị Thu', 'staff_c10@coffee.vn', '0934567893', 'STAFF', 3, 35000.00, 'ACTIVE');

-- =====================================================
-- 7. Thêm Ca làm mẫu cho tuần tới
-- =====================================================
INSERT INTO shifts (id, store_id, title, start_datetime, end_datetime, required_slots, created_by) VALUES
-- Store A - Hoàn Kiếm
(1, 1, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 2),
(2, 1, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 3, 2),
(3, 1, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 22 HOUR, 2, 2),
(4, 1, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 3, 2),
(5, 1, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, 3, 2),
-- Store B - Cầu Giấy
(6, 2, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 3),
(7, 2, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 3, 3),
(8, 2, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 23 HOUR, 2, 3),
(9, 2, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 3, 3),
-- Store C - Đống Đa
(10, 3, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 4),
(11, 3, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 3, 4),
(12, 3, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 22 HOUR + INTERVAL 30 MINUTE, 2, 4);

-- =====================================================
-- 8. Phân công ca làm mẫu
-- =====================================================
INSERT INTO shift_assignments (shift_id, user_id, status) VALUES
-- Store A shifts
(1, 5, 'CONFIRMED'), (1, 6, 'CONFIRMED'), (1, 7, 'ASSIGNED'),
(2, 8, 'CONFIRMED'), (2, 9, 'ASSIGNED'), (2, 10, 'CONFIRMED'),
(3, 11, 'ASSIGNED'), (3, 12, 'CONFIRMED'),
(4, 5, 'ASSIGNED'), (4, 13, 'CONFIRMED'), (4, 14, 'ASSIGNED'),
(5, 6, 'CONFIRMED'), (5, 7, 'CONFIRMED'), (5, 8, 'ASSIGNED'),
-- Store B shifts
(6, 15, 'CONFIRMED'), (6, 16, 'CONFIRMED'), (6, 17, 'ASSIGNED'),
(7, 18, 'CONFIRMED'), (7, 19, 'ASSIGNED'), (7, 20, 'CONFIRMED'),
(8, 21, 'ASSIGNED'), (8, 22, 'CONFIRMED'),
(9, 15, 'ASSIGNED'), (9, 23, 'CONFIRMED'), (9, 24, 'ASSIGNED'),
-- Store C shifts
(10, 25, 'CONFIRMED'), (10, 26, 'CONFIRMED'), (10, 27, 'ASSIGNED'),
(11, 28, 'CONFIRMED'), (11, 29, 'ASSIGNED'), (11, 30, 'CONFIRMED'),
(12, 31, 'ASSIGNED'), (12, 32, 'CONFIRMED');

-- =====================================================
-- 9. Thêm dữ liệu chấm công mẫu (tháng trước)
-- =====================================================
INSERT INTO time_logs (user_id, shift_id, check_in, check_out, duration_minutes, recorded_by) VALUES
-- Store A staff
(5, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 375, 'SYSTEM'),
(5, NULL, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 7 HOUR + INTERVAL 5 MINUTE, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, 355, 'SYSTEM'),
(5, NULL, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 19 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 22 HOUR + INTERVAL 10 MINUTE, 190, 'SYSTEM'),
(6, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 19 HOUR, 360, 'SYSTEM'),
(6, NULL, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, 360, 'SYSTEM'),
(7, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 360, 'SYSTEM'),
(8, NULL, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 19 HOUR, 360, 'SYSTEM'),
-- Store B staff
(15, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 14 HOUR, 420, 'SYSTEM'),
(16, NULL, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 20 HOUR, 420, 'SYSTEM'),
(17, NULL, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR, 360, 'SYSTEM'),
-- Store C staff
(25, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_SUB(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 390, 'MANUAL'),
(26, NULL, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 4 DAY) + INTERVAL 19 HOUR, 360, 'SYSTEM'),
(27, NULL, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 19 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 22 HOUR + INTERVAL 30 MINUTE, 210, 'SYSTEM');

-- =====================================================
-- 10. Thêm yêu cầu nghỉ/đổi ca mẫu
-- =====================================================
INSERT INTO requests (user_id, type, start_datetime, end_datetime, reason, status, reviewed_by, reviewed_at, review_note) VALUES
-- Approved requests
(5, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 13 HOUR, 
   'Có việc gia đình cần giải quyết', 'APPROVED', 2, NOW(), 'Đã duyệt, nhớ tìm người thay ca'),
(15, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 8 DAY) + INTERVAL 20 HOUR, 
   'Đi khám bệnh định kỳ', 'APPROVED', 3, NOW(), 'OK'),
-- Pending requests  
(6, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 10 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 10 DAY) + INTERVAL 19 HOUR, 
   'Thi học kỳ', 'PENDING', NULL, NULL, NULL),
(25, 'SHIFT_CHANGE', DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 22 HOUR, 
   'Muốn đổi sang ca sáng vì có lịch học', 'PENDING', NULL, NULL, NULL),
(16, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 12 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 12 DAY) + INTERVAL 13 HOUR, 
   'Việc cá nhân', 'PENDING', NULL, NULL, NULL),
-- Rejected requests
(17, 'SHIFT_CHANGE', DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR, 
   'Muốn đổi sang ca chiều', 'REJECTED', 3, NOW(), 'Không đủ người cho ca chiều');

-- =====================================================
-- 11. Thêm bảng lương mẫu (tháng trước)
-- =====================================================
INSERT INTO payrolls (user_id, month, total_hours, gross_pay, adjustments, adjustment_note, status) VALUES
-- Store A
(5, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 80.50, 2817500.00, 50000.00, 'Thưởng đi làm đúng giờ', 'APPROVED'),
(6, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 72.00, 2520000.00, 0.00, NULL, 'APPROVED'),
(7, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 65.25, 2479500.00, -50000.00, 'Trừ đi muộn 3 lần', 'APPROVED'),
(8, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 78.00, 2730000.00, 0.00, NULL, 'PAID'),
(9, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 60.00, 2160000.00, 0.00, NULL, 'PAID'),
(10, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 70.00, 2450000.00, 0.00, NULL, 'APPROVED'),
-- Store B
(15, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 85.00, 2975000.00, 100000.00, 'Thưởng nhân viên xuất sắc', 'APPROVED'),
(16, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 70.00, 2450000.00, 0.00, NULL, 'DRAFT'),
(17, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 68.00, 2584000.00, 0.00, NULL, 'DRAFT'),
(18, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 75.00, 2625000.00, 0.00, NULL, 'APPROVED'),
-- Store C
(25, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 82.00, 2870000.00, 50000.00, 'Thưởng chuyên cần', 'APPROVED'),
(26, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 65.00, 2275000.00, 0.00, NULL, 'APPROVED'),
(27, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 72.00, 2736000.00, 0.00, NULL, 'DRAFT'),
(28, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 55.00, 1925000.00, 0.00, NULL, 'DRAFT');

-- =====================================================
-- 12. Thêm thông báo mẫu
-- =====================================================
INSERT INTO notifications (user_id, title, message, is_read, link) VALUES
(5, 'Ca làm mới được phân công', 'Bạn đã được phân công ca sáng ngày mai. Vui lòng xác nhận.', FALSE, '/my-shifts'),
(5, 'Yêu cầu nghỉ phép đã được duyệt', 'Yêu cầu nghỉ phép của bạn đã được Manager Bình phê duyệt.', TRUE, '/requests'),
(6, 'Nhắc nhở ca làm', 'Ca chiều của bạn sẽ bắt đầu trong 1 giờ nữa.', FALSE, '/my-shifts'),
(6, 'Ca làm mới', 'Bạn có ca làm mới vào ngày mai.', FALSE, '/my-shifts'),
(15, 'Yêu cầu nghỉ phép đã được duyệt', 'Yêu cầu của bạn đã được duyệt.', TRUE, '/requests'),
(17, 'Yêu cầu đổi ca bị từ chối', 'Yêu cầu đổi ca của bạn đã bị từ chối. Lý do: Không đủ người cho ca chiều', TRUE, '/requests'),
(25, 'Ca làm mới được phân công', 'Bạn đã được phân công ca sáng.', FALSE, '/my-shifts'),
(2, 'Yêu cầu nghỉ phép mới', 'Nhân viên Vũ Thị Hương gửi yêu cầu nghỉ phép. Vui lòng xem xét.', FALSE, '/requests'),
(3, 'Yêu cầu nghỉ phép mới', 'Nhân viên Hồ Thị Trang gửi yêu cầu nghỉ phép. Vui lòng xem xét.', FALSE, '/requests'),
(4, 'Yêu cầu đổi ca mới', 'Nhân viên Phan Văn Giang gửi yêu cầu đổi ca. Vui lòng xem xét.', FALSE, '/requests');

-- =====================================================
-- 13. Thêm Audit Log mẫu
-- =====================================================
INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES
(1, 'CREATE', 'USER', 2, 'Tạo tài khoản Manager cho Store A'),
(1, 'CREATE', 'USER', 3, 'Tạo tài khoản Manager cho Store B'),
(1, 'CREATE', 'USER', 4, 'Tạo tài khoản Manager cho Store C'),
(2, 'CREATE', 'SHIFT', 1, 'Tạo ca sáng cho Store A'),
(2, 'APPROVE', 'REQUEST', 1, 'Duyệt yêu cầu nghỉ phép'),
(3, 'REJECT', 'REQUEST', 6, 'Từ chối yêu cầu đổi ca'),
(1, 'APPROVE', 'PAYROLL', 1, 'Duyệt bảng lương tháng trước cho staff_a01');

-- =====================================================
-- Hoàn tất
-- =====================================================
SELECT 'Dữ liệu mẫu đã được thêm thành công!' AS Message;
SELECT CONCAT('Tổng cộng: 1 Owner + 3 Managers + 30 Staff = ', COUNT(*), ' users') AS Summary FROM users;

