# Hướng dẫn sửa lỗi IDE (NetBeans/IntelliJ)

## Vấn đề
IDE hiển thị nhiều lỗi "cannot find symbol" nhưng Maven compile thành công. Đây là do IDE chưa nhận diện Lombok annotations.

## Giải pháp

### Cách 1: Rebuild Project (Khuyến nghị)

**NetBeans:**
1. Right-click vào project → `Clean and Build`
2. Hoặc: `Build` → `Clean and Build Project`
3. Đợi IDE index lại project

**IntelliJ IDEA:**
1. `File` → `Invalidate Caches / Restart`
2. Chọn `Invalidate and Restart`
3. Đợi IDE rebuild project

### Cách 2: Enable Annotation Processing

**NetBeans:**
1. Right-click project → `Properties`
2. `Build` → `Compiling`
3. ✅ Check `Enable Annotation Processing`
4. Click `OK` và rebuild project

**IntelliJ IDEA:**
1. `File` → `Settings` (hoặc `Ctrl+Alt+S`)
2. `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
3. ✅ Check `Enable annotation processing`
4. Click `Apply` và rebuild project

### Cách 3: Cài Lombok Plugin

**NetBeans:**
1. `Tools` → `Plugins`
2. Tìm "Lombok" trong Available Plugins
3. Install và restart IDE

**IntelliJ IDEA:**
1. `File` → `Settings` → `Plugins`
2. Tìm "Lombok"
3. Install và restart IDE

### Cách 4: Verify Maven Build

Chạy lệnh sau để xác nhận code không có lỗi:
```bash
cd backend
mvn clean compile -DskipTests
```

Nếu thấy `BUILD SUCCESS` → Code đúng, chỉ là vấn đề IDE.

## Lưu ý
- Các lỗi hiển thị trong IDE KHÔNG ảnh hưởng đến việc chạy ứng dụng
- Maven compile thành công = Code đúng
- Chỉ cần rebuild project hoặc enable annotation processing

