"use client";

import { useEffect, useState } from "react";
import { RecipeDetail } from "@/app/types/recipeDetail";

export default function Section5Recipe({ recipeId }: { recipeId: number }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Fetch dữ liệu từ backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(`/api/proxy/recipes/${recipeId}`, {
          headers: token
            ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` }
            : {},
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Không thể tải dữ liệu từ server");

        const data: RecipeDetail = await res.json();
        setRecipe(data);
      } catch (err: any) {
        console.error("❌ Lỗi load nutrition:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [recipeId]);

  // LOADING UI
  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Đang tải dữ liệu dinh dưỡng #{recipeId}...
      </p>
    );

  // LỖI
  if (error || !recipe)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không thể tải dữ liệu dinh dưỡng.
      </p>
    );

  const nutritionList = recipe.nutrition || [];

  if (!Array.isArray(nutritionList) || nutritionList.length === 0)
    return (
      <p className="text-center text-gray-500 mt-10">
        Công thức này chưa có thông tin dinh dưỡng.
      </p>
    );

  // Tách "Protein: 20g" → { name: "Protein", value: "20g" }
  const parseNutrition = (row: string) => {
    const parts = row.split(":");
    if (parts.length >= 2) {
      return {
        name: parts[0].trim(),
        value: parts.slice(1).join(":").trim(),
      };
    }
    return { name: row, value: "" };
  };

  const parsed = nutritionList.map(parseNutrition);

  return (
    <section className="mt-12 bg-gray-50 rounded-xl shadow-sm p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">
        Nutrition Facts
      </h2>

      <table className="w-full text-sm text-gray-700">
        <tbody>
          {parsed.map((fact, i) => (
            <tr
              key={i}
              className="border-t border-gray-200 hover:bg-gray-100 transition"
            >
              <td className="py-2 font-medium">{fact.name}</td>
              <td className="py-2 text-right font-semibold text-gray-900">
                {fact.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
