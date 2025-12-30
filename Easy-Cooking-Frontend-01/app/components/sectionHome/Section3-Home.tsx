"use client";

import { useEffect, useState } from "react";
import { CategoryItem } from "../item/CategoryItem";
import { Category } from "@/app/types/category";



export default function Section3Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy danh mục từ DB mock qua API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/proxy/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Không thể tải danh mục");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi tải danh mục:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);


  if (loading)
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải danh mục...
      </section>
    );

  if (categories.length === 0)
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Hiện chưa có danh mục nào.
      </section>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 text-center">
      <h2 className="text-[26px] sm:text-[28px] font-bold text-gray-900 mb-10">
        Danh Mục Món Ăn
      </h2>

      <div
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-2
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          gap-4 
          sm:gap-6 
          md:gap-8 
          justify-items-center
        "
      >
        {categories.map((item) => (
          <CategoryItem
            key={item.categoryId}
            name={item.name}
            image={item.imageUrl || "/banner01.jpg"}
            id={item.categoryId}         
          />
        ))}
      </div>
    </section>
  );
}
