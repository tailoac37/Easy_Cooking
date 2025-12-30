"use client";

import { getAuthHeader } from "@/app/utils/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRow({
    user,
    onChanged,
}: {
    user: any;
    onChanged: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleActive = async () => {
        try {
            setLoading(true);
            await fetch(`/api/proxy/admin/users/${user.userId}/status`, {
                method: "PATCH",
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "application/json",
                } as HeadersInit,
                body: JSON.stringify({
                    isActive: !user.isActive,
                    reason: "Cập nhật bởi giao diện Admin",
                }),
            });
            onChanged();
        } catch (err) {
            console.error("❌ Lỗi đổi trạng thái user:", err);
        } finally {
            setLoading(false);
        }
    };

    const changeRole = async (newRole: "USER" | "ADMIN") => {
        if (newRole === user.role) return;
        try {
            setLoading(true);
            await fetch(`/api/proxy/admin/users/${user.userId}/role`, {
                method: "PATCH",
                headers: {
                    ...getAuthHeader(),
                    "Content-Type": "application/json",
                } as HeadersInit,
                body: JSON.stringify({ role: newRole }),
            });
            onChanged();
        } catch (err) {
            console.error("❌ Lỗi đổi vai trò:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-3 border-t grid grid-cols-[2fr,1fr,1fr,1.2fr,1fr] gap-4 text-sm items-center">
            
            {/* THÔNG TIN USER */}
            <div className="flex items-center gap-3">
                <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    className="w-9 h-9 rounded-full object-cover bg-gray-100"
                    alt={user.userName}
                />
                <div>
                    <div className="font-medium flex items-center gap-2">
                        <span>{user.userName || "(chưa có username)"}</span>

                        {user.emailVerified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                                Đã xác minh
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
            </div>

            {/* VAI TRÒ */}
            <div>
                <select
                    value={user.role}
                    disabled={loading}
                    onChange={(e) =>
                        changeRole(e.target.value as "USER" | "ADMIN")
                    }
                    className="border rounded-lg px-2 py-1 text-xs bg-white"
                >
                    <option value="USER">Người dùng</option>
                    <option value="ADMIN">Quản trị viên</option>
                </select>
            </div>

            {/* TRẠNG THÁI */}
            <div>
                <button
                    onClick={toggleActive}
                    disabled={loading}
                    className={`px-3 py-1 rounded-full text-xs font-medium border
                        ${
                            user.isActive
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-red-50 text-red-600 border-red-200"
                        }`}
                >
                    {user.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </button>
            </div>

            {/* ENGAGEMENT */}
            <div className="text-xs text-gray-500">
                <div>
                    Công thức: <b>{user.totalRecipes}</b>
                </div>
                <div>
                    Follower: <b>{user.totalFollowers}</b> · Bình luận:{" "}
                    <b>{user.totalComments}</b>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end">
                <button
                    disabled={loading}
                    onClick={() => router.push(`/admin/users/${user.userId}`)}
                    className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50"
                >
                    Xem chi tiết
                </button>
            </div>

        </div>
    );
}
