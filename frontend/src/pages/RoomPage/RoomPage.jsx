// frontend/src/pages/RoomPage/RoomPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoomPage.css';

const RoomPage = () => {
    const [createData, setCreateData] = useState({ id: '', name: '', password: '' });
    const [joinData, setJoinData] = useState({ id: '', password: '' });
    const navigate = useNavigate();

   // frontend/src/pages/RoomPage/RoomPage.jsx

const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:5001/api/rooms/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                room_id: createData.id,
                name: createData.name,
                password: createData.password
            })
        });
        const data = await response.json();
        
        if (response.ok) {
            // --- ĐOẠN SỬA MỚI: Tự động vào phòng ---
            sessionStorage.setItem("current_room_id", createData.id);
            sessionStorage.setItem("current_room_name", createData.name);
            navigate(`/chat/${createData.id}`);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
    }
};

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5001/api/rooms/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    room_id: joinData.id,
                    password: joinData.password
                })
            });
            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem("current_room_id", data.room_id);
                sessionStorage.setItem("current_room_name", data.room_name);
                navigate(`/chat/${data.room_id}`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Hàm xử lý đăng xuất
    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?")) {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/auth');
        }
    };

    return (
        <div className="room-master-container">
            <div className="room-welcome" style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        position: 'absolute', right: 0, top: 0, 
                        padding: '10px 20px', borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', 
                        color: 'white', border: 'none', cursor: 'pointer',
                        fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255, 75, 43, 0.4)'
                    }}
                >
                    Đăng Xuất 🚪
                </button>
                <h1>Xin chào, {localStorage.getItem("username") || "Thành viên"} 👋</h1>
                <p>Hãy chọn tạo một không gian riêng hoặc tham gia phòng có sẵn</p>
            </div>
            
            <div className="room-grid">
                <div className="room-card glassmorphism">
                    <h2>Tạo Phòng Chat Mới</h2>
                    <form onSubmit={handleCreateRoom}>
                        <input type="text" placeholder="Mã phòng tự chọn (Ví dụ: phong-123)" required
                            onChange={e => setCreateData({...createData, id: e.target.value})} />
                        <input type="text" placeholder="Tên hiển thị của phòng" required
                            onChange={e => setCreateData({...createData, name: e.target.value})} />
                        <input type="password" placeholder="Mật khẩu bảo mật phòng" required
                            onChange={e => setCreateData({...createData, password: e.target.value})} />
                        <button type="submit" className="btn-effect green-gradient">Khởi Tạo Không Gian ✨</button>
                    </form>
                </div>

                <div className="room-card glassmorphism">
                    <h2>Tham Gia Phòng Khác</h2>
                    <form onSubmit={handleJoinRoom}>
                        <input type="text" placeholder="Nhập mã phòng (ID phòng)" required
                            onChange={e => setJoinData({...joinData, id: e.target.value})} />
                        <input type="password" placeholder="Nhập mật khẩu phòng" required
                            onChange={e => setJoinData({...joinData, password: e.target.value})} />
                        <button type="submit" className="btn-effect purple-gradient">Kết Nối Ngay 🚀</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RoomPage;