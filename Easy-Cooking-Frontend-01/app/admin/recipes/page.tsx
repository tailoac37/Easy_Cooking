"use client";

import { useEffect, useState } from "react";
import { getAuthHeader } from "@/app/utils/auth";
import RecipeRow from "./RecipeRow";

interface RecipeListResponse {
  recipes: any[];
  totalRecipes: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

type RecipeStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "";

const STATUS_TABS: { label: string; value: RecipeStatus }[] = [
  { label: "Tất cả", value: "" },
  { label: "Nháp", value: "DRAFT" },
  { label: "Chờ duyệt", value: "PENDING" },
  { label: "Đã duyệt", value: "APPROVED" },
  { label: "Đã từ chối", value: "REJECTED" },
];

export default function RecipesPage() {
  const [data, setData] = useState<RecipeListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "" as RecipeStatus,
    category: "",
    difficulty: "",
    searchTerm: "",
    userId: "",
    page: 0,
    size: 10,
    sortBy: "createdAt",
    sortDirection: "DESC",
  });

  const buildQuery = () => {
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.category) params.set("category", filters.category);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
    if (filters.userId) params.set("userId", filters.userId);

    params.set("page", String(filters.page));
    params.set("size", String(filters.size));
    params.set("sortBy", filters.sortBy);
    params.set("sortDirection", filters.sortDirection);

    return params.toString();
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const query = buildQuery();

      const res = await fetch(`/api/proxy/admin/recipes?${query}`, {
        headers: getAuthHeader() as HeadersInit,
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách công thức:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [
    filters.page,
    filters.status,
    filters.category,
    filters.difficulty,
    filters.sortBy,
    filters.sortDirection,
  ]);

  const handleSearch = () => {
    setFilters((f) => ({ ...f, page: 0 }));
    loadRecipes();
  };

  const goPage = (page: number) => {
    if (!data) return;
    if (page < 0 || page >= data.totalPages) return;
    setFilters((f) => ({ ...f, page }));
  };

  const changeStatusTab = (value: RecipeStatus) => {
    setFilters((f) => ({ ...f, status: value, page: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Công thức</h1>
          <p className="text-xs text-gray-500">
            Quản lý & duyệt công thức người dùng gửi lên
          </p>
        </div>
      </div>

      {/* STATUS TAB */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <button
              key={tab.value || "ALL"}
              onClick={() => changeStatusTab(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs border transition whitespace-nowrap
                ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề..."
          value={filters.searchTerm}
          onChange={(e) =>
            setFilters((f) => ({ ...f, searchTerm: e.target.value }))
          }
          className="border rounded-lg px-3 py-2 text-sm w-56"
        />

        <input
          type="text"
          placeholder="Danh mục..."
          value={filters.category}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category: e.target.value }))
          }
          className="border rounded-lg px-3 py-2 text-sm w-40"
        />

        <select
          value={filters.difficulty}
          onChange={(e) =>
            setFilters((f) => ({ ...f, difficulty: e.target.value }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Độ khó</option>
          <option value="EASY">Dễ</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HARD">Khó</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((f) => ({ ...f, sortBy: e.target.value }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="createdAt">Mới nhất</option>
          <option value="title">Tiêu đề A-Z</option>
          <option value="viewCount">Lượt xem</option>
          <option value="likeCount">Lượt thích</option>
        </select>

        <select
          value={filters.sortDirection}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sortDirection: e.target.value as "ASC" | "DESC",
            }))
          }
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="DESC">Giảm dần</option>
          <option value="ASC">Tăng dần</option>
        </select>

        <button
          onClick={handleSearch}
          className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          Áp dụng
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-2 border-b text-[11px] text-gray-500 grid grid-cols-[3fr,1fr,1.2fr,1fr] gap-4">
          <span>Công thức</span>
          <span>Độ khó</span>
          <span>Tương tác</span>
          <span className="text-right">Thao tác</span>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-500">Đang tải...</div>
        ) : !data || !data.recipes || data.recipes.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">
            Không có công thức nào.
          </div>
        ) : (
          data.recipes.map((r: any) => (
            <RecipeRow key={r.recipeId} recipe={r} onChanged={loadRecipes} />
          ))
        )}

        {/* PAGINATION */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500">
            <div>
              Trang <b>{data.currentPage + 1}</b> / {data.totalPages} –{" "}
              {data.totalRecipes} công thức
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goPage(data.currentPage - 1)}
                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
                disabled={data.currentPage === 0}
              >
                Trước
              </button>
              <button
                onClick={() => goPage(data.currentPage + 1)}
                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
                disabled={data.currentPage + 1 >= data.totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
