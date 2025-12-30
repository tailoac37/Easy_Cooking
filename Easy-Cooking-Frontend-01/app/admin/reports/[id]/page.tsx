"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthHeader } from "@/app/utils/auth";

export default function ReportDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");

    const loadDetail = async () => {
        const res = await fetch(`/api/proxy/admin/report/${id}`, {
            headers: getAuthHeader() as HeadersInit,
        });
        const json = await res.json();
        setReport(json);
        setLoading(false);
    };

    useEffect(() => {
        loadDetail();
    }, [id]);

    /**
     * action:
     * REVIEWED  → chỉ đánh dấu đã xem
     * REJECTED  → từ chối báo cáo
     * RESOLVED  → cảnh cáo user vi phạm
     * DELETE    → xóa bài viết bị báo cáo
     */
    const handleAction = async (
        action: "REVIEWED" | "REJECTED" | "RESOLVED" | "DELETE"
    ) => {
        let status = action === "DELETE" ? "RESOLVED" : action;

        let payload: any = {
            status,
            adminNote: note,
        };

        if (action === "RESOLVED") payload.type = "WARN";
        if (action === "DELETE") payload.type = "DELETE";

        const res = await fetch(`/api/proxy/admin/report/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...(getAuthHeader() as Record<string, string>),
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            alert("Xử lý thất bại!");
            return;
        }

        alert("Cập nhật thành công!");
        router.push("/admin/reports");
    };

    if (loading)
        return <p className="p-6 text-sm text-gray-500">Đang tải dữ liệu...</p>;

    if (!report)
        return <p className="p-6 text-sm text-gray-500">Không tìm thấy báo cáo.</p>;

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold">Chi tiết báo cáo #{report.reportId}</h1>

            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">

                <div>
                    <p className="text-xs text-gray-500 mb-1">Tiêu đề công thức</p>
                    <p className="font-semibold">{report.recipeTitle}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 mb-1">Người báo cáo</p>
                    <p>{report.reporterName || "(Không rõ)"}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 mb-1">Lý do báo cáo</p>
                    <p>{report.reason}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                    <p className="text-sm">{report.description || "-"}</p>
                </div>

                <hr />

                {/* ADMIN NOTE */}
                <div>
                    <p className="text-xs text-gray-500 mb-1">Ghi chú xử lý</p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập mô tả / lý do xử lý..."
                        className="border rounded-lg px-3 py-2 w-full text-sm min-h-[80px]"
                    />
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t">

                    <button
                        onClick={() => handleAction("REVIEWED")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                        Đánh dấu đã xem (REVIEWED)
                    </button>

                    <button
                        onClick={() => handleAction("REJECTED")}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm"
                    >
                        Từ chối báo cáo (REJECTED)
                    </button>

                    <button
                        onClick={() => handleAction("RESOLVED")}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm"
                    >
                        Cảnh cáo người vi phạm (RESOLVED)
                    </button>

                    <button
                        onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                                handleAction("DELETE");
                            }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                        Xóa bài viết (DELETE)
                    </button>
                </div>
            </div>
        </div>
    );
}
