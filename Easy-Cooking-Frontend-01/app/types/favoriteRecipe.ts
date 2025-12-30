export interface FavoriteRecipe {
  recipeId: number;
  prepTime: number;
  cookTime: number;
  viewCount: number;
  likeCount: number;

  userName: string;
  category: string;

  title: string;
  description: string;

  difficultyLevel: "EASY" | "MEDIUM" | "HARD";

  imageUrl: string;
  avatarUrl: string;

  ingredients: string[];

  createAt: string;  // yyyy-MM-dd
  updateAt: string;  // yyyy-MM-dd

  tags: string[];

  change: boolean;
  like: boolean;
}
