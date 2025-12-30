"use client";

import Section1Recipe from "@/app/components/recipe/Section1-Recipe";
import Section2Recipe from "@/app/components/recipe/Section2-Recipe";
import RecipeDetailBody from "@/app/components/recipe/RecipeDetailBody";
import Section8Recipe from "@/app/components/recipe/Section8-Recipe";
import Section9RecipeComments from "@/app/components/recipe/Section9-Recipe";
import Section10RecipeReviews from "@/app/components/recipe/Section10-Recipe";

export default function RecipeDetailClient({ recipeId }: { recipeId: number }) {

  return (
    <>
      <Section1Recipe recipeId={recipeId} />
      <Section2Recipe recipeId={recipeId} />
      <RecipeDetailBody recipeId={recipeId} />
      <Section8Recipe />
      <Section9RecipeComments recipeId={recipeId} />
      <Section10RecipeReviews recipeId={recipeId} />
    </>
  );
}
