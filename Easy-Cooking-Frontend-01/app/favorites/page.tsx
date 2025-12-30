"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FavoriteRecipe } from "@/app/types/favoriteRecipe";
import { FaTrash } from "react-icons/fa";

export default function FavoritePage() {
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🟢 Load danh sách yêu thích
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/proxy/recipes/favorite/`, {
          headers: {
            Authorization: token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`,
          },
        });

        const data = await res.json();

        // ⭐ ĐẢM BẢO LUÔN LÀ ARRAY
        const list: FavoriteRecipe[] = Array.isArray(data) ? data : [];
        setRecipes(list);
      } catch (err) {
        console.error("❌ Lỗi fetch favorite:", err);
        setRecipes([]); // tránh undefined
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  // ❌ Bỏ yêu thích
  const handleRemoveFavorite = async (recipeId: number) => {
    if (!token) {
      alert("Bạn cần đăng nhập!");
      return;
    }

    try {
      const res = await fetch(`/api/proxy/recipes/favorite?recipeId=${recipeId}`, {
        method: "DELETE",
        headers: {
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
      });


      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
      } else {
        alert("Không thể xóa khỏi yêu thích!");
      }
    } catch (err) {
      console.error("❌ Lỗi unfavorite:", err);
    }
  };

  if (loading)
    return (
      <p className="text-center py-20 text-gray-500">
        Đang tải danh sách yêu thích...
      </p>
    );

  return (
    <section className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Công thức yêu thích</h1>

      {recipes.length === 0 ? (
        <p className="text-gray-500">Bạn chưa lưu công thức nào.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((r) => (
            <div
              key={r.recipeId}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition relative"
            >
              {/* ❌ Nút xóa yêu thích */}
              <button
                onClick={() => handleRemoveFavorite(r.recipeId)}
                className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition"
                title="Bỏ yêu thích"
              >
                <FaTrash size={14} />
              </button>

              {/* Ảnh */}
              <Link href={`/recipes/${r.recipeId}`}>
                <Image
                  src={r.imageUrl}
                  alt={r.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-48"
                />
              </Link>

              {/* Nội dung */}
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {r.description}
                </p>

                {/* Tác giả */}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Image
                    src={r.avatarUrl}
                    alt={r.userName}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                  <span>{r.userName}</span>
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-400 mt-3">
                  <span>👁 {r.viewCount}</span>
                  <span>❤️ {r.likeCount}</span>
                  <span>⏱ {r.cookTime ?? 0} phút</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
