import RecipeDetailClient from "./RecipeDetailClient";

export default async function RecipeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params; // ⭐ BẮT BUỘC
  const recipeId = Number(id);

  if (isNaN(recipeId)) {
    return (
      <section className="container mx-auto px-4 py-10 text-center text-gray-500">
        ❌ ID công thức không hợp lệ.
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <RecipeDetailClient recipeId={recipeId} />
    </section>
  );
}
