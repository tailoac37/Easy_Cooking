export interface RecipeDetail {
  recipeId: number;
  prepTime: number;
  cookTime: number;
  viewCount: number;
  likeCount: number;
  userId: number
  userName: string; // người đăng
  category: string;
  title: string;
  description: string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD"; // hoặc string nếu backend không cố định
  imageUrl: string;
  avatarUrl: string | null; // ảnh đại diện người đăng (có thể null)
  ingredients: string[];
  nutrition: string[];
  instructions: {
    imageUrl: string;
    instructions: string;
  }[];

  tags: string[];

  commentsDTO: CommentDTO[];

  createAt: string;
  updateAt: string;
  change: boolean;
  like: boolean;
  favorite: boolean;
}

// Nếu backend có cấu trúc commentsDTO (hiện đang rỗng []),
// ông có thể thêm phần này để sau dễ mở rộng:
export interface CommentDTO {
  commentId?: number;
  userName?: string;
  avatarUrl?: string;
  content?: string;
  createdAt?: string;
}
