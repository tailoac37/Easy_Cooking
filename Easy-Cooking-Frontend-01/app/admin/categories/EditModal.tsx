"use client";

import { useState } from "react";
import { getAuthHeaderFormData } from "@/app/utils/auth";

export default function EditModal({ cate, onClose, onSaved }: any) {
  const [name, setName] = useState(cate.name || "");
  const [description, setDescription] = useState(cate.description || "");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const id = cate.categoryId;

  const submit = async () => {
    if (!name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    const categoriesData = {
      name: name.trim(),
      description: description.trim() || cate.description || ""
    };
    const categoriesBlob = new Blob(
      [JSON.stringify(categoriesData)],
      { type: "application/json" }
    );
    formData.append("categories", categoriesBlob);

    if (image) {
      formData.append("image", image);
    }

    console.log("📤 Update payload:", {
      id,
      categories: categoriesData,
      hasImage: !!image,
      imageType: image?.type,
      imageSize: image?.size
    });

    // Back to using proxy
    const res = await fetch(`/api/proxy/admin/categories/${id}`, {
      method: "PATCH",
      headers: getAuthHeaderFormData() as HeadersInit,
      body: formData,
    });

    setLoading(false);

    console.log("📥 Response:", res.status, res.statusText);

    if (res.ok) {
      const text = await res.text();
      console.log("✅ Success:", text);
      onSaved();
      onClose();
    } else {
      const error = await res.text();
      console.error("❌ Failed:", res.status, error);

      // ❗ Specific error for 415
      if (res.status === 415) {
        alert("⚠️ Lỗi 415: Backend không chấp nhận loại file.\n\nĐể test, hãy thử:\n1. Không chọn ảnh (chỉ đổi tên)\n2. Chọn ảnh JPG/PNG nhỏ hơn 5MB");
      } else {
        alert(`Lỗi ${res.status}: ${error}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">Chỉnh sửa danh mục #{id}</h2>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Tên danh mục *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên danh mục"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả"
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600 mb-1 block">Ảnh mới (tùy chọn)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="text-sm w-full"
          />
          {image && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {image.name} ({(image.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Hủy
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
