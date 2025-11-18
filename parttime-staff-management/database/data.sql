/*
 * file: database/data.sql (PHIÊN BẢN CẢI TIẾN)
 *
 * Nạp dữ liệu mẫu cho hệ thống 3 vai trò, 3 cơ sở (Hà Nội).
 *
 * [CẬP NHẬT] Hash Bcrypt mới:
 * '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu'
 */

-- === 1. TẠO CƠ SỞ (BRANCHES) (3 cơ sở) ===
INSERT INTO branches (name, address) VALUES
('Cơ sở 1 (Hoàn Kiếm)', '12 Hàng Bài, Hoàn Kiếm, Hà Nội'),
('Cơ sở 2 (Cầu Giấy)', '34 Xuân Thủy, Cầu Giấy, Hà Nội'),
('Cơ sở 3 (Thanh Xuân)', '55 Nguyễn Trãi, Thanh Xuân, Hà Nội');

-- === 2. TẠO CHỨC VỤ (POSITIONS) (Cho cả 3 cơ sở) ===
-- (Cơ sở 1: ID 1-3)
INSERT INTO positions (branch_id, position_code, name) VALUES
(1, 'QL', 'Quản lý'),
(1, 'PC', 'Pha chế (Barista)'),
(1, 'PV', 'Phục vụ (Waiter/Waitress)');
-- (Cơ sở 2: ID 4-6)
INSERT INTO positions (branch_id, position_code, name) VALUES
(2, 'QL', 'Quản lý'),
(2, 'PC', 'Pha chế (Barista)'),
(2, 'PV', 'Phục vụ (Waiter/Waitress)');
-- (Cơ sở 3: ID 7-9)
INSERT INTO positions (branch_id, position_code, name) VALUES
(3, 'QL', 'Quản lý'),
(3, 'PC', 'Pha chế (Barista)'),
(3, 'PV', 'Phục vụ (Waiter/Waitress)');


-- === 3. TẠO MẪU CA (SHIFT TEMPLATES) ===
INSERT INTO shift_templates (branch_id, name, start_time, end_time) VALUES
(1, 'Ca Sáng (HK)', '07:00:00', '15:00:00'),
(1, 'Ca Tối (HK)', '15:00:00', '23:00:00'),
(1, 'Ca Part-time (HK)', '18:00:00', '23:00:00'),
(2, 'Ca Sáng (CG)', '07:30:00', '15:30:00'),
(2, 'Ca Tối (CG)', '15:30:00', '23:30:00'),
(3, 'Ca Sáng (TX)', '07:00:00', '15:00:00'),
(3, 'Ca Tối (TX)', '15:00:00', '23:00:00');

-- === 4. TẠO CẤU HÌNH & LUẬT ===
INSERT INTO global_configs (config_key, config_value, description) VALUES
('HOURLY_WAGE', '25000', 'Mức lương/giờ (VNĐ) cho nhân viên STAFF'),
('OVERTIME_THRESHOLD_MONTH', '40', 'Ngưỡng giờ làm/tháng để tính OT (cho Đề 2)');

-- === 5. TẠO TÀI KHOẢN (USERS) & HỒ SƠ (PROFILES) ===

-- 👑 VAI TRÒ 1: CHỦ SỞ HỮU (SUPER ADMIN) (1 người)
INSERT INTO users (email, password, role, status) VALUES
('owner@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_SUPER_ADMIN', 'ACTIVE');
-- (Super Admin không cần hồ sơ staff_profiles, ID=1)

-- 👨‍💼 VAI TRÒ 2: QUẢN LÝ (MANAGER) (3 người)
INSERT INTO users (email, password, role, branch_id, position_id, status) VALUES
('manager.hn1@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_MANAGER', 1, 1, 'ACTIVE'), -- ID=2
('manager.hn2@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_MANAGER', 2, 4, 'ACTIVE'), -- ID=3
('manager.hn3@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_MANAGER', 3, 7, 'ACTIVE'); -- ID=4

