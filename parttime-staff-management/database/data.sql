/*
 * file: database/data.sql
 * Chú thích: Chèn dữ liệu mẫu cho dự án.
 *
 * Mật khẩu plain-text cho tất cả user: 'password123'
 * Hash Bcrypt (để lưu vào DB): '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu'
 */

-- 1. Chèn Nhà hàng
INSERT INTO restaurants (name, address) VALUES
('Nhà hàng Phố Cổ', 'Số 1 Hàng Bè, Hoàn Kiếm, Hà Nội'),
('Nhà hàng Bờ Sông', '258 Bạch Đằng, Hải Châu, Đà Nẵng'),
('Nhà hàng Sài Gòn Xưa', '123 Đồng Khởi, Quận 1, TP. HCM');

-- 2. Chèn Cấu hình chung
INSERT INTO global_configs (config_key, config_value, description) VALUES
('HOURLY_WAGE', '50000', 'Mức lương cơ bản theo giờ (VNĐ)'),
('REQUIRED_EMPLOYEES_PER_SHIFT', '3', 'Số nhân viên yêu cầu (N) cho mỗi ca'),
('MIN_WEEKLY_HOURS', '12', 'Số giờ đăng ký tối thiểu mỗi tuần (tương đương 1.5 ca)');

-- 3. Chèn Luật tính lương
INSERT INTO payroll_rules (rule_name, overtime_multiplier, late_penalty_per_minute, early_leave_penalty_per_minute, daily_overtime_threshold_hours) VALUES
('Default Rule', 1.5, 1000, 1000, 8.0); -- Phạt 1000 VNĐ/phút đi muộn hoặc về sớm

-- 4. Chèn Nhân viên (20 nhân viên + 2 quản lý)
-- Mật khẩu cho tất cả: 'password123'
-- Hash: '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu'

-- 2 Quản lý (Manager)
INSERT INTO employees (restaurant_id, name, phone_number, email, password, role) VALUES
(1, 'Trần Văn Quản Lý', '0988111222', 'manager@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_MANAGER'),
(3, 'Nguyễn Thị Admin', '0988333444', 'admin@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_MANAGER'); -- Dùng ROLE_MANAGER cho cả admin/quản lý nhà hàng

-- 18 Nhân viên (Employee)
INSERT INTO employees (restaurant_id, name, phone_number, email, password, role) VALUES
-- Nhân viên Nhà hàng 1 (Hà Nội)
(1, 'Nguyễn Văn An', '0911000001', 'nv01@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(1, 'Trần Thị Bình', '0911000002', 'nv02@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(1, 'Lê Minh Cường', '0911000003', 'nv03@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(1, 'Phạm Thị Dung', '0911000004', 'nv04@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(1, 'Vũ Văn Em', '0911000005', 'nv05@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(1, 'Bùi Thị Giang', '0911000006', 'nv06@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),

-- Nhân viên Nhà hàng 2 (Đà Nẵng)
(2, 'Hoàng Văn Hải', '0922000001', 'nv07@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(2, 'Mai Thị Hằng', '0922000002', 'nv08@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(2, 'Lương Văn Kiên', '0922000003', 'nv09@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(2, 'Trịnh Thị Lan', '0922000004', 'nv10@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),

-- Nhân viên Nhà hàng 3 (TP. HCM)
(3, 'Đặng Văn Minh', '0933000001', 'nv11@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Ngô Thị Nga', '0933000002', 'nv12@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Phan Văn Long', '0933000003', 'nv13@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Đỗ Thị Oanh', '0933000004', 'nv14@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Tô Văn Quân', '0933000005', 'nv15@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Hồ Thị Quỳnh', '0933000006', 'nv16@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Võ Văn Sang', '0933000007', 'nv17@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE'),
(3, 'Đinh Thị Tú', '0933000008', 'nv18@ptsm.com', '$2a$10$AVSyqHFccHH8N.85VkCaNOI1Ga3nI1dbpnU2WnR0YlQeoEzjne5lu', 'ROLE_EMPLOYEE');
