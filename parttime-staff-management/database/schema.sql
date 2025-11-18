/*
 * file: database/schema.sql (PHIÊN BẢN CẢI TIẾN)
 *
 * Hỗ trợ 3 vai trò (Super Admin, Manager, Staff) và đa cơ sở (Multi-Branch).
 * Hỗ trợ cả lương cố định (Manager) và lương theo giờ (Staff).
 * Dùng cú pháp PostgreSQL.
 */

-- Xóa các bảng cũ (nếu có) theo thứ tự phụ thuộc
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS task_logs CASCADE;
DROP TABLE IF EXISTS task_checklists CASCADE;
DROP TABLE IF EXISTS knowledge_articles CASCADE;
DROP TABLE IF EXISTS poll_votes CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS payroll_adjustments CASCADE;
DROP TABLE IF EXISTS payrolls CASCADE;
DROP TABLE IF EXISTS work_logs CASCADE;
DROP TABLE IF EXISTS shift_market CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS staff_availabilities CASCADE;
DROP TABLE IF EXISTS schedule_assignments CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS shift_templates CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS staff_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS global_configs CASCADE;

-- === BẢNG CƠ SỞ (SUPER ADMIN QUẢN LÝ) ===

-- 1. Quản lý Cơ sở (VAI TRÒ 1, Mục 2)
-- Thay thế "restaurants"
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- "Cơ sở 1 (Hoàn Kiếm)", "Cơ sở 2 (Cầu Giấy)"
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Quản lý Chức vụ (VAI TRÒ 2, Mục 3 & Đề 2)
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id) ON DELETE CASCADE, -- Chức vụ này thuộc cơ sở nào
    position_code VARCHAR(3) NOT NULL, -- [Đề 2] Mã chức vụ (ví dụ: QL, PC, PV)
    name VARCHAR(100) NOT NULL, -- "Quản lý", "Pha chế", "Phục vụ"
    UNIQUE(branch_id, position_code)
);

-- 3. Quản lý Mẫu Ca (VAI TRÒ 1, Mục 4 / VAI TRÒ 2, Mục 2)
CREATE TABLE shift_templates (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Ca Sáng", "Ca Tối", "Ca Gãy"
    start_time TIME NOT NULL, -- '07:00:00'
    end_time TIME NOT NULL   -- '15:00:00'
);

-- 4. Bảng Cấu hình chung (Lương giờ cho Staff - Đề 1)
CREATE TABLE global_configs (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL, -- 'HOURLY_WAGE', 'OVERTIME_THRESHOLD'
    config_value VARCHAR(255) NOT NULL,
    description TEXT
);

-- === BẢNG NGƯỜI DÙNG & HỒ SƠ ===

-- 5. Bảng Tài khoản (Lưu Login/Pass/Role)
-- Thay thế "employees"
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'ROLE_SUPER_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF'
    branch_id INT REFERENCES branches(id) ON DELETE SET NULL, -- STAFF và MANAGER sẽ thuộc 1 cơ sở
    position_id INT REFERENCES positions(id) ON DELETE SET NULL, -- Chức vụ
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng Hồ sơ Nhân viên (Lưu CCCD, NS, Lương...) (VAI TRÒ 2, Mục 3 & Đề 2)
CREATE TABLE staff_profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- [Đề 2] Mã nhân viên (ví dụ: CS1-QL-0001)
    employee_code VARCHAR(20) UNIQUE,
    
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- [Đề 2] Lương cơ bản (dùng cho Manager)
    base_salary DECIMAL(12, 2) DEFAULT 0,
    
    cccd VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    education VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng Hợp đồng (Theo dõi hết hạn) (VAI TRÒ 2, Mục 8)
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE, -- Nullable nếu là hợp đồng vô thời hạn
    contract_type VARCHAR(100), -- "Thử việc", "Chính thức"
    file_url TEXT, -- Link đến file scan hợp đồng
    health_doc_expiry DATE -- Ngày hết hạn GKSK
);

-- === BẢNG QUẢN LÝ LỊCH LÀM (SCHEDULING) (VAI TRÒ 2 & 3) ===

-- 8. Lịch làm việc (Do Quản lý tạo)
-- Thay thế "schedules" cũ
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    shift_template_id INT NOT NULL REFERENCES shift_templates(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    required_staff INT NOT NULL DEFAULT 1, -- Số lượng NV cần cho ca này
    UNIQUE(branch_id, shift_template_id, schedule_date)
);

-- 9. Phân công Nhân viên vào Lịch
-- Thay thế "schedule_assignments" cũ
CREATE TABLE schedule_assignments (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED' -- 'PENDING' (NV đăng ký), 'CONFIRMED'
);

-- 10. Đăng ký Bất khả dụng (NV báo bận) (VAI TRÒ 3, Mục 2)
-- Thay thế "weekly_availabilities" cũ
CREATE TABLE staff_availabilities (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT -- "Lịch học", "Việc gia đình"
);

