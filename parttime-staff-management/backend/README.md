# Coffee House - Backend API

Spring Boot REST API cho hệ thống quản lý nhân viên bán thời gian.

## Công nghệ

- Java 17
- Spring Boot 3.2
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.x
- Flyway Migration
- Maven

## Cài đặt

### 1. Yêu cầu
- Java 17+
- Maven 3.8+
- MySQL 8.x

### 2. Cấu hình Database

```sql
CREATE DATABASE coffee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình Environment

Sửa file `src/main/resources/application.yml` hoặc dùng biến môi trường:

```bash
export DB_USERNAME=root
export DB_PASSWORD=root
export JWT_SECRET=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong123456
```

### 4. Build & Run

```bash
# Build
mvn clean package

# Run
java -jar target/management-1.0.0.jar

# Hoặc dev mode
mvn spring-boot:run
```

Server chạy tại: http://localhost:8080

## API Documentation

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

## Database Migration

Flyway tự động chạy migrations khi khởi động. Files migration nằm trong:
`src/main/resources/db/migration/`

- V1__init_schema.sql - Tạo bảng
- V2__seed_data.sql - Dữ liệu mẫu

## Cấu trúc project

```
src/main/java/com/coffee/management/
├── config/           # Cấu hình Spring (Security, CORS, OpenAPI)
├── controller/       # REST Controllers
├── dto/              # Request/Response DTOs
├── entity/           # JPA Entities
├── exception/        # Exception handlers
├── repository/       # JPA Repositories
├── security/         # JWT & Auth
└── service/          # Business logic
```

## Test API với cURL

```bash
# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"password123"}'

# Get users (with token)
curl http://localhost:8080/api/v1/users \
  -H "Authorization: Bearer <token>"
```








