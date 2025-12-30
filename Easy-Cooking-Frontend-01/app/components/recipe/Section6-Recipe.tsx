"use client";

import Link from "next/link";
import Image from "next/image";

export default function Section6Recipe({ recipeId = 1 }: { recipeId?: number }) {
  // 🔹 Lấy công thức hiện tại (theo ID)
  const recipe = db.recipes.find((r) => r.recipe_id === recipeId);

  if (!recipe) {
    return <p className="text-gray-500 text-sm">Không tìm thấy công thức.</p>;
  }

  // 🔹 Lấy các công thức khác (ngoại trừ công thức hiện tại)
  const freshRecipes = db.recipes
    .filter((r) => r.recipe_id !== recipeId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4); // 🔸 Giới hạn hiển thị (4 công thức mới nhất)

  if (freshRecipes.length === 0) {
    return <p className="text-gray-500 text-sm">Không có công thức mới.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Fresh Recipes</h2>

      <div className="flex flex-col gap-4">
        {freshRecipes.map((r) => (
          <Link
            key={r.recipe_id}
            href={`/recipes/${r.recipe_id}`}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition group"
          >
            {/* Ảnh thumbnail */}
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={r.image_url}
                alt={r.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Thông tin công thức */}
            <div className="flex flex-col">
              {/* Rating sao */}
              <div className="flex text-orange-500 text-sm mb-1">
                {Array(r.stats.rating)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i}>★</span>
                  ))}
              </div>

              {/* Tên công thức */}
              <p className="font-medium text-gray-800 leading-tight line-clamp-2">
                {r.title}
              </p>

              {/* Tác giả (nếu muốn hiển thị thêm) */}
              <span className="text-xs text-gray-500">
                👨‍🍳 by User #{r.author_id}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
