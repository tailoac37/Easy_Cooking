import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';

const API_URL = 'http://192.168.57.154:8081/api';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async () => {
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/sendOTP?email=${encodeURIComponent(email)}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                setStep('otp');
            } else {
                setError(data.message || 'Không thể gửi OTP');
            }
        } catch (e) {
            setError('Không thể kết nối server');
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setError('Mã OTP phải có 6 số');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/verifyOTP?email=${encodeURIComponent(email)}&otp=${otp}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                setStep('password');
            } else {
                setError(data.message || 'Mã OTP không đúng');
            }
        } catch (e) {
            setError('Không thể kết nối server');
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/changePassword?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                setStep('success');
            } else {
                setError(data.message || 'Không thể đổi mật khẩu');
            }
        } catch (e) {
            setError('Không thể kết nối server');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        <Text style={styles.logo}>🍳</Text>
                        <Text style={styles.title}>Bếp Việt</Text>
                        <Text style={styles.subtitle}>
                            {step === 'email' && 'Khôi phục mật khẩu'}
                            {step === 'otp' && 'Nhập mã OTP'}
                            {step === 'password' && 'Đặt mật khẩu mới'}
                            {step === 'success' && 'Thành công!'}
                        </Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {step === 'email' && (
                            <>
                                <Text style={styles.label}>EMAIL</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập email đã đăng ký"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleSendOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Gửi mã OTP</Text>}
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 'otp' && (
                            <>
                                <Text style={styles.description}>Mã OTP đã được gửi đến {email}</Text>
                                <Text style={styles.label}>MÃ OTP (6 SỐ)</Text>
                                <TextInput
                                    style={[styles.input, styles.otpInput]}
                                    placeholder="000000"
                                    value={otp}
                                    onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleVerifyOtp}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Xác thực</Text>}
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 'password' && (
                            <>
                                <Text style={styles.label}>MẬT KHẨU MỚI</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ít nhất 6 ký tự"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                />
                                <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Đổi mật khẩu</Text>}
                                </TouchableOpacity>
                            </>
                        )}

                        {step === 'success' && (
                            <>
                                <Text style={styles.successIcon}>✓</Text>
                                <Text style={styles.successText}>Đổi mật khẩu thành công!</Text>
                                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.buttonText}>Đăng nhập ngay</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {step !== 'success' && (
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.backText}>← Quay lại đăng nhập</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#003459' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    formContainer: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' },
    logo: { fontSize: 50, marginBottom: 8 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#003459', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#667479', marginBottom: 24 },
    description: { fontSize: 14, color: '#667479', marginBottom: 16, textAlign: 'center' },
    errorBox: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' },
    errorText: { color: '#C62828', fontSize: 14 },
    label: { fontSize: 12, color: '#667479', alignSelf: 'flex-start', marginBottom: 8, fontWeight: '500' },
    input: { width: '100%', backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 16 },
    otpInput: { textAlign: 'center', fontSize: 24, letterSpacing: 8 },
    button: { width: '100%', backgroundColor: '#003459', borderRadius: 8, padding: 16, alignItems: 'center' },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    backButton: { marginTop: 24 },
    backText: { color: '#667479', fontSize: 14 },
    successIcon: { fontSize: 60, color: '#00A86B', marginBottom: 16 },
    successText: { fontSize: 18, fontWeight: '600', color: '#00171F', marginBottom: 24 },
});
