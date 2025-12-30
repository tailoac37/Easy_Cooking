"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { RecipeDetail } from "@/app/types/recipeDetail";

export default function Section4Recipe({ recipeId }: { recipeId: number }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🟢 Fetch dữ liệu thật từ backend
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

        if (!res.ok)
          throw new Error(`Không thể tải hướng dẫn (${res.status})`);

        const data: RecipeDetail = await res.json();
        setRecipe(data);
      } catch (err: any) {
        console.error("❌ Lỗi tải hướng dẫn:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) fetchRecipe();
  }, [recipeId]);

  // 🕓 Trạng thái loading
  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Đang tải hướng dẫn nấu ăn #{recipeId}...
      </p>
    );

  // ❌ Lỗi hoặc không có dữ liệu
  if (error || !recipe)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không thể tải hướng dẫn cho công thức #{recipeId}.
      </p>
    );

  const { instructions } = recipe;

  // ⚠️ Không có bước nấu
  if (!instructions || instructions.length === 0)
    return (
      <p className="text-center text-gray-500 mt-10">
        Công thức này chưa có hướng dẫn cụ thể.
      </p>
    );

  // ✅ Render UI
  return (
    <section className="mt-12 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-200 pb-2 text-gray-900 text-center">
        Các bước thực hiện
      </h2>

      <div className="space-y-10">
        {instructions.map((step, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-6 items-start border-b border-gray-100 pb-6"
          >
            {/* Số thứ tự bước */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-500 text-white font-bold rounded-full shadow-sm">
              {index + 1}
            </div>

            {/* Ảnh + mô tả */}
            <div className="flex-1">
              {step.imageUrl && (
                <div className="w-full md:w-[420px] rounded-xl overflow-hidden mb-3">
                  <Image
                    src={step.imageUrl}
                    alt={`Bước ${index + 1}`}
                    width={420}
                    height={280}
                    className="rounded-xl object-cover shadow-sm"
                  />
                </div>
              )}
              <p className="text-gray-700 text-[15px] leading-relaxed">
                {step.instructions
                  ? step.instructions
                  : `Thực hiện bước ${index + 1} theo hình minh họa.`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
