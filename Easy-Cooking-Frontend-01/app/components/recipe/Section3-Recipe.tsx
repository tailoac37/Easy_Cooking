"use client";

import { useState, useEffect } from "react";
import { RecipeDetail } from "@/app/types/recipeDetail";

export default function Section3Recipe({ recipeId }: { recipeId: number }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Fetch dữ liệu công thức thật từ backend
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
        setRecipe(data);
      } catch (err: any) {
        console.error("❌ Lỗi tải nguyên liệu:", err);
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
        Đang tải nguyên liệu cho công thức #{recipeId}...
      </p>
    );

  // ❌ Lỗi hoặc không có dữ liệu
  if (error || !recipe)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không thể tải nguyên liệu cho công thức #{recipeId}.
      </p>
    );

  const { ingredients = [], prepTime, cookTime } = recipe;

  // 🔹 Nếu không có nguyên liệu
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Không có dữ liệu nguyên liệu cho công thức này.
      </p>
    );
  }

  const toggleCheck = (item: string) => {
    setChecked((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  // ✅ Render UI
  return (
    <section className="space-y-8 mt-12">
      {/* === Info row === */}
      <div className="flex flex-wrap items-center gap-6 border-b border-gray-200 pb-4 text-[13px] text-gray-700">
        <div>
          <p className="font-semibold uppercase tracking-wide">Prep Time</p>
          <p>{prepTime ? `${prepTime} phút` : "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide">Cook Time</p>
          <p>{cookTime ? `${cookTime} phút` : "N/A"}</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide">Servings</p>
          <p>1-2 người</p>
        </div>
        <button
          onClick={() => window.print()}
          className="ml-auto text-gray-500 hover:text-orange-500 transition text-sm flex items-center gap-1"
        >
          🖨️ Print
        </button>
      </div>

      {/* === Ingredients === */}
      <h2 className="text-2xl font-bold mb-4">Nguyên liệu</h2>

      <ul className="space-y-3">
        {ingredients.map((item: string, i: number) => (
          <li
            key={i}
            onClick={() => toggleCheck(item)}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <span
              className={`w-5 h-5 flex items-center justify-center border rounded-full transition ${
                checked.includes(item)
                  ? "border-orange-500 text-orange-500"
                  : "border-gray-400"
              }`}
            >
              {checked.includes(item) && (
                <span className="text-[12px]">✔</span>
              )}
            </span>
            <span
              className={`text-[15px] transition ${
                checked.includes(item)
                  ? "line-through text-gray-400"
                  : "text-gray-800"
              }`}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
