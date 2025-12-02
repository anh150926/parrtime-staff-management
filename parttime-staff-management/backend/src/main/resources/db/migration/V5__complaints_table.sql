-- V5__complaints_table.sql
-- Create complaints table for staff feedback and issues

CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    from_user_id BIGINT NOT NULL,
    to_user_id BIGINT,
    type ENUM('SALARY', 'SCHEDULE', 'WORKPLACE', 'COLLEAGUE', 'MANAGEMENT', 'OTHER') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    response TEXT,
    responded_by BIGINT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_complaints_store ON complaints(store_id);
CREATE INDEX idx_complaints_from_user ON complaints(from_user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);

-- Insert sample complaints
INSERT INTO complaints (store_id, from_user_id, type, subject, content, status, created_at) VALUES
-- Store A complaints
(1, 5, 'SALARY', 'Sai số giờ làm tháng 11', 
 'Em thấy số giờ làm tháng 11 bị thiếu 2 giờ so với thực tế. Ngày 15/11 em làm từ 7h-13h nhưng hệ thống chỉ ghi nhận 7h-12h.',
 'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY)),
 
(1, 6, 'SCHEDULE', 'Xin đổi ca làm việc cố định', 
 'Em muốn xin đổi ca làm buổi sáng sang buổi chiều vì em có lịch học vào buổi sáng từ tháng 12.',
 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Store B complaints  
(2, 15, 'WORKPLACE', 'Máy lạnh khu vực pha chế bị hỏng',
 'Máy lạnh khu vực pha chế đã hỏng 3 ngày nay, làm việc rất nóng và khó chịu. Mong anh/chị kiểm tra và sửa chữa.',
 'RESOLVED', DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- Store C complaints
(3, 25, 'MANAGEMENT', 'Góp ý về cách phân ca',
 'Em muốn góp ý về cách phân ca hiện tại. Có một số bạn được phân ca tốt liên tục còn em thường xuyên bị ca đêm.',
 'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Update the resolved complaint with response
UPDATE complaints 
SET response = 'Đã liên hệ bộ phận kỹ thuật và máy lạnh đã được sửa. Cảm ơn bạn đã phản ánh.',
    responded_by = 3,
    responded_at = DATE_SUB(NOW(), INTERVAL 5 DAY),
    status = 'RESOLVED'
WHERE id = 3;



