// backend/src/config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3307,
  user: "root", // Thay đổi nếu bạn có user khác trên phpMyAdmin
  password: "", // Điền password nếu có
  database: "realtime_chat",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
