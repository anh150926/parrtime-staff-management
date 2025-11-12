/* * file: database/schema.sql
 * Chú thích: Script này dùng cú pháp PostgreSQL. 
 * 'SERIAL PRIMARY KEY' là một cột INT tự động tăng.
 * 'CASCADE' tự động xóa các bản ghi liên quan.
 */

-- Xóa các bảng cũ theo thứ tự ngược lại để tránh lỗi khóa ngoại
DROP TABLE IF EXISTS payrolls CASCADE;
DROP TABLE IF EXISTS work_logs CASCADE;
DROP TABLE IF EXISTS schedule_assignments CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS weekly_availabilities CASCADE;
DROP TABLE IF EXISTS payroll_rules CASCADE;
DROP TABLE IF EXISTS global_configs CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;

-- === BẢNG CƠ SỞ ===

-- Bảng Nhà hàng
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Nhân viên (ĐÃ CẬP NHẬT [AUTH])
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    
    -- [AUTH] Các trường dùng cho Đăng nhập / Phân quyền
    email VARCHAR(255) UNIQUE NOT NULL,           -- Dùng làm username
    password VARCHAR(255) NOT NULL,               -- Luôn lưu mật khẩu đã HASH (Bcrypt)
    role VARCHAR(50) NOT NULL,                    -- 'ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- === BẢNG CẤU HÌNH & LUẬT ===

-- Bảng Cấu hình chung
-- Lưu các giá trị như N (số NV/ca), Lương/giờ
CREATE TABLE global_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL, -- 'HOURLY_WAGE', 'REQUIRED_EMPLOYEES_PER_SHIFT'
    config_value VARCHAR(255) NOT NULL,
    description TEXT
);

-- Bảng Luật tính lương
-- Lưu các quy tắc về OT, phạt
CREATE TABLE payroll_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL DEFAULT 'Default Rule',
    overtime_multiplier DECIMAL(5, 2) DEFAULT 1.5,      -- Hệ số nhân OT (ví dụ: 1.5)
    late_penalty_per_minute DECIMAL(10, 2) DEFAULT 0, -- Tiền phạt/phút đi muộn
    early_leave_penalty_per_minute DECIMAL(10, 2) DEFAULT 0, -- Tiền phạt/phút về sớm
    daily_overtime_threshold_hours DECIMAL(4, 2) DEFAULT 8.0 -- Ngưỡng giờ làm/ngày để tính OT
);

-- === CÁC BẢNG NGHIỆP VỤ (4 MODULES) ===

-- MODULE 1: Đăng ký lịch rảnh
CREATE TABLE weekly_availabilities (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Ngày thứ 2 đầu tuần
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SUBMITTED
    UNIQUE(employee_id, week_start_date) -- 1 nhân viên chỉ có 1 lịch đăng ký/tuần
);

-- Chi tiết các ca rảnh (con của weekly_availabilities)
CREATE TABLE availability_slots (
    id SERIAL PRIMARY KEY,
    availability_id INT NOT NULL REFERENCES weekly_availabilities(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL, -- 'MONDAY', 'TUESDAY', ...
    shift_type VARCHAR(50) NOT NULL -- 'CA_1' (8h-16h), 'CA_2' (16h-00h)
);

-- MODULE 2: Xếp lịch
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED (Quản lý duyệt)
    published_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(restaurant_id, week_start_date) -- 1 nhà hàng chỉ có 1 bảng xếp lịch/tuần
);

-- Chi tiết phân công nhân viên vào ca (con của schedules)
CREATE TABLE schedule_assignments (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL, -- Ngày làm việc
    shift_type VARCHAR(50) NOT NULL
);

-- BẢNG CHẤM CÔNG (Check-in/out)
CREATE TABLE work_logs (
    id SERIAL PRIMARY KEY,
    -- Liên kết với ca đã xếp (có thể NULL nếu là ca làm đột xuất không có trong lịch)
    assignment_id INT REFERENCES schedule_assignments(id) ON DELETE SET NULL,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    shift_date DATE NOT NULL,
    shift_type VARCHAR(50) NOT NULL,
    
    -- Các trường này sẽ được tính toán khi checkout
    actual_hours DECIMAL(5, 2), -- Giờ làm thực tế
    base_hours DECIMAL(5, 2),   -- Giờ làm trong ca
    overtime_hours DECIMAL(5, 2), -- Giờ làm OT
    late_minutes INT,
    early_leave_minutes INT
);

-- MODULE 3 & 4: Tính lương & Thống kê
CREATE TABLE payrolls (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    -- Dữ liệu tổng hợp
    total_base_hours DECIMAL(5, 2) DEFAULT 0,
    total_overtime_hours DECIMAL(5, 2) DEFAULT 0,
    total_late_minutes INT DEFAULT 0,
    total_early_leave_minutes INT DEFAULT 0,
    
    -- Dữ liệu tiền
    base_pay DECIMAL(10, 2) DEFAULT 0,
    overtime_pay DECIMAL(10, 2) DEFAULT 0,
    penalty_amount DECIMAL(10, 2) DEFAULT 0,
    total_pay DECIMAL(10, 2) DEFAULT 0, -- (base + overtime - penalty)
    
    status VARCHAR(50) NOT NULL DEFAULT 'CALCULATED', -- CALCULATED, PAID
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, week_start_date) -- 1 nhân viên chỉ có 1 phiếu lương/tuần
);