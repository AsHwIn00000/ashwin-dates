import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.status !== 'PENDING_VERIFICATION') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const sendOtp = async (email, purpose) => {
    const { data } = await api.post('/auth/send-otp', { email, purpose });
    return data;
  };

  const checkEmail = async (email) => {
    const { data } = await api.post('/auth/check-email', { email });
    return data;
  };

  const verifyRegisterOtp = async (email, otp, password, name) => {
    const { data } = await api.post('/auth/verify-register-otp', { email, otp, password, name });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (idToken) => {
    const { data } = await api.post('/auth/google-login', { idToken });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const resetPasswordWithOtp = async (email, otp, password) => {
    const { data } = await api.post('/auth/reset-password-otp', { email, otp, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, sendOtp, checkEmail, verifyRegisterOtp, googleLogin, resetPasswordWithOtp, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
