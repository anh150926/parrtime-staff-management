# ☕ Coffee House - Hệ Thống Quản Lý Nhân Viên Bán Thời Gian

Hệ thống quản lý nhân viên bán thời gian cho chuỗi quán cà phê, hỗ trợ quản lý ca làm việc, phân công nhân viên, tính lương và chợ ca (marketplace) để trao đổi ca giữa các nhân viên.

![Coffee House](https://img.shields.io/badge/Coffee%20House-Management-brown?style=for-the-badge&logo=coffeescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=java)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql)

## 📋 Mục Lục

- [Tổng Quan](#-tổng-quan)
- [Tính Năng Chi Tiết](#-tính-năng-chi-tiết)
- [Công Nghệ](#-công-nghệ)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [API Documentation](#-api-documentation)
- [Cấu Trúc Dự Án Chi Tiết](#-cấu-trúc-dự-án-chi-tiết)
- [Mapping Thư Mục và Chức Năng](#-mapping-thư-mục-và-chức-năng)
- [Troubleshooting](#-troubleshooting)
- [Đóng Góp](#-đóng-góp)

## 🎯 Tổng Quan

Hệ thống quản lý nhân viên bán thời gian được thiết kế để hỗ trợ chuỗi quán cà phê quản lý:

- **Nhân viên**: Quản lý thông tin, phân công ca làm việc
- **Ca làm việc**: Tạo ca mẫu, đăng ký ca, phân công nhân viên, check-in/check-out
- **Chợ Ca (Marketplace)**: Cho phép nhân viên nhường/nhận/đổi ca với nhau
- **Tính lương**: Tự động tính lương dựa trên giờ làm việc
- **Nhiệm vụ**: Giao và theo dõi nhiệm vụ cho nhân viên
- **Yêu cầu**: Xử lý yêu cầu nghỉ/đổi ca từ nhân viên
- **Báo cáo**: Báo cáo chi phí nhân sự, thống kê hoạt động
- **Khiếu nại**: Hệ thống xử lý khiếu nại từ nhân viên

## ✨ Tính Năng Chi Tiết

### 👤 Owner (Chủ Sở Hữu)

#### Dashboard & Tổng Quan

- ✅ Dashboard tổng quan toàn hệ thống với thống kê:
  - Tổng số cơ sở, nhân viên, ca làm việc
  - Chi phí nhân sự theo tháng
  - Biểu đồ xu hướng hoạt động
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Dashboard.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ReportController.java`

#### Quản Lý Cơ Sở

- ✅ CRUD cơ sở (Create, Read, Update, Delete)
- ✅ Gán Manager cho từng cơ sở
- ✅ Xem danh sách tất cả cơ sở
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Stores.tsx`, `frontend/src/api/storeService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/StoreController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/StoreService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Store.java`

#### Quản Lý Nhân Viên

- ✅ Quản lý Manager và Staff toàn hệ thống
- ✅ Tạo, sửa, xóa nhân viên
- ✅ Xem thông tin chi tiết nhân viên
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Users.tsx`, `frontend/src/api/userService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/UserController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/UserService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/User.java`

#### Quản Lý Bảng Lương

- ✅ Xem & phê duyệt bảng lương toàn hệ thống
- ✅ Xem chi tiết từng phiếu lương
- ✅ Duyệt/từ chối bảng lương
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Payrolls.tsx`, `frontend/src/api/payrollService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/PayrollController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/PayrollService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Payroll.java`

#### Báo Cáo & Thống Kê

- ✅ Báo cáo chi phí nhân sự theo tháng/cơ sở
- ✅ Báo cáo chấm công
- ✅ Xem bảng xếp hạng nhân viên
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Reports.tsx`, `frontend/src/pages/EmployeeRanking.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ReportController.java`, `EmployeeRankingController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/ReportService.java`, `EmployeeRankingService.java`

#### Quản Lý Khiếu Nại

- ✅ Xem danh sách khiếu nại toàn hệ thống
- ✅ Xử lý khiếu nại (resolve)
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Complaints.tsx`, `frontend/src/api/complaintService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ComplaintController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/ComplaintService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Complaint.java`

#### Thông Báo

- ✅ Gửi thông báo toàn hệ thống
- ✅ Xem thông báo đã gửi
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Notifications.tsx`, `frontend/src/api/notificationService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/NotificationController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/NotificationService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Notification.java`

### 👨‍💼 Manager (Quản Lý)

#### Dashboard Cơ Sở

- ✅ Dashboard cơ sở được giao quản lý
- ✅ Thống kê nhân viên, ca làm việc của cơ sở
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Dashboard.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ReportController.java`

#### Quản Lý Nhân Viên

- ✅ Quản lý nhân viên thuộc cơ sở
- ✅ Tạo, sửa thông tin nhân viên
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Users.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/UserController.java`

#### Quản Lý Ca Làm Việc (Shift Management)

- ✅ **Tạo ca mẫu (Shift Template)**: Tạo ca mẫu cho các ngày trong tuần (Sáng, Chiều, Tối)
  - Ca mẫu hiển thị cho tất cả các tuần
  - Mỗi ca mẫu có: tên ca, thời gian bắt đầu/kết thúc, số nhân viên cần, ghi chú
- ✅ **Xem đăng ký ca**: Xem danh sách nhân viên đã đăng ký cho từng ca mẫu
- ✅ **Chốt ca (Finalize Shift)**:
  - Chọn nhân viên từ danh sách đăng ký
  - Tạo ca thực tế và phân công nhân viên
  - Khóa ca để nhân viên không thể đăng ký/hủy sau khi chốt
- ✅ **Phân công nhân viên**: Phân công nhân viên vào ca đã tạo
- ✅ **Xóa ca mẫu**: Xóa ca mẫu (không ảnh hưởng đến ca thực tế đã tạo)
- **Thư mục liên quan**:
  - Frontend:
    - `frontend/src/pages/Shifts.tsx` - Trang quản lý ca mẫu và chốt ca
    - `frontend/src/pages/WorkSchedule.tsx` - Xem lịch làm việc
    - `frontend/src/api/shiftService.ts` - API cho ca làm việc
    - `frontend/src/api/shiftRegistrationService.ts` - API cho đăng ký ca và chốt ca
  - Backend:
    - `backend/src/main/java/com/coffee/management/controller/ShiftController.java` - Quản lý ca làm việc
    - `backend/src/main/java/com/coffee/management/controller/ShiftRegistrationController.java` - Quản lý đăng ký ca và chốt ca
    - `backend/src/main/java/com/coffee/management/service/ShiftService.java` - Logic nghiệp vụ ca làm việc
    - `backend/src/main/java/com/coffee/management/service/ShiftRegistrationService.java` - Logic nghiệp vụ đăng ký ca
    - `backend/src/main/java/com/coffee/management/entity/Shift.java` - Entity ca làm việc
    - `backend/src/main/java/com/coffee/management/entity/ShiftRegistration.java` - Entity đăng ký ca
    - `backend/src/main/java/com/coffee/management/entity/ShiftFinalization.java` - Entity chốt ca
    - `backend/src/main/resources/db/migration/V8__shift_registrations.sql` - Migration cho đăng ký ca
    - `backend/src/main/resources/db/migration/V10__add_shift_finalization.sql` - Migration cho chốt ca

#### Duyệt Yêu Cầu

- ✅ Duyệt yêu cầu nghỉ/đổi ca từ nhân viên
- ✅ Từ chối yêu cầu với lý do
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Requests.tsx`, `frontend/src/api/requestService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/RequestController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/RequestService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Request.java`

#### Quản Lý Nhiệm Vụ

- ✅ Tạo và theo dõi nhiệm vụ cho nhân viên
- ✅ Xem trạng thái hoàn thành nhiệm vụ
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Tasks.tsx`, `frontend/src/pages/CreateTaskForStaff.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/TaskController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/TaskService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/Task.java`

#### Quản Lý Chợ Ca

- ✅ Duyệt nhường/nhận ca từ nhân viên
- ✅ Xem lịch sử giao dịch Chợ Ca
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Marketplace.tsx`, `frontend/src/api/marketplaceService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/MarketplaceController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/MarketplaceService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/ShiftMarketplace.java`, `ShiftSwapRequest.java`

#### Tính Lương

- ✅ Tính lương nhân viên thuộc cơ sở
- ✅ Xem và quản lý bảng lương
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Payrolls.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/PayrollController.java`

#### Chấm Công

- ✅ Chấm công thủ công cho nhân viên (nếu cần)
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/WorkSchedule.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/TimeLogController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/TimeLogService.java`
  - Entity: `backend/src/main/java/com/coffee/management/entity/TimeLog.java`

### 👷 Staff (Nhân Viên)

#### Dashboard Cá Nhân

- ✅ Dashboard cá nhân với ca làm & nhiệm vụ
- ✅ Xem thông tin cá nhân
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Dashboard.tsx`, `frontend/src/pages/Profile.tsx`

#### Đăng Ký Ca Làm Việc

- ✅ **Đăng ký ca mẫu**: Đăng ký cho các ca mẫu trong tuần
  - Chỉ đăng ký được ca tương lai (không đăng ký ca quá khứ)
  - Không thể đăng ký ca đã được chốt
- ✅ **Hủy đăng ký**: Hủy đăng ký ca (trước khi ca được chốt)
- ✅ Xem lịch làm việc tuần hiện tại
- **Thư mục liên quan**:
  - Frontend:
    - `frontend/src/pages/ShiftRegistration.tsx` - Trang đăng ký ca
    - `frontend/src/pages/MyShifts.tsx` - Xem ca đã được phân công
    - `frontend/src/api/shiftRegistrationService.ts`
  - Backend:
    - `backend/src/main/java/com/coffee/management/controller/ShiftRegistrationController.java`
    - `backend/src/main/java/com/coffee/management/service/ShiftRegistrationService.java`

#### Xác Nhận Ca Được Phân Công

- ✅ Xác nhận/từ chối ca được phân công
- ✅ Xem danh sách ca đã được phân công
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/MyShifts.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ShiftController.java`

#### Check-in/Check-out

- ✅ Check-in khi bắt đầu ca làm việc
- ✅ Check-out khi kết thúc ca làm việc
- ✅ Xem lịch sử check-in/check-out
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/MyShifts.tsx`, `frontend/src/api/timeLogService.ts`
  - Backend: `backend/src/main/java/com/coffee/management/controller/TimeLogController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/TimeLogService.java`

#### Gửi Yêu Cầu

- ✅ Gửi yêu cầu nghỉ/đổi ca
- ✅ Xem trạng thái yêu cầu
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Requests.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/RequestController.java`

#### Chợ Ca (Marketplace)

- ✅ **Đăng nhường ca**: Đăng ca muốn nhường (phải đăng trước ít nhất 2 giờ)
- ✅ **Nhận ca trống**: Nhận ca từ nhân viên khác
- ✅ **Yêu cầu đổi ca**: Yêu cầu đổi ca với nhân viên khác
- ✅ Xem lịch sử giao dịch Chợ Ca
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Marketplace.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/MarketplaceController.java`
  - Service: `backend/src/main/java/com/coffee/management/service/MarketplaceService.java`

#### Nhiệm Vụ

- ✅ Xem và hoàn thành nhiệm vụ được giao
- ✅ Xem lịch sử nhiệm vụ
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Tasks.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/TaskController.java`

#### Phiếu Lương

- ✅ Xem phiếu lương cá nhân
- ✅ Xem chi tiết giờ làm việc và lương
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/MyPayroll.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/PayrollController.java`

#### Lịch Sử Công

- ✅ Xem lịch sử công và thời gian làm việc
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/MyShifts.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/TimeLogController.java`

#### Khiếu Nại

- ✅ Gửi khiếu nại
- ✅ Xem trạng thái khiếu nại
- **Thư mục liên quan**:
  - Frontend: `frontend/src/pages/Complaints.tsx`
  - Backend: `backend/src/main/java/com/coffee/management/controller/ComplaintController.java`

## 🛠 Công Nghệ

### Frontend

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Bootstrap 5** - UI Framework
- **Bootstrap Icons** - Icon library

### Backend

- **Spring Boot 3.2** - Java framework
- **Java 17** - Programming language
- **Spring Security** - Authentication & Authorization
- **JWT (JSON Web Token)** - Token-based authentication
- **Spring Data JPA** - Database ORM
- **MySQL 8** - Relational database
- **Flyway** - Database migration tool
- **BCrypt** - Password encryption
- **Lombok** - Reduce boilerplate code
- **OpenAPI/Swagger** - API documentation
- **Maven** - Build tool

## 💻 Yêu Cầu Hệ Thống

### Phần Mềm

- **Node.js** 18+ (cho Frontend)
- **Java** 17+ (cho Backend)
- **Maven** 3.8+ (cho Backend)
- **MySQL** 8.0+ (Database)
- **Git** (để clone repository)

### IDE (Tùy chọn)

- **VS Code** hoặc **IntelliJ IDEA** (khuyến nghị)
- Extension MySQL cho VS Code (nếu dùng VS Code)

## 🚀 Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd parrtime-staff-management/parttime-staff-management
```

### 2. Thiết Lập Database

#### Cách 1: Sử dụng Flyway (Tự động - Khuyến nghị)

Flyway sẽ tự động tạo bảng khi chạy Backend. Chỉ cần tạo database:

```sql
CREATE DATABASE coffee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Cách 2: Chạy SQL thủ công

Xem hướng dẫn chi tiết trong [database/README.md](./database/README.md)

```bash
# Sử dụng VS Code MySQL Extension hoặc phpMyAdmin
# Chạy file: database/full_setup.sql
```

### 3. Cấu Hình Backend

1. Mở file `backend/src/main/resources/application.yml`

2. Cập nhật thông tin database:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coffee_management?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
    username: ${DB_USERNAME:root} # Thay đổi nếu cần
    password: ${DB_PASSWORD:123456} # Thay đổi password MySQL của bạn
```

3. Cấu hình JWT Secret (tùy chọn):

```yaml
jwt:
  secret: ${JWT_SECRET:mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong123456}
```

Hoặc sử dụng biến môi trường:

```bash
# Windows (CMD)
set DB_USERNAME=root
set DB_PASSWORD=your_password
set JWT_SECRET=your-256-bit-secret-key

# Windows (PowerShell)
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
$env:JWT_SECRET="your-256-bit-secret-key"

# Linux/Mac
export DB_USERNAME=root
export DB_PASSWORD=your_password
export JWT_SECRET=your-256-bit-secret-key
```

### 4. Cấu Hình Frontend

1. Tạo file `.env` trong thư mục `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

2. Cài đặt dependencies:

```bash
cd frontend
npm install
```

## ⚙️ Cấu Hình

### Backend Configuration

File: `backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coffee_management
    username: root
    password: your_password

  flyway:
    enabled: true # Tự động chạy migrations

server:
  port: 8080

jwt:
  secret: your-256-bit-secret-key
  access-token-expiration: 86400000 # 24 hours
  refresh-token-expiration: 604800000 # 7 days

cors:
  allowed-origins: http://localhost:3000,http://localhost:5173
```

### Frontend Configuration

File: `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

## 🏃 Chạy Ứng Dụng

### Chạy Backend

```bash
cd backend

# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run

# Hoặc chạy JAR file
java -jar target/management-1.0.0.jar
```

Backend sẽ chạy tại: **http://localhost:8080**

### Chạy Frontend

Mở terminal mới:

```bash
cd frontend

# Chạy development server
npm start
```

Frontend sẽ chạy tại: **http://localhost:3000**

### Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

## 👥 Tài Khoản Demo

Sau khi setup database, bạn có thể đăng nhập với các tài khoản sau:

| Vai Trò     | Username    | Password      | Cơ Sở     | Ghi Chú           |
| ----------- | ----------- | ------------- | --------- | ----------------- |
| **Owner**   | `owner`     | `password123` | Tất cả    | Quyền cao nhất    |
| **Manager** | `managerA`  | `password123` | Hoàn Kiếm | Quản lý Store A   |
| **Manager** | `managerB`  | `password123` | Cầu Giấy  | Quản lý Store B   |
| **Manager** | `managerC`  | `password123` | Đống Đa   | Quản lý Store C   |
| **Staff**   | `staff_a01` | `password123` | Hoàn Kiếm | Nhân viên Store A |
| **Staff**   | `staff_b01` | `password123` | Cầu Giấy  | Nhân viên Store B |
| **Staff**   | `staff_c01` | `password123` | Đống Đa   | Nhân viên Store C |

**Lưu ý**: Có 30 tài khoản Staff (10 nhân viên/cơ sở): `staff_a01` → `staff_a10`, `staff_b01` → `staff_b10`, `staff_c01` → `staff_c10`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint               | Description   | Auth Required |
| ------ | ---------------------- | ------------- | ------------- |
| POST   | `/api/v1/auth/login`   | Đăng nhập     | ❌            |
| POST   | `/api/v1/auth/refresh` | Refresh token | ❌            |
| POST   | `/api/v1/auth/logout`  | Đăng xuất     | ✅            |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/AuthController.java`

### User Management

| Method | Endpoint                | Description         | Role           |
| ------ | ----------------------- | ------------------- | -------------- |
| GET    | `/api/v1/users`         | Danh sách nhân viên | Owner, Manager |
| GET    | `/api/v1/users/{id}`    | Chi tiết nhân viên  | Owner, Manager |
| POST   | `/api/v1/users`         | Tạo nhân viên mới   | Owner, Manager |
| PUT    | `/api/v1/users/{id}`    | Cập nhật nhân viên  | Owner, Manager |
| DELETE | `/api/v1/users/{id}`    | Xóa nhân viên       | Owner          |
| GET    | `/api/v1/users/profile` | Thông tin cá nhân   | All            |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/UserController.java`

### Store Management

| Method | Endpoint              | Description     | Role           |
| ------ | --------------------- | --------------- | -------------- |
| GET    | `/api/v1/stores`      | Danh sách cơ sở | Owner, Manager |
| GET    | `/api/v1/stores/{id}` | Chi tiết cơ sở  | Owner, Manager |
| POST   | `/api/v1/stores`      | Tạo cơ sở mới   | Owner          |
| PUT    | `/api/v1/stores/{id}` | Cập nhật cơ sở  | Owner          |
| DELETE | `/api/v1/stores/{id}` | Xóa cơ sở       | Owner          |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/StoreController.java`

### Shift Management

| Method | Endpoint                         | Description             | Role           |
| ------ | -------------------------------- | ----------------------- | -------------- |
| GET    | `/api/v1/stores/{id}/shifts`     | Danh sách ca theo cơ sở | Manager        |
| POST   | `/api/v1/stores/{id}/shifts`     | Tạo ca mới              | Manager        |
| GET    | `/api/v1/shifts/{id}`            | Chi tiết ca             | Manager, Staff |
| PUT    | `/api/v1/shifts/{id}`            | Cập nhật ca             | Manager        |
| DELETE | `/api/v1/shifts/{id}`            | Xóa ca                  | Manager        |
| POST   | `/api/v1/shifts/{id}/assign`     | Phân công nhân viên     | Manager        |
| PUT    | `/api/v1/shifts/{id}/assignment` | Xác nhận/từ chối ca     | Staff          |
| GET    | `/api/v1/my-shifts`              | Ca làm của tôi          | Staff          |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/ShiftController.java`

### Shift Registration & Finalization

| Method | Endpoint                                            | Description           | Role    |
| ------ | --------------------------------------------------- | --------------------- | ------- |
| GET    | `/api/v1/shift-templates/store/{storeId}`           | Danh sách ca mẫu      | All     |
| POST   | `/api/v1/shift-templates/store/{storeId}`           | Tạo ca mẫu            | Manager |
| GET    | `/api/v1/shift-registrations/week`                  | Đăng ký ca trong tuần | Manager |
| GET    | `/api/v1/shift-registrations/my-week`               | Đăng ký ca của tôi    | Staff   |
| POST   | `/api/v1/shift-registrations/register`              | Đăng ký ca            | Staff   |
| DELETE | `/api/v1/shift-registrations/{id}`                  | Hủy đăng ký           | Staff   |
| POST   | `/api/v1/shift-templates/{templateId}/finalize`     | Chốt ca               | Manager |
| GET    | `/api/v1/shift-templates/{templateId}/is-finalized` | Kiểm tra ca đã chốt   | All     |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/ShiftRegistrationController.java`

### Marketplace (Chợ Ca)

| Method | Endpoint                          | Description               | Role    |
| ------ | --------------------------------- | ------------------------- | ------- |
| GET    | `/api/v1/marketplace/store/{id}`  | Ca đang nhường theo cơ sở | All     |
| GET    | `/api/v1/marketplace/my-listings` | Ca tôi đang nhường        | Staff   |
| POST   | `/api/v1/marketplace/give`        | Đăng nhường ca            | Staff   |
| POST   | `/api/v1/marketplace/claim/{id}`  | Yêu cầu nhận ca           | Staff   |
| POST   | `/api/v1/marketplace/review/{id}` | Manager duyệt giao dịch   | Manager |
| POST   | `/api/v1/marketplace/swap`        | Yêu cầu đổi ca            | Staff   |
| DELETE | `/api/v1/marketplace/{id}`        | Hủy đăng nhường ca        | Staff   |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/MarketplaceController.java`

### Task Management

| Method | Endpoint                      | Description         | Role    |
| ------ | ----------------------------- | ------------------- | ------- |
| GET    | `/api/v1/tasks/store/{id}`    | Nhiệm vụ theo cơ sở | Manager |
| GET    | `/api/v1/tasks/my-tasks`      | Nhiệm vụ của tôi    | Staff   |
| POST   | `/api/v1/tasks`               | Tạo nhiệm vụ        | Manager |
| PUT    | `/api/v1/tasks/{id}`          | Cập nhật nhiệm vụ   | Manager |
| POST   | `/api/v1/tasks/{id}/complete` | Hoàn thành nhiệm vụ | Staff   |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/TaskController.java`

### Request Management

| Method | Endpoint                        | Description       | Role    |
| ------ | ------------------------------- | ----------------- | ------- |
| GET    | `/api/v1/requests`              | Danh sách yêu cầu | Manager |
| GET    | `/api/v1/requests/my-requests`  | Yêu cầu của tôi   | Staff   |
| POST   | `/api/v1/requests`              | Tạo yêu cầu       | Staff   |
| PUT    | `/api/v1/requests/{id}/approve` | Duyệt yêu cầu     | Manager |
| PUT    | `/api/v1/requests/{id}/reject`  | Từ chối yêu cầu   | Manager |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/RequestController.java`

### Payroll Management

| Method | Endpoint                        | Description          | Role           |
| ------ | ------------------------------- | -------------------- | -------------- |
| GET    | `/api/v1/payrolls`              | Danh sách bảng lương | Owner, Manager |
| GET    | `/api/v1/payrolls/{id}`         | Chi tiết bảng lương  | Owner, Manager |
| GET    | `/api/v1/my-payrolls`           | Phiếu lương của tôi  | Staff          |
| POST   | `/api/v1/payrolls`              | Tạo bảng lương       | Manager        |
| PUT    | `/api/v1/payrolls/{id}/approve` | Duyệt bảng lương     | Owner          |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/PayrollController.java`

### Time Log Management

| Method | Endpoint                    | Description          | Role    |
| ------ | --------------------------- | -------------------- | ------- |
| POST   | `/api/v1/timelogs/checkin`  | Check-in ca làm      | Staff   |
| POST   | `/api/v1/timelogs/checkout` | Check-out ca làm     | Staff   |
| GET    | `/api/v1/timelogs/my-logs`  | Lịch sử công của tôi | Staff   |
| POST   | `/api/v1/timelogs/manual`   | Chấm công thủ công   | Manager |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/TimeLogController.java`

### Notification Management

| Method | Endpoint                          | Description                 | Role           |
| ------ | --------------------------------- | --------------------------- | -------------- |
| GET    | `/api/v1/notifications`           | Danh sách thông báo         | All            |
| GET    | `/api/v1/notifications/unread`    | Thông báo chưa đọc          | All            |
| PUT    | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc             | All            |
| PUT    | `/api/v1/notifications/read-all`  | Đánh dấu tất cả đã đọc      | All            |
| POST   | `/api/v1/notifications/send`      | Gửi thông báo               | Owner, Manager |
| POST   | `/api/v1/notifications/broadcast` | Gửi thông báo toàn hệ thống | Owner          |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/NotificationController.java`

### Report & Ranking

| Method | Endpoint                     | Description             | Role           |
| ------ | ---------------------------- | ----------------------- | -------------- |
| GET    | `/api/v1/reports/payroll`    | Báo cáo chi phí nhân sự | Owner, Manager |
| GET    | `/api/v1/reports/attendance` | Báo cáo chấm công       | Owner, Manager |
| GET    | `/api/v1/ranking/employees`  | Bảng xếp hạng nhân viên | Owner, Manager |

**Thư mục**:

- `backend/src/main/java/com/coffee/management/controller/ReportController.java`
- `backend/src/main/java/com/coffee/management/controller/EmployeeRankingController.java`

### Complaint Management

| Method | Endpoint                           | Description         | Role           |
| ------ | ---------------------------------- | ------------------- | -------------- |
| GET    | `/api/v1/complaints`               | Danh sách khiếu nại | Owner, Manager |
| GET    | `/api/v1/complaints/my-complaints` | Khiếu nại của tôi   | Staff          |
| POST   | `/api/v1/complaints`               | Tạo khiếu nại       | Staff          |
| PUT    | `/api/v1/complaints/{id}/resolve`  | Xử lý khiếu nại     | Owner, Manager |

**Thư mục**: `backend/src/main/java/com/coffee/management/controller/ComplaintController.java`

**Xem chi tiết API tại Swagger UI**: http://localhost:8080/swagger-ui.html

## 📁 Cấu Trúc Dự Án Chi Tiết

```
parttime-staff-management/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/coffee/management/
│   │       │   ├── CoffeeManagementApplication.java  # Main application class
│   │       │   │
│   │       │   ├── config/           # Spring Configuration
│   │       │   │   ├── CorsConfig.java              # CORS configuration
│   │       │   │   ├── OpenApiConfig.java           # Swagger/OpenAPI config
│   │       │   │   └── SecurityConfig.java         # Spring Security config
│   │       │   │
│   │       │   ├── controller/       # REST Controllers (14 files)
│   │       │   │   ├── AuthController.java          # Authentication endpoints
│   │       │   │   ├── UserController.java         # User management
│   │       │   │   ├── StoreController.java        # Store management
│   │       │   │   ├── ShiftController.java        # Shift management
│   │       │   │   ├── ShiftRegistrationController.java  # Shift registration & finalization
│   │       │   │   ├── MarketplaceController.java   # Marketplace (Chợ Ca)
│   │       │   │   ├── TaskController.java         # Task management
│   │       │   │   ├── RequestController.java      # Request management
│   │       │   │   ├── PayrollController.java      # Payroll management
│   │       │   │   ├── TimeLogController.java      # Time logging (check-in/out)
│   │       │   │   ├── NotificationController.java # Notification management
│   │       │   │   ├── ReportController.java       # Reports
│   │       │   │   ├── EmployeeRankingController.java  # Employee ranking
│   │       │   │   └── ComplaintController.java    # Complaint management
│   │       │   │
│   │       │   ├── dto/              # Data Transfer Objects (45 files)
│   │       │   │   ├── ApiResponse.java           # Standard API response wrapper
│   │       │   │   ├── auth/                      # Authentication DTOs
│   │       │   │   ├── user/                       # User DTOs
│   │       │   │   ├── store/                     # Store DTOs
│   │       │   │   ├── shift/                     # Shift DTOs
│   │       │   │   │   ├── CreateShiftRequest.java
│   │       │   │   │   ├── ShiftResponse.java
│   │       │   │   │   ├── CreateShiftTemplateRequest.java
│   │       │   │   │   ├── ShiftTemplateResponse.java
│   │       │   │   │   ├── FinalizeShiftRequest.java
│   │       │   │   │   └── ...
│   │       │   │   ├── marketplace/               # Marketplace DTOs
│   │       │   │   ├── task/                     # Task DTOs
│   │       │   │   ├── request/                  # Request DTOs
│   │       │   │   ├── payroll/                  # Payroll DTOs
│   │       │   │   ├── timelog/                  # TimeLog DTOs
│   │       │   │   ├── notification/             # Notification DTOs
│   │       │   │   ├── report/                   # Report DTOs
│   │       │   │   └── complaint/                # Complaint DTOs
│   │       │   │
│   │       │   ├── entity/           # JPA Entities (31 files)
│   │       │   │   ├── User.java                  # User entity
│   │       │   │   ├── Store.java                 # Store entity
│   │       │   │   ├── Shift.java                 # Shift entity (template & actual)
│   │       │   │   ├── ShiftAssignment.java      # Shift assignment
│   │       │   │   ├── ShiftRegistration.java    # Shift registration
│   │       │   │   ├── ShiftFinalization.java    # Shift finalization (chốt ca)
│   │       │   │   ├── ShiftMarketplace.java     # Marketplace listing
│   │       │   │   ├── ShiftSwapRequest.java    # Swap request
│   │       │   │   ├── Task.java                 # Task entity
│   │       │   │   ├── Request.java              # Request entity
│   │       │   │   ├── Payroll.java             # Payroll entity
│   │       │   │   ├── TimeLog.java             # Time log entity
│   │       │   │   ├── Notification.java        # Notification entity
│   │       │   │   ├── Complaint.java           # Complaint entity
│   │       │   │   ├── AuditLog.java           # Audit log entity
│   │       │   │   └── ... (enums: Role, ShiftType, etc.)
│   │       │   │
│   │       │   ├── exception/        # Custom Exceptions (5 files)
│   │       │   │   ├── GlobalExceptionHandler.java
│   │       │   │   ├── ResourceNotFoundException.java
│   │       │   │   ├── BadRequestException.java
│   │       │   │   ├── ForbiddenException.java
│   │       │   │   └── UnauthorizedException.java
│   │       │   │
│   │       │   ├── repository/       # JPA Repositories (15 files)
│   │       │   │   ├── UserRepository.java
│   │       │   │   ├── StoreRepository.java
│   │       │   │   ├── ShiftRepository.java
│   │       │   │   ├── ShiftAssignmentRepository.java
│   │       │   │   ├── ShiftRegistrationRepository.java
│   │       │   │   ├── ShiftFinalizationRepository.java
│   │       │   │   ├── ShiftMarketplaceRepository.java
│   │       │   │   ├── ShiftSwapRequestRepository.java
│   │       │   │   ├── TaskRepository.java
│   │       │   │   ├── RequestRepository.java
│   │       │   │   ├── PayrollRepository.java
│   │       │   │   ├── TimeLogRepository.java
│   │       │   │   ├── NotificationRepository.java
│   │       │   │   ├── ComplaintRepository.java
│   │       │   │   └── AuditLogRepository.java
│   │       │   │
│   │       │   ├── security/         # JWT & Security (5 files)
│   │       │   │   ├── SecurityConfig.java
│   │       │   │   ├── JwtTokenProvider.java
│   │       │   │   ├── JwtAuthenticationFilter.java
│   │       │   │   ├── JwtAuthenticationEntryPoint.java
│   │       │   │   ├── CustomUserDetailsService.java
│   │       │   │   └── UserPrincipal.java
│   │       │   │
│   │       │   └── service/          # Business Logic (16 files)
│   │       │       ├── AuthService.java
│   │       │       ├── UserService.java
│   │       │       ├── StoreService.java
│   │       │       ├── ShiftService.java
│   │       │       ├── ShiftRegistrationService.java
│   │       │       ├── MarketplaceService.java
│   │       │       ├── TaskService.java
│   │       │       ├── RequestService.java
│   │       │       ├── PayrollService.java
│   │       │       ├── TimeLogService.java
│   │       │       ├── NotificationService.java
│   │       │       ├── ReportService.java
│   │       │       ├── EmployeeRankingService.java
│   │       │       ├── ComplaintService.java
│   │       │       ├── AuditService.java
│   │       │       └── AutoCheckOutService.java
│   │       │
│   │       └── resources/
│   │           ├── db/migration/     # Flyway Migrations
│   │           │   ├── V1__init_schema.sql        # Initial schema
│   │           │   ├── V2__seed_data.sql          # Seed data
│   │           │   ├── V3__marketplace_and_tasks.sql
│   │           │   ├── V4__sample_marketplace_tasks.sql
│   │           │   ├── V5__complaints_table.sql
│   │           │   ├── V6__notification_attachments.sql
│   │           │   ├── V7__user_avatar_longtext.sql
│   │           │   ├── V8__shift_registrations.sql  # Shift registration system
│   │           │   ├── V9__add_notes_to_shifts.sql  # Add notes to shifts
│   │           │   └── V10__add_shift_finalization.sql  # Shift finalization system
│   │           ├── application.yml
│   │           ├── application-test.yml
│   │           └── application-manual.yml
│   ├── pom.xml
│   └── README.md
│
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── api/                      # API Services (14 files)
│   │   │   ├── axios.ts              # Axios instance & interceptors
│   │   │   ├── authService.ts        # Authentication API
│   │   │   ├── userService.ts        # User management API
│   │   │   ├── storeService.ts      # Store management API
│   │   │   ├── shiftService.ts       # Shift management API
│   │   │   ├── shiftRegistrationService.ts  # Shift registration API
│   │   │   ├── marketplaceService.ts # Marketplace API
│   │   │   ├── taskService.ts       # Task management API
│   │   │   ├── requestService.ts    # Request management API
│   │   │   ├── payrollService.ts    # Payroll API
│   │   │   ├── timeLogService.ts    # Time log API
│   │   │   ├── notificationService.ts  # Notification API
│   │   │   ├── reportService.ts     # Report API
│   │   │   ├── rankingService.ts    # Ranking API
│   │   │   └── complaintService.ts  # Complaint API
│   │   │
│   │   ├── app/                      # Redux Store
│   │   │   └── store.ts              # Redux store configuration
│   │   │
│   │   ├── components/               # Reusable Components (4 files)
│   │   │   ├── Layout.tsx           # Main layout with sidebar
│   │   │   ├── Loading.tsx           # Loading spinner
│   │   │   ├── Toast.tsx            # Toast notification
│   │   │   └── ConfirmModal.tsx    # Confirmation modal
│   │   │
│   │   ├── features/                 # Redux Slices (10 files)
│   │   │   ├── auth/
│   │   │   │   └── authSlice.ts     # Authentication state
│   │   │   ├── users/
│   │   │   │   └── userSlice.ts     # User state
│   │   │   ├── stores/
│   │   │   │   └── storeSlice.ts    # Store state
│   │   │   ├── shifts/
│   │   │   │   └── shiftSlice.ts    # Shift state
│   │   │   ├── marketplace/
│   │   │   │   └── marketplaceSlice.ts  # Marketplace state
│   │   │   ├── tasks/
│   │   │   │   └── taskSlice.ts     # Task state
│   │   │   ├── requests/
│   │   │   │   └── requestSlice.ts  # Request state
│   │   │   ├── payroll/
│   │   │   │   └── payrollSlice.ts  # Payroll state
│   │   │   ├── timelog/
│   │   │   │   └── timelogSlice.ts  # Time log state
│   │   │   ├── notifications/
│   │   │   │   └── notificationSlice.ts  # Notification state
│   │   │   └── complaints/
│   │   │       └── complaintSlice.ts  # Complaint state
│   │   │
│   │   ├── pages/                    # Page Components (18 files)
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Dashboard.tsx        # Dashboard (Owner/Manager/Staff)
│   │   │   ├── Users.tsx            # User management (Owner/Manager)
│   │   │   ├── Stores.tsx           # Store management (Owner)
│   │   │   ├── Shifts.tsx           # Shift template management & finalization (Manager)
│   │   │   ├── ShiftRegistration.tsx  # Shift registration (Staff)
│   │   │   ├── MyShifts.tsx         # My shifts & check-in/out (Staff)
│   │   │   ├── WorkSchedule.tsx     # Work schedule view
│   │   │   ├── Marketplace.tsx      # Marketplace (Chợ Ca)
│   │   │   ├── Tasks.tsx            # Task management
│   │   │   ├── CreateTaskForStaff.tsx  # Create task for staff
│   │   │   ├── Requests.tsx         # Request management
│   │   │   ├── Payrolls.tsx         # Payroll management (Owner/Manager)
│   │   │   ├── MyPayroll.tsx        # My payroll (Staff)
│   │   │   ├── Reports.tsx          # Reports (Owner/Manager)
│   │   │   ├── EmployeeRanking.tsx  # Employee ranking
│   │   │   ├── Notifications.tsx    # Notifications
│   │   │   ├── Complaints.tsx       # Complaints
│   │   │   └── Profile.tsx          # User profile
│   │   │
│   │   ├── routes/                   # Route Guards
│   │   │   └── ProtectedRoute.tsx   # Protected route wrapper
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   └── formatters.ts       # Date/time formatters
│   │   │
│   │   ├── App.tsx                  # Main App component
│   │   ├── index.tsx                # Entry point
│   │   └── index.css                # Global styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── database/                          # Database Scripts
│   ├── schema.sql                    # Database schema
│   ├── data.sql                      # Sample data
│   ├── full_setup.sql                # Complete setup
│   ├── setup.sql                     # Database creation only
│   ├── init.bat                      # Windows init script
│   ├── init.ps1                      # PowerShell init script
│   └── README.md
│
├── postman_collection.json           # Postman API Collection
└── README.md                          # This file
```

## 🗺 Mapping Thư Mục và Chức Năng

### Backend Mapping

| Chức Năng              | Controller                         | Service                         | Entity                                                           | Repository                                                                                     |
| ---------------------- | ---------------------------------- | ------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Authentication**     | `AuthController.java`              | `AuthService.java`              | `User.java`                                                      | `UserRepository.java`                                                                          |
| **User Management**    | `UserController.java`              | `UserService.java`              | `User.java`                                                      | `UserRepository.java`                                                                          |
| **Store Management**   | `StoreController.java`             | `StoreService.java`             | `Store.java`                                                     | `StoreRepository.java`                                                                         |
| **Shift Management**   | `ShiftController.java`             | `ShiftService.java`             | `Shift.java`, `ShiftAssignment.java`                             | `ShiftRepository.java`, `ShiftAssignmentRepository.java`                                       |
| **Shift Registration** | `ShiftRegistrationController.java` | `ShiftRegistrationService.java` | `Shift.java`, `ShiftRegistration.java`, `ShiftFinalization.java` | `ShiftRepository.java`, `ShiftRegistrationRepository.java`, `ShiftFinalizationRepository.java` |
| **Marketplace**        | `MarketplaceController.java`       | `MarketplaceService.java`       | `ShiftMarketplace.java`, `ShiftSwapRequest.java`                 | `ShiftMarketplaceRepository.java`, `ShiftSwapRequestRepository.java`                           |
| **Task Management**    | `TaskController.java`              | `TaskService.java`              | `Task.java`                                                      | `TaskRepository.java`                                                                          |
| **Request Management** | `RequestController.java`           | `RequestService.java`           | `Request.java`                                                   | `RequestRepository.java`                                                                       |
| **Payroll Management** | `PayrollController.java`           | `PayrollService.java`           | `Payroll.java`                                                   | `PayrollRepository.java`                                                                       |
| **Time Logging**       | `TimeLogController.java`           | `TimeLogService.java`           | `TimeLog.java`                                                   | `TimeLogRepository.java`                                                                       |
| **Notifications**      | `NotificationController.java`      | `NotificationService.java`      | `Notification.java`                                              | `NotificationRepository.java`                                                                  |
| **Reports**            | `ReportController.java`            | `ReportService.java`            | -                                                                | Multiple repositories                                                                          |
| **Employee Ranking**   | `EmployeeRankingController.java`   | `EmployeeRankingService.java`   | -                                                                | Multiple repositories                                                                          |
| **Complaints**         | `ComplaintController.java`         | `ComplaintService.java`         | `Complaint.java`                                                 | `ComplaintRepository.java`                                                                     |

### Frontend Mapping

| Chức Năng                     | Page Component                        | API Service                                      | Redux Slice                        |
| ----------------------------- | ------------------------------------- | ------------------------------------------------ | ---------------------------------- |
| **Authentication**            | `Login.tsx`                           | `authService.ts`                                 | `authSlice.ts`                     |
| **Dashboard**                 | `Dashboard.tsx`                       | Multiple services                                | Multiple slices                    |
| **User Management**           | `Users.tsx`                           | `userService.ts`                                 | `userSlice.ts`                     |
| **Store Management**          | `Stores.tsx`                          | `storeService.ts`                                | `storeSlice.ts`                    |
| **Shift Template Management** | `Shifts.tsx`                          | `shiftService.ts`, `shiftRegistrationService.ts` | `shiftSlice.ts`                    |
| **Shift Registration**        | `ShiftRegistration.tsx`               | `shiftRegistrationService.ts`                    | `shiftSlice.ts`                    |
| **My Shifts**                 | `MyShifts.tsx`                        | `shiftService.ts`, `timeLogService.ts`           | `shiftSlice.ts`, `timelogSlice.ts` |
| **Work Schedule**             | `WorkSchedule.tsx`                    | `shiftService.ts`                                | `shiftSlice.ts`                    |
| **Marketplace**               | `Marketplace.tsx`                     | `marketplaceService.ts`                          | `marketplaceSlice.ts`              |
| **Task Management**           | `Tasks.tsx`, `CreateTaskForStaff.tsx` | `taskService.ts`                                 | `taskSlice.ts`                     |
| **Request Management**        | `Requests.tsx`                        | `requestService.ts`                              | `requestSlice.ts`                  |
| **Payroll Management**        | `Payrolls.tsx`, `MyPayroll.tsx`       | `payrollService.ts`                              | `payrollSlice.ts`                  |
| **Reports**                   | `Reports.tsx`                         | `reportService.ts`                               | -                                  |
| **Employee Ranking**          | `EmployeeRanking.tsx`                 | `rankingService.ts`                              | -                                  |
| **Notifications**             | `Notifications.tsx`                   | `notificationService.ts`                         | `notificationSlice.ts`             |
| **Complaints**                | `Complaints.tsx`                      | `complaintService.ts`                            | `complaintSlice.ts`                |
| **Profile**                   | `Profile.tsx`                         | `userService.ts`                                 | `authSlice.ts`                     |

## 🔒 Bảo Mật

- ✅ **JWT Authentication** với Access Token và Refresh Token
- ✅ **BCrypt Password Encryption** - Mã hóa mật khẩu
- ✅ **Role-based Access Control (RBAC)** - Phân quyền theo vai trò
- ✅ **CORS Configuration** - Bảo vệ cross-origin requests
- ✅ **Input Validation** - Kiểm tra dữ liệu đầu vào
- ✅ **SQL Injection Protection** - Sử dụng JPA để tránh SQL injection

**Thư mục liên quan**:

- `backend/src/main/java/com/coffee/management/security/` - Security configuration
- `backend/src/main/java/com/coffee/management/config/SecurityConfig.java` - Security config

## 📝 Quy Tắc Nghiệp Vụ

### 1. Ca Làm Việc (Shift Management)

#### Ca Mẫu (Shift Template)

- Manager tạo ca mẫu cho các ngày trong tuần (Thứ 2-7, Chủ nhật)
- Mỗi ca mẫu có: tên ca, loại ca (Sáng/Chiều/Tối), thời gian bắt đầu/kết thúc, số nhân viên cần, ghi chú
- Ca mẫu hiển thị cho tất cả các tuần
- Manager có thể xóa ca mẫu (không ảnh hưởng đến ca thực tế đã tạo)

#### Đăng Ký Ca (Shift Registration)

- Staff đăng ký cho các ca mẫu trong tuần
- Chỉ đăng ký được ca tương lai (không đăng ký ca quá khứ)
- Không thể đăng ký ca đã được chốt
- Có thể hủy đăng ký trước khi ca được chốt

#### Chốt Ca (Shift Finalization)

- Manager xem danh sách nhân viên đã đăng ký
- Manager chọn nhân viên từ danh sách đăng ký (đúng số người cần)
- Khi chốt ca:
  - Tạo ca thực tế cho ngày cụ thể
  - Phân công nhân viên đã chọn vào ca
  - Khóa ca (nhân viên không thể đăng ký/hủy sau khi chốt)
- Sau khi chốt, ca mẫu vẫn có thể xóa (không ảnh hưởng đến ca thực tế)

#### Phân Công Ca

- Manager phân công nhân viên vào ca đã tạo
- Staff xác nhận/từ chối ca được phân công
- Mỗi ca tối đa 3 nhân viên

### 2. Chợ Ca (Marketplace)

- Phải đăng nhường ca trước ít nhất 2 giờ
- Manager phải duyệt mọi giao dịch
- Không thể đổi ca khi ca đã bắt đầu

### 3. Tính Lương

- Dựa trên giờ làm việc thực tế (check-in/check-out)
- Manager có thể chấm công thủ công
- Owner phải duyệt bảng lương trước khi thanh toán

### 4. Yêu Cầu

- Staff gửi yêu cầu nghỉ/đổi ca
- Manager duyệt/từ chối yêu cầu
- Thông báo realtime cho cả hai bên

### 5. Audit Log

- Lưu lại mọi hành động quan trọng (tạo, sửa, xóa)
- **Thư mục**: `backend/src/main/java/com/coffee/management/service/AuditService.java`

## 🐛 Troubleshooting

### Backend không chạy được

**Lỗi: Port 8080 đã được sử dụng**

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Lỗi: Database connection failed**

- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong `application.yml`
- Kiểm tra database `coffee_management` đã tạo chưa

**Lỗi: Flyway migration failed**

- Kiểm tra database đã tồn tại chưa
- Xóa các bảng cũ nếu cần: `DROP DATABASE coffee_management; CREATE DATABASE coffee_management;`
- Hoặc tắt Flyway và chạy SQL thủ công

### Frontend không kết nối được Backend

**Lỗi: Network Error / CORS Error**

- Kiểm tra Backend đã chạy tại `http://localhost:8080`
- Kiểm tra file `.env` có đúng `REACT_APP_API_URL`
- Kiểm tra CORS config trong `application.yml`

**Lỗi: 401 Unauthorized**

- Token đã hết hạn, đăng nhập lại
- Kiểm tra token có được gửi trong header không

### Database Issues

**Lỗi: Table doesn't exist**

- Chạy lại Flyway migrations hoặc SQL scripts
- Kiểm tra `flyway.enabled: true` trong `application.yml`

**Lỗi: Character encoding issues**

- Đảm bảo database sử dụng `utf8mb4` charset
- Kiểm tra connection string có `useUnicode=true&characterEncoding=utf8`

### IDE Warnings (Lombok)

Nếu IDE hiển thị nhiều warnings về Lombok:

- Cài đặt Lombok plugin cho IDE
- Enable annotation processing
- Rebuild project

Xem chi tiết: [backend/IDE_FIX_GUIDE.md](./backend/IDE_FIX_GUIDE.md)

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. **Fork** dự án
2. **Tạo branch** tính năng (`git checkout -b feature/AmazingFeature`)
3. **Commit** thay đổi (`git commit -m 'Add AmazingFeature'`)
4. **Push** lên branch (`git push origin feature/AmazingFeature`)
5. **Mở Pull Request**

### Quy tắc đóng góp

- Tuân thủ code style hiện tại
- Viết commit message rõ ràng
- Thêm tests cho tính năng mới
- Cập nhật documentation nếu cần

## 📄 License

Dự án này được phát hành dưới giấy phép **MIT License**.

## 👨‍💻 Tác Giả

Xây dựng bởi ❤️ cho cộng đồng

---

**Coffee House Management System** - Hệ thống quản lý nhân viên bán thời gian chuyên nghiệp

📧 **Liên hệ**: [Thêm thông tin liên hệ nếu cần]

🔗 **Repository**: [Thêm link repository nếu có]
