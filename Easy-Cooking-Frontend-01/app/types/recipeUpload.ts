// /types/recipeUpload.ts

export interface Instruction {
  instruction: string;
  files?: File[];        // DANH SÁCH file ảnh
  previews?: string[];   // DANH SÁCH preview
}

export interface RecipeForm {
  title: string;
  description: string;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";

  prepTime: string;
  cookTime: string;
  servings: string;

  category: string;

  ingredients: string[];
  nutrition: string[];

  instructions: Instruction[];

  tags: string[];

  image_primary: File | null;
}
