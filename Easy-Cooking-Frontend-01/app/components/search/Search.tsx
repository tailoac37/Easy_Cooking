"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiX } from "react-icons/fi";
import { Recipe } from "@/app/types/recipe";

interface SearchProps {
  onClose: () => void;
}

export const Search = ({ onClose }: SearchProps) => {
  const [query, setQuery] = useState("");

  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [cookTime, setCookTime] = useState<number | null>(null);
  const [servings, setServings] = useState<number | null>(null);

  const [results, setResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 AI IMAGE SEARCH STATES
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiImage, setAIImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // ⭐ Load category API
  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch("/api/proxy/categories", { cache: "no-store" });
      const data = await res.json();

      const names = Array.isArray(data) ? data.map((c: any) => c.name) : [];
      setCategoryList(names);
    };
    loadCategories();
  }, []);

  // ⭐ Search API
  const fetchSearch = async () => {
    const payload: any = {};

    if (query.trim()) payload.title = [query];
    if (categories.length) payload.category = categories;
    if (difficulty.length) payload.level = difficulty;
    if (ingredients.length) payload.ingredients = ingredients;
    if (tags.length) payload.tags = tags;
    if (prepTime) payload.prepTime = prepTime;
    if (cookTime) payload.cookTime = cookTime;
    if (servings) payload.servings = servings;

    try {
      setLoading(true);
      const token = localStorage.getItem("token") || "";

      const res = await fetch("/api/proxy/recipes/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  // Debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => fetchSearch(), 350);
    return () => clearTimeout(t);
  }, [query]);

  const applyFilters = () => fetchSearch();

  const toggle = (value: string, list: string[], setList: any) => {
    if (list.includes(value)) setList(list.filter((x) => x !== value));
    else setList([...list, value]);
  };

  // 🔥 AI IMAGE SEARCH FUNCTION
  const handleAIImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setShowAIModal(false); // close modal

    // preview
    const preview = URL.createObjectURL(file);
    setAIImage(preview);

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setProgress(10);

      const token = localStorage.getItem("token") || "";

      const res = await fetch("/api/proxy/findAI", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      setProgress(75);

      const data = await res.json();
      setProgress(100);

      if (Array.isArray(data)) setResults(data);
      else alert("Không tìm thấy công thức từ hình ảnh");

    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 p-6 overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition z-[999]"
      >
        <FiX size={28} className="text-gray-700" />
      </button>

      {/* Search Input */}
      <div className="max-w-3xl mx-auto mt-20 mb-6">
        <input
          type="text"
          placeholder="Tìm công thức..."
          className="w-full text-lg outline-none text-gray-800 bg-white shadow-md border border-gray-200 rounded-xl px-4 py-3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* AI SEARCH BUTTON */}
      <div className="max-w-3xl mx-auto mb-8">
        <button
          onClick={() => setShowAIModal(true)}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition"
        >
          🤖 Tìm kiếm bằng hình ảnh (AI)
        </button>
      </div>

      {/* AI MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-xl relative">

            <button
              onClick={() => setShowAIModal(false)}
              className="absolute top-3 right-3"
            >
              <FiX size={26} className="text-gray-700" />
            </button>

            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Chọn cách tải ảnh
            </h2>

            <div className="flex flex-col gap-3">

              {/* Camera */}
              <label
                htmlFor="camera-input"
                className="cursor-pointer w-full py-3 rounded-lg bg-orange-500 text-white text-center font-medium shadow"
              >
                📷 Chụp ảnh
              </label>
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAIImage}
              />

              {/* Upload file */}
              <label
                htmlFor="file-input"
                className="cursor-pointer w-full py-3 rounded-lg bg-blue-500 text-white text-center font-medium shadow"
              >
                🖼 Chọn ảnh từ máy
              </label>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAIImage}
              />

            </div>
          </div>
        </div>
      )}

      {/* AI IMAGE PREVIEW */}
      {aiImage && (
        <div className="max-w-3xl mx-auto mb-6 text-center">
          <p className="text-sm text-gray-600 mb-1">Ảnh đã chọn:</p>
          <img
            src={aiImage}
            className="w-40 h-40 object-cover mx-auto rounded-lg shadow"
          />

          {progress > 0 && progress < 100 && (
            <div className="mt-3">
              <p className="text-gray-700 text-sm">Đang xử lý: {progress}%</p>
              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white border border-gray-200 shadow-md rounded-xl p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Bộ lọc nâng cao</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Category */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Danh mục</p>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {categoryList.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={categories.includes(c)}
                    onChange={() => toggle(c, categories, setCategories)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Độ khó</p>
            {["EASY", "MEDIUM", "HARD"].map((lv) => (
              <label key={lv} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={difficulty.includes(lv)}
                  onChange={() => toggle(lv, difficulty, setDifficulty)}
                />
                {lv}
              </label>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Nguyên liệu</p>
            <input
              type="text"
              placeholder="Nhập và Enter..."
              className="border rounded-lg p-2 w-full text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  setIngredients([...ingredients, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {ingredients.map((i) => (
                <span key={i} className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">Tags</p>
            <input
              type="text"
              placeholder="Nhập và Enter..."
              className="border rounded-lg p-2 w-full text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  setTags([...tags, e.currentTarget.value.trim()]);
                  e.currentTarget.value = "";
                }
              }}
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {tags.map((t) => (
                <span key={t} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* PrepTime */}
          <div>
            <p className="font-semibold text-gray-700 mb-1">Chuẩn bị (phút)</p>
            <input
              type="number"
              className="border rounded-lg p-2 w-full text-sm"
              value={prepTime ?? ""}
              onChange={(e) => setPrepTime(Number(e.target.value))}
            />
          </div>

          {/* CookTime */}
          <div>
            <p className="font-semibold text-gray-700 mb-1">Thời gian nấu</p>
            <input
              type="number"
              className="border rounded-lg p-2 w-full text-sm"
              value={cookTime ?? ""}
              onChange={(e) => setCookTime(Number(e.target.value))}
            />
          </div>

          {/* Servings */}
          <div>
            <p className="font-semibold text-gray-700 mb-1">Khẩu phần</p>
            <input
              type="number"
              className="border rounded-lg p-2 w-full text-sm"
              value={servings ?? ""}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </div>

        </div>

        <button
          onClick={applyFilters}
          className="w-full mt-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md"
        >
          Áp dụng bộ lọc
        </button>
      </div>

      {/* RESULTS */}
      <div className="bg-white border border-gray-200 shadow-md rounded-xl divide-y">
        {loading ? (
          <p className="text-center py-4">Đang tìm kiếm...</p>
        ) : results.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Không tìm thấy kết quả.</p>
        ) : (
          results.map((item) => (
            <Link
              key={item.recipeId}
              href={`/recipes/${item.recipeId}`}
              onClick={onClose}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 transition"
            >
              <div className="w-14 h-14 relative rounded-lg overflow-hidden bg-gray-200 shadow">
                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
