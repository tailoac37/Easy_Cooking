'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate trống
    if (!username.trim() || !password.trim()) {
      return setError('Vui lòng nhập đầy đủ thông tin')
    }

    setLoading(true)
    const ok = await login(username, password)
    setLoading(false)

    if (!ok) return setError('Sai tài khoản hoặc mật khẩu')

    // Đọc lại user từ localStorage
    const saved = localStorage.getItem('user')
    if (!saved) return router.push('/')

    const user = JSON.parse(saved)
    console.log("🧭 Role của user:", user.role)

    // Điều hướng theo role
    if (user.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#003459] to-[#00171F]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-[380px]"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🍳</div>
          <h1 className="text-2xl font-bold text-[#003459]">Easy Cooking</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập vào tài khoản</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">TÊN ĐĂNG NHẬP</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition"
          />
        </div>

        <div className="mb-2">
          <label className="block text-xs text-gray-500 mb-1">MẬT KHẨU</label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition"
          />
        </div>

        {/* Quên mật khẩu link */}
        <div className="text-right mb-4">
          <Link
            href="/forgot-password"
            className="text-sm text-[#003459] hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#003459] text-white py-3 rounded-lg hover:bg-[#00171F] transition disabled:opacity-50 font-medium"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {/* Link đăng ký */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="text-[#003459] font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>
      </form>
    </div>
  )
}

