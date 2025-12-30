"use client";

import { useState } from "react";
import { getAuthHeader } from "@/app/utils/auth";
import EditModal from "./EditModal";

export default function CategoryRow({
  cate,
  onChanged,
}: {
  cate: any;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // 🔥 categoryId đúng theo backend
  const id = cate.categoryId;

  const deactivate = async () => {
    if (!confirm("Bạn có chắc muốn ẩn danh mục này?")) return;

    setLoading(true);

    await fetch(`/api/proxy/admin/categories/${id}/deactivate`, {
      method: "PATCH",
      headers: getAuthHeader() as HeadersInit,
    });

    onChanged();
    setLoading(false);
  };

  const remove = async () => {
    if (!confirm("Bạn chắc chắn muốn XÓA VĨNH VIỄN danh mục này?")) return;

    setLoading(true);

    await fetch(`/api/proxy/admin/categories/${cate.categoryId}`, {
      method: "DELETE",
      headers: getAuthHeader() as HeadersInit,
    });

    onChanged();
    setLoading(false);
  };

  return (
    <div className="px-4 py-4 border-b grid grid-cols-[2fr,2fr,1fr,1fr] gap-4 text-sm items-center">

      {/* HÌNH + TÊN DANH MỤC */}
      <div className="flex items-center gap-3">
        <img
          src={cate.imageUrl || "/default-category.png"}
          alt={cate.name}
          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
        />
        <span className="font-semibold">{cate.name}</span>
      </div>

      {/* MÔ TẢ */}
      <div className="text-gray-600 text-xs">
        {cate.description || "Không có mô tả"}
      </div>

      {/* TỔNG SỐ CÔNG THỨC */}
      <div className="text-xs text-gray-500">
        {cate.recipes?.length ?? 0}
      </div>

      {/* NÚT THAO TÁC */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setOpenEdit(true)}
          className="px-3 py-1 border rounded-lg hover:bg-gray-50 text-xs"
        >
          Chỉnh sửa
        </button>

        <button
          onClick={deactivate}
          disabled={loading}
          className="px-3 py-1 border border-orange-400 text-orange-600 rounded-lg text-xs hover:bg-orange-50"
        >
          Ẩn
        </button>

        <button
          onClick={remove}
          disabled={loading}
          className="px-3 py-1 border border-red-500 text-red-600 rounded-lg text-xs hover:bg-red-50"
        >
          Xóa
        </button>
      </div>

      {/* MODAL EDIT */}
      {openEdit && (
        <EditModal
          cate={cate}
          onClose={() => setOpenEdit(false)}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}
