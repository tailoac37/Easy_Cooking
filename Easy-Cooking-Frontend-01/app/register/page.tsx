'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [userName, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [passwordHash, setPassword] = useState('');
  const [error, setError] = useState('');   // ⭐ THÊM STATE LỖI

  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // ⭐ VALIDATE TRỐNG
    if (!fullName.trim() || !userName.trim() || !email.trim() || !passwordHash.trim()) {
      return setError('Vui lòng nhập đầy đủ thông tin!');
    }

    // ⭐ VALIDATE EMAIL GMAIL
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return setError('Email phải đúng định dạng @gmail.com');
    }

    setError(''); // clear lỗi cũ

    try {
      const res = await fetch('/api/proxy/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          userName,
          email,
          passwordHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Đăng ký thất bại!');
      }

      // Auto login
      const success = await login(userName, passwordHash);

      if (success) {
        alert('🎉 Đăng ký thành công!');
        router.push('/');
      } else {
        setError('Đăng ký thành công nhưng đăng nhập tự động thất bại!');
      }
    } catch (err) {
      console.error('❌ Lỗi đăng ký:', err);
      setError('Không thể kết nối tới server!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <form
        onSubmit={handleRegister}
        className="bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-2 text-center text-orange-600">
          Đăng ký tài khoản
        </h1>

        {/* ⭐ HIỂN THỊ LỖI */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Họ và tên */}
        <input
          type="text"
          placeholder="Họ và tên"
          className="w-full p-3 mb-4 border rounded-lg dark:bg-zinc-700 dark:text-white"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        {/* Tên đăng nhập */}
        <input
          type="text"
          placeholder="Tên đăng nhập"
          className="w-full p-3 mb-4 border rounded-lg dark:bg-zinc-700 dark:text-white"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg dark:bg-zinc-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Mật khẩu */}
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 mb-6 border rounded-lg dark:bg-zinc-700 dark:text-white"
          value={passwordHash}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg"
        >
          Đăng ký
        </button>

        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-orange-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
