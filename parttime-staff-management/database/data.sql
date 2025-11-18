/*
 * DATA PHIÊN BẢN 2 (V2) - FULL DỮ LIỆU
 *
 * Nạp toàn bộ: 1 Super Admin, 3 Manager, 30 Staff.
 * Mật khẩu tất cả: 'password123'
 */

USE parttime_staff_db;

-- 1. TẠO CƠ SỞ (BRANCHES)
INSERT INTO branches (name, address) VALUES
('Cơ sở 1 (Hoàn Kiếm)', '12 Hàng Bài, Hoàn Kiếm, Hà Nội'),
('Cơ sở 2 (Cầu Giấy)', '34 Xuân Thủy, Cầu Giấy, Hà Nội'),
('Cơ sở 3 (Thanh Xuân)', '55 Nguyễn Trãi, Thanh Xuân, Hà Nội');

-- 2. TẠO CHỨC VỤ (POSITIONS)
-- Cơ sở 1
INSERT INTO positions (branch_id, position_code, name) VALUES
(1, 'QL', 'Quản lý'), (1, 'PC', 'Pha chế (Barista)'), (1, 'PV', 'Phục vụ');
-- Cơ sở 2
INSERT INTO positions (branch_id, position_code, name) VALUES
(2, 'QL', 'Quản lý'), (2, 'PC', 'Pha chế (Barista)'), (2, 'PV', 'Phục vụ');
-- Cơ sở 3
INSERT INTO positions (branch_id, position_code, name) VALUES
(3, 'QL', 'Quản lý'), (3, 'PC', 'Pha chế (Barista)'), (3, 'PV', 'Phục vụ');

-- 3. TẠO MẪU CA (SHIFT TEMPLATES)
INSERT INTO shift_templates (branch_id, name, start_time, end_time) VALUES
(1, 'Ca Sáng (HK)', '07:00:00', '15:00:00'), (1, 'Ca Tối (HK)', '15:00:00', '23:00:00'),
(2, 'Ca Sáng (CG)', '07:30:00', '15:30:00'), (2, 'Ca Tối (CG)', '15:30:00', '23:30:00'),
(3, 'Ca Sáng (TX)', '07:00:00', '15:00:00'), (3, 'Ca Tối (TX)', '15:00:00', '23:00:00');

-- 4. CẤU HÌNH CHUNG
INSERT INTO global_configs (config_key, config_value, description) VALUES
('HOURLY_WAGE_STAFF_PV', '30000', 'Lương giờ Phục Vụ'),
('HOURLY_WAGE_STAFF_PC', '35000', 'Lương giờ Pha Chế'),
('OVERTIME_THRESHOLD_HOURS', '8', 'Ngưỡng OT');

-- =============================================
-- 5. TẠO TÀI KHOẢN (USERS) - MẬT KHẨU ĐÚNG
-- =============================================
SET @h = '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu'; -- password123

-- Super Admin (ID=1)
INSERT INTO users (email, password, `role`, `status`) VALUES 
('owner@coffeechain.com', @h, 'ROLE_SUPER_ADMIN', 'ACTIVE');

-- Managers (ID 2,3,4)
INSERT INTO users (email, password, `role`, `status`, branch_id, position_id) VALUES
('manager.hn1@coffeechain.com', @h, 'ROLE_MANAGER', 'ACTIVE', 1, 1),
('manager.hn2@coffeechain.com', @h, 'ROLE_MANAGER', 'ACTIVE', 2, 4),
('manager.hn3@coffeechain.com', @h, 'ROLE_MANAGER', 'ACTIVE', 3, 7);

