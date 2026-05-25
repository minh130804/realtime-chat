// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage/AuthPage';
import RoomPage from './pages/RoomPage/RoomPage';
import ChatPage from './pages/ChatPage/ChatPage'; // Thêm dòng này

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/rooms" element={<RoomPage />} />
        <Route path="/chat/:roomId" element={<ChatPage />} /> {/* Đổi ChatBox thành ChatPage */}
      </Routes>
    </Router>
  );
}

export default App;