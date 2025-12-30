"use client";

import { useEffect, useState } from "react";
import { getAuthHeader, getAuthHeaderFormData } from "../utils/auth";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  const loadStats = async () => {
    const headers = getAuthHeader();

    // 📌 Gọi API thống kê người dùng
    const userStats = await fetch("/api/proxy/admin/users/statistics", {
      headers: getAuthHeaderFormData() as HeadersInit,
    }).then((r) => r.json());

    // 📌 Có thể gọi thêm: thống kê công thức, báo cáo, tương tác...
    setStats({
      userStats,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bảng Điều Khiển</h1>
      <p className="text-sm text-gray-500 -mt-2">
        Tổng quan hệ thống quản trị Cooking Admin
      </p>

      {/* GRID 4 CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Tổng số người dùng" value={stats?.userStats?.totalUsers} />
        <Card title="Đang hoạt động" value={stats?.userStats?.activeUsers} />
        <Card title="Không hoạt động" value={stats?.userStats?.inactiveUsers} />
        <Card title="Tài khoản Admin" value={stats?.userStats?.adminUsers} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <p className="text-gray-500 text-xs">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value ?? "-"}</p>
    </div>
  );
}
