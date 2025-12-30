export interface RecipeReviewDTO {
    reviewId: number;
    recipeId: number;
    recipeName: string;
    userId: number;
    userName: string;
    userAvatar: string;
    title: string;
    reviewContent: string;
    userImages: string[];
    actualCookingTime: number;
    createdAt: string;
    updatedAt: string;
    isChange: boolean;
    isDelete: boolean;
}

export interface UserReviewWithRecipe {
    review: RecipeReviewDTO;
    recipeId: number;
    recipeTitle: string;
    recipeImageUrl: string;
    recipeDescription: string;
    category: string;
    difficultyLevel: string;
    prepTime: number;
    cookTime: number;
}
