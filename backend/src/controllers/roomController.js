// backend/src/controllers/roomController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.createRoom = async (req, res) => {
  try {
    const { room_id, name, password } = req.body;

    // Kiểm tra xem Room ID đã tồn tại chưa
    const [existing] = await db.query("SELECT * FROM rooms WHERE room_id = ?", [
      room_id,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Mã phòng này đã tồn tại!" });
    }

    // Mã hóa mật khẩu phòng
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query =
      "INSERT INTO rooms (room_id, name, password) VALUES (?, ?, ?)";
    await db.query(query, [room_id, name, hashedPassword]);

    res.status(201).json({ message: "Tạo phòng thành công!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi tạo phòng." });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { room_id, password } = req.body;

    const [rooms] = await db.query("SELECT * FROM rooms WHERE room_id = ?", [
      room_id,
    ]);
    if (rooms.length === 0) {
      return res.status(444).json({ message: "Phòng không tồn tại." });
    }

    const room = rooms[0];
    // Xác thực mật khẩu vào phòng
    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu phòng." });
    }

    res.json({
      message: "Xác thực phòng thành công",
      room_id: room.room_id,
      room_name: room.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi vào phòng." });
  }
};
