"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Recipe } from "@/app/types/recipe";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategory = async () => {
    try {
      const res = await fetch(`/api/proxy/categories/${id}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

      const data = await res.json();
      console.log("📥 Category detail:", data);

      // ❗ Backend trả về: { categoryId, name, description, imageUrl, recipes: [] }
      setCategory(data);
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error("❌ Load category error:", err);
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [id]);

  if (loading) return <p className="text-center py-10">⏳ Đang tải...</p>;
  if (error)
    return (
      <p className="text-center text-red-600 py-10">{error}</p>
    );
  if (!category)
    return <p className="text-center py-10">Không tìm thấy danh mục.</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-3">{category.name}</h1>
      <p className="text-gray-600 mb-6">{category.description}</p>

      {/* RECIPES */}
      {recipes.length === 0 ? (
        <p className="text-gray-500">
          Danh mục này chưa có công thức nào.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {recipes.map((r: Recipe) => (
            <Link
              key={r.recipeId}
              href={`/recipes/${r.recipeId}`}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="h-40 bg-gray-100">
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    className="w-full h-full object-cover"
                    alt={r.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Không có ảnh
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-3">
                <h3 className="font-semibold text-lg">{r.title}</h3>

                <p className="text-sm text-gray-600 mt-1">
                  {r.userName || "Ẩn danh"}
                </p>

                <p className="text-sm text-gray-500 flex gap-3 mt-1">
                  ❤️ {r.likeCount} • 👁 {r.viewCount}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Độ khó: {r.difficultyLevel || "Không rõ"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
