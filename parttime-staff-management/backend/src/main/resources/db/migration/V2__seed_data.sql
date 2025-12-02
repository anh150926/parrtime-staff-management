-- =====================================================
-- Coffee House Staff Management System - Sample Data
-- 1 Owner + 3 Managers + 30 Staff (10 mỗi cơ sở)
-- Password cho tất cả: password123
-- BCrypt hash: $2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu
-- =====================================================

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
-- Store B - Cầu Giấy
(4, 2, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 3),
(5, 2, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 3, 3),
(6, 2, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 23 HOUR, 2, 3),
-- Store C - Đống Đa
(7, 3, 'Ca sáng', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 3, 4),
(8, 3, 'Ca chiều', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, 3, 4),
(9, 3, 'Ca tối', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 22 HOUR + INTERVAL 30 MINUTE, 2, 4);

-- =====================================================
-- 8. Phân công ca làm mẫu
-- =====================================================
INSERT INTO shift_assignments (shift_id, user_id, status) VALUES
-- Store A shifts
(1, 5, 'CONFIRMED'), (1, 6, 'CONFIRMED'), (1, 7, 'ASSIGNED'),
(2, 8, 'CONFIRMED'), (2, 9, 'ASSIGNED'), (2, 10, 'CONFIRMED'),
(3, 11, 'ASSIGNED'), (3, 12, 'CONFIRMED'),
-- Store B shifts
(4, 15, 'CONFIRMED'), (4, 16, 'CONFIRMED'), (4, 17, 'ASSIGNED'),
(5, 18, 'CONFIRMED'), (5, 19, 'ASSIGNED'), (5, 20, 'CONFIRMED'),
(6, 21, 'ASSIGNED'), (6, 22, 'CONFIRMED'),
-- Store C shifts
(7, 25, 'CONFIRMED'), (7, 26, 'CONFIRMED'), (7, 27, 'ASSIGNED'),
(8, 28, 'CONFIRMED'), (8, 29, 'ASSIGNED'), (8, 30, 'CONFIRMED'),
(9, 31, 'ASSIGNED'), (9, 32, 'CONFIRMED');

-- =====================================================
-- 9. Thêm dữ liệu chấm công mẫu
-- =====================================================
INSERT INTO time_logs (user_id, shift_id, check_in, check_out, duration_minutes, recorded_by) VALUES
(5, NULL, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR + INTERVAL 15 MINUTE, 375, 'SYSTEM'),
(5, NULL, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 7 HOUR + INTERVAL 5 MINUTE, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 355, 'SYSTEM'),
(6, NULL, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 19 HOUR, 360, 'SYSTEM'),
(15, NULL, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_SUB(CURDATE(), INTERVAL 3 DAY) + INTERVAL 14 HOUR, 420, 'SYSTEM'),
(25, NULL, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, DATE_SUB(CURDATE(), INTERVAL 2 DAY) + INTERVAL 13 HOUR, 390, 'MANUAL');

-- =====================================================
-- 10. Thêm yêu cầu nghỉ/đổi ca mẫu
-- =====================================================
INSERT INTO requests (user_id, type, start_datetime, end_datetime, reason, status, reviewed_by, reviewed_at, review_note) VALUES
(5, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 5 DAY) + INTERVAL 13 HOUR, 'Có việc gia đình', 'APPROVED', 2, NOW(), 'Đã duyệt'),
(6, 'LEAVE', DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 13 HOUR, DATE_ADD(CURDATE(), INTERVAL 7 DAY) + INTERVAL 19 HOUR, 'Đi khám bệnh', 'PENDING', NULL, NULL, NULL),
(15, 'SHIFT_CHANGE', DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 7 HOUR, DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 13 HOUR, 'Muốn đổi sang ca chiều', 'REJECTED', 3, NOW(), 'Không đủ người'),
(25, 'SHIFT_CHANGE', DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 19 HOUR, DATE_ADD(CURDATE(), INTERVAL 4 DAY) + INTERVAL 22 HOUR, 'Muốn đổi ca vì có lịch học', 'PENDING', NULL, NULL, NULL);

-- =====================================================
-- 11. Thêm bảng lương mẫu
-- =====================================================
INSERT INTO payrolls (user_id, month, total_hours, gross_pay, adjustments, adjustment_note, status) VALUES
(5, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 80.50, 2817500.00, 50000.00, 'Thưởng đi làm đúng giờ', 'APPROVED'),
(6, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 72.00, 2520000.00, 0.00, NULL, 'APPROVED'),
(15, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 85.00, 2975000.00, 100000.00, 'Thưởng nhân viên xuất sắc', 'APPROVED'),
(25, DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m'), 82.00, 2870000.00, 50000.00, 'Thưởng chuyên cần', 'DRAFT');

-- =====================================================
-- 12. Thêm thông báo mẫu
-- =====================================================
INSERT INTO notifications (user_id, title, message, is_read, link) VALUES
(5, 'Ca làm mới được phân công', 'Bạn đã được phân công ca sáng ngày mai.', FALSE, '/my-shifts'),
(5, 'Yêu cầu nghỉ phép đã được duyệt', 'Yêu cầu của bạn đã được duyệt.', TRUE, '/requests'),
(6, 'Nhắc nhở ca làm', 'Ca chiều sẽ bắt đầu trong 1 giờ.', FALSE, '/my-shifts'),
(2, 'Yêu cầu nghỉ phép mới', 'Nhân viên gửi yêu cầu nghỉ phép.', FALSE, '/requests');

-- =====================================================
-- 13. Audit Log mẫu
-- =====================================================
INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES
(1, 'CREATE', 'USER', 2, 'Tạo tài khoản Manager Store A'),
(1, 'CREATE', 'USER', 3, 'Tạo tài khoản Manager Store B'),
(1, 'CREATE', 'USER', 4, 'Tạo tài khoản Manager Store C'),
(2, 'CREATE', 'SHIFT', 1, 'Tạo ca sáng Store A'),
(2, 'APPROVE', 'REQUEST', 1, 'Duyệt yêu cầu nghỉ phép');
