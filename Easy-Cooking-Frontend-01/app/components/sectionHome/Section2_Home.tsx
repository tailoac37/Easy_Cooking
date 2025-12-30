"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RecipeItem } from "../item/RecipeItem";
import { Recipe } from "@/app/types/recipe";

export default function Section2Home() {
  const [topView, setTopView] = useState<Recipe[]>([]);
  const [topLike, setTopLike] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopView = async () => {
      try {
        const res = await fetch("/api/proxy/recipes/views/top", {
          cache: "no-store",
        });

        console.log("✅ VIEW STATUS:", res.status);

        const data = await res.json();
        console.log("✅ VIEW DATA:", data);

        setTopView(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi fetch VIEW:", err);
      }
    };

    const fetchTopLike = async () => {
      try {
        const res = await fetch("/api/proxy/recipes/likes/top", {
          cache: "no-store",
        });

        console.log("✅ LIKE STATUS:", res.status);

        const data = await res.json();
        console.log("✅ LIKE DATA:", data);

        setTopLike(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi fetch LIKE:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopView();
    fetchTopLike();
  }, []);


  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải danh sách công thức...
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">

      {/* 🍝 Top View */}
      <h2 className="text-[28px] font-bold text-gray-900 mb-8">
        Công Thức Nhiều Lượt Xem Nhất
      </h2>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8 mb-12">
        {topView.map((item) => (
          <Link key={item.recipeId} href={`/recipes/${item.recipeId}`}>
            <RecipeItem
              name={item.title}
              image={item.imageUrl}
              likeCount={item.likeCount}
              viewCount={item.viewCount}
              userName={item.userName}
            />
          </Link>
        ))}
      </div>

      {/* ❤️ Top Like */}
      <h2 className="text-[28px] font-bold text-gray-900 mb-8">
        Công Thức Được Yêu Thích Nhất
      </h2>
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
        {topLike.map((item) => (
          <Link key={item.recipeId} href={`/recipes/${item.recipeId}`}>
            <RecipeItem
              name={item.title}
              image={item.imageUrl}
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
