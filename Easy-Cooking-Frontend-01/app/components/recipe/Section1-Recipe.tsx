"use client";

import { useState, useEffect } from "react";
import { FaShareAlt, FaBookmark, FaHeart } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import Image from "next/image";
import { RecipeDetail } from "@/app/types/recipeDetail";
import Link from "next/link";
import { ReportRequest } from "@/app/types/report";
import { useRouter } from "next/navigation";

interface Section1RecipeProps {
  recipeId: number;
}

export default function Section1Recipe({ recipeId }: Section1RecipeProps) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ❤️ LIKE
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // ⭐ FAVORITE
  const [isFavorite, setIsFavorite] = useState(false);

  // 👤 USER HIỆN TẠI
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 🚨 REPORT
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("SPAM");
  const [reportDescription, setReportDescription] = useState("");
  const router = useRouter();

  // 🔥 Load Recipe + User + Tăng view
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // 👉 Load user hiện tại
        if (token) {
          const meRes = await fetch("/api/proxy/user/me", {
            headers: {
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            },
          });

          if (meRes.ok) {
            const meData = await meRes.json();
            setCurrentUserId(meData.userId);
          }
        }

        // 👉 Tăng view
        await fetch(`/api/proxy/recipes/${recipeId}/view`, {
          method: "PATCH",
          headers: token
            ? {
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            }
            : {},
        });

        // 👉 Load recipe detail
        const res = await fetch(`/api/proxy/recipes/${recipeId}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`Lỗi tải công thức (${res.status})`);

        const data: RecipeDetail = await res.json();
        setRecipe(data);
        setLiked(data.like ?? false);
        setLikeCount(data.likeCount ?? 0);
        setIsFavorite(data.favorite ?? false);
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [recipeId]);

  // ❤️ LIKE
  const handleLike = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return alert("Bạn cần đăng nhập!");

    const res = await fetch(`/api/proxy/recipes/${recipeId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  // 💔 UNLIKE
  const handleUnlike = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return alert("Bạn cần đăng nhập!");

    const res = await fetch(`/api/proxy/recipes/${recipeId}/unlike`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setLiked(false);
      setLikeCount((prev) => Math.max(prev - 1, 0));
    }
  };

  // ⭐ FAVORITE
  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return alert("Bạn cần đăng nhập!");

    const method = isFavorite ? "DELETE" : "POST";

    const res = await fetch(`/api/proxy/recipes/${recipeId}/favorite`, {
      method,
      headers: {
        Authorization: token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`,
      },
    });

    if (res.ok) setIsFavorite(!isFavorite);
  };

  // 📌 SHARE LINK
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết!");
    } catch {
      alert("Không thể sao chép link.");
    }
  };

  // 🚨 Gửi báo cáo
  const handleSendReport = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return alert("Bạn cần đăng nhập!");

    const payload: ReportRequest = {
      recipeId,
      reportType: "RECIPE",
      reason: reportReason as any,
      description: reportDescription,
    };

    const res = await fetch("/api/proxy/user/report", {
      method: "POST",
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Đã gửi báo cáo thành công!");
      setShowReport(false);
      setReportDescription("");
    } else {
      alert("Gửi báo cáo thất bại!");
    }
  };


  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Đang tải công thức #{recipeId}...
      </p>
    );

  if (error || !recipe)
    return (
      <p className="text-center text-gray-500 mt-10">
        Không tìm thấy công thức #{recipeId}.
      </p>
    );

  const commentCount = recipe.commentsDTO?.length ?? 0;

  const formattedDate = recipe.createAt
    ? new Date(recipe.createAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "Không rõ ngày";

  // 🎯 Difficulty Style
  const getDifficultyStyle = (level?: string) => {
    switch (level) {
      case "EASY":
        return { text: "Dễ", color: "bg-green-100 text-green-700 border-green-400" };
      case "MEDIUM":
        return { text: "Trung bình", color: "bg-yellow-100 text-yellow-700 border-yellow-400" };
      case "HARD":
        return { text: "Khó", color: "bg-red-100 text-red-700 border-red-400" };
      default:
        return { text: "Không rõ", color: "bg-gray-100 text-gray-600 border-gray-300" };
    }
  };

  const difficulty = getDifficultyStyle(recipe.difficultyLevel);

  return (
    <header className="border-b pb-5 mb-10">
      {/* === Trend + Action === */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <FaArrowTrendUp className="text-gray-800" />
          <span>{recipe.viewCount} lượt xem</span>
        </div>

        <div className="flex items-center gap-5 text-lg text-gray-700">
          <FaShareAlt
            onClick={handleShare}
            className="cursor-pointer hover:text-black transition"
          />

          <FaBookmark
            onClick={handleFavoriteToggle}
            className={`cursor-pointer transition ${isFavorite ? "text-yellow-500" : "text-gray-700"
              } hover:text-black`}
          />

          {/* ✏️ EDIT BUTTON - Chỉ chủ bài viết */}
          {currentUserId === recipe.userId && (
            <button
              onClick={() => router.push(`/recipes/${recipeId}/edit`)}
              className="text-blue-600 text-sm hover:underline"
            >
              Sửa công thức
            </button>
          )}

          {/* 🚨 REPORT BUTTON - Không phải chủ bài viết */}
          {currentUserId && currentUserId !== recipe.userId && (
            <button
              onClick={() => setShowReport(true)}
              className="text-red-600 text-sm hover:underline"
            >
              Báo cáo
            </button>
          )}


        </div>
      </div>

      {/* === Title === */}
      <h1 className="text-[38px] sm:text-[42px] font-extrabold text-gray-900 mb-4 leading-tight">
        {recipe.title}
      </h1>

      {/* === Difficulty === */}
      <div
        className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${difficulty.color} mb-5`}
      >
        {difficulty.text}
      </div>

      {/* === Author Info === */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
        <Link href={`/user-profile/${recipe.userId}`} className="flex items-center gap-3">
          <Image
            src={recipe.avatarUrl || "/avatarTruongHop.jpg"}
            alt={recipe.userName || "Người dùng"}
            width={34}
            height={34}
            className="rounded-full object-cover border border-gray-200 cursor-pointer"
          />

          <span className="font-medium hover:underline cursor-pointer">
            {recipe.userName || "Ẩn danh"}
          </span>
        </Link>

        <span className="text-gray-500">• {formattedDate}</span>
        <span className="text-gray-500">• {commentCount} bình luận</span>

        {/* ❤️ Nút Like */}
        <button
          onClick={liked ? handleUnlike : handleLike}
          className={`flex items-center gap-1 ml-2 transition ${liked ? "text-red-600" : "text-gray-500"
            }`}
        >
          <FaHeart />
          <span>{likeCount}</span>
        </button>
      </div>

      {/* === TAGS === */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {recipe.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 🚨 REPORT MODAL */}
      {showReport && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-96 p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Gửi báo cáo</h2>

            <label className="text-sm">Lý do</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE">Nội dung không phù hợp</option>
              <option value="COPYRIGHT">Vi phạm bản quyền</option>
              <option value="OTHER">Khác</option>
            </select>

            <label className="text-sm">Mô tả</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full border p-2 rounded h-24 mb-4"
              placeholder="Nhập mô tả chi tiết..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleSendReport}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
