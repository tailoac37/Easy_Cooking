import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
    userId: number;
    userName: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (userName: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://192.168.57.154:8081/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedUser = await SecureStore.getItemAsync('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.log('Error loading auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (userName: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, passwordHash: password }),
            });

            if (!response.ok) return false;

            const userData = await response.json();
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.log('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
