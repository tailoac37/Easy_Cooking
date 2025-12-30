"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaArrowRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { Recipe } from "@/app/types/recipe";


export const Section1Home = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 🧩 Fetch 5 công thức đầu tiên
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const res = await fetch("/api/proxy/recipes", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setRecipes(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error("❌ Lỗi tải recipes:", err);
      }
    };
    fetchRecipes();
  }, []);

  // 🔁 Tự động chuyển slide
  useEffect(() => {
    if (!paused && recipes.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % recipes.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paused, recipes]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % recipes.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + recipes.length) % recipes.length);

  // 🖱️ Khi click vào 20% bên trái/phải → chuyển slide
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.2) {
      prevSlide();
    } else if (x > width * 0.8) {
      nextSlide();
    }
  };

  if (recipes.length === 0)
    return (
      <section className="container mx-auto px-4 py-12 text-center text-gray-500">
        Đang tải công thức nổi bật...
      </section>
    );

  return (
    <section
      className="container mx-auto overflow-hidden bg-white py-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto relative">
        {/* SLIDER */}
        <div
          className="relative w-full h-[440px] md:h-[460px] lg:h-[480px] cursor-pointer"
          onClick={handleClick}
        >
          {recipes.map((recipe, i) => (
            <div
              key={`${recipe.recipeId}-${i}`}   // 🔥 KEY FIXED!
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
            >
              <Link href={`/recipes/${recipe.recipeId}`} className="block h-full">
                <div
                  className="grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white h-full"
                >
                  {/* LEFT IMAGE */}
                  <div className="
      bg-white overflow-hidden 
      h-[220px]
      sm:h-[260px]
      md:h-full
      flex items-center justify-center
    ">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-contain md:object-cover"
                    />
                  </div>

                  {/* RIGHT TEXT */}
                  <div className="flex flex-col justify-center bg-[#EAF3FF] px-10 py-8 h-full">
                    <div className="flex items-center gap-2 text-[16px] font-medium text-gray-600 mb-3">
                      <FaArrowTrendUp className="text-gray-800" />
                      {recipe.viewCount} views
                    </div>

                    <h1 className="text-[32px] sm:text-[36px] font-extrabold text-gray-900 leading-tight mb-4">
                      {recipe.title}
                    </h1>

                    <p className="text-gray-700 text-[16px] mb-6 leading-relaxed line-clamp-3">
                      {recipe.description ||
                        "A delightful recipe you’ll love to make again and again!"}
                    </p>
                  </div>
                </div>
              </Link>

            </div>
          ))}
        </div>

        {/* ARROWS */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow hover:bg-white transition"
        >
          <FaChevronLeft className="text-gray-700" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow hover:bg-white transition"
        >
          <FaChevronRight className="text-gray-700" />
        </button>

        {/* DOTS */}
        <div className="flex justify-center mt-6 gap-2">
          {recipes.map((_, i) => (
            <button
              key={`dot-${i}`}   // 🔥 DOT KEY FIXED!
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${i === current ? "bg-orange-500" : "bg-gray-300"
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
