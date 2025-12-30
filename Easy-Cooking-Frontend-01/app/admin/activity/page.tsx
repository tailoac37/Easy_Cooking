"use client";

import { useEffect, useState } from "react";
import { getAuthHeader } from "@/app/utils/auth";

interface AdminAction {
    actionId: number;
    actionType: string;
    adminUserName: string;
    adminEmail: string;
    targetUserName: string | null;
    targetUserEmail: string | null;
    recipeTitle: string | null;
    categoryName: string | null;
    reportReason: string | null;
    adminNote: string | null;
    createdAt: string;
}

interface ActivityResponse {
    actions: AdminAction[];
    totalActions: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
}

interface StatsResponse {
    totalActions: number;
    message: string;
    admins: string[];
}

export default function ActivityPage() {
    const [data, setData] = useState<ActivityResponse | null>(null);
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        actionType: "",
        searchTerm: "",
        adminId: "",
        targetUserId: "",
        timeline: "ALL",
        page: 0,
        size: 10,
        sortBy: "createdAt",
        sortDirection: "DESC",
    });

    const buildTimelineQuery = () => {
        const today = new Date();
        let from = null;

        if (filters.timeline === "TODAY") {
            from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        }

        if (filters.timeline === "WEEK") {
            const firstDay = today.getDate() - today.getDay();
            from = new Date(today.setDate(firstDay)).toISOString();
        }

        if (filters.timeline === "MONTH") {
            from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        }

        return from ? `&createdAtFrom=${from}` : "";
    };

    const buildQuery = () => {
        const params = new URLSearchParams();

        if (filters.actionType) params.set("actionType", filters.actionType);
        if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
        if (filters.adminId) params.set("adminId", filters.adminId);
        if (filters.targetUserId) params.set("targetUserId", filters.targetUserId);

        params.set("page", String(filters.page));
        params.set("size", String(filters.size));
        params.set("sortBy", filters.sortBy);
        params.set("sortDirection", filters.sortDirection);

        return params.toString() + buildTimelineQuery();
    };

    const loadStats = async () => {
        const res = await fetch("/api/proxy/admin/activity/stats", {
            headers: getAuthHeader() as HeadersInit,
        });

        const json = await res.json();

        const adminListRes = await fetch("/api/proxy/admin/activity?page=0&size=100", {
            headers: getAuthHeader() as HeadersInit,
        });

        const adminListJson = await adminListRes.json();

        const admins = Array.from(
            new Set(adminListJson.actions.map((a: any) => a.adminUserName))
        );

        setStats({ ...json, admins });
    };

    const loadData = async () => {
        try {
            setLoading(true);

            const query = buildQuery();

            const res = await fetch(`/api/proxy/admin/activity?${query}`, {
                headers: getAuthHeader() as HeadersInit,
            });

            let json = null;

            try {
                json = await res.json();
            } catch {
                json = { actions: [], totalActions: 0, totalPages: 0, currentPage: 0 };
            }

            setData(json);
        } catch (err) {
            console.error("❌ Lỗi tải activity:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        loadData();
    }, []);

    useEffect(() => {
        loadData();
    }, [
        filters.page,
        filters.actionType,
        filters.searchTerm,
        filters.timeline,
        filters.adminId,
    ]);

    const goPage = (page: number) => {
        if (!data) return;
        if (page < 0 || page >= data.totalPages) return;
        setFilters((f) => ({ ...f, page }));
    };

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Nhật ký hoạt động</h1>
                <p className="text-xs text-gray-500">Theo dõi lịch sử thao tác của đội ngũ Admin</p>
            </div>

            {/* STATS */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard label="Tổng số thao tác" value={stats.totalActions} />
                    <StatCard label="Số Admin đã thao tác" value={stats.admins.length} />
                </div>
            )}

            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">

                {/* Dòng 1: action type + search */}
                <div className="flex flex-wrap gap-3 items-center">

                    <select
                        value={filters.actionType}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, actionType: e.target.value }))
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Loại thao tác</option>
                        <option value="APPROVE">Duyệt công thức</option>
                        <option value="REJECT">Từ chối công thức</option>
                        <option value="WARN">Cảnh cáo</option>
                        <option value="DELETE">Xóa</option>
                        <option value="REVIEW">Đánh dấu đã xem</option>
                        <option value="CATEGORIES">Quản lý danh mục</option>
                        <option value="USER_STATUS_CHANGE">Thay đổi trạng thái user</option>
                        <option value="USER_ROLE_CHANGE">Thay đổi quyền user</option>
                        <option value="USER_DELETE">Xóa user</option>
                    </select>

                    <input
                        placeholder="Tìm kiếm..."
                        value={filters.searchTerm}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, searchTerm: e.target.value }))
                        }
                        className="border rounded-lg px-3 py-2 text-sm w-56"
                    />
                </div>

                {/* Dòng 2: Admin + User */}
                <div className="flex flex-wrap gap-3">

                    <select
                        value={filters.adminId}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, adminId: e.target.value }))
                        }
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">Admin thực hiện</option>
                        {stats?.admins.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>

                    <input
                        placeholder="Lọc theo user bị tác động..."
                        value={filters.targetUserId}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, targetUserId: e.target.value }))
                        }
                        className="border rounded-lg px-3 py-2 text-sm w-56"
                    />
                </div>

                {/* Dòng 3: Timeline */}
                <div className="flex gap-2">
                    {[
                        ["ALL", "Tất cả"],
                        ["TODAY", "Hôm nay"],
                        ["WEEK", "Tuần này"],
                        ["MONTH", "Tháng này"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() =>
                                setFilters((f) => ({ ...f, timeline: value }))
                            }
                            className={`px-3 py-1 text-xs rounded-full border ${
                                filters.timeline === value
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-4 py-2 border-b text-xs text-gray-500 grid grid-cols-[1fr,2fr,2fr,1fr] gap-4">
                    <span>Admin</span>
                    <span>Thao tác</span>
                    <span>Ghi chú</span>
                    <span>Thời gian</span>
                </div>

                {loading ? (
                    <div className="p-4 text-sm text-gray-500">Đang tải...</div>
                ) : data && data.actions.length > 0 ? (
                    data.actions.map((a) => <ActivityRow key={a.actionId} action={a} />)
                ) : (
                    <div className="p-6 text-sm text-gray-500 text-center">
                        Không có hoạt động nào.
                    </div>
                )}

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-gray-500">
                        <div>
                            Trang <b>{data.currentPage + 1}</b> / {data.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={data.currentPage === 0}
                                onClick={() => goPage(data.currentPage - 1)}
                                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
                            >
                                Trước
                            </button>
                            <button
                                disabled={data.currentPage + 1 >= data.totalPages}
                                onClick={() => goPage(data.currentPage + 1)}
                                className="px-3 py-1 border rounded-lg text-xs disabled:opacity-40"
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

function ActivityRow({ action }: { action: AdminAction }) {
    return (
        <div className="px-4 py-3 border-t grid grid-cols-[1fr,2fr,2fr,1fr] gap-4 text-sm items-center">
            <div>{action.adminUserName}</div>

            <div>
                <span className="font-medium">{action.actionType}</span>

                {action.recipeTitle && (
                    <p className="text-xs text-gray-500">
                        Công thức: {action.recipeTitle}
                    </p>
                )}

                {action.categoryName && (
                    <p className="text-xs text-gray-500">
                        Danh mục: {action.categoryName}
                    </p>
                )}

                {action.targetUserName && (
                    <p className="text-xs text-gray-500">
                        Tác động lên user: {action.targetUserName}
                    </p>
                )}
            </div>

            <div className="text-xs text-gray-600">
                {action.adminNote || "(Không có ghi chú)"}
            </div>

            <div className="text-xs text-gray-500">
                {new Date(action.createdAt).toLocaleString()}
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
    );
}
