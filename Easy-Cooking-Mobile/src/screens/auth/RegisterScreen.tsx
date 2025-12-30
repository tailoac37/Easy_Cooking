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
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = 'http://192.168.57.154:8081/api';

export default function RegisterScreen({ navigation }: any) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        userName: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');
        const { userName, fullName, email, password, confirmPassword } = formData;

        if (!userName || !fullName || !email || !password) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, fullName, email, passwordHash: password }),
            });

            if (res.ok) {
                // Đăng nhập luôn sau khi đăng ký thành công
                await login(userName, password);
            } else {
                const data = await res.json();
                setError(data.message || 'Đăng ký thất bại');
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
                        <Text style={styles.title}>Easy Cooking</Text>
                        <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên đăng nhập"
                            value={formData.userName}
                            onChangeText={(t) => setFormData({ ...formData, userName: t })}
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>HỌ VÀ TÊN</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên"
                            value={formData.fullName}
                            onChangeText={(t) => setFormData({ ...formData, fullName: t })}
                        />

                        <Text style={styles.label}>EMAIL</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChangeText={(t) => setFormData({ ...formData, email: t })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>MẬT KHẨU</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ít nhất 6 ký tự"
                            value={formData.password}
                            onChangeText={(t) => setFormData({ ...formData, password: t })}
                            secureTextEntry
                        />

                        <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            value={formData.confirmPassword}
                            onChangeText={(t) => setFormData({ ...formData, confirmPassword: t })}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
                        </TouchableOpacity>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
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
    errorBox: { backgroundColor: '#FFEBEE', borderRadius: 8, padding: 12, marginBottom: 16, width: '100%' },
    errorText: { color: '#C62828', fontSize: 14 },
    label: { fontSize: 12, color: '#667479', alignSelf: 'flex-start', marginBottom: 8, fontWeight: '500' },
    input: { width: '100%', backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 16 },
    button: { width: '100%', backgroundColor: '#003459', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    loginRow: { flexDirection: 'row', marginTop: 24 },
    loginText: { color: '#667479', fontSize: 14 },
    loginLink: { color: '#003459', fontSize: 14, fontWeight: '600' },
});
