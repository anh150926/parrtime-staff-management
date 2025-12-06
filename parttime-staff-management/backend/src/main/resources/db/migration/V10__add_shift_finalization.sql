-- =====================================================
-- Coffee Shop Staff Management System - Add Shift Finalization
-- Version 10: Add shift finalization to lock registrations
-- =====================================================

-- Table to track finalized shifts (locked registrations)
CREATE TABLE shift_finalizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shift_template_id BIGINT NOT NULL COMMENT 'ID ca mẫu',
    finalization_date DATE NOT NULL COMMENT 'Ngày cụ thể đã chốt',
    finalized_by BIGINT NOT NULL COMMENT 'Người chốt (quản lý)',
    finalized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian chốt',
    CONSTRAINT fk_finalizations_template FOREIGN KEY (shift_template_id) REFERENCES shifts(id) ON DELETE CASCADE,
    CONSTRAINT fk_finalizations_user FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_finalization_template_date (shift_template_id, finalization_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_finalizations_template ON shift_finalizations(shift_template_id);
CREATE INDEX idx_finalizations_date ON shift_finalizations(finalization_date);

