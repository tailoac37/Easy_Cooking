"use client";

import { useState, useEffect } from "react";
import { UserReviewWithRecipe } from "@/app/types/userReview";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaClock } from "react-icons/fa";

interface MyReviewsWidgetProps {
    limit?: number;
}

export default function MyReviewsWidget({ limit = 3 }: MyReviewsWidgetProps) {
    const [reviews, setReviews] = useState<UserReviewWithRecipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch("/api/proxy/user/me/reviews", {
                headers: {
                    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setReviews(data.slice(0, limit));
            }
        } catch (err) {
            console.error("Error loading reviews:", err);
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

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">Đánh Giá Của Tôi</h2>
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Đánh Giá Của Tôi
                </h2>
                {reviews.length > 0 && (
                    <Link
                        href="/my-reviews"
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline"
                    >
                        Xem tất cả ({reviews.length})
                    </Link>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                        Bạn chưa có đánh giá nào
                    </p>
                    <Link
                        href="/"
                        className="inline-block text-orange-600 hover:underline"
                    >
                        Khám phá công thức để đánh giá
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((item) => (
                        <div
                            key={item.review.reviewId}
                            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition"
                        >
                            <Link href={`/recipes/${item.recipeId}`}>
                                <div className="flex gap-4">
                                    {/* Recipe Thumbnail */}
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <Image
                                            src={item.recipeImageUrl || "/default-recipe.jpg"}
                                            alt={item.recipeTitle}
                                            fill
                                            className="object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 hover:text-orange-600 transition truncate mb-1">
                                            {item.recipeTitle}
                                        </h3>

                                        {item.review.title && (
                                            <p className="text-sm text-gray-700 font-medium mb-1">
                                                {item.review.title}
                                            </p>
                                        )}

                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {item.review.reviewContent}
                                        </p>

                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{formatDate(item.review.createdAt)}</span>
                                            {item.review.actualCookingTime && (
                                                <span className="flex items-center gap-1">
                                                    <FaClock />
                                                    {item.review.actualCookingTime} phút
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}

                    {reviews.length >= limit && (
                        <Link
                            href="/my-reviews"
                            className="block text-center text-orange-600 hover:text-orange-700 font-medium py-2 hover:underline"
                        >
                            Xem tất cả đánh giá →
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
