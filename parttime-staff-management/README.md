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
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [API Documentation](#-api-documentation)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Troubleshooting](#-troubleshooting)
- [Đóng Góp](#-đóng-góp)

## 🎯 Tổng Quan

Hệ thống quản lý nhân viên bán thời gian được thiết kế để hỗ trợ chuỗi quán cà phê quản lý:
- **Nhân viên**: Quản lý thông tin, phân công ca làm việc
- **Ca làm việc**: Tạo lịch ca, phân công nhân viên, check-in/check-out
- **Chợ Ca (Marketplace)**: Cho phép nhân viên nhường/nhận/đổi ca với nhau
- **Tính lương**: Tự động tính lương dựa trên giờ làm việc
- **Nhiệm vụ**: Giao và theo dõi nhiệm vụ cho nhân viên
- **Yêu cầu**: Xử lý yêu cầu nghỉ/đổi ca từ nhân viên
- **Báo cáo**: Báo cáo chi phí nhân sự, thống kê hoạt động

## ✨ Tính Năng

### 👤 Owner (Chủ Sở Hữu)
- ✅ Dashboard tổng quan toàn hệ thống
- ✅ Quản lý cơ sở (CRUD stores)
- ✅ Quản lý Manager và Staff toàn hệ thống
- ✅ Xem & phê duyệt bảng lương toàn hệ thống
- ✅ Báo cáo chi phí nhân sự theo tháng/cơ sở
- ✅ Giám sát Chợ Ca toàn bộ cơ sở
- ✅ Gửi thông báo toàn hệ thống
- ✅ Xem bảng xếp hạng nhân viên
- ✅ Xử lý khiếu nại

### 👨‍💼 Manager (Quản Lý)
- ✅ Dashboard cơ sở được giao quản lý
- ✅ Quản lý nhân viên thuộc cơ sở
- ✅ Tạo và quản lý lịch làm việc (3 ca/ngày: Sáng, Chiều, Tối)
- ✅ Phân công nhân viên vào ca (tối đa 3 nhân viên/ca)
- ✅ Duyệt yêu cầu nghỉ/đổi ca từ nhân viên
- ✅ Tạo và theo dõi nhiệm vụ cho nhân viên
- ✅ Quản lý Chợ Ca (duyệt nhường/nhận ca)
- ✅ Tính lương nhân viên thuộc cơ sở
- ✅ Chấm công thủ công (nếu cần)
- ✅ Xem báo cáo cơ sở

### 👷 Staff (Nhân Viên)
- ✅ Dashboard cá nhân với ca làm & nhiệm vụ
- ✅ Xác nhận/từ chối ca được phân công
- ✅ Check-in/Check-out ca làm việc
- ✅ Gửi yêu cầu nghỉ/đổi ca
- ✅ **Chợ Ca**: 
  - Đăng nhường ca
  - Nhận ca trống
  - Yêu cầu đổi ca với nhân viên khác
- ✅ Xem và hoàn thành nhiệm vụ được giao
- ✅ Xem phiếu lương cá nhân
- ✅ Xem lịch sử công và thời gian làm việc
- ✅ Gửi khiếu nại

### 🛒 Chợ Ca (Shift Marketplace)
- ✅ Staff đăng nhường ca (phải đăng trước ít nhất 2 giờ)
- ✅ Staff nhận ca trống từ nhân viên khác
- ✅ Yêu cầu đổi ca giữa nhân viên
- ✅ Manager duyệt các giao dịch Chợ Ca
- ✅ Thông báo realtime khi có ca mới/được duyệt
- ✅ Lịch sử giao dịch Chợ Ca

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
    username: ${DB_USERNAME:root}  # Thay đổi nếu cần
    password: ${DB_PASSWORD:123456}  # Thay đổi password MySQL của bạn
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
    enabled: true  # Tự động chạy migrations

server:
  port: 8080

jwt:
  secret: your-256-bit-secret-key
  access-token-expiration: 86400000  # 24 hours
  refresh-token-expiration: 604800000  # 7 days

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

| Vai Trò | Username | Password | Cơ Sở | Ghi Chú |
|---------|----------|----------|-------|---------|
| **Owner** | `owner` | `password123` | Tất cả | Quyền cao nhất |
| **Manager** | `managerA` | `password123` | Hoàn Kiếm | Quản lý Store A |
| **Manager** | `managerB` | `password123` | Cầu Giấy | Quản lý Store B |
| **Manager** | `managerC` | `password123` | Đống Đa | Quản lý Store C |
| **Staff** | `staff_a01` | `password123` | Hoàn Kiếm | Nhân viên Store A |
| **Staff** | `staff_b01` | `password123` | Cầu Giấy | Nhân viên Store B |
| **Staff** | `staff_c01` | `password123` | Đống Đa | Nhân viên Store C |

**Lưu ý**: Có 30 tài khoản Staff (10 nhân viên/cơ sở): `staff_a01` → `staff_a10`, `staff_b01` → `staff_b10`, `staff_c01` → `staff_c10`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Đăng nhập | ❌ |
| POST | `/api/v1/auth/refresh` | Refresh token | ❌ |
| POST | `/api/v1/auth/logout` | Đăng xuất | ✅ |

### User Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | Danh sách nhân viên | Owner, Manager |
| GET | `/api/v1/users/{id}` | Chi tiết nhân viên | Owner, Manager |
| POST | `/api/v1/users` | Tạo nhân viên mới | Owner, Manager |
| PUT | `/api/v1/users/{id}` | Cập nhật nhân viên | Owner, Manager |
| DELETE | `/api/v1/users/{id}` | Xóa nhân viên | Owner |
| GET | `/api/v1/users/profile` | Thông tin cá nhân | All |

### Store Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/stores` | Danh sách cơ sở | Owner, Manager |
| GET | `/api/v1/stores/{id}` | Chi tiết cơ sở | Owner, Manager |
| POST | `/api/v1/stores` | Tạo cơ sở mới | Owner |
| PUT | `/api/v1/stores/{id}` | Cập nhật cơ sở | Owner |
| DELETE | `/api/v1/stores/{id}` | Xóa cơ sở | Owner |

### Shift Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/stores/{id}/shifts` | Danh sách ca theo cơ sở | Manager |
| POST | `/api/v1/stores/{id}/shifts` | Tạo ca mới | Manager |
| GET | `/api/v1/shifts/{id}` | Chi tiết ca | Manager, Staff |
| PUT | `/api/v1/shifts/{id}` | Cập nhật ca | Manager |
| DELETE | `/api/v1/shifts/{id}` | Xóa ca | Manager |
| POST | `/api/v1/shifts/{id}/assign` | Phân công nhân viên | Manager |
| PUT | `/api/v1/shifts/{id}/assignment` | Xác nhận/từ chối ca | Staff |
| GET | `/api/v1/my-shifts` | Ca làm của tôi | Staff |

### Marketplace (Chợ Ca)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/marketplace/store/{id}` | Ca đang nhường theo cơ sở | All |
| GET | `/api/v1/marketplace/my-listings` | Ca tôi đang nhường | Staff |
| POST | `/api/v1/marketplace/give` | Đăng nhường ca | Staff |
| POST | `/api/v1/marketplace/claim/{id}` | Yêu cầu nhận ca | Staff |
| POST | `/api/v1/marketplace/review/{id}` | Manager duyệt giao dịch | Manager |
| POST | `/api/v1/marketplace/swap` | Yêu cầu đổi ca | Staff |
| DELETE | `/api/v1/marketplace/{id}` | Hủy đăng nhường ca | Staff |

### Task Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/tasks/store/{id}` | Nhiệm vụ theo cơ sở | Manager |
| GET | `/api/v1/tasks/my-tasks` | Nhiệm vụ của tôi | Staff |
| POST | `/api/v1/tasks` | Tạo nhiệm vụ | Manager |
| PUT | `/api/v1/tasks/{id}` | Cập nhật nhiệm vụ | Manager |
| POST | `/api/v1/tasks/{id}/complete` | Hoàn thành nhiệm vụ | Staff |

### Request Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/requests` | Danh sách yêu cầu | Manager |
| GET | `/api/v1/requests/my-requests` | Yêu cầu của tôi | Staff |
| POST | `/api/v1/requests` | Tạo yêu cầu | Staff |
| PUT | `/api/v1/requests/{id}/approve` | Duyệt yêu cầu | Manager |
| PUT | `/api/v1/requests/{id}/reject` | Từ chối yêu cầu | Manager |

### Payroll Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/payrolls` | Danh sách bảng lương | Owner, Manager |
| GET | `/api/v1/payrolls/{id}` | Chi tiết bảng lương | Owner, Manager |
| GET | `/api/v1/my-payrolls` | Phiếu lương của tôi | Staff |
| POST | `/api/v1/payrolls` | Tạo bảng lương | Manager |
| PUT | `/api/v1/payrolls/{id}/approve` | Duyệt bảng lương | Owner |

### Time Log Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/v1/timelogs/checkin` | Check-in ca làm | Staff |
| POST | `/api/v1/timelogs/checkout` | Check-out ca làm | Staff |
| GET | `/api/v1/timelogs/my-logs` | Lịch sử công của tôi | Staff |
| POST | `/api/v1/timelogs/manual` | Chấm công thủ công | Manager |

### Notification Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/notifications` | Danh sách thông báo | All |
| GET | `/api/v1/notifications/unread` | Thông báo chưa đọc | All |
| PUT | `/api/v1/notifications/{id}/read` | Đánh dấu đã đọc | All |
| PUT | `/api/v1/notifications/read-all` | Đánh dấu tất cả đã đọc | All |

### Report & Ranking

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/reports/payroll` | Báo cáo chi phí nhân sự | Owner, Manager |
| GET | `/api/v1/reports/attendance` | Báo cáo chấm công | Owner, Manager |
| GET | `/api/v1/ranking/employees` | Bảng xếp hạng nhân viên | Owner, Manager |

### Complaint Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/complaints` | Danh sách khiếu nại | Owner, Manager |
| POST | `/api/v1/complaints` | Tạo khiếu nại | Staff |
| PUT | `/api/v1/complaints/{id}/resolve` | Xử lý khiếu nại | Owner, Manager |

**Xem chi tiết API tại Swagger UI**: http://localhost:8080/swagger-ui.html

## 📁 Cấu Trúc Dự Án

```
parttime-staff-management/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/coffee/management/
│   │       │   ├── config/           # Spring Configuration
│   │       │   │   ├── CorsConfig.java
│   │       │   │   ├── OpenApiConfig.java
│   │       │   │   └── SecurityConfig.java
│   │       │   ├── controller/       # REST Controllers (13 files)
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── UserController.java
│   │       │   │   ├── StoreController.java
│   │       │   │   ├── ShiftController.java
│   │       │   │   ├── MarketplaceController.java
│   │       │   │   ├── TaskController.java
│   │       │   │   ├── RequestController.java
│   │       │   │   ├── PayrollController.java
│   │       │   │   ├── TimeLogController.java
│   │       │   │   ├── NotificationController.java
│   │       │   │   ├── ReportController.java
│   │       │   │   ├── EmployeeRankingController.java
│   │       │   │   └── ComplaintController.java
│   │       │   ├── dto/              # Data Transfer Objects (41 files)
│   │       │   ├── entity/           # JPA Entities (27 files)
│   │       │   │   ├── User.java
│   │       │   │   ├── Store.java
│   │       │   │   ├── Shift.java
│   │       │   │   ├── ShiftAssignment.java
│   │       │   │   ├── ShiftMarketplace.java
│   │       │   │   ├── Task.java
│   │       │   │   ├── Request.java
│   │       │   │   ├── Payroll.java
│   │       │   │   ├── TimeLog.java
│   │       │   │   ├── Notification.java
│   │       │   │   ├── Complaint.java
│   │       │   │   └── ...
│   │       │   ├── exception/        # Custom Exceptions (5 files)
│   │       │   ├── repository/       # JPA Repositories (13 files)
│   │       │   ├── security/         # JWT & Security (5 files)
│   │       │   └── service/          # Business Logic (14 files)
│   │       └── resources/
│   │           ├── db/migration/     # Flyway Migrations
│   │           │   ├── V1__init_schema.sql
│   │           │   ├── V2__seed_data.sql
│   │           │   ├── V3__marketplace_and_tasks.sql
│   │           │   ├── V4__sample_marketplace_tasks.sql
│   │           │   ├── V5__complaints_table.sql
│   │           │   ├── V6__notification_attachments.sql
│   │           │   └── V7__user_avatar_longtext.sql
│   │           ├── application.yml
│   │           ├── application-test.yml
│   │           └── application-manual.yml
│   ├── pom.xml
│   └── README.md
│
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── api/                      # API Services
│   │   │   ├── axios.ts
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   ├── storeService.ts
│   │   │   ├── shiftService.ts
│   │   │   ├── marketplaceService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── requestService.ts
│   │   │   ├── payrollService.ts
│   │   │   ├── timeLogService.ts
│   │   │   ├── notificationService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── rankingService.ts
│   │   │   └── complaintService.ts
│   │   ├── app/                      # Redux Store
│   │   │   └── store.ts
│   │   ├── components/               # Reusable Components
│   │   │   ├── Layout.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ConfirmModal.tsx
│   │   ├── features/                 # Redux Slices
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── stores/
│   │   │   ├── shifts/
│   │   │   ├── marketplace/
│   │   │   ├── tasks/
│   │   │   ├── requests/
│   │   │   ├── payroll/
│   │   │   ├── timelog/
│   │   │   ├── notifications/
│   │   │   └── complaints/
│   │   ├── pages/                    # Page Components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Stores.tsx
│   │   │   ├── Shifts.tsx
│   │   │   ├── MyShifts.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── CreateTaskForStaff.tsx
│   │   │   ├── Requests.tsx
│   │   │   ├── Payrolls.tsx
│   │   │   ├── MyPayroll.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── EmployeeRanking.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Complaints.tsx
│   │   │   └── Profile.tsx
│   │   ├── routes/                   # Route Guards
│   │   │   └── ProtectedRoute.tsx
│   │   ├── utils/                    # Utilities
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── public/
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

## 🔒 Bảo Mật

- ✅ **JWT Authentication** với Access Token và Refresh Token
- ✅ **BCrypt Password Encryption** - Mã hóa mật khẩu
- ✅ **Role-based Access Control (RBAC)** - Phân quyền theo vai trò
- ✅ **CORS Configuration** - Bảo vệ cross-origin requests
- ✅ **Input Validation** - Kiểm tra dữ liệu đầu vào
- ✅ **SQL Injection Protection** - Sử dụng JPA để tránh SQL injection

## 📝 Quy Tắc Nghiệp Vụ

1. **Ca làm việc**: 
   - 3 ca/ngày (Sáng, Chiều, Tối)
   - Mỗi ca tối đa 3 nhân viên
   - Nhân viên phải xác nhận ca được phân công

2. **Chợ Ca (Marketplace)**:
   - Phải đăng nhường ca trước ít nhất 2 giờ
   - Manager phải duyệt mọi giao dịch
   - Không thể đổi ca khi ca đã bắt đầu

3. **Tính lương**:
   - Dựa trên giờ làm việc thực tế (check-in/check-out)
   - Manager có thể chấm công thủ công
   - Owner phải duyệt bảng lương trước khi thanh toán

4. **Yêu cầu**:
   - Staff gửi yêu cầu nghỉ/đổi ca
   - Manager duyệt/từ chối yêu cầu
   - Thông báo realtime cho cả hai bên

5. **Audit Log**: Lưu lại mọi hành động quan trọng (tạo, sửa, xóa)

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
