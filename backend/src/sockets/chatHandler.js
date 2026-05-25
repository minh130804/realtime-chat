// backend/src/sockets/chatHandler.js
const db = require("../config/db");

const roomUsers = {};

module.exports = (io, socket) => {
  socket.on("joinRoom", ({ room_id, username }) => {
    socket.join(room_id);
    socket.username = username;
    socket.roomId = room_id;

    if (!roomUsers[room_id]) {
      roomUsers[room_id] = [];
    }
    if (!roomUsers[room_id].includes(username)) {
      roomUsers[room_id].push(username);
    }

    io.to(room_id).emit("roomUsers", roomUsers[room_id]);
    console.log(`User [${username}] joined room: ${room_id}`);
  });

  // Xử lý gửi tin nhắn kèm Log kiểm tra lỗi SQL
  // Trong file backend/src/sockets/chatHandler.js, tìm đến sự kiện "sendMessage" và sửa lại như sau:

  socket.on("sendMessage", async (messageData) => {
    try {
      // Nhận thêm file_url và file_type (mặc định là null nếu chỉ gửi text)
      const {
        room_id,
        sender,
        text,
        time,
        file_url = null,
        file_type = null,
      } = messageData;

      // Cập nhật câu lệnh SQL
      const query =
        "INSERT INTO messages (room_id, sender, text, time, file_url, file_type) VALUES (?, ?, ?, ?, ?, ?)";
      const [result] = await db.query(query, [
        room_id,
        sender,
        text,
        time,
        file_url,
        file_type,
      ]);

      const finalMessage = {
        ...messageData,
        id: result.insertId,
        reactions: {},
      };

      io.to(room_id).emit("receiveMessage", finalMessage);
    } catch (error) {
      console.error("❌ LỖI KHI GHI TIN NHẮN VÀO MYSQL:", error.message);
    }
  });

  socket.on("addReaction", async ({ room_id, message_id, emoji }) => {
    if (!message_id) return;
    try {
      const [rows] = await db.query(
        "SELECT reactions FROM messages WHERE id = ?",
        [message_id],
      );
      if (rows.length > 0) {
        let currentReactions = {};
        if (rows[0].reactions) {
          try {
            currentReactions = JSON.parse(rows[0].reactions);
          } catch (e) {
            currentReactions = {};
          }
        }
        currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
        await db.query("UPDATE messages SET reactions = ? WHERE id = ?", [
          JSON.stringify(currentReactions),
          message_id,
        ]);
        io.to(room_id).emit("reactionUpdated", {
          message_id,
          reactions: currentReactions,
        });
      }
    } catch (error) {
      console.error("❌ LỖI THẢ ICON MYSQL:", error.message);
    }
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket;
    if (roomId && roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter((user) => user !== username);
      io.to(roomId).emit("roomUsers", roomUsers[roomId]);
      if (roomUsers[roomId].length === 0) {
        delete roomUsers[roomId];
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
};
