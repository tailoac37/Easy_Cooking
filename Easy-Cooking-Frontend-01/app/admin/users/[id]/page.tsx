"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getAuthHeader, getAuthHeaderFormData } from "@/app/utils/auth";

export default function UserDetailPage() {
    const { id } = useParams();
    const [user, setUser] = useState<any>(null);

    const loadDetail = async () => {
        const res = await fetch(`/api/proxy/admin/users/${id}`, {
            headers: getAuthHeaderFormData() as HeadersInit,
        });

        const json = await res.json();
        setUser(json);
    };

    useEffect(() => {
        if (id) loadDetail();
    }, [id]);

    if (!user) return <p className="p-6 text-sm">Đang tải...</p>;

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">User Detail</h1>

            <div className="bg-white border rounded-xl p-4 space-y-2">
                <p><b>ID:</b> {user.userId}</p>
                <p><b>Username:</b> {user.userName}</p>
                <p><b>Email:</b> {user.email}</p>
                <p><b>Role:</b> {user.role}</p>
                <p><b>Active:</b> {String(user.isActive)}</p>
                <p><b>Recipes:</b> {user.totalRecipes}</p>
                <p><b>Followers:</b> {user.totalFollowers}</p>
                <p><b>Comments:</b> {user.totalComments}</p>
            </div>
        </div>
    );
}
