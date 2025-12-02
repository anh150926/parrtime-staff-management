-- =====================================================
-- Coffee House Staff Management System - Sample Marketplace & Tasks Data
-- =====================================================

-- =====================================================
-- 1. Cập nhật cài đặt cho các cơ sở
-- =====================================================
UPDATE stores SET 
    min_hours_before_give = 2, 
    max_staff_per_shift = 3, 
    allow_cross_store_swap = FALSE 
WHERE id IN (1, 2, 3);

-- =====================================================
-- 2. Thêm dữ liệu mẫu Chợ Ca (Marketplace)
-- =====================================================
INSERT INTO shift_marketplace (shift_id, type, from_user_id, to_user_id, status, reason, expires_at) VALUES
-- Store A: Nhân viên đang nhường ca
(1, 'GIVE_AWAY', 7, NULL, 'PENDING', 'Có lịch học đột xuất', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR),
-- Store B: Ca đã có người nhận, chờ Manager duyệt
(5, 'GIVE_AWAY', 19, 20, 'CLAIMED', 'Bị ốm không đi làm được', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 12 HOUR);

-- =====================================================
-- 3. Thêm nhiệm vụ mẫu (Tasks)
-- =====================================================
INSERT INTO tasks (store_id, shift_id, title, description, priority, assigned_to, status, due_date, created_by, notes) VALUES
-- Store A - Hoàn Kiếm
(1, 1, 'Kiểm tra nguyên liệu', 'Kiểm tra tồn kho cà phê, sữa, đường', 'HIGH', 5, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, 2, 'Báo cáo lại cho Manager sau khi kiểm tra'),
(1, 1, 'Vệ sinh máy pha', 'Vệ sinh và bảo dưỡng máy pha cà phê', 'MEDIUM', 6, 'IN_PROGRESS', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR, 2, NULL),
(1, 2, 'Setup bàn VIP', 'Chuẩn bị bàn cho khách đặt trước', 'URGENT', 8, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 2, 'Khách đặt 5 người, cần setup đặc biệt'),
(1, NULL, 'Đào tạo nhân viên mới', 'Hướng dẫn quy trình pha chế cho nhân viên mới', 'LOW', 7, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 2, NULL),

-- Store B - Cầu Giấy  
(2, 4, 'Nhập hàng buổi sáng', 'Nhận hàng từ nhà cung cấp', 'HIGH', 15, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 8 HOUR, 3, 'Kiểm tra kỹ số lượng'),
(2, 5, 'Chuẩn bị event', 'Trang trí quán cho event cuối tuần', 'MEDIUM', 16, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 15 HOUR, 3, NULL),
(2, NULL, 'Kiểm kê cuối tháng', 'Đếm và ghi nhận tồn kho', 'MEDIUM', 17, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 3, NULL),

-- Store C - Đống Đa
(3, 7, 'Mở cửa và setup', 'Bật máy, setup quầy, kiểm tra thiết bị', 'HIGH', 25, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 6 HOUR + INTERVAL 30 MINUTE, 4, NULL),
(3, 8, 'Vệ sinh bàn ghế', 'Lau dọn toàn bộ khu vực ngồi', 'MEDIUM', 28, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 13 HOUR, 4, NULL),
(3, 9, 'Đóng cửa và kiểm tra', 'Tắt thiết bị, khóa cửa, kiểm tra an ninh', 'HIGH', 31, 'PENDING', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 22 HOUR, 4, 'Nhớ tắt điều hòa');

-- =====================================================
-- 4. Thêm thông báo mẫu cho Marketplace và Tasks
-- =====================================================
INSERT INTO notifications (user_id, title, message, is_read, link) VALUES
(7, 'Ca đang nhường', 'Có đồng nghiệp đang nhường ca sáng ngày mai. Nhấn để xem chi tiết.', FALSE, '/marketplace'),
(20, 'Yêu cầu nhận ca', 'Yêu cầu nhận ca của bạn đang chờ Manager duyệt.', FALSE, '/marketplace'),
(3, 'Yêu cầu chuyển ca cần duyệt', 'Có yêu cầu chuyển ca đang chờ bạn duyệt.', FALSE, '/marketplace'),
(5, 'Nhiệm vụ mới', 'Bạn được giao nhiệm vụ: Kiểm tra nguyên liệu', FALSE, '/tasks'),
(8, 'Nhiệm vụ khẩn cấp', 'Nhiệm vụ Setup bàn VIP cần hoàn thành hôm nay.', FALSE, '/tasks'),
(2, 'Tổng hợp nhiệm vụ', 'Có 4 nhiệm vụ đang chờ hoàn thành tại Store A.', FALSE, '/tasks');

-- =====================================================
-- 5. Audit Log cho các hoạt động mới
-- =====================================================
INSERT INTO audit_log (user_id, action, entity, entity_id, details) VALUES
(7, 'CREATE', 'MARKETPLACE_LISTING', 1, 'Đăng nhường ca sáng ngày mai'),
(19, 'CREATE', 'MARKETPLACE_LISTING', 2, 'Đăng nhường ca chiều do bị ốm'),
(20, 'CLAIM', 'MARKETPLACE_LISTING', 2, 'Yêu cầu nhận ca chiều'),
(2, 'CREATE', 'TASK', 1, 'Tạo nhiệm vụ: Kiểm tra nguyên liệu'),
(2, 'CREATE', 'TASK', 3, 'Tạo nhiệm vụ khẩn cấp: Setup bàn VIP');




