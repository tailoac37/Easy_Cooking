import { Recipe } from "./recipe";

export interface CategoryRecipesResponse {
  categoryId: number;
  categoryName: string;
  recipes: Recipe[];
}
