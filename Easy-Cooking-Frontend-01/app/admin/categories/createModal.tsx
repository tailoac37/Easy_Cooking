"use client";

import { useState } from "react";
import { getAuthHeaderFormData } from "@/app/utils/auth";

export default function CreateModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const save = async () => {
    const fd = new FormData();

    if (file) fd.append("image", file);

    const categoryBlob = new Blob(
      [JSON.stringify({ name, description: desc })],
      { type: "application/json" }
    );

    fd.append("categories", categoryBlob);

    await fetch("/api/proxy/admin/categories", {
      method: "POST",
      headers: getAuthHeaderFormData() as HeadersInit, // chỉ gửi Authorization
      body: fd,
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[380px] space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold">Thêm danh mục</h2>

        {/* Tên danh mục */}
        <input
          className="w-full border px-3 py-2 rounded-lg text-sm"
          placeholder="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Mô tả */}
        <textarea
          className="w-full border px-3 py-2 rounded-lg text-sm"
          placeholder="Mô tả"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* Ảnh */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />

        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            Hủy
          </button>

          <button
            onClick={save}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}
