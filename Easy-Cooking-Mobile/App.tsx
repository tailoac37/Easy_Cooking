import React, { useState, useEffect, createContext, useContext } from 'react';
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
  Image,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';


import { Client } from '@stomp/stompjs';
import { TextEncoder, TextDecoder } from 'text-encoding';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any;
}

import { API_URL } from './src/config/api';

const { width } = Dimensions.get('window');
// const API_URL = 'http://192.168.57.154:8081/api';

const Avatar = ({ uri, name, size = 40, style }: { uri?: string, name?: string, size?: number, style?: any }) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [uri]);
  if (uri && !error) {
    return (
      <Image key={uri} source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#EEE' }, style]} onError={() => setError(true)} />
    );
  }
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#003459', justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: Math.max(14, size * 0.4) }}>{(name || 'U').charAt(0).toUpperCase()}</Text>
    </View>
  );
};

// ==================== AUTH CONTEXT ====================
interface User {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  setScreen: (s: string) => void;
  screen: string;
  selectedRecipeId: number | null;
  setSelectedRecipeId: (id: number | null) => void;
  selectedOtherUserId: number | null;
  setSelectedOtherUserId: (id: number | null) => void;
  notifications: any[];
  unreadCount: number;
  loadNotifications: () => Promise<void>;
  handleNotificationRead: (id: number, recipeId?: number, userId?: number) => void;
  editingRecipe: any;
  setEditingRecipe: (r: any) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

// ==================== LOGIN SCREEN ====================
function LoginScreen() {
  const { login, setScreen } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) setError('Sai tài khoản hoặc mật khẩu');
  };

  return (
    <View style={styles.authContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authForm}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.title}>Bếp Việt</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản</Text>

            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

            <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
            <TextInput style={styles.input} placeholder="Nhập tên đăng nhập" value={username} onChangeText={setUsername} autoCapitalize="none" />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput style={styles.input} placeholder="Nhập mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity onPress={() => setScreen('forgot')}>
              <Text style={styles.linkText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
            </TouchableOpacity>

            <View style={styles.row}>
              <Text style={styles.grayText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => setScreen('register')}>
                <Text style={styles.linkTextBold}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== REGISTER SCREEN ====================
function RegisterScreen() {
  const { login, setScreen } = useAuth();
  const [form, setForm] = useState({ userName: '', fullName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!form.userName || !form.fullName || !form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: form.userName, fullName: form.fullName, email: form.email, passwordHash: form.password }),
      });
      if (res.ok) {
        await login(form.userName, form.password);
      } else {
        setError('Đăng ký thất bại');
      }
    } catch (e) {
      setError('Không thể kết nối server');
    }
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authForm}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.title}>Bếp Việt</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

            <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
            <TextInput style={styles.input} placeholder="Nhập tên đăng nhập" value={form.userName} onChangeText={(t) => setForm({ ...form, userName: t })} autoCapitalize="none" />

            <Text style={styles.label}>HỌ VÀ TÊN</Text>
            <TextInput style={styles.input} placeholder="Nhập họ và tên" value={form.fullName} onChangeText={(t) => setForm({ ...form, fullName: t })} />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput style={styles.input} placeholder="example@gmail.com" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput style={styles.input} placeholder="Ít nhất 6 ký tự" value={form.password} onChangeText={(t) => setForm({ ...form, password: t })} secureTextEntry />

            <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
            <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChangeText={(t) => setForm({ ...form, confirmPassword: t })} secureTextEntry />

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
            </TouchableOpacity>

            <View style={styles.row}>
              <Text style={styles.grayText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => setScreen('login')}>
                <Text style={styles.linkTextBold}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== FORGOT PASSWORD SCREEN ====================
