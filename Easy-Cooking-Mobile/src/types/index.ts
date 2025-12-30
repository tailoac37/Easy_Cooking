export interface User {
    userId: number;
    userName: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    role: 'USER' | 'ADMIN';
    token: string;
    totalRecipes?: number;
    totalLike?: number;
    totalView?: number;
    followerCount?: number;
}

export interface Recipe {
    recipeId: number;
    title: string;
    description: string;
    imageUrl?: string;
    cookTime?: number;
    prepTime?: number;
    servings?: number;
    difficulty?: string;
    viewCount: number;
    likeCount: number;
    createdAt: string;
    author?: {
        userId: number;
        userName: string;
        fullName: string;
        avatarUrl?: string;
    };
    category?: {
        categoryId: number;
        name: string;
    };
    ingredients?: string[];
    instructions?: Instruction[];
}

export interface Instruction {
    stepNumber: number;
    description: string;
    imageUrl?: string;
}

export interface Category {
    categoryId: number;
    name: string;
    imageUrl?: string;
    recipeCount?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
