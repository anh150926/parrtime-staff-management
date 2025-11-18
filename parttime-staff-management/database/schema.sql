/*
 * SCHEMA V2 - ULTIMATE FIX
 * Chuyển đổi JSON/ENUM -> TEXT/VARCHAR để tương thích 100% với Hibernate
 */

SET FOREIGN_KEY_CHECKS=0;

-- 1. Xóa sạch sẽ
DROP TABLE IF EXISTS audit_logs, task_logs, task_checklists, knowledge_articles, poll_votes, polls, complaints, announcements, payroll_adjustments, payrolls, work_logs, shift_market, leave_requests, staff_availabilities, schedule_assignments, schedules, shift_templates, contracts, staff_profiles, users, positions, branches, global_configs, weekly_availabilities, availability_slots, payroll_rules, employees, restaurants;

SET FOREIGN_KEY_CHECKS=1;

-- 2. Tạo lại bảng (Phiên bản an toàn)

CREATE TABLE branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    position_code VARCHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE shift_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE global_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL, -- Dùng VARCHAR cho an toàn
    branch_id INT,
    position_id INT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
);

CREATE TABLE staff_profiles (
    user_id INT PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    base_salary DECIMAL(12, 2) DEFAULT 0,
    cccd VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    education VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    contract_type VARCHAR(100),
    file_url TEXT,
    health_doc_expiry DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    shift_template_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    required_staff INT NOT NULL DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_template_id) REFERENCES shift_templates(id) ON DELETE CASCADE
);

CREATE TABLE schedule_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE staff_availabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    manager_id INT,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE shift_market (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT UNIQUE NOT NULL,
    offering_user_id INT NOT NULL,
    claiming_user_id INT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'POSTED',
    manager_id INT,
    FOREIGN KEY (assignment_id) REFERENCES schedule_assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (offering_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE work_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP NULL,
    is_edited TINYINT(1) DEFAULT 0,
    edit_reason TEXT,
    edited_by_manager_id INT,
    actual_hours DECIMAL(5, 2),
    late_minutes INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE payrolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    `month` INT NOT NULL,
    `year` INT NOT NULL,
    total_work_hours DECIMAL(5, 2) DEFAULT 0,
    total_late_minutes INT DEFAULT 0,
    base_pay DECIMAL(12, 2) NOT NULL,
    total_bonus DECIMAL(12, 2) DEFAULT 0,
    total_penalty DECIMAL(12, 2) DEFAULT 0,
    final_pay DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payroll_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT,
    user_id INT NOT NULL,
    manager_id INT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    branch_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_user_id INT NOT NULL,
    branch_id INT NOT NULL,
    content TEXT NOT NULL,
    response TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE knowledge_articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE task_checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    branch_id INT NOT NULL,
    shift_template_id INT NOT NULL,
    task_description TEXT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE task_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task_checklists(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_id VARCHAR(100),
    details TEXT,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    branch_id INT NOT NULL,
    question TEXT NOT NULL,
    -- QUAN TRỌNG: Đổi JSON thành LONGTEXT để tránh lỗi
    options LONGTEXT NOT NULL, 
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE poll_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    user_id INT NOT NULL,
    selected_option VARCHAR(255) NOT NULL,
    FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);