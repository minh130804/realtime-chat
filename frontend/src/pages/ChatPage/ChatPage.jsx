// frontend/src/pages/ChatPage/ChatPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatBox from '../../components/ChatBox/ChatBox';
import { socket } from '../../services/socket'; // Import thêm socket
import './ChatPage.css';

const ChatPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const roomName = sessionStorage.getItem("current_room_name") || "Phòng Chat";
    const username = localStorage.getItem("username");
    
    // State lưu danh sách người online
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Lắng nghe tín hiệu danh sách user từ Backend
        socket.on("roomUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("roomUsers");
        };
    }, []);

    const handleLeave = () => {
        if (window.confirm("Bạn có chắc muốn rời phòng?")) {
            sessionStorage.removeItem("current_room_id");
            sessionStorage.removeItem("current_room_name");
            navigate('/rooms');
        }
    };

    return (
        <div className="chat-page-layout">
            <aside className="chat-sidebar">
                <div className="sidebar-header">
                    <div className="app-logo">💬 RealChat</div>
                </div>
                
                <div className="sidebar-content">
                    <div className="info-item">
                        <label>Đang ở phòng:</label>
                        <p>{roomName}</p>
                    </div>
                    <div className="info-item">
                        <label>Mã phòng:</label>
                        <code>{roomId}</code>
                    </div>
                    
                    {/* --- ĐOẠN SỬA MỚI: Hiển thị danh sách online --- */}
                    <div className="info-item">
                        <label>Thành viên online ({onlineUsers.length}):</label>
                        <ul className="user-list">
                            {onlineUsers.map((user, index) => (
                                <li key={index} className={user === username ? "is-me" : ""}>
                                    <span className="status-dot"></span>
                                    {user} {user === username && "(Bạn)"}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button onClick={handleLeave} className="leave-btn">
                        Rời Phòng 🚪
                    </button>
                </div>
            </aside>

            <main className="chat-main-area">
                <ChatBox />
            </main>
        </div>
    );
};

export default ChatPage;