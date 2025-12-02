# Database Setup - Hướng dẫn cho VS Code

## Cấu trúc thư mục

```
database/
├── schema.sql      # Cấu trúc bảng
├── data.sql        # Dữ liệu mẫu (34 tài khoản)
├── full_setup.sql  # File tổng hợp (schema + data)
├── setup.sql       # Chỉ tạo database
└── README.md       # File này
```

---

## 🔧 CÁCH 1: Chạy trong VS Code (Khuyến nghị)

### Bước 1: Cài Extension MySQL cho VS Code

Mở VS Code → Extensions (Ctrl+Shift+X) → Tìm và cài 1 trong các extension sau:

- **MySQL** (by cweijan) - ⭐ Khuyến nghị
- **Database Client** (by Weijan Chen)
- **SQLTools** + **SQLTools MySQL/MariaDB**

### Bước 2: Kết nối MySQL Server

1. Mở Extension MySQL (icon database bên trái)
2. Click **"+"** để thêm connection mới
3. Điền thông tin:
   - **Host:** localhost
   - **Port:** 3306
   - **Username:** root
   - **Password:** (mật khẩu MySQL của bạn, mặc định XAMPP/Laragon là rỗng)

### Bước 3: Chạy SQL trong VS Code

**Cách A: Chạy file `full_setup.sql` (Đơn giản nhất)**

1. Mở file `database/full_setup.sql`
2. Click chuột phải → **"Run SQL"** hoặc **"Execute Query"**
3. Chọn connection MySQL đã tạo

**Cách B: Chạy từng file**

1. Mở file `schema.sql` → Run SQL
2. Mở file `data.sql` → Run SQL

---

## 🔧 CÁCH 2: Dùng XAMPP / Laragon / WAMP

### Nếu dùng XAMPP:

1. Mở XAMPP Control Panel
2. Start **Apache** và **MySQL**
3. Mở trình duyệt: http://localhost/phpmyadmin
4. Click **"Import"** → Chọn file `full_setup.sql` → **"Go"**

### Nếu dùng Laragon:

1. Start Laragon
2. Click **"Database"** → Mở HeidiSQL
3. Kết nối với root (password rỗng)
4. File → Run SQL file → Chọn `full_setup.sql`

---

## 🔧 CÁCH 3: MySQL Command Line

```bash
# Tạo database và import tất cả
mysql -u root -p < full_setup.sql

# Hoặc từng bước
mysql -u root -p -e "CREATE DATABASE coffee_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p coffee_management < schema.sql
mysql -u root -p coffee_management < data.sql
```

---

## ⚙️ Cấu hình Backend

Sau khi tạo database, sửa file `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/coffee_management?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
    username: root
    password: "" # Để rỗng nếu dùng XAMPP/Laragon

  flyway:
    enabled: false # TẮT vì đã tạo bảng thủ công
```

**Lưu ý:** Nếu MySQL của bạn có password, hãy điền vào `password: "your_password"`

---

## 📊 Dữ liệu mẫu

Sau khi chạy SQL, database sẽ có:

| Loại           | Số lượng | Chi tiết                     |
| -------------- | -------- | ---------------------------- |
| **Cơ sở**      | 3        | Hoàn Kiếm, Cầu Giấy, Đống Đa |
| **Owner**      | 1        | Chủ sở hữu                   |
| **Manager**    | 3        | Mỗi cơ sở 1 quản lý          |
| **Staff**      | 30       | 10 nhân viên/cơ sở           |
| **Tổng users** | **34**   |                              |

### Tài khoản đăng nhập (Password: `password123`)

| Vai trò | Username                  | Cơ sở     |
| ------- | ------------------------- | --------- |
| Owner   | `owner`                   | Tất cả    |
| Manager | `managerA`                | Hoàn Kiếm |
| Manager | `managerB`                | Cầu Giấy  |
| Manager | `managerC`                | Đống Đa   |
| Staff   | `staff_a01` → `staff_a10` | Hoàn Kiếm |
| Staff   | `staff_b01` → `staff_b10` | Cầu Giấy  |
| Staff   | `staff_c01` → `staff_c10` | Đống Đa   |

---

## 🚀 Sau khi tạo Database

```bash
# Chạy Backend
cd backend
mvn spring-boot:run

# Chạy Frontend (terminal khác)
cd frontend
npm install
npm start
```

Truy cập: http://localhost:3000
