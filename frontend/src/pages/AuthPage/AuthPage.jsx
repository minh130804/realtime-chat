import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', gmail: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        
        try {
            const response = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.name);
                    navigate('/rooms'); // Chuyển sang trang chọn phòng
                } else {
                    alert('Đăng ký thành công! Hãy đăng nhập.');
                    setIsLogin(true);
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card">
                <h2>{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input type="text" placeholder="Tên hiển thị" required
                            onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    )}
                    <input type="email" placeholder="Email (Gmail)" required
                        onChange={(e) => setFormData({...formData, gmail: e.target.value})} />
                    <input type="password" placeholder="Mật khẩu" required
                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    <button type="submit" className="glow-on-hover">
                        {isLogin ? 'Vào Trạm Chat' : 'Đăng Ký'}
                    </button>
                </form>
                <p onClick={() => setIsLogin(!isLogin)} className="toggle-text">
                    {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                </p>
            </div>
        </div>
    );
};

export default AuthPage;