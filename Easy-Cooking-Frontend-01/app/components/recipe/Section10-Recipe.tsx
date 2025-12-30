"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaTrash, FaPlus, FaImage } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";
import { RecipeReview } from "@/app/types/review";

/* ================================
   TOKEN SAFE GETTER
================================ */
function getAuthHeader() {
    const raw = localStorage.getItem("token");
    if (!raw || raw === "null" || raw === "undefined") {
        return { Authorization: "" };
    }
    const token = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
    return { Authorization: token };
}

/* ================================
      MAIN COMPONENT
================================ */
export default function Section10RecipeReviews({ recipeId }: { recipeId: number }) {
    const { user } = useAuth();

    const [reviews, setReviews] = useState<RecipeReview[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");

    const [files, setFiles] = useState<FileList | null>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [sending, setSending] = useState(false);

    /* ================================
          LOAD REVIEWS
    ================================= */
    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/proxy/reviews/${recipeId}`, {
                headers: { ...getAuthHeader() },
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = [];
            }

            setReviews(Array.isArray(data) ? data : []);
        };

        load();
    }, [recipeId]);

    /* ================================
          PREVIEW IMAGES
    ================================= */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        setFiles(files);

        if (files) {
            const previews = Array.from(files).map((file) => URL.createObjectURL(file));
            setPreviewImages(previews);
        }
    };

    /* ================================
          CREATE REVIEW (NO 415)
    ================================= */
    const handleCreateReview = async () => {
        if (!user) return alert("Bạn cần đăng nhập!");
        if (!newContent.trim()) return alert("Nhập nội dung review!");

        setSending(true);

        const reviewData = {
            title: newTitle,
            reviewContent: newContent,
            actualCookingTime: 0,
        };

        const form = new FormData();
        form.append(
            "review",
            new Blob([JSON.stringify(reviewData)], { type: "application/json" })
        );

        if (files) {
            Array.from(files).forEach((f) => form.append("images", f));
        }

        const resPost = await fetch(`/api/proxy/reviews/${recipeId}`, {
            method: "POST",
            headers: {
                ...getAuthHeader(),  // ❗ KHÔNG thêm content-type
            },
            body: form,
        });


        if (!resPost.ok) {
            setSending(false);
            return alert("❌ Lỗi gửi đánh giá: " + resPost.status);
        }

        // reload
        const res = await fetch(`/api/proxy/reviews/${recipeId}`, {
            headers: { ...getAuthHeader() },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
            setReviews(data);
            alert("🎉 Gửi đánh giá thành công!");
        }

        setSending(false);
        setNewTitle("");
        setNewContent("");
        setPreviewImages([]);
        setFiles(null);
    };

    /* ================================
            DELETE REVIEW
    ================================= */
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        await fetch(`/api/proxy/reviews/${deleteTarget}`, {
            method: "DELETE",
            headers: {
                ...getAuthHeader(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reason: "User removed review" }),
        });

        setReviews((prev) => prev.filter((r) => r.reviewId !== deleteTarget));
        setDeleteTarget(null);
    };

    /* ================================
                UI
    ================================= */
    return (
        <section className="mt-16 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold mb-6">
                Kết quả từ người nấu{" "}
                <span className="text-gray-500 text-base">({reviews.length})</span>
            </h2>

            {/* LIST REVIEWS */}
            <div className="flex flex-col gap-10">
                {reviews.map((r) => (
                    <div
                        key={r.reviewId}
                        className="border border-gray-200 rounded-xl p-6 shadow-sm"
                    >
                        {/* USER INFO */}
                        <div className="flex items-start gap-4">
                            <Link href={`/user-profile/${r.userId}`}>
                                <img
                                    src={r.userAvatar}
                                    className="w-12 h-12 rounded-full hover:opacity-80 transition"
                                />
                            </Link>

                            <div className="flex-1">
                                <Link
                                    href={`/user-profile/${r.userId}`}
                                    className="font-semibold hover:underline"
                                >
                                    {r.userName}
                                </Link>
                                <p className="text-gray-500 text-sm">{r.createdAt}</p>
                            </div>

                            {user?.userId === r.userId && (
                                <button
                                    onClick={() => setDeleteTarget(r.reviewId)}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>

                        <h3 className="font-bold text-lg mt-4">{r.title}</h3>

                        <p className="mt-2 whitespace-pre-line">{r.reviewContent}</p>

                        {r.userImages?.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                {r.userImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className="w-full aspect-[16/9] overflow-hidden rounded-lg shadow"
                                    >
                                        <img
                                            src={img}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}


                    </div>
                ))}
            </div>

            {/* CREATE REVIEW */}
            <div className="mt-14 border-t pt-8">
                <h3 className="text-lg font-semibold mb-3">Chia sẻ kết quả của bạn</h3>

                <input
                    type="text"
                    placeholder="Tiêu đề review"
                    className="w-full border rounded-md px-3 py-2 mb-3"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />

                <textarea
                    placeholder="Mô tả kết quả nấu..."
                    className="w-full border rounded-md px-3 py-2"
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                />

                {/* BUTTON UPLOAD IMAGE */}
                <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border rounded-md cursor-pointer hover:bg-gray-200">
                    <FaImage /> Thêm ảnh
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>

                {previewImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {previewImages.map((src, i) => (
                            <div
                                key={i}
                                className="w-full aspect-[16/9] overflow-hidden rounded-lg shadow"
                            >
                                <img
                                    src={src}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}


                <div className="text-right mt-3">
                    <button
                        onClick={handleCreateReview}
                        disabled={sending}
                        className="bg-orange-500 text-white px-6 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
                    >
                        {sending ? "⏳ Đang gửi..." : <><FaPlus /> Gửi đánh giá</>}
                    </button>
                </div>
            </div>

            {/* DELETE MODAL */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-2xl">
                        <h3 className="text-xl font-bold text-center mb-3">
                            Xóa bài đánh giá?
                        </h3>
                        <p className="text-center text-gray-600 mb-4">
                            Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex gap-3">
                            <button
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Hủy
                            </button>

                            <button
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                                onClick={confirmDelete}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