-- Tạo Hồ sơ và Gán Lương Cố định cho Manager (Logic Đề 2)
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary, cccd, date_of_birth) VALUES
(2, 'HN1-QL-0001', 'Nguyễn Văn Mạnh', '0911111111', 15000000, '001111111111', '1990-01-01'),
(3, 'HN2-QL-0001', 'Trần Thị Hằng', '0922222222', 14000000, '001222222222', '1992-02-02'),
(4, 'HN3-QL-0001', 'Lê Văn Dũng', '0933333333', 14500000, '001333333333', '1991-03-03');

-- 🧑‍💼 VAI TRÒ 3: NHÂN VIÊN (STAFF) (30 người)
-- (10 người cho Cơ sở 1 - Hoàn Kiếm, Dùng chức vụ ID 2, 3)
INSERT INTO users (email, password, role, branch_id, position_id, status) VALUES
('staff01@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 2, 'ACTIVE'),
('staff02@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE'),
('staff03@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE'),
('staff04@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 2, 'ACTIVE'),
('staff05@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE'),
('staff06@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE'),
('staff07@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE'),
('staff08@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 2, 'ACTIVE'),
('staff09@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 2, 'ACTIVE'),
('staff10@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 1, 3, 'ACTIVE');
-- (10 người cho Cơ sở 2 - Cầu Giấy, Dùng chức vụ ID 5, 6)
INSERT INTO users (email, password, role, branch_id, position_id, status) VALUES
('staff11@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 5, 'ACTIVE'),
('staff12@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE'),
('staff13@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE'),
('staff14@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 5, 'ACTIVE'),
('staff15@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE'),
('staff16@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE'),
('staff17@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE'),
('staff18@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 5, 'ACTIVE'),
('staff19@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 5, 'ACTIVE'),
('staff20@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 2, 6, 'ACTIVE');
-- (10 người cho Cơ sở 3 - Thanh Xuân, Dùng chức vụ ID 8, 9)
INSERT INTO users (email, password, role, branch_id, position_id, status) VALUES
('staff21@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 8, 'ACTIVE'),
('staff22@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE'),
('staff23@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE'),
('staff24@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 8, 'ACTIVE'),
('staff25@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE'),
('staff26@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE'),
('staff27@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE'),
('staff28@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 8, 'ACTIVE'),
('staff29@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 8, 'ACTIVE'),
('staff30@coffeechain.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_STAFF', 3, 9, 'ACTIVE');

-- Tạo Hồ sơ cho 30 nhân viên (user_id từ 5 đến 34)
INSERT INTO staff_profiles (user_id, employee_code, full_name, phone_number, base_salary, cccd, date_of_birth) VALUES
(5, 'HN1-PC-0001', 'Nguyễn Văn An', '0911000001', 0, '001000000001', '2004-01-01'),
(6, 'HN1-PV-0001', 'Trần Thị Bình', '0911000002', 0, '001000000002', '2004-02-02'),
(7, 'HN1-PV-0002', 'Lê Minh Cường', '0911000003', 0, '001000000003', '2004-03-03'),
(8, 'HN1-PC-0002', 'Phạm Thị Dung', '0911000004', 0, '001000000004', '2004-04-04'),
(9, 'HN1-PV-0003', 'Vũ Văn Em', '0911000005', 0, '001000000005', '2004-05-05'),
(10, 'HN1-PV-0004', 'Bùi Thị Giang', '0911000006', 0, '001000000006', '2004-06-06'),
(11, 'HN1-PV-0005', 'Hoàng Văn Hải', '0922000001', 0, '001000000007', '2004-07-07'),
(12, 'HN1-PC-0003', 'Mai Thị Hằng', '0922000002', 0, '001000000008', '2004-08-08'),
(13, 'HN1-PC-0004', 'Lương Văn Kiên', '0922000003', 0, '001000000009', '2004-09-09'),
(14, 'HN1-PV-0006', 'Trịnh Thị Lan', '0922000004', 0, '001000000010', '2004-10-10'),
(15, 'HN2-PC-0001', 'Đặng Văn Minh', '0933000001', 0, '001000000011', '2005-01-01'),
(16, 'HN2-PV-0001', 'Ngô Thị Nga', '0933000002', 0, '001000000012', '2005-02-02'),
(17, 'HN2-PV-0002', 'Phan Văn Long', '0933000003', 0, '001000000013', '2005-03-03'),
(18, 'HN2-PC-0002', 'Đỗ Thị Oanh', '0933000004', 0, '001000000014', '2005-04-04'),
(19, 'HN2-PV-0003', 'Tô Văn Quân', '0933000005', 0, '001000000015', '2005-05-05'),
(20, 'HN2-PV-0004', 'Hồ Thị Quỳnh', '0933000006', 0, '001000000016', '2005-06-06'),
(21, 'HN2-PV-0005', 'Võ Văn Sang', '0933000007', 0, '001000000017', '2005-07-07'),
(22, 'HN2-PC-0003', 'Đinh Thị Tú', '0933000008', 0, '001000000018', '2005-08-08'),
(23, 'HN2-PC-0004', 'Uông Văn Tài', '0933000009', 0, '001000000019', '2005-09-09'),
(24, 'HN2-PV-0006', 'Vương Thị Tâm', '0933000010', 0, '001000000020', '2005-10-10'),
(25, 'HN3-PC-0001', 'Giang Văn Thắng', '0933000011', 0, '001000000021', '2003-01-01'),
(26, 'HN3-PV-0001', 'Hà Thị Thảo', '0933000012', 0, '001000000022', '2003-02-02'),
(27, 'HN3-PV-0002', 'Lại Văn Tiến', '0933000013', 0, '001000000023', '2003-03-03'),
(28, 'HN3-PC-0002', 'Mạc Thị Uyên', '0933000014', 0, '001000000024', '2003-04-04'),
(29, 'HN3-PV-0003', 'Nông Văn Vui', '0933000015', 0, '001000000025', '2003-05-05'),
(30, 'HN3-PV-0004', 'Oa Thị Xuân', '0933000016', 0, '001000000026', '2003-06-06'),
(31, 'HN3-PV-0005', 'Phí Văn Yên', '0933000017', 0, '001000000027', '2003-07-07'),
(32, 'HN3-PC-0003', 'Quách Thị Yến', '0933000018', 0, '001000000028', '2003-08-08'),
(33, 'HN3-PC-0004', 'Cao Văn Anh', '0933000019', 0, '001000000029', '2003-09-09'),
(34, 'HN3-PV-0006', 'Châu Thị Ánh', '0933000020', 0, '001000000030', '2003-10-10');

-- === 6. TẠO DỮ LIỆU NGHIỆP VỤ MẪU ===

-- Tạo 1 thông báo chung từ Super Admin (VAI TRÒ 1, Mục 6)
INSERT INTO announcements (author_id, branch_id, title, content) VALUES
(1, NULL, 'Chào mừng đến với hệ thống Quản lý Nhân viên mới!', 'Đây là thông báo chung cho toàn bộ nhân viên ở cả 3 cơ sở...');

-- Tạo 1 checklist mẫu cho Ca Sáng Cở sở 1 (VAI TRÒ 2, Mục 7)
INSERT INTO task_checklists (branch_id, shift_template_id, task_description, is_active) VALUES
(1, 1, 'Kiểm tra và vệ sinh máy pha cà phê', true),
(1, 1, 'Kiểm kho (sữa, hạt cà phê)', true);

-- Tạo 1 bài viết Sổ tay Vận hành (VAI TRÒ 2, Mục 7)
INSERT INTO knowledge_articles (title, content, category, created_by_user_id) VALUES
('Công thức pha Cà phê Nâu', 'Bước 1: 30ml cà phê. Bước 2: 20ml sữa đặc...', 'Công thức pha chế', 2);