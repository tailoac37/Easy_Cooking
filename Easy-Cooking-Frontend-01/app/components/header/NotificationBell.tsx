"use client";

import { IoNotificationsOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { useRef, useState } from "react";
import { useNotification } from "@/app/contexts/NotificationContext";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import { NotificationItem } from "@/app/types/notification";
import { useRouter } from "next/navigation";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    updateRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotification();

  useClickOutside(notiRef, () => setIsOpen(false));

  const router = useRouter();



  // 🔥 Điều hướng theo loại thông báo
  const getNotificationLink = (n: NotificationItem) => {
    if (n.type === "FOLLOW") return `/user-profile/${n.userId}`;
    if (n.type === "COMMENT") return `/recipes/${n.recipeId}`;
    // LIKE → Cũng điều hướng đến bài viết
    if (n.type === "LIKE") {
      if (n.recipeId) return `/recipes/${n.recipeId}`;
      return "/recipes";
    }
    if (n.type === "VIEW") {
      if (n.recipeId) return `/recipes/${n.recipeId}`;
      return "/recipes";
    }
    if (n.type === "RATE") {
      if (n.recipeId) return `/recipes/${n.recipeId}`;
      return "/recipes";
    }
    if (n.type === "ADMIN_MESSAGE") {
      if (n.recipeId) return `/recipes/${n.recipeId}`;
      return "/recipes";
    }
    // SYSTEM → Điều hướng đến trang thông báo hệ thống
    if (n.type === "SYSTEM") {
      return "/notifications/system"; // hoặc "#" nếu bạn muốn không điều hướng
    }

    return "#";
  };

  // 🔥 API đánh dấu đã đọc
  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`/api/proxy/notification/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("❌ Mark as read error:", err);
    }
  };

  // 🔥 Click 1 thông báo → mark read
  const handleClickNotification = async (n: NotificationItem) => {
    const link = getNotificationLink(n);

    if (!n.read) {
      updateRead(n.id);
      await markAsRead(n.id);
    }
    router.push(link); // 🔥 điều hướng
  };

  return (
    <div className="relative" ref={notiRef}>
      {/* BUTTON */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="relative hover:text-gray-700 transition flex items-center justify-center"
      >
        <IoNotificationsOutline className="w-6 h-6" />

        {/* Badge = số chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[5px] py-[1px] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Thông báo</h4>

            {/* 🔥 Nút xoá tất cả */}
            {notifications.length > 0 && (
              <button
                onClick={() => deleteAllNotifications()}
                className="text-xs text-red-500 hover:underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-3">
              Không có thông báo mới
            </p>
          )}

          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`relative p-3 border-b last:border-none hover:bg-gray-50 rounded-md cursor-pointer ${n.read ? "opacity-70" : "bg-blue-50"
                  }`}
                onClick={() => handleClickNotification(n)}
              >
                {/* 🔥 Nút xoá 1 thông báo */}
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // ❗ Chặn click vào điều hướng
                    deleteNotification(n.id);
                  }}
                >
                  <IoClose className="w-4 h-4" />
                </button>

                <div className="block">
                  <p className="font-medium text-gray-900">
                    {n.senderName ?? "Ai đó"}{" "}
                    <span className="text-xs text-gray-500">({n.type})</span>
                  </p>

                  <p className="text-gray-700 text-sm">{n.message}</p>

                  <p className="text-gray-400 text-[12px] mt-1">{n.createdAt}</p>
                </div>

              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