function ForgotPasswordScreen() {
  const { setScreen } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!email) { setError('Vui lòng nhập email'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/sendOTP?email=${encodeURIComponent(email)}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) setStep(2);
      else setError(data.message || 'Không thể gửi OTP');
    } catch (e) { setError('Không thể kết nối server'); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError('Mã OTP phải có 6 số'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/verifyOTP?email=${encodeURIComponent(email)}&otp=${otp}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) setStep(3);
      else setError(data.message || 'Mã OTP không đúng');
    } catch (e) { setError('Không thể kết nối server'); }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { setError('Mật khẩu không khớp'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/auth/changePassword?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) setStep(4);
      else setError(data.message || 'Không thể đổi mật khẩu');
    } catch (e) { setError('Không thể kết nối server'); }
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <ScrollView contentContainerStyle={styles.authScroll}>
        <View style={styles.authForm}>
          <Text style={styles.logo}>🍳</Text>
          <Text style={styles.title}>Bếp Việt</Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Khôi phục mật khẩu'}
            {step === 2 && 'Nhập mã OTP'}
            {step === 3 && 'Đặt mật khẩu mới'}
            {step === 4 && 'Thành công!'}
          </Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {step === 1 && (
            <>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput style={styles.input} placeholder="Nhập email đã đăng ký" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Gửi mã OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.grayText}>Mã OTP đã gửi đến {email}</Text>
              <Text style={styles.label}>MÃ OTP</Text>
              <TextInput style={[styles.input, { textAlign: 'center', fontSize: 24, letterSpacing: 8 }]} placeholder="000000" value={otp} onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Xác thực</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.label}>MẬT KHẨU MỚI</Text>
              <TextInput style={styles.input} placeholder="Ít nhất 6 ký tự" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
              <TextInput style={styles.input} placeholder="Nhập lại mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleChangePassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Đổi mật khẩu</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={{ fontSize: 60, color: '#00A86B', marginBottom: 16 }}>✓</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 24 }}>Đổi mật khẩu thành công!</Text>
              <TouchableOpacity style={styles.button} onPress={() => setScreen('login')}>
                <Text style={styles.buttonText}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </>
          )}

          {step !== 4 && (
            <TouchableOpacity style={{ marginTop: 24 }} onPress={() => setScreen('login')}>
              <Text style={styles.grayText}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ==================== HOME SCREEN ====================
function HomeScreen() {
  const { setSelectedRecipeId, user, notifications, unreadCount, loadNotifications, handleNotificationRead: markRead } = useAuth();
  const [bannerRecipes, setBannerRecipes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topViews, setTopViews] = useState<any[]>([]);
  const [topLikes, setTopLikes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState<'title' | 'ingredients'>('title');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
      const body: any = {};
      if (searchType === 'ingredients') {
        body.ingredients = searchQuery.split(',').map(s => s.trim());
      } else {
        body.title = [searchQuery.trim()];
      }

      const res = await fetch(`${API_URL}/recipes/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': rawToken ? `Bearer ${rawToken}` : '' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } else { setSearchResults([]); }
    } catch (e) { console.log(e); } finally { setIsSearching(false); }
  };

  const handleImageSearch = async () => {
    Alert.alert('Tìm kiếm bằng hình ảnh', 'Chọn phương thức', [
      { text: 'Chụp ảnh', onPress: () => processImageSearch('camera') },
      { text: 'Chọn từ thư viện', onPress: () => processImageSearch('library') },
      { text: 'Hủy', style: 'cancel' }
    ]);
  };

  const processImageSearch = async (mode: 'camera' | 'library') => {
    let result;
    if (mode === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Cần quyền Camera'); return; }
      result = await ImagePicker.launchCameraAsync({ quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setIsSearching(true);
      try {
        const formData = new FormData();
        const fileName = uri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append('file', { uri, name: fileName, type });

        const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
        const res = await fetch(`${API_URL}/find/AI`, {
          method: 'POST',
          headers: { 'Authorization': rawToken ? `Bearer ${rawToken}` : '' },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
          setSearchQuery('');
        } else {
          Alert.alert('Không tìm thấy', 'Không nhận diện được món ăn hoặc không có công thức phù hợp.');
          setSearchResults([]);
        }
      } catch (e: any) { Alert.alert('Lỗi', e.message); }
      finally { setIsSearching(false); }
    }
  };

  const [showNotifications, setShowNotifications] = useState(false);

  const handleNotificationRead = (id: number, recipeId?: number, userId?: number) => {
    setShowNotifications(false);
    markRead(id, recipeId, userId);
  };
  useEffect(() => { if (showNotifications) loadNotifications(); }, [showNotifications]);

  useEffect(() => { loadData(); }, []);

  // Auto slide banner
  useEffect(() => {
    if (bannerRecipes.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % bannerRecipes.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [bannerRecipes]);

  const loadData = async () => {
    try {
      // Fetch all data - sử dụng đúng endpoint của backend
      const [recipesRes, categoriesRes, popularRes, trendingRes] = await Promise.all([
        fetch(`${API_URL}/recipes`).catch(() => null),
        fetch(`${API_URL}/categories`).catch(() => null),
        fetch(`${API_URL}/recipes/popular`).catch(() => null),
        fetch(`${API_URL}/recipes/trending`).catch(() => null),
      ]);

      // Banner recipes (lấy từ tất cả recipes)
      if (recipesRes?.ok) {
        const data = await recipesRes.json();
        setBannerRecipes(Array.isArray(data) ? data.slice(0, 5) : []);
      }

      // Categories
      if (categoriesRes?.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }

      // Popular recipes (nhiều lượt xem)
      if (popularRes?.ok) {
        const data = await popularRes.json();
        setTopViews(Array.isArray(data) ? data.slice(0, 6) : []);
      }

      // Trending recipes (được yêu thích)
      if (trendingRes?.ok) {
        const data = await trendingRes.json();
        setTopLikes(Array.isArray(data) ? data.slice(0, 6) : []);
      }
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadNotifications()]);
    setRefreshing(false);
  };

  // Recipe Card Component
  const RecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => setSelectedRecipeId(item.recipeId)}
      style={{
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/300' }}
        style={{ width: '100%', height: 140, backgroundColor: '#E8EAED' }}
      />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#00171F', marginBottom: 8 }} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#EF5350', marginRight: 16 }}>❤️ {item.likeCount || 0}</Text>
            <Text style={{ fontSize: 13, color: '#667479' }}>👁 {item.viewCount || 0}</Text>
          </View>
        </View>
        {item.userName && (
          <Text style={{ fontSize: 12, color: '#99A1A7', marginTop: 8 }}>👤 {item.userName}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' }}>
        <ActivityIndicator size="large" color="#003459" />
        <Text style={{ marginTop: 16, color: '#667479' }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F4F6F8' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* === HEADER === */}
        <View style={{ backgroundColor: '#003459', paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>Xin chào! 👋</Text>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>Bếp Việt</Text>
            </View>
            {!showSearch && (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setShowNotifications(true)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                  <Ionicons name="notifications-outline" size={24} color="#FFF" />
                  {unreadCount > 0 && (
                    <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: '#EF5350', borderRadius: 9, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#003459' }}>
                      <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowSearch(true)}
                  style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="search" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {showSearch ? (
          <View style={{ padding: 16, minHeight: 500 }}>
            {/* Search Input Area */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, marginRight: 12, height: 50, borderWidth: 1, borderColor: '#E8EAED' }}>
                <Ionicons name="search" size={20} color="#99A1A7" />
                <TextInput
                  style={{ flex: 1, marginLeft: 8, fontSize: 16, color: '#00171F' }}
                  placeholder={searchType === 'ingredients' ? "Nhập nguyên liệu (vd: thịt, trứng)..." : "Tìm kiếm công thức..."}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color="#99A1A7" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleImageSearch} style={{ padding: 4 }}>
                    <Ionicons name="camera-outline" size={24} color="#003459" />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }}>
                <Text style={{ fontSize: 16, color: '#003459', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>
            </View>

            {/* Search Type Filter */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <TouchableOpacity
                style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: searchType === 'title' ? '#003459' : '#E8EAED', marginRight: 8 }}
                onPress={() => setSearchType('title')}
              >
                <Text style={{ color: searchType === 'title' ? '#FFF' : '#667479', fontWeight: '600' }}>Theo Tên</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: searchType === 'ingredients' ? '#003459' : '#E8EAED' }}
                onPress={() => setSearchType('ingredients')}
              >
                <Text style={{ color: searchType === 'ingredients' ? '#FFF' : '#667479', fontWeight: '600' }}>Theo Nguyên Liệu</Text>
              </TouchableOpacity>
            </View>

            {/* Search Button (Only show if not image searching) */}
            {!isSearching && searchQuery.length === 0 && searchResults.length === 0 && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Text style={{ color: '#99A1A7', fontSize: 14 }}>Nhập từ khóa hoặc chụp ảnh nguyên liệu để tìm kiếm</Text>
              </View>
            )}

            {isSearching && (
              <View style={{ marginTop: 20 }}>
                <ActivityIndicator size="large" color="#F5A623" />
                <Text style={{ textAlign: 'center', color: '#667479', marginTop: 8 }}>Đang tìm kiếm...</Text>
              </View>
            )}

            {/* Results */}
            {searchResults.length > 0 ? (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 16 }}>Kết quả tìm kiếm ({searchResults.length})</Text>
                {searchResults.map((item, i) => (
                  <View key={item.recipeId || i} style={{ marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => setSelectedRecipeId(item.recipeId)}
                      style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, elevation: 2 }}
                    >
                      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={{ width: 100, height: 100, borderRadius: 8, backgroundColor: '#EEE' }} />
                      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00171F', marginBottom: 4 }} numberOfLines={2}>{item.title}</Text>
                        {item.userName && <Text style={{ fontSize: 13, color: '#667479' }}>👤 {item.userName}</Text>}
                        <View style={{ flexDirection: 'row', marginTop: 8 }}>
                          <Text style={{ fontSize: 13, color: '#EF5350', marginRight: 12 }}>❤️ {item.likeCount || 0}</Text>
                          <Text style={{ fontSize: 13, color: '#667479' }}>👁 {item.viewCount || 0}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              !isSearching && searchQuery.trim().length > 0 && (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                  <Ionicons name="search-outline" size={60} color="#D1D5DB" />
                  <Text style={{ marginTop: 16, color: '#99A1A7', fontSize: 16 }}>Không tìm thấy công thức nào</Text>
                </View>
              )
            )}
          </View>
        ) : (
          <>
            {/* === BANNER SLIDER === */}
            {bannerRecipes.length > 0 && (
              <View style={{ marginTop: 16, marginHorizontal: 16 }}>
                <TouchableOpacity
                  onPress={() => setSelectedRecipeId(bannerRecipes[currentBanner]?.recipeId)}
                  style={{
                    backgroundColor: '#FFF',
                    borderRadius: 20,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <Image
                    source={{ uri: bannerRecipes[currentBanner]?.imageUrl || 'https://via.placeholder.com/400' }}
                    style={{ width: '100%', height: 200 }}
                  />
                  <View style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 16,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="trending-up" size={16} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 13, marginLeft: 6 }}>{bannerRecipes[currentBanner]?.viewCount || 0} lượt xem</Text>
                    </View>
                    <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }} numberOfLines={2}>
                      {bannerRecipes[currentBanner]?.title}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Banner Dots */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                  {bannerRecipes.map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setCurrentBanner(i)}
                      style={{
                        width: currentBanner === i ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: currentBanner === i ? '#F5A623' : '#D1D5DB',
                        marginHorizontal: 3,
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* === CATEGORIES === */}
            {categories.length > 0 && (
              <View style={{ marginTop: 28 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00171F', paddingHorizontal: 20, marginBottom: 16 }}>
                  🍽️ Danh Mục Món Ăn
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                >
                  {categories.map((cat, i) => (
                    <TouchableOpacity
                      key={cat.categoryId || i}
                      style={{
                        alignItems: 'center',
                        marginHorizontal: 8,
                        width: 80,
                      }}
                    >
                      <View style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: '#FFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                        overflow: 'hidden',
                      }}>
                        {cat.imageUrl ? (
                          <Image source={{ uri: cat.imageUrl }} style={{ width: 70, height: 70 }} />
                        ) : (
                          <Text style={{ fontSize: 30 }}>🍳</Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: '#667479', marginTop: 8, textAlign: 'center' }} numberOfLines={2}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* === TOP VIEWS === */}
            {topViews.length > 0 && (
              <View style={{ marginTop: 28, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00171F', marginBottom: 16 }}>
                  👁️ Nhiều Lượt Xem Nhất
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
                  {topViews.map((item, i) => (
                    <View key={item.recipeId || i} style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
                      <RecipeCard item={item} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* === TOP LIKES === */}
            {topLikes.length > 0 && (
              <View style={{ marginTop: 12, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00171F', marginBottom: 16 }}>
                  ❤️ Được Yêu Thích Nhất
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
                  {topLikes.map((item, i) => (
                    <View key={item.recipeId || i} style={{ width: '50%', paddingHorizontal: 8, marginBottom: 16 }}>
                      <RecipeCard item={item} />
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>

      <Modal visible={showNotifications} animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
          <View style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="arrow-back" size={24} color="#003459" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#003459', marginLeft: 16 }}>Thông báo</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => loadNotifications()}>
              <Ionicons name="refresh" size={24} color="#003459" />
            </TouchableOpacity>
          </View>


          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 50 }}><Ionicons name="notifications-off-outline" size={48} color="#CCC" /><Text style={{ marginTop: 16, color: '#999' }}>Không có thông báo nào</Text></View>}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleNotificationRead(item.id, item.recipeId, item.userId)}
                style={{ flexDirection: 'row', padding: 16, backgroundColor: item.isRead ? '#FFF' : '#E3F2FD', borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: item.type === 'LIKE' ? '#FFEBEE' : item.type === 'COMMENT' ? '#E0F7FA' : '#F3E5F5',
                  justifyContent: 'center', alignItems: 'center', marginRight: 16
                }}>
                  <Ionicons name={item.type === 'LIKE' ? 'heart' : item.type === 'COMMENT' ? 'chatbubble' : 'notifications'}
                    size={20} color={item.type === 'LIKE' ? '#EF5350' : item.type === 'COMMENT' ? '#006064' : '#7B1FA2'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: item.isRead ? '400' : '700', color: '#00171F', marginBottom: 4 }}>{item.title}</Text>
                  <Text style={{ fontSize: 13, color: '#667479' }}>{item.message}</Text>
                  <Text style={{ fontSize: 11, color: '#99A1A7', marginTop: 6 }}>{item.createdAt}</Text>
                </View>
                {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', alignSelf: 'center', marginLeft: 8 }} />}
              </TouchableOpacity>
            )}
          />

        </SafeAreaView>
      </Modal>
    </>
  );
}

// ==================== PROFILE SCREEN ====================
function ProfileScreen() {
  const { user, logout, setScreen, setSelectedRecipeId } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recipes' | 'favorites'>('recipes');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Edit Profile States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => { setImageError(false); }, [profile]);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const headers = { 'Authorization': `Bearer ${user.token.trim().replace(/^Bearer\s+/i, '')}` };
      const res = await fetch(`${API_URL}/user/me`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const openEditModal = () => {
    setEditFullName(profile?.fullName || '');
    setEditBio(profile?.bio || '');
    setEditEmail(profile?.email || '');
    setEditAvatar(null);
    setShowEditModal(true);
  };

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      const userRequest = {
        fullName: editFullName,
        bio: editBio,
        email: editEmail,
      };

      const jsonUri = FileSystem.cacheDirectory + 'user_update.json';
      await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(userRequest), { encoding: 'utf8' });
      formData.append('UserInfor', {
        uri: jsonUri,
        name: 'user_update.json',
        type: 'application/json'
      } as any);

      if (editAvatar) {
        const fileName = editAvatar.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        // @ts-ignore
        formData.append('avatar', { uri: editAvatar, name: fileName, type });
      }

      const res = await fetch(`${API_URL}/user/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token.trim().replace(/^Bearer\s+/i, '')}`,
        },
        body: formData
      });

      if (res.ok) {
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
        setShowEditModal(false);
        loadProfile();
      } else {
        const text = await res.text();
        try {
          const errJson = JSON.parse(text);
          Alert.alert('Lỗi', errJson.message || text);
        } catch { Alert.alert('Lỗi', text); }
      }
    } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật'); }
    finally { setIsUpdating(false); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#003459" /></View>;

  const recipes = profile?.myRecipe || [];
  const favorites = profile?.favorites || [];

  const getFilteredData = () => {
    if (activeTab === 'favorites') return favorites;
    if (statusFilter === 'ALL') return recipes;
    return recipes.filter((r: any) => r.status === statusFilter);
  };

  const displayList = getFilteredData();

  const STATUS_FILTERS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'PENDING', label: 'Chờ duyệt' },
    { id: 'APPROVED', label: 'Đã duyệt' },
    { id: 'REJECTED', label: 'Từ chối' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#003459', padding: 24, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#F5A623', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 4, borderColor: '#FFF', overflow: 'hidden' }}>
          {profile?.avatarUrl && !imageError ? (
            <Image
              key={profile.avatarUrl}
              source={{ uri: profile.avatarUrl }}
              style={{ width: '100%', height: '100%' }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#FFF' }}>{profile?.fullName?.charAt(0) || user?.userName?.charAt(0) || 'U'}</Text>
          )}
        </View>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF' }}>{profile?.fullName || user?.userName}</Text>
        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>@{user?.userName}</Text>
        {profile?.bio && <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 8, fontStyle: 'italic' }}>"{profile.bio}"</Text>}

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{profile?.totalRecipes || 0}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Công thức</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{profile?.followerCount || 0}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Người theo dõi</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{profile?.followingcount || 0}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Đang theo dõi</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 12 }}>
        <TouchableOpacity onPress={openEditModal} style={{ backgroundColor: '#FFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#003459' }}>
          <Text style={{ color: '#003459', fontWeight: '600' }}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#EF5350', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 }}>
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginTop: 24, marginHorizontal: 16, backgroundColor: '#E8EAED', borderRadius: 12, padding: 4 }}>
        <TouchableOpacity onPress={() => { setActiveTab('recipes'); setStatusFilter('ALL'); }} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'recipes' ? '#FFF' : 'transparent', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', color: activeTab === 'recipes' ? '#003459' : '#667479' }}>Công thức ({recipes.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('favorites')} style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: activeTab === 'favorites' ? '#FFF' : 'transparent', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', color: activeTab === 'favorites' ? '#003459' : '#667479' }}>Đã lưu ({favorites.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter for Recipes */}
      {activeTab === 'recipes' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: 16 }}>
          {STATUS_FILTERS.map(status => (
            <TouchableOpacity
              key={status.id}
              onPress={() => setStatusFilter(status.id as any)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8,
                backgroundColor: statusFilter === status.id ? '#003459' : '#FFF',
                borderWidth: 1, borderColor: statusFilter === status.id ? '#003459' : '#E8EAED'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: statusFilter === status.id ? '#FFF' : '#667479' }}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* List */}
      <View style={{ padding: 16 }}>
        {displayList.map((item: any, i: number) => (
          <TouchableOpacity key={i} onPress={() => setSelectedRecipeId(item.recipeId)} style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 10, marginBottom: 12, shadowOpacity: 0.1, elevation: 1 }}>
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#EEE' }} />
            <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00171F', flex: 1 }} numberOfLines={1}>{item.title}</Text>
                {/* Status Badge */}
                {activeTab === 'recipes' && item.status && (
                  <Text style={{
                    fontSize: 10, fontWeight: 'bold',
                    color: item.status === 'APPROVED' ? '#4CAF50' : item.status === 'REJECTED' ? '#F44336' : '#FF9800',
                    backgroundColor: item.status === 'APPROVED' ? '#E8F5E9' : item.status === 'REJECTED' ? '#FFEBEE' : '#FFF3E0',
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', marginLeft: 4, alignSelf: 'flex-start'
                  }}>
                    {item.status === 'APPROVED' ? 'DUYỆT' : item.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ'}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <Text style={{ fontSize: 13, color: '#EF5350', marginRight: 12 }}>❤️ {item.likeCount || 0}</Text>
                <Text style={{ fontSize: 13, color: '#667479' }}>👁 {item.viewCount || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {displayList.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Không có bài viết nào</Text>
        )}
      </View>
      <View style={{ height: 100 }} />

      {/* Edit Modal */}
      <Modal animationType="slide" visible={showEditModal} onRequestClose={() => setShowEditModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16 }}>Chỉnh sửa hồ sơ</Text>
            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? <ActivityIndicator color="#003459" /> : <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#003459' }}>Lưu</Text>}
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity onPress={pickAvatar}>
                <Image source={{ uri: editAvatar || profile?.avatarUrl || 'https://via.placeholder.com/150' }} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#EEE' }} />
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#003459', padding: 8, borderRadius: 15 }}>
                  <Ionicons name="camera" size={16} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={{ fontWeight: '600', marginBottom: 8, color: '#666' }}>Họ và Tên</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 }} value={editFullName} onChangeText={setEditFullName} placeholder="Nhập họ và tên" />

            <Text style={{ fontWeight: '600', marginBottom: 8, color: '#666' }}>Email</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 }} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" placeholder="Nhập email" />

            <Text style={{ fontWeight: '600', marginBottom: 8, color: '#666' }}>Bio (Giới thiệu)</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, height: 100, textAlignVertical: 'top' }} multiline value={editBio} onChangeText={setEditBio} placeholder="Viết giới thiệu về bạn..." />

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

// ==================== OTHER PROFILE SCREEN ====================
function OtherProfileScreen() {
  const { selectedOtherUserId, setSelectedOtherUserId, user, setSelectedRecipeId, setSelectedRecipeId: setRecipeId } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Report States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => { loadOtherProfile(); }, [selectedOtherUserId]);

  const loadOtherProfile = async () => {
    if (!selectedOtherUserId) return;
    setLoading(true);
    try {
      const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
      const headers: any = rawToken ? { 'Authorization': `Bearer ${rawToken}` } : {};
      const res = await fetch(`${API_URL}/getUser/${selectedOtherUserId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsFollowing(data.following || false); // Note: DTO uses isFollowing? Method is isFollowing() but field is isFollowing. JSON normally follows field name.
      }
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleFollow = async () => {
    if (!user) { Alert.alert('Thông báo', 'Vui lòng đăng nhập'); return; }
    const oldStatus = isFollowing;
    setIsFollowing(!oldStatus); // Optimistic

    try {
      const rawToken = user.token.trim().replace(/^Bearer\s+/i, '');
      const method = oldStatus ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/user/${selectedOtherUserId}/follow`, {
        method,
        headers: { 'Authorization': `Bearer ${rawToken}` }
      });
      if (!res.ok) setIsFollowing(oldStatus);
      else loadOtherProfile(); // Reload to get correct stats
    } catch (e) { setIsFollowing(oldStatus); }
  };

  const handleReportUser = async () => {
    if (!reportDescription.trim()) { Alert.alert('Thông báo', 'Vui lòng nhập mô tả'); return; }
    setIsReporting(true);
    try {
      const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
      const res = await fetch(`${API_URL}/user/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rawToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportedUserId: selectedOtherUserId,
          reason: reportReason,
          description: reportDescription
        })
      });
      const text = await res.text();
      if (res.ok || text === 'done') {
        Alert.alert('Thành công', 'Đã gửi báo cáo vi phạm.');
        setShowReportModal(false);
        setReportDescription('');
      } else {
        Alert.alert('Lỗi', 'Không thể gửi báo cáo.');
      }
    } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra.'); }
    finally { setIsReporting(false); }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' }}><ActivityIndicator size="large" color="#003459" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      {/* Header with Back Button */}
      <View style={{ position: 'absolute', top: 50, left: 16, zIndex: 10 }}>
        <TouchableOpacity onPress={() => setSelectedOtherUserId(null)} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Report Button */}
      <View style={{ position: 'absolute', top: 50, right: 16, zIndex: 10 }}>
        <TouchableOpacity onPress={() => setShowReportModal(true)} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
          <Ionicons name="warning-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={{ backgroundColor: '#003459', padding: 24, paddingTop: 80, alignItems: 'center' }}>
          <Avatar uri={profile?.avatarUrl} name={profile?.fullName || ''} size={100} style={{ marginBottom: 12, borderWidth: 4, borderColor: '#FFF' }} />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FFF' }}>{profile?.fullName}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>@{profile?.userName}</Text>
          {/* Stats */}
          <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{profile?.totalRecipes || 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Công thức</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>{profile?.followerCount || 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Người theo dõi</Text>
            </View>
          </View>
        </View>

        {/* Action Bar */}
        <View style={{ padding: 16, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleFollow}
            style={{ backgroundColor: isFollowing ? '#E0E0E0' : '#F5A623', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24, elevation: 2 }}
          >
            <Text style={{ fontWeight: 'bold', color: isFollowing ? '#333' : '#FFF' }}>{isFollowing ? 'Đang theo dõi' : '+ Theo dõi'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recipes List */}
        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 12 }}>Danh sách công thức</Text>
          {profile?.myRecipe && profile.myRecipe.length > 0 ? profile.myRecipe.map((item: any, i: number) => (
            <TouchableOpacity key={i} onPress={() => setSelectedRecipeId(item.recipeId)} style={{ flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 10, marginBottom: 12, shadowOpacity: 0.1, elevation: 1 }}>
              <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#EEE' }} />
              <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#00171F' }} numberOfLines={1}>{item.title}</Text>
                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                  <Text style={{ fontSize: 13, color: '#EF5350', marginRight: 12 }}>❤️ {item.likeCount || 0}</Text>
                  <Text style={{ fontSize: 13, color: '#667479' }}>👁 {item.viewCount || 0}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <Text style={{ textAlign: 'center', color: '#999', marginTop: 10 }}>Người dùng này chưa có bài viết công khai.</Text>
          )}
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal visible={showReportModal} animationType="fade" transparent onRequestClose={() => setShowReportModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 20, width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#D32F2F' }}>Báo cáo người dùng</Text>

            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Lý do:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {['SPAM', 'INAPPROPRIATE', 'COPYRIGHT', 'FAKE', 'OTHER'].map(r => (
                <TouchableOpacity key={r} onPress={() => setReportReason(r)}
                  style={{ padding: 8, borderWidth: 1, borderColor: reportReason === r ? '#D32F2F' : '#DDD', borderRadius: 8, marginRight: 8, marginBottom: 8, backgroundColor: reportReason === r ? '#FFEBEE' : '#FFF' }}>
                  <Text style={{ color: reportReason === r ? '#D32F2F' : '#333' }}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ marginBottom: 8, fontWeight: '600' }}>Mô tả chi tiết:</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 10, height: 80, textAlignVertical: 'top', marginBottom: 16 }}
              placeholder="Nhập nội dung báo cáo..." multiline value={reportDescription} onChangeText={setReportDescription} />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowReportModal(false)} style={{ padding: 10 }}><Text style={{ color: '#666' }}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleReportUser} disabled={isReporting} style={{ backgroundColor: '#D32F2F', padding: 10, borderRadius: 8 }}>
                {isReporting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Gửi báo cáo</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== RECIPE DETAIL SCREEN ====================
function RecipeDetailScreen() {
  const { selectedRecipeId, setSelectedRecipeId, setScreen, user, logout, setSelectedOtherUserId, setEditingRecipe } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review form states
  // Review form states
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [actualCookingTime, setActualCookingTime] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReviewImages([...reviewImages, result.assets[0].uri]);
    }
  };

  // Comment form states
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any>(null);

  // Report State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const REASONS = [
    { id: 'SPAM', label: 'Spam / Quảng cáo' },
    { id: 'INAPPROPRIATE', label: 'Nội dung không phù hợp' },
    { id: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
    { id: 'FAKE', label: 'Thông tin sai lệch' },
    { id: 'OTHER', label: 'Khác' },
  ];

  const handleSendReport = async () => {
    if (!user) { Alert.alert('Thông báo', 'Vui lòng đăng nhập!'); return; }
    if (!reportDescription.trim()) { Alert.alert('Thông báo', 'Vui lòng nhập mô tả chi tiết'); return; }

    setIsReporting(true);
    try {
      const rawToken = user.token.trim().replace(/^Bearer\s+/i, '');
      const res = await fetch(`${API_URL}/user/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${rawToken}`
        },
        body: JSON.stringify({
          recipeId: selectedRecipeId,
          reason: reportReason,
          description: reportDescription
        })
      });
      const text = await res.text();
      if (res.ok || text === 'done' || text.includes('thanh cong')) {
        Alert.alert('Thành công', 'Đã gửi báo cáo. Cảm ơn phản hồi của bạn!');
        setShowReportModal(false);
        setReportDescription('');
        setReportReason('SPAM');
      } else {
        Alert.alert('Lỗi', text || 'Không thể gửi báo cáo');
      }
    } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra'); }
    finally { setIsReporting(false); }
  };

  // --- LIKE / SAVE RECIPE & COMMENT ACTIONS ---
  const handleLikeRecipe = async () => {
    if (!user) { Alert.alert('Thông báo', 'Vui lòng đăng nhập!'); return; }
    if (!recipe) return;

    const oldLike = recipe.isLike;
    const oldCount = recipe.likeCount || 0;

    // Optimistic Update
    setRecipe({ ...recipe, isLike: !oldLike, likeCount: oldLike ? oldCount - 1 : oldCount + 1 });

    try {
      const method = oldLike ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/user/recipes/${selectedRecipeId}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${user.token.trim()}` }
      });

      if (!res.ok) {
        setRecipe({ ...recipe, isLike: oldLike, likeCount: oldCount });
      }
    } catch (e) {
      setRecipe({ ...recipe, isLike: oldLike, likeCount: oldCount });
    }
  };

  const handleSaveRecipe = async () => {
    if (!user) { Alert.alert('Thông báo', 'Vui lòng đăng nhập!'); return; }
    if (!recipe) return;

    const oldFav = recipe.isFavorite;
    setRecipe({ ...recipe, isFavorite: !oldFav });

    try {
      const method = oldFav ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/user/recipes/${selectedRecipeId}/favorite`, {
        method,
        headers: { 'Authorization': `Bearer ${user.token.trim()}` }
      });

      if (!res.ok) {
        setRecipe({ ...recipe, isFavorite: oldFav });
      }
    } catch (e) {
      setRecipe({ ...recipe, isFavorite: oldFav });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/user/comments/${commentId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${user.token.trim()}` }
            });
            if (res.ok) { loadData(); }
            else { Alert.alert('Lỗi', 'Không thể xóa'); }
          } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra'); }
        }
      }
    ]);
  };

  const startEditComment = (comment: any) => {
    setEditingCommentId(comment.commentID);
    setEditingText(comment.content);
  };

  const submitEditComment = async (commentId: number) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/user/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: editingText })
      });
      if (res.ok) { setEditingCommentId(null); loadData(); }
      else { Alert.alert('Lỗi', 'Không thể sửa.'); }
    } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra'); }
  };



  // Tab state: 'reviews' or 'comments'
  const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews');

  useEffect(() => {
    if (selectedRecipeId) {
      loadData();
    }
  }, [selectedRecipeId, user]);

  const loadData = async () => {
    if (!selectedRecipeId) return;
    setLoading(true);
    try {
      const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
      const headers: any = rawToken ? { 'Authorization': `Bearer ${rawToken}` } : {};

      const [recipeRes, reviewsRes, commentsRes] = await Promise.all([
        fetch(`${API_URL}/recipes/${selectedRecipeId}`, { headers }),
        fetch(`${API_URL}/review/${selectedRecipeId}`, { headers }),
        fetch(`${API_URL}/recipes/${selectedRecipeId}/comments`, { headers }),
      ]);

      if (recipeRes.ok) {
        const data = await recipeRes.json();
        setRecipe(data);
      } else {
        console.log('Recipe fetch failed:', recipeRes.status);
        const errorText = await recipeRes.text();
        console.log('Error details:', errorText);
      }

      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        setReviews(Array.isArray(data) ? data : []);
      }

      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.log('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewContent.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    if (!user?.token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để đánh giá');
      return;
    }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      const reviewData: any = {
        title: reviewTitle.trim() || null,
        reviewContent: reviewContent.trim(),
        actualCookingTime: actualCookingTime ? parseInt(actualCookingTime) : null,
      };

      // USE FILESYSTEM to avoid 400/415 errors
      const reviewJson = JSON.stringify(reviewData);
      const reviewUri = FileSystem.cacheDirectory + 'review.json';
      await FileSystem.writeAsStringAsync(reviewUri, reviewJson, { encoding: 'utf8' });

      formData.append('review', {
        uri: reviewUri,
        name: 'review.json',
        type: 'application/json'
      } as any);

      if (reviewImages.length > 0) {
        reviewImages.forEach((uri, index) => {
          const fileName = uri.split('/').pop() || `image_${index}.jpg`;
          const match = /\.(\w+)$/.exec(fileName);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          // @ts-ignore
          formData.append('images', { uri: uri, name: fileName, type: type });
        });
      } else {
        // Empty file for 'images' part
        const emptyUri = FileSystem.cacheDirectory + 'empty.txt';
        await FileSystem.writeAsStringAsync(emptyUri, '', { encoding: 'utf8' });
        formData.append('images', {
          uri: emptyUri,
          name: 'empty.txt',
          type: 'text/plain'
        } as any);
      }

      const res = await fetch(`${API_URL}/user/review/${selectedRecipeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
        body: formData,
      });
      if (res.ok) {
        Alert.alert('Thành công', 'Đã gửi đánh giá!');
        setReviewTitle('');
        setReviewContent('');
        setActualCookingTime('');
        setReviewImages([]);
        loadData();
      } else {
        const errText = await res.text();
        console.log('Review error:', errText);
        Alert.alert('Lỗi ' + res.status, 'Không thể gửi đánh giá. ' + errText);
      }
    } catch (e: any) {
      console.log('Review exception:', e);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá ' + e.message);
    } finally {
      setSubmittingReview(false);
    }
  };



  const handleReplyComment = (comment: any) => {
    setReplyingTo(comment);
    setActiveTab('comments');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung bình luận');
      return;
    }
    if (!user?.token) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình luận');
      return;
    }
    setSubmittingComment(true);
    try {
      const rawToken = user.token.trim().replace(/^Bearer\s+/i, '');
      let url = `${API_URL}/user/recipes/${selectedRecipeId}/comments`;

      if (replyingTo) {
        url = `${API_URL}/user/comments/${replyingTo.commentID}/reply`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${rawToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents: commentText.trim() }),
      });

      const text = await res.text();
      if (res.ok || text === 'done') {
        Alert.alert('Thành công', replyingTo ? 'Đã phản hồi!' : 'Đã gửi bình luận!');
        setCommentText('');
        setReplyingTo(null);
        loadData();
      } else {
        Alert.alert('Lỗi', text || 'Không thể gửi');
      }
    } catch (e: any) {
      console.log('Comment exception:', e);
      Alert.alert('Lỗi', e.message || 'Không thể gửi bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBack = () => {
    setSelectedRecipeId(null);
    setScreen('home');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' }}>
        <ActivityIndicator size="large" color="#003459" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' }}>
        <Text>Không tìm thấy công thức</Text>
        <TouchableOpacity onPress={handleBack} style={{ marginTop: 16, padding: 12, backgroundColor: '#003459', borderRadius: 8 }}>
          <Text style={{ color: '#FFF' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/400' }}
            style={{ width: '100%', height: 280, backgroundColor: '#E8EAED' }}
          />
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 20,
              padding: 8
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 20 }}>
          {/* Title and Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#00171F', flex: 1, marginRight: 8 }}>
              {recipe.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={handleLikeRecipe} style={{ padding: 4 }}>
                <Ionicons name={recipe.isLike ? "heart" : "heart-outline"} size={28} color={recipe.isLike ? "red" : "#99A1A7"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveRecipe} style={{ padding: 4, marginLeft: 8 }}>
                <Ionicons name={recipe.isFavorite ? "bookmark" : "bookmark-outline"} size={28} color={recipe.isFavorite ? "#F5A623" : "#99A1A7"} />
              </TouchableOpacity>
              {user && user.userId === recipe.userId ? (
                <TouchableOpacity onPress={() => { setEditingRecipe(recipe); setSelectedRecipeId(null); setScreen('recipe-form'); }} style={{ padding: 4, marginLeft: 8 }}>
                  <Ionicons name="create-outline" size={28} color="#003459" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setShowReportModal(true)} style={{ padding: 4, marginLeft: 8 }}>
                  <Ionicons name="warning-outline" size={28} color="#D32F2F" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Author */}
          {recipe.userName && (
            <TouchableOpacity onPress={() => setSelectedOtherUserId(recipe.userId)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Avatar uri={recipe.avatarUrl} name={recipe.userName} size={36} style={{ backgroundColor: '#F5A623', marginRight: 10 }} />
              <Text style={{ fontSize: 15, color: '#667479' }}>bởi {recipe.userName}</Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', backgroundColor: '#F4F6F8', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name="time-outline" size={24} color="#003459" />
              <Text style={{ fontSize: 14, color: '#667479', marginTop: 4 }}>Chuẩn bị</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#00171F' }}>{recipe.prepTime || 0} phút</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name="flame-outline" size={24} color="#003459" />
              <Text style={{ fontSize: 14, color: '#667479', marginTop: 4 }}>Nấu</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#00171F' }}>{recipe.cookTime || 0} phút</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Ionicons name="people-outline" size={24} color="#003459" />
              <Text style={{ fontSize: 14, color: '#667479', marginTop: 4 }}>Khẩu phần</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#00171F' }}>{recipe.serving || 1}</Text>
            </View>
          </View>

          {/* Likes & Views */}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
              <Ionicons name="heart" size={20} color="#EF5350" />
              <Text style={{ fontSize: 15, color: '#667479', marginLeft: 6 }}>{recipe.likeCount || 0} lượt thích</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="eye" size={20} color="#667479" />
              <Text style={{ fontSize: 15, color: '#667479', marginLeft: 6 }}>{recipe.viewCount || 0} lượt xem</Text>
            </View>
          </View>

          {/* Description */}
          {recipe.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 10 }}>Mô tả</Text>
              <Text style={{ fontSize: 15, color: '#667479', lineHeight: 24 }}>{recipe.description}</Text>
            </View>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 12 }}>🥗 Nguyên liệu</Text>
              {recipe.ingredients.map((ing: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E8EAED' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F5A623', marginRight: 12 }} />
                  <Text style={{ fontSize: 15, color: '#00171F', flex: 1 }}>
                    {typeof ing === 'string' ? ing : `${ing.name || ''} ${ing.amount || ''} ${ing.unit || ''}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 12 }}>📝 Hướng dẫn</Text>
              {recipe.instructions.map((step: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#003459', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: '#00171F', lineHeight: 24 }}>
                      {typeof step === 'string' ? step : step.description || step.content || ''}
                    </Text>
                    {step.imageUrl && (
                      <Image source={{ uri: step.imageUrl }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 10 }} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Nutrition */}
          {recipe.nutritionInfo && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#00171F', marginBottom: 12 }}>📊 Thông tin dinh dưỡng</Text>
              <View style={{ backgroundColor: '#F4F6F8', borderRadius: 12, padding: 16 }}>
                {recipe.nutritionInfo.calories && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#667479' }}>Calories</Text>
                    <Text style={{ fontWeight: '600', color: '#00171F' }}>{recipe.nutritionInfo.calories}</Text>
                  </View>
                )}
                {recipe.nutritionInfo.protein && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#667479' }}>Protein</Text>
                    <Text style={{ fontWeight: '600', color: '#00171F' }}>{recipe.nutritionInfo.protein}</Text>
                  </View>
                )}
                {recipe.nutritionInfo.carbs && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#667479' }}>Carbs</Text>
                    <Text style={{ fontWeight: '600', color: '#00171F' }}>{recipe.nutritionInfo.carbs}</Text>
                  </View>
                )}
                {recipe.nutritionInfo.fat && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#667479' }}>Fat</Text>
                    <Text style={{ fontWeight: '600', color: '#00171F' }}>{recipe.nutritionInfo.fat}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ========== TABS: ĐÁNH GIÁ / BÌNH LUẬN ========== */}
          <View style={{ marginBottom: 24 }}>
            {/* Tab Headers */}
            <View style={{ flexDirection: 'row', backgroundColor: '#E8EAED', borderRadius: 12, padding: 4, marginBottom: 16 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: activeTab === 'reviews' ? '#F5A623' : 'transparent',
                  alignItems: 'center',
                }}
                onPress={() => setActiveTab('reviews')}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: activeTab === 'reviews' ? '#FFF' : '#667479' }}>
                  ⭐ Đánh giá ({reviews.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: activeTab === 'comments' ? '#003459' : 'transparent',
                  alignItems: 'center',
                }}
                onPress={() => setActiveTab('comments')}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: activeTab === 'comments' ? '#FFF' : '#667479' }}>
                  💬 Bình luận ({comments.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <>
                {/* Write Review Form */}
                {user && (
                  <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F5A623' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F5A623', marginBottom: 16 }}>📝 Viết đánh giá của bạn</Text>

                    {/* Title */}
                    <Text style={{ fontSize: 14, color: '#667479', marginBottom: 6 }}>Tiêu đề đánh giá</Text>
                    <TextInput
                      style={{ backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12 }}
                      placeholder="Nhập tiêu đề (tùy chọn)"
                      value={reviewTitle}
                      onChangeText={setReviewTitle}
                    />

                    {/* Actual Cooking Time */}
                    <Text style={{ fontSize: 14, color: '#667479', marginBottom: 6 }}>Thời gian nấu thực tế (phút)</Text>
                    <TextInput
                      style={{ backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 12 }}
                      placeholder="VD: 45"
                      value={actualCookingTime}
                      onChangeText={setActualCookingTime}
                      keyboardType="numeric"
                    />

                    {/* Review Content */}
                    <Text style={{ fontSize: 14, color: '#667479', marginBottom: 6 }}>Nội dung đánh giá *</Text>
                    <TextInput
                      style={{ backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 }}
                      placeholder="Chia sẻ trải nghiệm nấu món này..."
                      value={reviewContent}
                      onChangeText={setReviewContent}
                      multiline
                      numberOfLines={5}
                    />

                    {/* Images Picker */}
                    <Text style={{ fontSize: 14, color: '#667479', marginBottom: 6 }}>Hình ảnh (tùy chọn)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                      {reviewImages.map((uri, index) => (
                        <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                          <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                          <TouchableOpacity
                            style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => setReviewImages(reviewImages.filter((_, i) => i !== index))}
                          >
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>X</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity
                        onPress={pickImage}
                        style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#F5A623', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="camera" size={24} color="#F5A623" />
                        <Text style={{ fontSize: 10, color: '#F5A623', marginTop: 4 }}>Thêm ảnh</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={{ backgroundColor: '#F5A623', borderRadius: 8, padding: 14, alignItems: 'center', opacity: submittingReview ? 0.7 : 1 }}
                      onPress={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>Gửi đánh giá</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 30, backgroundColor: '#FFF', borderRadius: 12 }}>
                    <Ionicons name="star-outline" size={50} color="#F5A623" />
                    <Text style={{ color: '#99A1A7', marginTop: 12, fontSize: 15 }}>Chưa có đánh giá nào</Text>
                    <Text style={{ color: '#D1D5DB', marginTop: 4, fontSize: 13 }}>Hãy là người đầu tiên đánh giá!</Text>
                  </View>
                ) : (
                  reviews.map((review, index) => (
                    <View key={review.reviewId || index} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#F5A623' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Avatar uri={review.userAvatar} name={review.userName} size={44} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: '600', color: '#00171F' }}>{review.userName || 'Người dùng'}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            {review.createdAt && <Text style={{ fontSize: 12, color: '#99A1A7' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>}
                            {review.actualCookingTime && <Text style={{ fontSize: 12, color: '#F5A623', marginLeft: 10 }}>⏱ {review.actualCookingTime} phút</Text>}
                          </View>
                        </View>
                      </View>
                      {review.title && <Text style={{ fontSize: 16, fontWeight: '600', color: '#00171F', marginBottom: 8 }}>{review.title}</Text>}
                      <Text style={{ fontSize: 14, color: '#667479', lineHeight: 24 }}>{review.reviewContent || ''}</Text>
                      {review.userImages && review.userImages.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                          {review.userImages.map((img: string, i: number) => (
                            <Image key={i} source={{ uri: img }} style={{ width: 100, height: 100, borderRadius: 8, marginRight: 8 }} />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))
                )}
              </>
            )}

            {/* COMMENTS TAB */}
            {activeTab === 'comments' && (
              <>
                {/* Write Comment Form */}
                {user && (
                  <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#003459' }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#003459', marginBottom: 12 }}>
                      {replyingTo ? `💬 Trả lời ${replyingTo.userName || 'bình luận'}` : '💬 Viết bình luận'}
                    </Text>

                    {replyingTo && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E0F7FA', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                        <Ionicons name="return-down-forward" size={16} color="#006064" />
                        <Text style={{ fontStyle: 'italic', color: '#006064', flex: 1, marginLeft: 8 }} numberOfLines={1}>
                          {replyingTo.content}
                        </Text>
                        <TouchableOpacity onPress={handleCancelReply} style={{ padding: 4 }}>
                          <Ionicons name="close-circle" size={20} color="#D32F2F" />
                        </TouchableOpacity>
                      </View>
                    )}

                    <TextInput
                      style={{ backgroundColor: '#F4F6F8', borderWidth: 1, borderColor: '#E8EAED', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 }}
                      placeholder={replyingTo ? "Nhập câu trả lời..." : "Nhập bình luận của bạn..."}
                      value={commentText}
                      onChangeText={setCommentText}
                      multiline
                      numberOfLines={4}
                    />
                    <TouchableOpacity
                      style={{ backgroundColor: '#003459', borderRadius: 8, padding: 14, alignItems: 'center', opacity: submittingComment ? 0.7 : 1 }}
                      onPress={handleSubmitComment}
                      disabled={submittingComment}
                    >
                      {submittingComment ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>{replyingTo ? "Gửi trả lời" : "Gửi bình luận"}</Text>}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Comments List */}
                {comments.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 30, backgroundColor: '#FFF', borderRadius: 12 }}>
                    <Ionicons name="chatbubble-outline" size={50} color="#003459" />
                    <Text style={{ color: '#99A1A7', marginTop: 12, fontSize: 15 }}>Chưa có bình luận nào</Text>
                    <Text style={{ color: '#D1D5DB', marginTop: 4, fontSize: 13 }}>Hãy là người đầu tiên bình luận!</Text>
                  </View>
                ) : (
                  comments.map((comment, index) => (
                    <View key={comment.commentID || index} style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#003459' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <TouchableOpacity onPress={() => setSelectedOtherUserId(comment.userId)}>
                          <Avatar uri={comment.avatarUrl} name={comment.userName} size={40} style={{ marginRight: 12 }} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity onPress={() => setSelectedOtherUserId(comment.userId)}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#00171F' }}>{comment.userName || 'Người dùng'}</Text>
                          </TouchableOpacity>
                          {comment.createAt && <Text style={{ fontSize: 11, color: '#99A1A7' }}>{new Date(comment.createAt).toLocaleDateString('vi-VN')}</Text>}
                        </View>
                      </View>
                      {/* Content or Edit Form */}
                      {editingCommentId === comment.commentID ? (
                        <View style={{ marginTop: 8 }}>
                          <TextInput
                            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8, color: '#000' }}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                          />
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => setEditingCommentId(null)} style={{ marginRight: 12, padding: 4 }}>
                              <Text style={{ color: '#666', fontWeight: '600' }}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => submitEditComment(comment.commentID)} style={{ padding: 4 }}>
                              <Text style={{ color: '#F5A623', fontWeight: 'bold' }}>Lưu</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <>
                          <Text style={{ fontSize: 14, color: '#667479', lineHeight: 22 }}>{comment.content || ''}</Text>

                          {/* Action Bar */}
                          <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => handleReplyComment(comment)}>
                              <Text style={{ fontSize: 12, color: '#99A1A7', fontWeight: 'bold' }}>Trả lời</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
                              <Ionicons name="heart-outline" size={14} color="#99A1A7" />
                              <Text style={{ fontSize: 12, color: '#99A1A7', marginLeft: 4 }}>Thích</Text>
                            </TouchableOpacity>

                            {user && (user.userId === comment.userId || (recipe && recipe.userId === user.userId)) && (
                              <>
                                {user.userId === comment.userId && (
                                  <TouchableOpacity onPress={() => startEditComment(comment)} style={{ marginRight: 16 }}>
                                    <Text style={{ fontSize: 12, color: '#003459', fontWeight: 'bold' }}>Sửa</Text>
                                  </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => handleDeleteComment(comment.commentID)}>
                                  <Text style={{ fontSize: 12, color: 'red', fontWeight: 'bold' }}>Xóa</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <View style={{ marginLeft: 20, marginTop: 12, borderLeftWidth: 2, borderLeftColor: '#E8EAED', paddingLeft: 12 }}>
                          {comment.replies.map((reply: any, ri: number) => (
                            <View key={reply.commentID || ri} style={{ marginBottom: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#003459' }}>{reply.userName || 'Người dùng'}</Text>
                                {reply.createAt && <Text style={{ fontSize: 11, color: '#99A1A7', marginLeft: 8 }}>{new Date(reply.createAt).toLocaleDateString('vi-VN')}</Text>}
                              </View>
                              <Text style={{ fontSize: 13, color: '#667479' }}>{reply.content || ''}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal animationType="slide" transparent={true} visible={showReportModal} onRequestClose={() => setShowReportModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '80%' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#D32F2F', textAlign: 'center' }}>⚠️ Báo cáo bài viết</Text>

            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#003459' }}>Lý do báo cáo:</Text>
            {REASONS.map(r => (
              <TouchableOpacity key={r.id} onPress={() => setReportReason(r.id)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 4 }}>
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#003459', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  {reportReason === r.id && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#003459' }} />}
                </View>
                <Text style={{ fontSize: 16, color: '#333' }}>{r.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={{ fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 8, color: '#003459' }}>Chi tiết (Bắt buộc):</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 15, backgroundColor: '#F9F9F9' }}
              multiline placeholder="Vui lòng mô tả vấn đề gặp phải..."
              value={reportDescription} onChangeText={setReportDescription}
            />

            <View style={{ flexDirection: 'row', marginTop: 24, gap: 12 }}>
              <TouchableOpacity onPress={() => setShowReportModal(false)} style={{ flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#E0E0E0', borderRadius: 12 }}>
                <Text style={{ fontWeight: 'bold', color: '#555' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendReport} disabled={isReporting} style={{ flex: 1, padding: 14, alignItems: 'center', backgroundColor: '#D32F2F', borderRadius: 12 }}>
                {isReporting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Gửi báo cáo</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==================== MAIN APP ====================
// ==================== RECIPE FORM SCREEN ====================
function RecipeFormScreen() {
  const { user, setScreen, editingRecipe, setEditingRecipe, setSelectedRecipeId } = useAuth();
  const [title, setTitle] = useState(editingRecipe?.title || '');
  const [description, setDescription] = useState(editingRecipe?.description || '');
  const [prepTime, setPrepTime] = useState(editingRecipe?.prepTime?.toString() || '');
  const [cookTime, setCookTime] = useState(editingRecipe?.cookTime?.toString() || '');
  const [servings, setServings] = useState(editingRecipe?.servings?.toString() || '');
  const [difficulty, setDifficulty] = useState(editingRecipe?.difficultyLevel || 'MEDIUM');
  const [categoryName, setCategoryName] = useState(editingRecipe?.category || '');
  const [ingredients, setIngredients] = useState<string[]>(editingRecipe?.ingredients || ['']);
  const [nutrition, setNutrition] = useState<string[]>(editingRecipe?.nutrition || ['']);
  const [tags, setTags] = useState<string[]>(editingRecipe?.tags || ['']);
  const [instructions, setInstructions] = useState<{ text: string, imageUri: string | null, existingUrl?: string }[]>(
    editingRecipe ? editingRecipe.instructions.map((i: any) => ({ text: i.instructions || i.instruction, imageUri: i.imageUrl || null, existingUrl: i.imageUrl })) : [{ text: '', imageUri: null }]
  );
  const [mainImage, setMainImage] = useState<string | null>(editingRecipe?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(e => console.log('Error fetching categories', e));
  }, []);

  const pickImage = async (callback: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) callback(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!user || !title || !mainImage) { Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và ảnh chính'); return; }
    setLoading(true);
    try {
      const catObj = categories.find(c => c.name === categoryName);
      const request = {
        title, description, difficultyLevel: difficulty,
        prepTime: parseInt(prepTime) || 0, cookTime: parseInt(cookTime) || 0, servings: parseInt(servings) || 1,
        category: { name: categoryName || 'Khác', description: catObj?.description || '' },
        ingredients: ingredients.filter(i => i.trim()),
        nutrition: nutrition.filter(n => n.trim()),
        tags: tags.filter(t => t.trim()),
        instructions: instructions.filter(i => i.text.trim()).map(i => ({
          instruction: i.text, image: i.imageUri && !i.imageUri.startsWith('http') ? true : false, existingUrl: i.imageUri?.startsWith('http') ? i.imageUri : null
        }))
      };

      const formData = new FormData();
      const jsonUri = FileSystem.cacheDirectory + 'recipes.json';
      await FileSystem.writeAsStringAsync(jsonUri, JSON.stringify(request), { encoding: 'utf8' });
      formData.append('recipes', { uri: jsonUri, name: 'recipes.json', type: 'application/json' } as any);

      if (mainImage && !mainImage.startsWith('http')) {
        const fileName = mainImage.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        formData.append('image_primary', { uri: mainImage, name: fileName, type: match ? `image/${match[1]}` : 'image/jpeg' } as any);
      }

      instructions.forEach((inst) => {
        if (inst.imageUri && !inst.imageUri.startsWith('http')) {
          const fileName = inst.imageUri.split('/').pop() || 'step.jpg';
          const match = /\.(\w+)$/.exec(fileName);
          formData.append('image', { uri: inst.imageUri, name: fileName, type: match ? `image/${match[1]}` : 'image/jpeg' } as any);
        }
      });

      const url = editingRecipe ? `${API_URL}/user/recipes/${editingRecipe.recipeId}` : `${API_URL}/user/recipes`;
      const res = await fetch(url, {
        method: editingRecipe ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${user.token.trim().replace(/^Bearer\s+/i, '')}` },
        body: formData
      });

      if (res.ok) {
        Alert.alert('Thành công', editingRecipe ? 'Đã cập nhật công thức!' : 'Đã đăng công thức!');
        setEditingRecipe(null);
        setScreen('home');
      } else {
        const txt = await res.text();
        Alert.alert('Lỗi', 'Không thể lưu công thức: ' + txt);
      }
    } catch (e) { Alert.alert('Lỗi', 'Có lỗi xảy ra.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F6F8' }}>
      <View style={{ backgroundColor: '#003459', padding: 16, paddingTop: 48, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setScreen('home')}><Ionicons name="arrow-back" size={24} color="#FFF" /></TouchableOpacity>
        <Text style={{ fontSize: 18, color: '#FFF', fontWeight: 'bold', marginLeft: 16 }}>{editingRecipe ? 'Chỉnh sửa' : 'Đăng công thức'}</Text>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Ảnh bìa mòn ăn</Text>
          <TouchableOpacity onPress={() => pickImage(setMainImage)} style={{ height: 200, backgroundColor: '#E0E0E0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            {mainImage ? <Image source={{ uri: mainImage }} style={{ width: '100%', height: '100%', borderRadius: 8 }} /> : <Ionicons name="camera" size={48} color="#999" />}
          </TouchableOpacity>

          <TextInput placeholder="Tên món ăn" value={title} onChangeText={setTitle} style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 12 }} />
          <TextInput placeholder="Mô tả" value={description} onChangeText={setDescription} multiline style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 12, height: 80 }} />

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput placeholder="Chuẩn bị (phút)" value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" style={{ flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8 }} />
            <TextInput placeholder="Nấu (phút)" value={cookTime} onChangeText={setCookTime} keyboardType="numeric" style={{ flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8 }} />
            <TextInput placeholder="Khẩu phần (người)" value={servings} onChangeText={setServings} keyboardType="numeric" style={{ flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8 }} />
          </View>

          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Độ khó</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['EASY', 'MEDIUM', 'HARD'].map(d => (
              <TouchableOpacity key={d} onPress={() => setDifficulty(d)} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: difficulty === d ? '#003459' : '#FFF', alignItems: 'center' }}>
                <Text style={{ color: difficulty === d ? '#FFF' : '#333' }}>{d === 'EASY' ? 'Dễ' : d === 'MEDIUM' ? 'Vừa' : 'Khó'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Danh mục món ăn</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCategoryName(cat.name)}
                style={{
                  backgroundColor: categoryName === cat.name ? '#003459' : '#FFF',
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: categoryName === cat.name ? '#003459' : '#DDD'
                }}>
                <Text style={{ color: categoryName === cat.name ? '#FFF' : '#333', fontWeight: categoryName === cat.name ? 'bold' : 'normal' }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Nguyên liệu</Text>
          {ingredients.map((ing, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput placeholder={`Nguyên liệu ${i + 1}`} value={ing} onChangeText={t => { const n = [...ingredients]; n[i] = t; setIngredients(n); }} style={{ flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 8 }} />
              <TouchableOpacity onPress={() => { const n = [...ingredients]; n.splice(i, 1); setIngredients(n); }} style={{ padding: 10 }}><Ionicons name="trash" size={20} color="red" /></TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={() => setIngredients([...ingredients, ''])} style={{ alignSelf: 'center', padding: 8 }}><Ionicons name="add-circle" size={32} color="#003459" /></TouchableOpacity>

          <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Giá trị dinh dưỡng</Text>
          {nutrition.map((nut, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
              <TextInput placeholder={`Dinh dưỡng ${i + 1}`} value={nut} onChangeText={t => { const n = [...nutrition]; n[i] = t; setNutrition(n); }} style={{ flex: 1, backgroundColor: '#FFF', padding: 10, borderRadius: 8 }} />
              <TouchableOpacity onPress={() => { const n = [...nutrition]; n.splice(i, 1); setNutrition(n); }} style={{ padding: 10 }}><Ionicons name="trash" size={20} color="red" /></TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={() => setNutrition([...nutrition, ''])} style={{ alignSelf: 'center', padding: 8 }}><Ionicons name="add-circle" size={32} color="#003459" /></TouchableOpacity>

          <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Thẻ Tags</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tags.map((tag, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingLeft: 12, paddingRight: 4, paddingVertical: 4 }}>
                <TextInput value={tag} onChangeText={t => { const n = [...tags]; n[i] = t; setTags(n); }} style={{ minWidth: 60 }} placeholder="Tag..." />
                <TouchableOpacity onPress={() => { const n = [...tags]; n.splice(i, 1); setTags(n); }} style={{ padding: 4 }}><Ionicons name="close-circle" size={20} color="#999" /></TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setTags([...tags, ''])} style={{ padding: 6, backgroundColor: '#E0E0E0', borderRadius: 20 }}><Ionicons name="add" size={24} color="#333" /></TouchableOpacity>
          </View>

          <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Các bước thực hiện</Text>
          {instructions.map((inst, i) => (
            <View key={i} style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: 'bold' }}>Bước {i + 1}</Text><TouchableOpacity onPress={() => { const n = [...instructions]; n.splice(i, 1); setInstructions(n); }}><Ionicons name="trash" size={20} color="red" /></TouchableOpacity></View>
              <TextInput placeholder="Mô tả bước này..." value={inst.text} onChangeText={t => { const n = [...instructions]; n[i].text = t; setInstructions(n); }} multiline style={{ backgroundColor: '#F4F6F8', padding: 8, borderRadius: 4, marginTop: 8, height: 60 }} />
              <TouchableOpacity onPress={() => pickImage(uri => { const n = [...instructions]; n[i].imageUri = uri; setInstructions(n); })} style={{ marginTop: 8, height: 100, backgroundColor: '#EEE', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
                {inst.imageUri ? <Image source={{ uri: inst.imageUri }} style={{ width: '100%', height: '100%' }} /> : <Ionicons name="image" size={24} color="#999" />}
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={() => setInstructions([...instructions, { text: '', imageUri: null }])} style={{ alignSelf: 'center', padding: 8 }}><Ionicons name="add-circle" size={32} color="#003459" /></TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ backgroundColor: '#003459', padding: 16, borderRadius: 8, marginTop: 24, alignItems: 'center' }}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>{editingRecipe ? 'Cập nhật' : 'Đăng bài'}</Text>}
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ==================== MAIN APP ====================
function MainApp() {
  const { screen, setScreen, selectedRecipeId, selectedOtherUserId, user, setSelectedRecipeId, setEditingRecipe, editingRecipe } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { from: 'user', text: msg }]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { from: 'bot', text: data.response || '', recipes: data.recipes || [] }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { from: 'bot', text: 'Lỗi kết nối server.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Priority Screens
  if (selectedOtherUserId) return <OtherProfileScreen />;
  if (selectedRecipeId) return <RecipeDetailScreen />;

  return (
    <View style={{ flex: 1 }}>
      {screen === 'home' && <HomeScreen />}
      {screen === 'profile' && <ProfileScreen />}
      {screen === 'forgot' && <ForgotPasswordScreen />}
      {screen === 'recipe-form' && <RecipeFormScreen />}

      {screen !== 'forgot' && screen !== 'recipe-form' && (
        <>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#E8EAED', alignItems: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }} onPress={() => setScreen('home')}>
              <Ionicons name={screen === 'home' ? 'home' : 'home-outline'} size={24} color={screen === 'home' ? '#003459' : '#99A1A7'} />
              <Text style={{ fontSize: 12, color: screen === 'home' ? '#003459' : '#99A1A7', marginTop: 4 }}>Trang chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ top: -24, justifyContent: 'center', alignItems: 'center' }} onPress={() => { setEditingRecipe(null); setScreen('recipe-form'); }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#003459', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', elevation: 5 }}>
                <Ionicons name="add" size={32} color="#FFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }} onPress={() => setScreen('profile')}>
              <Ionicons name={screen === 'profile' ? 'person' : 'person-outline'} size={24} color={screen === 'profile' ? '#003459' : '#99A1A7'} />
              <Text style={{ fontSize: 12, color: screen === 'profile' ? '#003459' : '#99A1A7', marginTop: 4 }}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ position: 'absolute', bottom: 80, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF9800', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 8 }}
            onPress={() => setShowChat(true)}
          >
            <Ionicons name="chatbubbles" size={30} color="#FFF" />
          </TouchableOpacity>

          <Modal visible={showChat} animationType="slide" transparent={true} onRequestClose={() => setShowChat(false)}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: '#F4F6F8', height: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FF9800' }}>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>Bếp Việt AI</Text>
                  <TouchableOpacity onPress={() => setShowChat(false)}>
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  ref={flatListRef}
                  data={chatMessages}
                  keyExtractor={(_, i) => i.toString()}
                  contentContainerStyle={{ padding: 16, gap: 12 }}
                  onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  renderItem={({ item }) => (
                    <View style={{ alignSelf: item.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                      {item.text && (
                        <View style={{ backgroundColor: item.from === 'user' ? '#FFE0B2' : '#FFF', padding: 12, borderRadius: 12, marginBottom: 4 }}>
                          <Text style={{ color: '#000', fontSize: 15 }}>{item.text}</Text>
                        </View>
                      )}
                      {item.recipes && item.recipes.map((r: any) => (
                        <TouchableOpacity key={r.recipeId} style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 8, borderRadius: 8, marginTop: 4, elevation: 2 }} onPress={() => { setSelectedRecipeId(r.recipeId); setShowChat(false); }}>
                          <Image source={{ uri: r.imageUrl }} style={{ width: 60, height: 60, borderRadius: 8 }} />
                          <View style={{ marginLeft: 8, flex: 1 }}>
                            <Text numberOfLines={2} style={{ fontWeight: 'bold', fontSize: 14 }}>{r.title}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                              <Ionicons name="heart" size={14} color="red" />
                              <Text style={{ fontSize: 12, marginLeft: 4, color: '#666' }}>{r.likeCount}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  ListEmptyComponent={<View style={{ alignItems: 'center', marginTop: 50 }}><Text style={{ color: '#999' }}>Hỏi tôi bất cứ điều gì về nấu ăn!</Text></View>}
                />

                <View style={{ flexDirection: 'row', padding: 12, backgroundColor: '#FFF', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE' }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, marginRight: 12, fontSize: 16 }}
                    placeholder="Nhập câu hỏi..."
                    value={chatInput}
                    onChangeText={setChatInput}
                    onSubmitEditing={sendMessage}
                  />
                  <TouchableOpacity onPress={sendMessage} disabled={isChatLoading} style={{ padding: 8 }}>
                    <Ionicons name="send" size={28} color={isChatLoading ? '#CCC' : '#FF9800'} />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </>
      )}
    </View>
  );
}

// ==================== APP COMPONENT ====================
// ==================== APP COMPONENT ====================
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [screen, setScreen] = useState('login');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<number | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = React.useRef<Client | null>(null);

  useEffect(() => { loadAuth(); }, []);

  // WebSocket Connection
  useEffect(() => {
    if (user?.token) {
      connectWebSocket();
      loadNotifications();
    } else {
      disconnectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [user]);

  const connectWebSocket = () => {
    if (stompClientRef.current && stompClientRef.current.active) return;
    const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
    // Use replace to getting IP Address from API_URL
    const wsUrl = API_URL.replace('http', 'ws').replace('/api', '/ws/websocket');

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: { Authorization: `Bearer ${rawToken}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      onConnect: () => {
        console.log('STOMP: Connected');
        client.subscribe('/user/queue/notifications', (message) => {
          if (message.body) {
            const notif = JSON.parse(message.body);
            // Add new notification to top
            setNotifications(prev => {
              if (prev.find(n => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });
            if (!notif.isRead) setUnreadCount(prev => prev + 1);
          }
        });
      },
      onStompError: (frame) => {
        console.log('STOMP Error:', frame.headers['message']);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  const loadNotifications = async () => {
    if (!user?.token) return;
    try {
      const rawToken = user.token.trim().replace(/^Bearer\s+/i, '');
      const res = await fetch(`${API_URL}/user/notifications`, { headers: { 'Authorization': `Bearer ${rawToken}` } });
      if (res.ok) {
        const data = await res.json();
        const sorted = Array.isArray(data) ? data.sort((a: any, b: any) => b.id - a.id) : [];
        setNotifications(sorted);
        setUnreadCount(sorted.filter((n: any) => !n.isRead).length);
      }
    } catch (e) { console.log(e); }
  };

  const handleNotificationRead = async (id: number, recipeId?: number, userId?: number) => {
    setNotifications(prev => {
      const exists = prev.find(n => n.id === id);
      if (exists && !exists.isRead) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.map(n => n.id === id ? { ...n, isRead: true } : n);
    });

    if (recipeId) setSelectedRecipeId(recipeId);
    else if (userId) setSelectedOtherUserId(userId);

    const rawToken = user?.token ? user.token.trim().replace(/^Bearer\s+/i, '') : '';
    fetch(`${API_URL}/user/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${rawToken}` }
    });
  };

  const loadAuth = async () => {
    try {
      const stored = await SecureStore.getItemAsync('user');
      if (stored) {
        setUser(JSON.parse(stored));
        setScreen('home');
      }
    } catch (e) { console.log(e); }
    setIsLoading(false);
  };

  const login = async (userName: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, passwordHash: password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      await SecureStore.setItemAsync('user', JSON.stringify(data));
      setUser(data);
      setScreen('home');
      return true;
    } catch (e) { return false; }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('user');
    disconnectWebSocket();
    setUser(null);
    setSelectedRecipeId(null);
    setScreen('login');
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#003459' }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthContext.Provider value={{
        user, isLoading, login, logout, screen, setScreen,
        selectedRecipeId, setSelectedRecipeId,
        selectedOtherUserId, setSelectedOtherUserId,
        notifications, unreadCount, loadNotifications, handleNotificationRead,
        editingRecipe, setEditingRecipe
      }}>
        {user ? <MainApp /> : (
          screen === 'login' ? <LoginScreen /> :
            screen === 'register' ? <RegisterScreen /> :
              screen === 'forgot' ? <ForgotPasswordScreen /> : <LoginScreen />
        )}
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#003459' },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  authForm: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' },
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
  linkText: { color: '#003459', fontSize: 14, alignSelf: 'flex-end', marginBottom: 24 },
  linkTextBold: { color: '#003459', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', marginTop: 24 },
  grayText: { color: '#667479', fontSize: 14 },
});
