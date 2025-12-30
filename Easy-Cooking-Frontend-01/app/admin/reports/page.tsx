"use client";

import { useEffect, useState } from "react";
import { getAuthHeader } from "@/app/utils/auth";
import Link from "next/link";

export default function ReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [status, setStatus] = useState("PENDING");
    const [loading, setLoading] = useState(true);

    const loadReports = async () => {
        setLoading(true);

        const res = await fetch(`/api/proxy/admin/report?status=${status}`, {
            headers: getAuthHeader() as HeadersInit,
        });

        const json = await res.json();

        // ⭐ CHỐNG LỖI MAP
        setReports(Array.isArray(json) ? json : []);

        setLoading(false);
    };

    useEffect(() => {
        loadReports();
    }, [status]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Báo cáo vi phạm</h1>
            <p className="text-sm text-gray-500 -mt-2">Quản lý các báo cáo từ người dùng</p>

            {/* FILTER */}
            <div className="flex gap-3 bg-white p-4 rounded-xl border shadow-sm">
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                >
                    <option value="PENDING">Đang chờ xử lý</option>
                    <option value="REVIEWED">Đã xem</option>
                    <option value="RESOLVED">Đã xử lý</option>
                    <option value="REJECTED">Đã từ chối</option>
                </select>

                <button
                    onClick={loadReports}
                    className="px-4 py-2 text-sm bg-black text-white rounded-lg"
                >
                    Làm mới
                </button>
            </div>

            {/* LIST */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="p-4 text-sm text-gray-500">Đang tải...</div>
                ) : reports.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">
                        Không có báo cáo nào.
                    </div>
                ) : (
                    reports.map((r: any) => (
                        <div
                            key={r.reportId}
                            className="px-4 py-3 border-t flex justify-between items-center text-sm"
                        >
                            <div>
                                <p className="font-medium">{r.recipeTitle}</p>
                                <p className="text-xs text-gray-500">
                                    Người báo cáo: {r.userName || "(Không rõ)"}
                                </p>
                            </div>

                            <Link
                                href={`/admin/reports/${r.reportId}`}
                                className="px-3 py-1.5 border rounded-lg text-xs hover:bg-gray-50"
                            >
                                Xem chi tiết
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
