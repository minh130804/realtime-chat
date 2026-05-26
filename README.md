# 💬 RealChat - Ứng dụng Trò chuyện Thời gian thực

RealChat là một ứng dụng nhắn tin thời gian thực hiện đại, được xây dựng với kiến trúc Full-Stack mang lại trải nghiệm mượt mà, tốc độ cao và giao diện bắt mắt. Ứng dụng hỗ trợ trò chuyện theo phòng, gửi file đính kèm, thả cảm xúc và cá nhân hóa giao diện người dùng.

---

## ✨ Tính năng nổi bật

* **⚡ Trò chuyện Thời gian thực:** Nhắn tin tốc độ cao không độ trễ thông qua kết nối WebSockets (`Socket.io`).
* **🔒 Xác thực Bảo mật:** Đăng ký và Đăng nhập an toàn với mật khẩu mã hóa (`bcrypt`) và JSON Web Token (`JWT`).
* **📁 Gửi Ảnh & Tệp đính kèm:** Dễ dàng chia sẻ khoảnh khắc và tài liệu. Tích hợp tính năng nhấp để phóng to ảnh (Zoom Modal) mượt mà.
* **🎨 Giao diện Kính mờ & Đa Chủ đề (Themes):** Giao diện UI/UX hiện đại theo phong cách Glassmorphism. Cung cấp nhiều bộ màu sắc để cá nhân hóa phòng chat (Lưu trữ bằng `localStorage`).
* **❤️ Thả Cảm xúc (Reactions):** Tương tác với từng tin nhắn bằng các biểu tượng cảm xúc sinh động (👍, ❤️, 😂, 🔥).
* **📌 Theo dõi Tin nhắn Chưa đọc:** Tự động ghi nhớ vị trí tin nhắn cuối cùng và hiển thị vạch ngăn cách đỏ rực rỡ để báo hiệu tin nhắn mới đến.

---

## 🛠️ Công nghệ sử dụng

**Frontend (Client)**
* **Framework:** React.js (Khởi tạo bằng Vite cho tốc độ build siêu tốc)
* **Routing:** React Router DOM
* **Styling:** Thuần CSS 3 với CSS Variables, Flexbox, Grid & Animations
* **Real-time:** Socket.io-client

**Backend (Server)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Real-time:** Socket.io
* **Xử lý File:** Multer
* **Bảo mật:** Bcrypt (Mã hóa), JsonWebToken (Xác thực), CORS

**Database**
* **Hệ quản trị:** MySQL

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án (Local)

### Yêu cầu hệ thống
* Node.js (Phiên bản v16 trở lên)
* MySQL Server (XAMPP, MAMP hoặc Docker)

### 1. Cấu hình Database (MySQL)
1. Mở phpMyAdmin (hoặc bất kỳ MySQL Client nào).
2. Tạo một Database mới có tên: `realtime_chat`.
3. Chạy các lệnh SQL sau để khởi tạo bảng:

```sql
-- Bảng Người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gmail VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Bảng Tin nhắn
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(50) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    text TEXT,
    time VARCHAR(20),
    reactions JSON DEFAULT NULL,
    file_url VARCHAR(255) DEFAULT NULL,
    file_type VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
