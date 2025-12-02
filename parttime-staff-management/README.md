# ☕ Coffee House - Hệ Thống Quản Lý Nhân Viên Bán Thời Gian

Ứng dụng quản lý nhân viên bán thời gian cho chuỗi 3 quán cà phê tại Hà Nội. Hỗ trợ 3 vai trò: **Owner**, **Manager**, **Staff**.

![Coffee House](https://img.shields.io/badge/Coffee%20House-Management-brown?style=for-the-badge&logo=coffeescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat-square&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql)

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [Cài Đặt](#-cài-đặt)
- [Cấu Hình](#-cấu-hình)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [API Documentation](#-api-documentation)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)

## ✨ Tính Năng

### 👤 Owner (Chủ Sở Hữu)
- ✅ Dashboard tổng quan toàn hệ thống
- ✅ Quản lý cơ sở (CRUD stores)
- ✅ Quản lý Manager và Staff
- ✅ Xem & phê duyệt bảng lương toàn hệ thống
- ✅ Báo cáo chi phí nhân sự theo tháng
- ✅ Giám sát Chợ Ca toàn bộ cơ sở
- ✅ Gửi thông báo toàn hệ thống

### 👨‍💼 Manager (Quản Lý)
- ✅ Dashboard cơ sở
- ✅ Quản lý nhân viên thuộc cơ sở
- ✅ Tạo và quản lý lịch làm việc (3 ca/ngày)
- ✅ Phân công nhân viên vào ca
- ✅ Duyệt yêu cầu nghỉ/đổi ca
- ✅ Tạo và theo dõi nhiệm vụ
- ✅ Quản lý Chợ Ca (duyệt nhường/nhận ca)
- ✅ Tính lương nhân viên

### 👷 Staff (Nhân Viên)
- ✅ Dashboard cá nhân với ca làm & nhiệm vụ
- ✅ Xác nhận/từ chối ca được phân công
- ✅ Check-in/Check-out
- ✅ Gửi yêu cầu nghỉ/đổi ca
- ✅ **Chợ Ca**: Nhường ca, Nhận ca, Đổi ca
- ✅ Hoàn thành nhiệm vụ
- ✅ Xem phiếu lương

### 🛒 Chợ Ca (Shift Marketplace)
- ✅ Staff đăng nhường ca
- ✅ Staff nhận ca trống
- ✅ Yêu cầu đổi ca giữa nhân viên
- ✅ Manager duyệt các giao dịch
- ✅ Thông báo realtime

## 🛠 Công Nghệ

### Frontend
- **React 18** + TypeScript
- **Redux Toolkit** - State management
- **Bootstrap 5** - UI Framework
- **Bootstrap Icons** - Icons
- **Axios** - HTTP Client
- **React Router v6** - Routing

### Backend
- **Spring Boot 3** (Java 17)
- **Spring Security** + JWT
- **Spring Data JPA**
- **MySQL 8**
- **Flyway** - Database migrations
- **BCrypt** - Password encryption
- **Swagger/OpenAPI** - API documentation

## 🚀 Cài Đặt

### Yêu Cầu
- **Node.js** 18+
- **Java** 17+
- **Maven** 3.8+
- **MySQL** 8.0+

### 1. Clone Repository
```bash
git clone <repository-url>
cd Parttime-staff-management
```

### 2. Thiết Lập Database
```bash
# Tạo database
mysql -u root -p
CREATE DATABASE coffee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'coffee_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON coffee_management.* TO 'coffee_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Cấu Hình Backend
```bash
cd backend

# Sửa file application.yml với thông tin database của bạn
# Hoặc tạo file application-local.yml

# Build và chạy
mvn clean install
mvn spring-boot:run
```

### 4. Cấu Hình Frontend
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

### 5. Truy Cập Ứng Dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Swagger UI**: http://localhost:8080/swagger-ui.html

## ⚙️ Cấu Hình

### Backend (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coffee_management
    username: coffee_user
    password: your_password

app:
  jwt:
    secret: your-256-bit-secret-key-here
    expiration-ms: 86400000  # 24 hours
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

## 👥 Tài Khoản Demo

| Vai Trò | Username | Password | Ghi Chú |
|---------|----------|----------|---------|
| Owner | `owner` | `password123` | Quyền cao nhất |
| Manager A | `managerA` | `password123` | Quản lý Store Hoàn Kiếm |
| Manager B | `managerB` | `password123` | Quản lý Store Cầu Giấy |
| Manager C | `managerC` | `password123` | Quản lý Store Đống Đa |
| Staff | `staff_a01` | `password123` | Nhân viên Store A |
| Staff | `staff_b01` | `password123` | Nhân viên Store B |
| Staff | `staff_c01` | `password123` | Nhân viên Store C |

## 📚 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Đăng xuất |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Danh sách nhân viên |
| POST | `/users` | Tạo nhân viên mới |
| PUT | `/users/{id}` | Cập nhật nhân viên |
| DELETE | `/users/{id}` | Xóa nhân viên |

### Shifts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stores/{id}/shifts` | Danh sách ca theo cơ sở |
| POST | `/stores/{id}/shifts` | Tạo ca mới |
| POST | `/shifts/{id}/assign` | Phân công nhân viên |
| PUT | `/shifts/{id}/assignment` | Xác nhận/từ chối ca |
| GET | `/my-shifts` | Ca làm của tôi |

### Marketplace (Chợ Ca)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/marketplace/store/{id}` | Ca đang nhường |
| POST | `/marketplace/give` | Đăng nhường ca |
| POST | `/marketplace/claim/{id}` | Yêu cầu nhận ca |
| POST | `/marketplace/review/{id}` | Manager duyệt |
| POST | `/marketplace/swap` | Yêu cầu đổi ca |

### Tasks (Nhiệm Vụ)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/store/{id}` | Nhiệm vụ theo cơ sở |
| GET | `/tasks/my-tasks` | Nhiệm vụ của tôi |
| POST | `/tasks` | Tạo nhiệm vụ |
| POST | `/tasks/{id}/complete` | Hoàn thành nhiệm vụ |

## 📁 Cấu Trúc Dự Án

```
Parttime-staff-management/
├── backend/
│   ├── src/main/java/com/coffee/management/
│   │   ├── config/           # Cấu hình Spring
│   │   ├── controller/       # REST Controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entity/           # JPA Entities
│   │   ├── exception/        # Custom Exceptions
│   │   ├── repository/       # JPA Repositories
│   │   ├── security/         # JWT & Security
│   │   └── service/          # Business Logic
│   ├── src/main/resources/
│   │   ├── db/migration/     # Flyway migrations
│   │   └── application.yml   # Configuration
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API Services
│   │   ├── app/              # Redux Store
│   │   ├── components/       # Reusable Components
│   │   ├── features/         # Redux Slices
│   │   ├── pages/            # Page Components
│   │   ├── routes/           # Route Guards
│   │   └── utils/            # Utilities
│   ├── public/
│   └── package.json
│
├── database/                 # Database scripts
└── README.md
```

## 🔒 Bảo Mật

- ✅ JWT Authentication với Refresh Token
- ✅ BCrypt Password Encryption
- ✅ Role-based Access Control (RBAC)
- ✅ CORS Configuration
- ✅ Rate Limiting (đề xuất)

## 📝 Quy Tắc Nghiệp Vụ

1. **Ca làm việc**: 3 ca/ngày, mỗi ca tối đa 3 nhân viên
2. **Chợ Ca**: Phải đăng trước ít nhất 2 giờ
3. **Không được đổi ca**: Khi ca đã bắt đầu hoặc đã chốt lương
4. **Manager duyệt**: Mọi giao dịch Chợ Ca cần Manager phê duyệt
5. **Audit Log**: Lưu lại mọi hành động quan trọng

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được phát hành dưới giấy phép MIT.

---

**Coffee House Management System** - Xây dựng bởi ❤️ cho cộng đồng
