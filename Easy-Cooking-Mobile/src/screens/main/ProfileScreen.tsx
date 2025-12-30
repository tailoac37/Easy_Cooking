import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: logout },
        ]);
    };

    const menuItems = [
        { icon: 'person-outline', label: 'Chỉnh sửa hồ sơ' },
        { icon: 'heart-outline', label: 'Yêu thích' },
        { icon: 'book-outline', label: 'Công thức của tôi' },
        { icon: 'lock-closed-outline', label: 'Đổi mật khẩu', onPress: () => navigation.navigate('ForgotPassword') },
        { icon: 'settings-outline', label: 'Cài đặt' },
    ];

    const getInitials = () => {
        if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
        if (user?.userName) return user.userName.charAt(0).toUpperCase();
        return 'U';
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user?.fullName || user?.userName || 'Người dùng'}</Text>
                <Text style={styles.username}>@{user?.userName}</Text>
            </View>

            {/* Menu */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress || (() => Alert.alert('Thông báo', `${item.label} đang phát triển`))}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name={item.icon as any} size={22} color="#003459" style={styles.menuIcon} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#99A1A7" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={22} color="#EF5350" style={styles.logoutIcon} />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F8' },
    header: {
        backgroundColor: '#003459',
        paddingTop: 60,
        paddingBottom: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    avatarContainer: { marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFF' },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F5A623',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    username: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    menuContainer: {
        backgroundColor: '#FFF',
        marginHorizontal: 24,
        marginTop: -16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8EAED',
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIcon: { marginRight: 16 },
    menuLabel: { fontSize: 16, color: '#00171F' },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 24,
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF5350',
    },
    logoutIcon: { marginRight: 8 },
    logoutText: { fontSize: 16, color: '#EF5350', fontWeight: '600' },
});
