import Section3Recipe from "./Section3-Recipe";
import Section4Recipe from "./Section4-Recipe";
import Section5Recipe from "./Section5-Recipe";
import Section6Recipe from "./Section6-Recipe";
import Section7Recipe from "./Section7-Recipe";

export default function RecipeDetailBody({ recipeId }: { recipeId: number }) {
  if (isNaN(recipeId)) {
    return (
      <section className="container mx-auto px-4 py-10 text-center text-gray-500">
        ❌ ID công thức không hợp lệ.
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
      {/* === LEFT: Ingredients + Steps === */}
      <div className="space-y-10">
        <Section3Recipe recipeId={recipeId} />
        <Section4Recipe recipeId={recipeId} />
      </div>

      {/* === RIGHT: Nutrition + Comments + More === */}
      <div className="flex flex-col gap-8 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8">
        <Section5Recipe recipeId={recipeId} />
        {/* <Section6Recipe recipeId={recipeId} /> */}
        <Section7Recipe />
      </div>
    </section>
  );
}
