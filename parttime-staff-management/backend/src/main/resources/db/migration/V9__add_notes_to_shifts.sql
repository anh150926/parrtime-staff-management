-- =====================================================
-- Coffee Shop Staff Management System - Add Notes to Shifts
-- Version 9: Add notes field to shifts table
-- =====================================================

ALTER TABLE shifts
    ADD COLUMN notes TEXT NULL COMMENT 'Ghi chú cho ca làm' AFTER day_of_week;

