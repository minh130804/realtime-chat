// frontend/src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Sẽ chủ động gọi connect() khi component mount
});