-- 11. Đơn xin nghỉ (VAI TRÒ 3, Mục 2)
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    manager_id INT REFERENCES users(id), -- Người duyệt
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 12. "Chợ Ca" (Shift Market) (VAI TRÒ 3, Mục 2)
CREATE TABLE shift_market (
    id SERIAL PRIMARY KEY,
    assignment_id INT UNIQUE NOT NULL REFERENCES schedule_assignments(id) ON DELETE CASCADE, -- Ca gốc
    offering_user_id INT NOT NULL REFERENCES users(id), -- Người "bán" ca
    claiming_user_id INT REFERENCES users(id), -- Người "nhận" ca (nullable)
    status VARCHAR(50) NOT NULL DEFAULT 'POSTED', -- POSTED (Đang bán), CLAIMED (Chờ duyệt), APPROVED
    manager_id INT REFERENCES users(id) -- Người duyệt cuối
);

-- === BẢNG CHẤM CÔNG & LƯƠNG (TIMESHEET & PAYROLL) ===

-- 13. Chấm công (VAI TRÒ 2, Mục 4 & Đề 1/Đề 2)
-- Thay thế "work_logs" cũ
CREATE TABLE work_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    branch_id INT NOT NULL REFERENCES branches(id),
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE,
    
    -- Dùng cho "Hiệu chỉnh công"
    is_edited BOOLEAN DEFAULT false,
    edit_reason TEXT,
    edited_by_manager_id INT REFERENCES users(id),
    
    -- (Các trường tính toán)
    actual_hours DECIMAL(5, 2), -- Giờ làm thực tế
    late_minutes INT
);

-- 14. Phiếu lương (VAI TRÒ 2, Mục 5 & Đề 1/Đề 2)
-- Thay thế "payrolls" cũ
CREATE TABLE payrolls (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    
    -- Dữ liệu tính toán
    total_work_hours DECIMAL(5, 2) DEFAULT 0, -- Tổng giờ làm (cho Staff)
    total_late_minutes INT DEFAULT 0,
    
    -- Dữ liệu tiền
    base_pay DECIMAL(12, 2) NOT NULL, -- Lương cơ bản (cho Manager) HOẶC Lương theo giờ (cho Staff)
    total_bonus DECIMAL(12, 2) DEFAULT 0,
    total_penalty DECIMAL(12, 2) DEFAULT 0,
    final_pay DECIMAL(12, 2) NOT NULL, -- (base + bonus - penalty)
    
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CALCULATED, PAID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month, year)
);

-- 15. Bảng Thưởng/Phạt (VAI TRÒ 2, Mục 5)
CREATE TABLE payroll_adjustments (
    id SERIAL PRIMARY KEY,
    payroll_id INT REFERENCES payrolls(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    manager_id INT NOT NULL REFERENCES users(id), -- Quản lý tạo
    type VARCHAR(50) NOT NULL, -- 'BONUS' hoặc 'PENALTY'
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL, -- "Làm vỡ ly", "Thưởng lễ"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- === BẢNG GIAO TIẾP & VẬN HÀNH (COMMUNICATION & OPS) ===

-- 16. Thông báo (VAI TRÒ 2, Mục 6)
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES users(id), -- Người gửi (Manager/SuperAdmin)
    branch_id INT REFERENCES branches(id), -- Null = Gửi toàn hệ thống
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Khiếu nại (VAI TRÒ 2, Mục 6 / VAI TRÒ 3, Mục 6)
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    staff_user_id INT NOT NULL REFERENCES users(id), -- Người gửi
    branch_id INT NOT NULL REFERENCES branches(id),
    content TEXT NOT NULL,
    response TEXT, -- Phản hồi của quản lý (nullable)
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, RESOLVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Sổ tay Vận hành (VAI TRÒ 2, Mục 7)
CREATE TABLE knowledge_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100), -- "Công thức pha chế", "Quy trình"
    created_by_user_id INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Checklist công việc (VAI TRÒ 2, Mục 7)
CREATE TABLE task_checklists (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES branches(id),
    shift_template_id INT NOT NULL REFERENCES shift_templates(id),
    task_description TEXT NOT NULL, -- "Vệ sinh máy pha cà phê"
    is_active BOOLEAN DEFAULT true
);

-- 20. Log của Checklist (VAI TRÒ 3, Mục 7)
CREATE TABLE task_logs (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES task_checklists(id),
    user_id INT NOT NULL REFERENCES users(id), -- Nhân viên hoàn thành
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 21. Lịch sử Hoạt động (VAI TRÒ 2, Mục 9)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id), -- Manager/Admin thực hiện
    action VARCHAR(255) NOT NULL, -- "CREATE_STAFF", "EDIT_TIMESHEET", "APPROVE_LEAVE"
    target_id VARCHAR(100), -- ID của đối tượng bị tác động (user_id, leave_id...)
    details TEXT, -- "Đã sửa giờ check-in cho nv01"
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Khảo sát (VAI TRÒ 2, Mục 6)
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    author_id INT NOT NULL REFERENCES users(id),
    branch_id INT NOT NULL REFERENCES branches(id),
    question TEXT NOT NULL,
    options TEXT[] NOT NULL, -- Mảng các lựa chọn, ví dụ: {'Du lịch Hạ Long', 'Nghỉ 1 ngày'}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. Phiếu bầu (VAI TRÒ 3, Mục 8)
CREATE TABLE poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    selected_option VARCHAR(255) NOT NULL,
    UNIQUE(poll_id, user_id) -- Mỗi nhân viên chỉ bầu 1 lần
);