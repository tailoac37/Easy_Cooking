import { API_URL } from '../config/api';
import { User, Recipe, Category, ApiResponse } from '../types';

// Auth Services
export const authService = {
    login: async (userName: string, password: string): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, passwordHash: password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đăng nhập thất bại');
        }

        return response.json();
    },

    register: async (data: {
        userName: string;
        passwordHash: string;
        fullName: string;
        email: string;
    }): Promise<User> => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đăng ký thất bại');
        }

        return response.json();
    },

    sendOtp: async (email: string): Promise<ApiResponse<null>> => {
        const response = await fetch(`${API_URL}/auth/sendOTP?email=${encodeURIComponent(email)}`, {
            method: 'POST',
        });
        return response.json();
    },

    verifyOtp: async (email: string, otp: string): Promise<ApiResponse<null>> => {
        const response = await fetch(
            `${API_URL}/auth/verifyOTP?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
            { method: 'POST' }
        );
        return response.json();
    },

    changePassword: async (email: string, newPassword: string): Promise<ApiResponse<null>> => {
        const response = await fetch(
            `${API_URL}/auth/changePassword?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
            { method: 'POST' }
        );
        return response.json();
    },
};

// Recipe Services
export const recipeService = {
    getAll: async (page = 0, size = 10): Promise<Recipe[]> => {
        const response = await fetch(`${API_URL}/recipe?page=${page}&size=${size}`);
        if (!response.ok) throw new Error('Không thể tải công thức');
        const data = await response.json();
        return data.content || data;
    },

    getById: async (id: number): Promise<Recipe> => {
        const response = await fetch(`${API_URL}/recipe/${id}`);
        if (!response.ok) throw new Error('Không tìm thấy công thức');
        return response.json();
    },

    getPopular: async (): Promise<Recipe[]> => {
        const response = await fetch(`${API_URL}/recipe/popular`);
        if (!response.ok) throw new Error('Không thể tải công thức phổ biến');
        return response.json();
    },

    getTrending: async (): Promise<Recipe[]> => {
        const response = await fetch(`${API_URL}/recipe/trending`);
        if (!response.ok) throw new Error('Không thể tải công thức trending');
        return response.json();
    },

    search: async (keyword: string): Promise<Recipe[]> => {
        const response = await fetch(`${API_URL}/recipe/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error('Tìm kiếm thất bại');
        return response.json();
    },

    getByCategory: async (categoryId: number): Promise<Recipe[]> => {
        const response = await fetch(`${API_URL}/recipe/category/${categoryId}`);
        if (!response.ok) throw new Error('Không thể tải công thức');
        return response.json();
    },
};

// Category Services
export const categoryService = {
    getAll: async (): Promise<Category[]> => {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Không thể tải danh mục');
        return response.json();
    },
};

// User Services
export const userService = {
    getMe: async (token: string): Promise<User> => {
        const response = await fetch(`${API_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Không thể tải thông tin người dùng');
        return response.json();
    },

    getProfile: async (userId: number): Promise<User> => {
        const response = await fetch(`${API_URL}/user/${userId}`);
        if (!response.ok) throw new Error('Không tìm thấy người dùng');
        return response.json();
    },
};
