export interface MyRecipe {
  recipeId: number;
  prepTime: number;
  cookTime: number;
  viewCount: number;
  likeCount: number;

  userName: string;
  category: string | null;
  title: string;
  description: string;
  difficultyLevel: string | null;

  imageUrl: string | null;
  avatarUrl: string;     // backend trả avatarUrl chứ không phải avatar_url

  ingredients: string[] | null; 
  tags: string[];

  createAt: string;
  updateAt: string;

  change: boolean;
  like: boolean;         // backend trả "like"
}

export interface UserProfile {
  userId: number;
  userName: string;
  fullName: string | null;
  email: string;
  avatarUrl: string;
  bio: string;

  role: string;
  active: boolean;

  createdAt: string;
  updateAt: string;

  totalRecipes: number;
  followerCount: number;
  followingCount: number;    // backend trả tên sai → phải để vậy
  totalLike: number;
  totalView: number;

  pendingRecipes: number;
  approvedRecipes: number;
  rejectedRecipes: number;

  favorites: any[];

  following: boolean;       
  follower: boolean;        

  myRecipe: MyRecipe[];
}
