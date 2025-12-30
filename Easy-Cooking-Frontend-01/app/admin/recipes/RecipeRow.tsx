"use client";

import { useState } from "react";
import { getAuthHeader } from "@/app/utils/auth";

export default function RecipeRow({
  recipe,
  onChanged,
}: {
  recipe: any;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const statusColor = (() => {
    switch (recipe.status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "DRAFT":
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  })();

  const approveRecipe = async () => {
    if (recipe.status === "APPROVED") return;
    const note = window.prompt("Ghi chú gửi cho tác giả (tuỳ chọn):", "");
    try {
      setLoading(true);
      await fetch(`/api/proxy/admin/recipes/${recipe.recipeId}/approve`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ adminNote: note || "Đã duyệt bởi Admin" }),
      });
      onChanged();
    } catch (err) {
      console.error("❌ Lỗi duyệt công thức:", err);
    } finally {
      setLoading(false);
    }
  };

  const rejectRecipe = async () => {
    if (recipe.status === "REJECTED") return;
    const note = window.prompt("Lý do từ chối (tuỳ chọn):", "");
    try {
      setLoading(true);
      await fetch(`/api/proxy/admin/recipes/${recipe.recipeId}/reject`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        } as HeadersInit,
        body: JSON.stringify({ adminNote: note || "Đã từ chối bởi Admin" }),
      });
      onChanged();
    } catch (err) {
      console.error("❌ Lỗi từ chối công thức:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-3 border-t grid grid-cols-[3fr,1fr,1.2fr,1fr] gap-4 text-sm items-center">
      
      {/* ẢNH + TIÊU ĐỀ + TÁC GIẢ + TRẠNG THÁI */}
      <div className="flex items-center gap-3">
        <img
          src={recipe.imageUrl || recipe.thumbnailUrl || "/default-recipe.png"}
          alt={recipe.title}
          className="w-14 h-14 rounded-lg object-cover bg-gray-100"
        />
        <div className="space-y-1">
          <div className="font-medium line-clamp-1 flex items-center gap-2">
            <span>{recipe.title}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor}`}
            >
              {recipe.status}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            @{recipe.authorName || recipe.userName || "unknown"} ·{" "}
            {recipe.categoryName || recipe.category || "Không có danh mục"}
          </p>
        </div>
      </div>

      {/* ĐỘ KHÓ */}
      <div className="text-xs text-gray-600">
        <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
          {recipe.difficulty || "KHÔNG RÕ"}
        </span>
      </div>

      {/* ENGAGEMENT */}
      <div className="text-xs text-gray-500">
        <div>
          Lượt xem: <b>{recipe.viewCount ?? 0}</b> · Lượt thích:{" "}
          <b>{recipe.likeCount ?? 0}</b>
        </div>
        <div>
          Bình luận: <b>{recipe.commentCount ?? 0}</b>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        <button
          onClick={approveRecipe}
          disabled={loading || recipe.status === "APPROVED"}
          className={`px-3 py-1.5 text-xs rounded-lg border font-medium
            ${
              recipe.status === "APPROVED"
                ? "bg-green-50 text-green-600 border-green-200 cursor-default"
                : "bg-black text-white border-black hover:bg-gray-900"
            }`}
        >
          Duyệt
        </button>

        <button
          onClick={rejectRecipe}
          disabled={loading || recipe.status === "REJECTED"}
          className={`px-3 py-1.5 text-xs rounded-lg border font-medium
            ${
              recipe.status === "REJECTED"
                ? "bg-red-50 text-red-600 border-red-200 cursor-default"
                : "bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-600"
            }`}
        >
          Từ chối
        </button>
      </div>
    </div>
  );
}
