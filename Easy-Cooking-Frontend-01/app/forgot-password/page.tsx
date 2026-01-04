'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    // Gửi OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            return setError('Vui lòng nhập email')
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return setError('Email không hợp lệ')
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/proxy/auth/send-otp?email=${encodeURIComponent(email)}`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.success) {
                setStep('otp')
                // Start countdown for resend
                setCountdown(60)
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                setError(data.message || 'Không thể gửi OTP')
            }
        } catch (err) {
            setError('Không thể kết nối tới server')
        } finally {
            setLoading(false)
        }
    }

    // Xác thực OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!otp.trim()) {
            return setError('Vui lòng nhập mã OTP')
        }

        if (otp.length !== 6) {
            return setError('Mã OTP phải có 6 số')
        }

        setLoading(true)
        try {
            const res = await fetch(
                `/api/proxy/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
                { method: 'POST' }
            )
            const data = await res.json()

            if (data.success) {
                setStep('password')
            } else {
                setError(data.message || 'Mã OTP không chính xác')
            }
        } catch (err) {
            setError('Không thể kết nối tới server')
        } finally {
            setLoading(false)
        }
    }

    // Đổi mật khẩu
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!newPassword.trim()) {
            return setError('Vui lòng nhập mật khẩu mới')
        }

        if (newPassword.length < 6) {
            return setError('Mật khẩu phải có ít nhất 6 ký tự')
        }

        if (newPassword !== confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp')
        }

        setLoading(true)
        try {
            const res = await fetch(
                `/api/proxy/auth/change-password?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
                { method: 'POST' }
            )
            const data = await res.json()

            if (data.success) {
                setStep('success')
            } else {
                setError(data.message || 'Không thể đổi mật khẩu')
            }
        } catch (err) {
            setError('Không thể kết nối tới server')
        } finally {
            setLoading(false)
        }
    }

    // Gửi lại OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return

        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/proxy/auth/send-otp?email=${encodeURIComponent(email)}`, {
                method: 'POST',
            })
            const data = await res.json()

            if (data.success) {
                setCountdown(60)
                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            } else {
                setError(data.message || 'Không thể gửi lại OTP')
            }
        } catch (err) {
            setError('Không thể kết nối tới server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#003459] to-[#00171F]">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px]">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-3">🍳</div>
                    <h1 className="text-2xl font-bold text-[#003459]">Bếp Việt</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 'email' && 'Khôi phục mật khẩu'}
                        {step === 'otp' && 'Xác thực mã OTP'}
                        {step === 'password' && 'Đặt mật khẩu mới'}
                        {step === 'success' && 'Thành công!'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-2 mb-6">
                    {['email', 'otp', 'password'].map((s, i) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all ${step === s ||
                                (step === 'otp' && i === 0) ||
                                (step === 'password' && i <= 1) ||
                                step === 'success'
                                ? 'bg-[#003459]'
                                : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Step 1: Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendOtp}>
                        <p className="text-gray-600 text-sm mb-4">
                            Nhập địa chỉ email đã đăng ký để nhận mã xác thực.
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-1">EMAIL</label>
                            <input
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003459] text-white py-3 rounded-lg hover:bg-[#00171F] transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <p className="text-gray-600 text-sm mb-4">
                            Mã OTP đã được gửi đến <span className="font-medium text-[#003459]">{email}</span>
                        </p>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-1">MÃ XÁC THỰC (6 SỐ)</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition text-center text-2xl tracking-[0.5em] font-mono"
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003459] text-white py-3 rounded-lg hover:bg-[#00171F] transition disabled:opacity-50 font-medium mb-3"
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || loading}
                                className="text-sm text-[#003459] hover:underline disabled:text-gray-400 disabled:no-underline"
                            >
                                {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: New Password */}
                {step === 'password' && (
                    <form onSubmit={handleChangePassword}>
                        <p className="text-gray-600 text-sm mb-4">
                            Tạo mật khẩu mới cho tài khoản của bạn.
                        </p>
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">MẬT KHẨU MỚI</label>
                            <input
                                type="password"
                                placeholder="Ít nhất 6 ký tự"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-1">XÁC NHẬN MẬT KHẨU</label>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#003459] transition"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#003459] text-white py-3 rounded-lg hover:bg-[#00171F] transition disabled:opacity-50 font-medium"
                        >
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Đổi mật khẩu thành công!
                        </h3>
                        <p className="text-gray-600 text-sm mb-6">
                            Bạn có thể đăng nhập với mật khẩu mới.
                        </p>
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-[#003459] text-white py-3 rounded-lg hover:bg-[#00171F] transition font-medium"
                        >
                            Đăng nhập ngay
                        </button>
                    </div>
                )}

                {/* Back to Login */}
                {step !== 'success' && (
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-gray-500 hover:text-[#003459] transition"
                        >
                            ← Quay lại đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
