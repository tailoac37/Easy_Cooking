"use client";

import { useState, useEffect } from "react";
import { UserReviewWithRecipe } from "@/app/types/userReview";
import Link from "next/link";
import Image from "next/image";
import { FaClock, FaUtensils, FaCalendar, FaEdit, FaTrash } from "react-icons/fa";

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<UserReviewWithRecipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Bạn cần đăng nhập để xem đánh giá của mình");
                setLoading(false);
                return;
            }

            const res = await fetch("/api/proxy/user/me/reviews", {
                headers: {
                    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Không thể tải danh sách đánh giá");
            }

            const data = await res.json();
            setReviews(data);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getDifficultyStyle = (level: string) => {
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

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Đang tải đánh giá của bạn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <Link href="/login" className="mt-4 inline-block text-orange-600 hover:underline">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Đánh Giá Của Tôi
                </h1>
                <p className="text-gray-600">
                    Quản lý tất cả các đánh giá bạn đã viết cho các công thức nấu ăn
                </p>
            </div>

            {/* Reviews Count */}
            <div className="mb-6">
                <p className="text-lg text-gray-700">
                    Tổng cộng: <span className="font-semibold text-orange-600">{reviews.length}</span> đánh giá
                </p>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg mb-4">
                        Bạn chưa có đánh giá nào
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition"
                    >
                        Khám phá công thức
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((item) => {
                        const difficulty = getDifficultyStyle(item.difficultyLevel);
                        return (
                            <div
                                key={item.review.reviewId}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                            >
                                <div className="md:flex">
                                    {/* Recipe Image */}
                                    <div className="md:w-64 md:flex-shrink-0">
                                        <Link href={`/recipes/${item.recipeId}`}>
                                            <div className="relative h-48 md:h-full">
                                                <Image
                                                    src={item.recipeImageUrl || "/default-recipe.jpg"}
                                                    alt={item.recipeTitle}
                                                    fill
                                                    className="object-cover hover:scale-105 transition duration-300"
                                                />
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        {/* Recipe Info */}
                                        <div className="mb-4">
                                            <Link href={`/recipes/${item.recipeId}`}>
                                                <h2 className="text-2xl font-bold text-gray-900 hover:text-orange-600 transition mb-2">
                                                    {item.recipeTitle}
                                                </h2>
                                            </Link>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className={`px-2 py-1 rounded-full border ${difficulty.color}`}>
                                                    {difficulty.text}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaUtensils className="text-gray-400" />
                                                    {item.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaClock className="text-gray-400" />
                                                    {item.prepTime + item.cookTime} phút
                                                </span>
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                            {item.review.title && (
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    {item.review.title}
                                                </h3>
                                            )}
                                            <p className="text-gray-700 line-clamp-3">
                                                {item.review.reviewContent}
                                            </p>

                                            {item.review.actualCookingTime && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    ⏱️ Thời gian thực tế: {item.review.actualCookingTime} phút
                                                </p>
                                            )}
                                        </div>

                                        {/* Review Images */}
                                        {item.review.userImages && item.review.userImages.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">Ảnh của tôi:</p>
                                                <div className="flex gap-2 overflow-x-auto">
                                                    {item.review.userImages.map((img, idx) => (
                                                        <div key={idx} className="relative w-24 h-24 flex-shrink-0">
                                                            <Image
                                                                src={img}
                                                                alt={`Review image ${idx + 1}`}
                                                                fill
                                                                className="object-cover rounded-lg border border-gray-200"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Meta Info & Actions */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FaCalendar className="text-gray-400" />
                                                Đánh giá lúc: {formatDate(item.review.createdAt)}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.review.isChange && (
                                                    <Link
                                                        href={`/reviews/${item.review.reviewId}/edit`}
                                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                                                    >
                                                        <FaEdit /> Sửa
                                                    </Link>
                                                )}
                                                {item.review.isDelete && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Bạn có chắc muốn xóa đánh giá này?")) {
                                                                // TODO: Implement delete
                                                                alert("Chức năng xóa đang được phát triển");
                                                            }
                                                        }}
                                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                                                    >
                                                        <FaTrash /> Xóa
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
