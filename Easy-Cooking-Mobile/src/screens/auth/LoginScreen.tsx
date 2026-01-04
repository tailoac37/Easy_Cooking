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

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        const success = await login(username, password);
        setLoading(false);

        if (!success) {
            setError('Sai tài khoản hoặc mật khẩu');
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.formContainer}>
                        <Text style={styles.logo}>🍳</Text>
                        <Text style={styles.title}>Bếp Việt</Text>
                        <Text style={styles.subtitle}>Đăng nhập vào tài khoản</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>MẬT KHẨU</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Đăng nhập</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.registerRow}>
                            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Đăng ký ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003459',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    logo: {
        fontSize: 50,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#003459',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#667479',
        marginBottom: 24,
    },
    errorBox: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        width: '100%',
    },
    errorText: {
        color: '#C62828',
        fontSize: 14,
    },
    label: {
        fontSize: 12,
        color: '#667479',
        alignSelf: 'flex-start',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        width: '100%',
        backgroundColor: '#F4F6F8',
        borderWidth: 1,
        borderColor: '#E8EAED',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    forgotText: {
        color: '#003459',
        fontSize: 14,
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    button: {
        width: '100%',
        backgroundColor: '#003459',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    registerRow: {
        flexDirection: 'row',
        marginTop: 24,
    },
    registerText: {
        color: '#667479',
        fontSize: 14,
    },
    registerLink: {
        color: '#003459',
        fontSize: 14,
        fontWeight: '600',
    },
});
