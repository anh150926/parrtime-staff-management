/*
 * file: backend/src/main/java/com/company/ptsm/model/enums/RequestStatus.java
 *
 * [MỚI]
 * Dùng chung cho Đơn xin nghỉ, Chợ Ca, Đăng ký ca...
 */
package com.company.ptsm.model.enums;

public enum RequestStatus {
    PENDING, // Đang chờ duyệt
    APPROVED, // Đã duyệt
    REJECTED, // Bị từ chối
    CANCELLED // Bị hủy (bởi nhân viên)
}