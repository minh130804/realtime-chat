// backend/src/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./config/db");
require("dotenv").config();

// Import các router xử lý nghiệp vụ logic tách biệt
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const chatHandler = require("./sockets/chatHandler");

const app = express();

// Khởi tạo các Middleware hệ thống
app.use(cors());
app.use(express.json()); // Đọc dữ liệu JSON gửi từ body client

// Đảm bảo thư mục 'uploads' luôn tồn tại ở thư mục gốc backend
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Express phục vụ file tĩnh (để truy cập ảnh/file qua URL)
app.use("/uploads", express.static(uploadDir));

// --- CẤU HÌNH MULTER ĐỔI TÊN FILE AN TOÀN TUYỆT ĐỐI ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Trích xuất đuôi định dạng gốc (.png, .jpg, .pdf...)
    const ext = path.extname(file.originalname);
    // Tạo chuỗi mã số ngẫu nhiên duy nhất dựa vào thời gian để đặt tên file sạch
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// --- API UPLOAD FILE (TỰ ĐỘNG NHẬN DIỆN PORT 5001) ---
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không tìm thấy file tải lên." });
  }

  // req.get('host') giúp tự động nhận diện chính xác "localhost:5001"
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, type: req.file.mimetype });
});

// --- KẾT NỐI CÁC ĐƯỜNG DẪN REST API ---
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

// API Endpoint: Lấy lịch sử chat lọc theo từng Room ID riêng biệt
app.get("/api/messages/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const query =
      "SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC";
    const [rows] = await db.query(query, [roomId]);
    res.json(rows);
  } catch (error) {
    console.error("❌ LỖI API LẤY LỊCH SỬ CHAT:", error.message);
    res.status(500).json({ message: "Không thể tải lịch sử chat từ máy chủ." });
  }
});

// --- KHỞI TẠO HỆ THỐNG HTTP SERVER & SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Chấp nhận kết nối từ cổng chạy Vite React
    methods: ["GET", "POST"],
  },
});

// Gắn luồng xử lý Socket.io Handler điều phối phòng và tin nhắn
io.on("connection", (socket) => {
  chatHandler(io, socket);
});

// Thiết lập chạy cứng trên cổng 5001 theo yêu cầu của bạn
const PORT = 5001;
server.listen(PORT, () => {
  console.log(
    `🚀 Backend Server đang vận hành mượt mà tại: http://localhost:${PORT}`,
  );
});
