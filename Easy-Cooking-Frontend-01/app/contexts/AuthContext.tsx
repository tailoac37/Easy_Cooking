'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 LOGIN
  const login = async (userName: string, passwordHash: string) => {
    try {
      console.log('🚀 Gửi request login:', userName);
      const res = await fetch('/api/proxy/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, passwordHash }),
      });

      console.log('📦 Status:', res.status);
      if (!res.ok) return false;

      const data = await res.json();
      console.log('✅ Server trả về:', data);

      if (data?.token) {
        const normalizedUser = {
          ...data,
          userName: data.userName || data.username || '',
          fullName: data.fullName || data.fullname || '',
        };

        // 🔥 LƯU TOKEN + USER
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        setToken(data.token);
        setUser(normalizedUser);

        return true;
      }
      return false;
    } catch (err) {
      console.error('❌ Lỗi login:', err);
      return false;
    }
  };

  // 🔹 LOGOUT
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 🔹 CHECK TOKEN (tự đăng nhập lại khi reload)
  const checkToken = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      console.log('🔑 Kiểm tra token...');
      const res = await fetch('/api/proxy/user/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      });

      console.log('📦 /me status:', res.status);
      const data = await res.json();
      console.log('📨 /me data:', data);

      if (res.ok && data) {
        const normalizedUser = {
          ...storedUser,
          ...data,
          userName: data.userName || data.username || storedUser.userName || '',
          fullName: data.fullName || data.fullname || storedUser.fullName || '',
        };

        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } else {
        logout();
      }
    } catch (err) {
      console.error('❌ Lỗi xác thực token:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
