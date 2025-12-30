"use client";

import { useEffect, useState } from "react";
import CategoryRow from "./CategoryRow";
import CreateModal from "./createModal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/proxy/categories");
      const json = await res.json();
      setCategories(json || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh mục:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh mục</h1>
          <p className="text-xs text-gray-500">
            Quản lý danh mục công thức
          </p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* HEADER ROW */}
        <div className="px-4 py-2 border-b text-xs text-gray-500 grid grid-cols-[2fr,2fr,1fr,1fr] gap-4">
          <span>Tên danh mục</span>
          <span>Mô tả</span>
          <span>Số công thức</span>
          <span className="text-right">Thao tác</span>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-500">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 text-center">Chưa có danh mục nào.</div>
        ) : (
          categories.map((c) => (
            <CategoryRow
              key={c.id}
              cate={c}
              onChanged={loadCategories}
            />
          ))
        )}
      </div>

      {/* MODAL CREATE */}
      {openCreate && (
        <CreateModal
          onClose={() => setOpenCreate(false)}
          onSaved={loadCategories}
        />
      )}
    </div>
  );
}
