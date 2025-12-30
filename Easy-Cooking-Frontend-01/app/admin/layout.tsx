"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // ❗ Chỉ redirect khi loading = false
  useEffect(() => {
    if (loading) return; // Chờ AuthContext load token

    if (!user) {
      router.replace("/login"); // Không có user → quay lại trang đăng nhập
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/"); // Không phải admin → quay lại trang chủ
    }
  }, [user, loading]);

  // ❗ Khi đang loading → không render layout để tránh lỗi
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-500">
        Đang xác thực...
      </div>
    );
  }

  // ❗ Nếu user không phải admin → tránh hiển thị nháy layout
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const menu = [
    { name: "Tổng quan", href: "/admin" },
    { name: "Người dùng", href: "/admin/users" },
    { name: "Công thức", href: "/admin/recipes" },
    { name: "Hoạt động", href: "/admin/activity" },
    { name: "Danh mục", href: "/admin/categories" },
    { name: "Báo cáo vi phạm", href: "/admin/reports" },
    { name: "Chat nội bộ", href: "/admin/chat" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800">
      {/* THANH BÊN TRÁI */}
      <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold tracking-tight">Cooking Admin</h1>
          <p className="text-xs text-gray-500">Bảng điều khiển quản trị</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menu.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition
                  ${active
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs text-gray-400">
          © {new Date().getFullYear()} CookingWeb Admin
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
