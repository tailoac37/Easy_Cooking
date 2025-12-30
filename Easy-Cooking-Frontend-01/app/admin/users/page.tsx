"use client";

import { useEffect, useState } from "react";
import { getAuthHeader, getAuthHeaderFormData } from "@/app/utils/auth";
import UserRow from "./UserRow";

interface UserListResponse {
    users: any[];
    totalUsers: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    regularUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    newUsersThisMonth: number;
    newUsersToday: number;
}

export default function UsersPage() {
    const [data, setData] = useState<UserListResponse | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        role: "",
        isActive: "",
        emailVerified: "",
        searchTerm: "",
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
    });

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (filters.role) params.set("role", filters.role);
        if (filters.isActive) params.set("isActive", filters.isActive);
        if (filters.emailVerified) params.set("emailVerified", filters.emailVerified);
        if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
        params.set("page", String(filters.page));
        params.set("size", String(filters.size));
        params.set("sortBy", filters.sortBy);
        params.set("sortDirection", filters.sortDirection);
        return params.toString();
    };

    const loadStats = async () => {
        const res = await fetch("/api/proxy/admin/users/statistics", {
            headers: getAuthHeaderFormData() as HeadersInit,
        });
        if (!res.ok) return;
        const json = await res.json();
        setStats(json);
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const query = buildQuery();

            const res = await fetch(`/api/proxy/admin/users?${query}`, {
                headers: getAuthHeaderFormData() as HeadersInit,
            });

            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error("❌ Lỗi tải danh sách người dùng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadUsers();
    }, [filters.page, filters.role, filters.isActive, filters.emailVerified, filters.sortBy, filters.sortDirection]);

    const handleSearch = () => {
        setFilters((f) => ({ ...f, page: 0 }));
        loadUsers();
    };

    const goPage = (page: number) => {
        if (!data) return;
        if (page < 0 || page >= data.totalPages) return;
        setFilters((f) => ({ ...f, page }));
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Người dùng</h1>
                    <p className="text-xs text-gray-500">
                        Quản lý tài khoản & quyền truy cập hệ thống
                    </p>
                </div>
            </div>

            {/* THỐNG KÊ */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Tổng người dùng" value={stats.totalUsers} />
                    <StatCard label="Đang hoạt động" value={stats.activeUsers} />
                    <StatCard label="Không hoạt động" value={stats.inactiveUsers} />
                    <StatCard label="Tài khoản Admin" value={stats.adminUsers} />
                </div>
            )}

            {/* THANH LỌC / FILTER */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Tìm theo username / email..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, searchTerm: e.target.value }))
                    }
                    className="border rounded-lg px-3 py-2 text-sm w-56"
                />

                <select
                    value={filters.role}
                    onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Vai trò</option>
                    <option value="USER">Người dùng</option>
                    <option value="ADMIN">Quản trị viên</option>
                </select>

                <select
                    value={filters.isActive}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, isActive: e.target.value }))
                    }
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Trạng thái</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng hoạt động</option>
                </select>

                <select
                    value={filters.emailVerified}
                    onChange={(e) =>
                        setFilters((f) => ({ ...f, emailVerified: e.target.value }))
                    }
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">Email</option>
                    <option value="true">Đã xác minh</option>
                    <option value="false">Chưa xác minh</option>
                </select>

                <button
                    onClick={handleSearch}
                    className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-sm"
                >
                    Áp dụng
                </button>
            </div>

            {/* DANH SÁCH NGƯỜI DÙNG */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-4 py-2 border-b text-xs text-gray-500 grid grid-cols-[2fr,1fr,1fr,1.2fr,1fr] gap-4">
                    <span>Người dùng</span>
                    <span>Vai trò</span>
                    <span>Trạng thái</span>
                    <span>Tương tác</span>
                    <span className="text-right">Thao tác</span>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-500">Đang tải...</div>
                ) : !data || data.users.length === 0 ? (
                    <div className="p-6 text-sm text-gray-500 text-center">
                        Không tìm thấy người dùng nào.
                    </div>
                ) : (
                    data.users.map((u) => (
                        <UserRow key={u.userId} user={u} onChanged={loadUsers} />
                    ))
                )}

                {/* PHÂN TRANG */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500">
                        <div>
                            Trang <b>{data.currentPage + 1}</b> / {data.totalPages} –{" "}
                            {data.totalUsers} người dùng
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => goPage(data.currentPage - 1)}
                                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
                                disabled={data.currentPage === 0}
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => goPage(data.currentPage + 1)}
                                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
                                disabled={data.currentPage + 1 >= data.totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value ?? "-"}</p>
        </div>
    );
}
