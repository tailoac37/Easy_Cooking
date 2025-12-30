export interface Recipe {
  recipeId: number;
  title: string;
  description: string;
  category: string;
  difficultyLevel: string;
  prepTime: number;
  cookTime: number;
  viewCount: number;
  likeCount: number;
  userName: string;
  avatarUrl: string;
  imageUrl: string;
  ingredients: string[];
  tags: string[];
  createAt: string;
  updateAt: string;
  change: boolean;
  like: boolean;
}
