# Coffee House - Frontend

React + TypeScript frontend cho hệ thống quản lý nhân viên bán thời gian.

## Công nghệ

- React 18
- TypeScript
- Redux Toolkit
- React Router DOM v6
- Axios
- Bootstrap 5 (CSS thuần)
- Bootstrap Icons

## Cài đặt

### 1. Yêu cầu
- Node.js 18+
- npm hoặc yarn

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình API URL

Tạo file `.env`:
```
REACT_APP_API_URL=http://localhost:8080/api/v1
```

### 4. Chạy development server

```bash
npm start
```

App chạy tại: http://localhost:3000

### 5. Build production

```bash
npm run build
```

Output trong thư mục `build/`

## Cấu trúc project

```
src/
├── api/              # API services (axios)
├── app/              # Redux store configuration
├── components/       # Reusable UI components
│   ├── Layout.tsx
│   ├── Loading.tsx
│   ├── Toast.tsx
│   └── ConfirmModal.tsx
├── features/         # Redux slices
│   ├── auth/
│   ├── users/
│   ├── stores/
│   ├── shifts/
│   ├── requests/
│   ├── payroll/
│   └── notifications/
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Users.tsx
│   ├── Stores.tsx
│   ├── Shifts.tsx
│   ├── MyShifts.tsx
│   ├── Requests.tsx
│   ├── Payrolls.tsx
│   ├── Reports.tsx
│   └── Profile.tsx
├── routes/           # Route guards
├── utils/            # Helper functions
├── App.tsx
├── index.tsx
└── index.css         # Custom styles
```

## Tài khoản demo

| Vai trò | Username | Password |
|---------|----------|----------|
| Owner | owner | password123 |
| Manager | managerA | password123 |
| Staff | staff1 | password123 |

## Tính năng theo vai trò

### Owner
- Dashboard tổng quan hệ thống
- Quản lý tất cả cơ sở
- Quản lý tất cả nhân viên
- Xem báo cáo toàn hệ thống
- Duyệt bảng lương

### Manager
- Dashboard cơ sở được giao
- Quản lý nhân viên tại cơ sở
- Tạo và phân ca làm việc
- Duyệt yêu cầu nghỉ/đổi ca
- Chấm công thủ công

### Staff
- Xem ca làm được phân công
- Check-in/Check-out
- Gửi yêu cầu nghỉ/đổi ca
- Xem lịch sử công và lương








