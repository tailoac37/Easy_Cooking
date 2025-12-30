"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RecipeItem } from "../item/RecipeItem";

interface Recipe {
  recipeId: number;
  title: string;
  imageUrl: string;
  category: string;
  difficultyLevel: string;
  likeCount: number;
  viewCount: number;
  userName: string;
}

interface Section6HomeProps {
  title?: string;
}

export default function Section6Home({ title = "Latest Recipes" }: Section6HomeProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ Không có token, không thể tải recipes");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/proxy/recipes", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Không thể tải công thức");
        const data = await res.json();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi tải công thức:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải danh sách công thức...
      </section>
    );
  }

  if (!recipes.length) {
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Không có công thức nào để hiển thị.
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      {/* ✅ Tiêu đề chính duy nhất */}
      <h2 className="text-[28px] font-bold text-gray-900 mb-10">
        {title}
      </h2>

      {/* ✅ Grid danh sách món ăn */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
        {recipes.map((item) => (
          <Link key={item.recipeId} href={`/recipes/${item.recipeId}`}>
            <RecipeItem
              name={item.title}
              image={item.imageUrl || "/banner01.jpg"}
              likeCount={item.likeCount}
              viewCount={item.viewCount}
              userName={item.userName}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
