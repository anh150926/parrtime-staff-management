-- =====================================================
-- Coffee Shop Staff Management System - Marketplace & Tasks
-- Version 3: Add Shift Marketplace and Task Management
-- =====================================================

-- =====================================================
-- Shift Marketplace table
-- =====================================================
CREATE TABLE shift_marketplace (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT NOT NULL,
    type ENUM('GIVE_AWAY', 'SWAP', 'OPEN') NOT NULL,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT NULL,
    status ENUM('PENDING', 'CLAIMED', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(500),
    manager_note VARCHAR(500),
    reviewed_by BIGINT NULL,
    reviewed_at DATETIME NULL,
    expires_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marketplace_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    CONSTRAINT fk_marketplace_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_marketplace_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_marketplace_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Shift Swap Requests table
-- =====================================================
CREATE TABLE shift_swap_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_assignment_id BIGINT NOT NULL,
    to_assignment_id BIGINT NOT NULL,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT NOT NULL,
    status ENUM('PENDING_PEER', 'PENDING_MANAGER', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PEER',
    reason VARCHAR(500),
    peer_confirmed BOOLEAN DEFAULT FALSE,
    reviewed_by BIGINT NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_swap_from_assignment FOREIGN KEY (from_assignment_id) REFERENCES shift_assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_to_assignment FOREIGN KEY (to_assignment_id) REFERENCES shift_assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_swap_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Tasks table for shift task management
-- =====================================================
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    shift_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    assigned_to BIGINT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    due_date DATETIME NULL,
    completed_at DATETIME NULL,
    completed_by BIGINT NULL,
    created_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_completed_by FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Add additional user fields
-- =====================================================
ALTER TABLE users
    ADD COLUMN date_of_birth DATE NULL AFTER phone,
    ADD COLUMN id_card VARCHAR(20) NULL AFTER date_of_birth,
    ADD COLUMN address VARCHAR(500) NULL AFTER id_card,
    ADD COLUMN hometown VARCHAR(200) NULL AFTER address,
    ADD COLUMN fixed_salary DECIMAL(15, 2) NULL AFTER hourly_rate,
    ADD COLUMN bank_account VARCHAR(50) NULL AFTER fixed_salary,
    ADD COLUMN bank_name VARCHAR(100) NULL AFTER bank_account;

-- =====================================================
-- Add marketplace settings to stores
-- =====================================================
ALTER TABLE stores
    ADD COLUMN min_hours_before_give INT DEFAULT 2 AFTER closing_time,
    ADD COLUMN max_staff_per_shift INT DEFAULT 3 AFTER min_hours_before_give,
    ADD COLUMN allow_cross_store_swap BOOLEAN DEFAULT FALSE AFTER max_staff_per_shift;

-- =====================================================
-- Indexes for performance
-- =====================================================
CREATE INDEX idx_marketplace_shift ON shift_marketplace(shift_id);
CREATE INDEX idx_marketplace_from_user ON shift_marketplace(from_user_id);
CREATE INDEX idx_marketplace_status ON shift_marketplace(status);
CREATE INDEX idx_marketplace_type ON shift_marketplace(type);
CREATE INDEX idx_swap_status ON shift_swap_requests(status);
CREATE INDEX idx_tasks_store ON tasks(store_id);
CREATE INDEX idx_tasks_shift ON tasks(shift_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);




