"use client";

import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { RecipeDetail } from "@/app/types/recipeDetail";

export default function Section2Recipe({ recipeId }: { recipeId: number }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Fetch chi tiết công thức từ backend
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`/api/proxy/recipes/${recipeId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Không thể tải công thức (${res.status})`);
        const data: RecipeDetail = await res.json();
        console.log("DETAIL DATA:", data);
        setRecipe(data);
      } catch (err: any) {
        console.error("❌ Lỗi tải công thức:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) fetchRecipe();
  }, [recipeId]);

  // 🕓 Loading
  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Đang tải chi tiết công thức #{recipeId}...
      </p>
    );

  // ❌ Error / Không có dữ liệu
  if (error || !recipe)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không thể tải công thức #{recipeId}.
      </p>
    );

  const { description, imageUrl } = recipe;

  return (
    <section className="flex flex-col items-center w-full mt-10">
      {/* 📝 Mô tả món ăn */}
      <p className="text-gray-700 text-[15px] max-w-3xl text-center mb-6 leading-relaxed">
        {description || "Không có mô tả cho công thức này."}
      </p>

      {/* 🖼 Ảnh chính của món ăn */}
      <div className="relative w-full max-w-5xl rounded-xl overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt={recipe.title}
          className="w-full h-auto object-cover rounded-xl"
        />

        {/* 🎬 Nếu sau này có video, sẽ bật nút play */}
        {"videoUrl" in recipe && (recipe as any).videoUrl && (
          <button
            className="absolute inset-0 flex items-center justify-center group"
            onClick={() => console.log("▶️ Play video:", (recipe as any).videoUrl)}
          >
            <div className="bg-white/80 rounded-full p-5 group-hover:scale-110 transition">
              <FaPlay className="text-gray-900 text-2xl" />
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
