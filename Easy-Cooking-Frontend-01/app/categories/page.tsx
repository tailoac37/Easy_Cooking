"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category } from "@/app/types/category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => 
  {
    try {
      const res = await fetch("/api/proxy/categories", {
        cache: "no-store",
      });

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("❌ Load categories error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading)
    return <p className="p-6 text-gray-600">Đang tải danh mục...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Danh mục công thức</h1>

      {categories.length === 0 && (
        <p className="text-gray-500">Không có danh mục nào.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {categories.map((cat) => (
          <Link
            key={cat.categoryId}
            href={`/categories/${cat.categoryId}`}
            className="border rounded-lg overflow-hidden shadow hover:shadow-md transition"
          >
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Không có ảnh</span>
              )}
            </div>

            <div className="p-3">
              <h2 className="font-semibold">{cat.name}</h2>
              <p className="text-sm text-gray-600">
                {cat.description ?? "Danh mục không có mô tả"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
