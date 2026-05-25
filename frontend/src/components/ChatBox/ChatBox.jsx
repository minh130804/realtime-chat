// frontend/src/components/ChatBox/ChatBox.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../../services/socket";
import "./ChatBox.css";

// DANH SÁCH CÁC THEME TUYỆT ĐẸP
const CHAT_THEMES = [
    { id: 'default', name: 'Mặc định', bg: '#f4f6f9' },
    { id: 'messenger', name: 'Messenger', bg: 'linear-gradient(180deg, #FFFFFF 0%, #E8F0FE 100%)' },
    { id: 'sunset', name: 'Hoàng hôn', bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { id: 'ocean', name: 'Đại dương', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { id: 'midnight', name: 'Màn đêm', bg: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
    { id: 'forest', name: 'Rừng nhiệt đới', bg: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)' }
];

const ChatBox = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    
    const [firstUnreadId, setFirstUnreadId] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const messagesRef = useRef([]); 

    // --- STATE CHO THEME ---
    // Khôi phục theme đã lưu cho phòng này, nếu chưa có thì lấy 'default'
    const savedThemeId = localStorage.getItem(`theme_${roomId}`) || 'default';
    const [activeTheme, setActiveTheme] = useState(CHAT_THEMES.find(t => t.id === savedThemeId) || CHAT_THEMES[0]);
    const [showThemePicker, setShowThemePicker] = useState(false);
    
    const username = localStorage.getItem("username") || "Ẩn danh";
    const roomName = sessionStorage.getItem("current_room_name") || roomId;
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => { messagesRef.current = messages; }, [messages]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/messages/${roomId}`);
                if (!response.ok) throw new Error(`API lỗi: ${response.status}`);
                
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    const parsedData = data.map(msg => {
                        let safeReactions = {};
                        if (msg.reactions && msg.reactions !== "NULL") {
                            try { safeReactions = typeof msg.reactions === 'string' ? JSON.parse(msg.reactions) : msg.reactions; } 
                            catch (e) {}
                        }
                        return { ...msg, reactions: safeReactions };
                    });
                    
                    setMessages(parsedData);

                    const lastReadId = localStorage.getItem(`last_read_${roomId}`);
                    let foundUnreadId = null;

                    if (lastReadId && parsedData.length > 0) {
                        const firstUnread = parsedData.find(msg => msg.id > parseInt(lastReadId) && msg.sender !== username);
                        if (firstUnread) {
                            foundUnreadId = firstUnread.id;
                            setFirstUnreadId(foundUnreadId);
                        }
                    }

                    setTimeout(() => {
                        if (foundUnreadId) {
                            const unreadElement = document.getElementById(`unread-marker-${foundUnreadId}`);
                            if (unreadElement) unreadElement.scrollIntoView({ behavior: "smooth", block: "center" });
                        } else {
                            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
                        }
                        setIsInitialLoad(false); 
                    }, 300);
                } else {
                    setMessages([]);
                    setIsInitialLoad(false);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
                setIsInitialLoad(false);
            }
        };

        fetchChatHistory();
        
        socket.connect();
        socket.emit("joinRoom", { room_id: roomId, username: username });

        socket.on("receiveMessage", (message) => setMessages((prev) => [...prev, message]));
        socket.on("reactionUpdated", ({ message_id, reactions }) => {
            setMessages((prev) => prev.map(msg => msg.id === message_id ? { ...msg, reactions } : msg));
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("reactionUpdated");
            socket.disconnect();
            
            const currentMessages = messagesRef.current;
            if (currentMessages.length > 0) {
                localStorage.setItem(`last_read_${roomId}`, currentMessages[currentMessages.length - 1].id);
            }
        };
    }, [roomId, username]);

    useEffect(() => {
        if (!isInitialLoad) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            if (messages.length > 0) {
                localStorage.setItem(`last_read_${roomId}`, messages[messages.length - 1].id);
            }
        }
    }, [messages.length, isInitialLoad, roomId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (currentMsg.trim() !== "") {
            socket.emit("sendMessage", {
                room_id: roomId, text: currentMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: username, file_url: null, file_type: null
            });
            setCurrentMsg("");
        }
    };

    const handleReact = (messageId, emoji) => {
        if (!messageId) return;
        socket.emit("addReaction", { room_id: roomId, message_id: messageId, emoji });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:5001/api/upload", { method: "POST", body: formData });
            const data = await response.json();
            if (response.ok) {
                socket.emit("sendMessage", {
                    room_id: roomId, text: "", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: username, file_url: data.url, file_type: data.type
                });
            }
        } catch (error) { console.error("Lỗi upload file:", error); }
        e.target.value = null;
    };

    // --- HÀM THAY ĐỔI THEME ---
    const changeTheme = (theme) => {
        setActiveTheme(theme);
        localStorage.setItem(`theme_${roomId}`, theme.id);
        setShowThemePicker(false);
    };

    return (
        <div className="chat-container">
            {/* Header được nâng cấp */}
            <div className="chat-header glass-header">
                <button className="back-btn" onClick={() => navigate('/rooms')}>⬅ Rời Phòng</button>
                <div className="header-info">
                    <h2>{roomName}</h2>
                    <span>ID: {roomId}</span>
                </div>
                
                {/* --- NÚT BẤM VÀ MENU CHỌN THEME --- */}
                <div className="theme-selector">
                    <button className="theme-btn" onClick={() => setShowThemePicker(!showThemePicker)} title="Đổi chủ đề">
                        🎨
                    </button>
                    {showThemePicker && (
                        <div className="theme-dropdown">
                            <h4>Chọn chủ đề</h4>
                            <div className="theme-list">
                                {CHAT_THEMES.map(t => (
                                    <div 
                                        key={t.id} 
                                        className={`theme-item ${activeTheme.id === t.id ? 'active' : ''}`}
                                        style={{ background: t.bg }}
                                        onClick={() => changeTheme(t)}
                                        title={t.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Áp dụng Theme vào Background của khu vực tin nhắn */}
            <div className="chat-messages" style={{ background: activeTheme.bg }}>
                {Array.isArray(messages) && messages.map((msg, index) => {
                    const isMe = msg.sender === username;
                    return (
                        <div key={msg.id || index}>
                            {firstUnreadId === msg.id && (
                                <div className="unread-divider" id={`unread-marker-${msg.id}`}>
                                    <span>Tin nhắn mới</span>
                                </div>
                            )}

                            <div className={`message-row ${isMe ? "row-me" : "row-other"}`}>
                                {!isMe && <div className="msg-author-name">{msg.sender}</div>}
                                
                                <div className="message-content-wrapper">
                                    {/* Thêm class 'theme-bubble' để trong suốt nhẹ khi có hình nền */}
                                    <div className={`message-bubble theme-bubble ${isMe ? "my-message" : "other-message"}`}>
                                        {msg.text && <p className="msg-text">{msg.text}</p>}
                                        {msg.file_url && (
                                            <div className="msg-attachment">
                                                {msg.file_type && msg.file_type.includes("image") ? (
                                                    <img src={msg.file_url} alt="attachment" className="attached-image" onClick={() => setSelectedImage(msg.file_url)} />
                                                ) : (
                                                    <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="attached-file">📄 Tải tệp</a>
                                                )}
                                            </div>
                                        )}
                                        <span className="message-time">{msg.time}</span>
                                    </div>

                                    <div className="reaction-picker">
                                        <span onClick={() => handleReact(msg.id, '👍')}>👍</span>
                                        <span onClick={() => handleReact(msg.id, '❤️')}>❤️</span>
                                        <span onClick={() => handleReact(msg.id, '😂')}>😂</span>
                                        <span onClick={() => handleReact(msg.id, '🔥')}>🔥</span>
                                    </div>
                                </div>

                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                    <div className="reaction-display">
                                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                                            <span key={emoji} className="reaction-badge">{emoji} <span className="react-count">{count}</span></span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
                <button type="button" className="attach-btn" onClick={() => fileInputRef.current.click()} title="Đính kèm file">📎</button>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                <div className="input-wrapper">
                    <input type="text" value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} placeholder="Soạn tin nhắn gửi đến phòng..." />
                </div>
                <button type="submit" className="send-btn">Gửi 🚀</button>
            </form>

            {selectedImage && (
                <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
                    <span className="close-modal-btn">&times;</span>
                    <img src={selectedImage} alt="Zoomed" className="image-modal-content" />
                </div>
            )}
        </div>
    );
};

export default ChatBox;