-- Staff Cơ sở 1 (ID 5-14)
INSERT INTO users (email, password, `role`, `status`, branch_id, position_id) VALUES
('staff01@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 2),
('staff02@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3),
('staff03@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3),
('staff04@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 2),
('staff05@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3),
('staff06@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3),
('staff07@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3),
('staff08@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 2),
('staff09@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 2),
('staff10@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 1, 3);

-- Staff Cơ sở 2 (ID 15-24)
INSERT INTO users (email, password, `role`, `status`, branch_id, position_id) VALUES
('staff11@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 5),
('staff12@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6),
('staff13@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6),
('staff14@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 5),
('staff15@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6),
('staff16@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6),
('staff17@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6),
('staff18@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 5),
('staff19@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 5),
('staff20@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 2, 6);

-- Staff Cơ sở 3 (ID 25-34)
INSERT INTO users (email, password, `role`, `status`, branch_id, position_id) VALUES
('staff21@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 8),
('staff22@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9),
('staff23@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9),
('staff24@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 8),
('staff25@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9),
('staff26@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9),
('staff27@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9),
('staff28@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 8),
('staff29@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 8),
('staff30@coffeechain.com', @h, 'ROLE_STAFF', 'ACTIVE', 3, 9);

-- =============================================
-- 6. TẠO HỒ SƠ (PROFILES)
-- =============================================

-- Profiles Manager
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary) VALUES
(2, 'HN1-QL-0001', 'Nguyễn Văn Mạnh', '0911111111', 15000000),
(3, 'HN2-QL-0001', 'Trần Thị Hằng', '0922222222', 14000000),
(4, 'HN3-QL-0001', 'Lê Văn Dũng', '0933333333', 14500000);

-- Profiles Staff (Cơ sở 1)
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary) VALUES
(5, 'HN1-PC-0001', 'Nguyễn Văn An', '0911000001', 0),
(6, 'HN1-PV-0001', 'Trần Thị Bình', '0911000002', 0),
(7, 'HN1-PV-0002', 'Lê Minh Cường', '0911000003', 0),
(8, 'HN1-PC-0002', 'Phạm Thị Dung', '0911000004', 0),
(9, 'HN1-PV-0003', 'Vũ Văn Em', '0911000005', 0),
(10, 'HN1-PV-0004', 'Bùi Thị Giang', '0911000006', 0),
(11, 'HN1-PV-0005', 'Hoàng Văn Hải', '0922000001', 0),
(12, 'HN1-PC-0003', 'Mai Thị Hằng', '0922000002', 0),
(13, 'HN1-PC-0004', 'Lương Văn Kiên', '0922000003', 0),
(14, 'HN1-PV-0006', 'Trịnh Thị Lan', '0922000004', 0);

-- Profiles Staff (Cơ sở 2)
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary) VALUES
(15, 'HN2-PC-0001', 'Đặng Văn Minh', '0933000001', 0),
(16, 'HN2-PV-0001', 'Ngô Thị Nga', '0933000002', 0),
(17, 'HN2-PV-0002', 'Phan Văn Long', '0933000003', 0),
(18, 'HN2-PC-0002', 'Đỗ Thị Oanh', '0933000004', 0),
(19, 'HN2-PV-0003', 'Tô Văn Quân', '0933000005', 0),
(20, 'HN2-PV-0004', 'Hồ Thị Quỳnh', '0933000006', 0),
(21, 'HN2-PV-0005', 'Võ Văn Sang', '0933000007', 0),
(22, 'HN2-PC-0003', 'Đinh Thị Tú', '0933000008', 0),
(23, 'HN2-PC-0004', 'Uông Văn Tài', '0933000009', 0),
(24, 'HN2-PV-0006', 'Vương Thị Tâm', '0933000010', 0);

-- Profiles Staff (Cơ sở 3)
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary) VALUES
(25, 'HN3-PC-0001', 'Giang Văn Thắng', '0933000011', 0),
(26, 'HN3-PV-0001', 'Hà Thị Thảo', '0933000012', 0),
(27, 'HN3-PV-0002', 'Lại Văn Tiến', '0933000013', 0),
(28, 'HN3-PC-0002', 'Mạc Thị Uyên', '0933000014', 0),
(29, 'HN3-PV-0003', 'Nông Văn Vui', '0933000015', 0),
(30, 'HN3-PV-0004', 'Oa Thị Xuân', '0933000016', 0),
(31, 'HN3-PV-0005', 'Phí Văn Yên', '0933000017', 0),
(32, 'HN3-PC-0003', 'Quách Thị Yến', '0933000018', 0),
(33, 'HN3-PC-0004', 'Cao Văn Anh', '0933000019', 0),
(34, 'HN3-PV-0006', 'Châu Thị Ánh', '0933000020', 0);