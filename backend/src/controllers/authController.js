// backend/src/controllers/authController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Kéo SECRET_KEY từ file .env ra.
// Nếu không tìm thấy trong .env, nó sẽ dùng chuỗi dự phòng phía sau làm mặc định.
const SECRET_KEY = process.env.SECRET_KEY;

exports.register = async (req, res) => {
  try {
    const { name, gmail, password } = req.body;
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO users (name, gmail, password) VALUES (?, ?, ?)";
    await db.query(query, [name, gmail, hashedPassword]);

    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng ký hoặc Gmail đã tồn tại." });
  }
};

exports.login = async (req, res) => {
  try {
    const { gmail, password } = req.body;
    const [users] = await db.query("SELECT * FROM users WHERE gmail = ?", [
      gmail,
    ]);

    if (users.length === 0)
      return res.status(404).json({ message: "Không tìm thấy tài khoản." });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu." });

    // Tạo token đăng nhập sử dụng SECRET_KEY từ biến môi trường
    const token = jwt.sign({ id: user.id, name: user.name }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Đăng nhập thành công", token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};
