import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const token = req.headers.get("authorization") ?? "";

    try {
        const res = await fetch("http://localhost:8081/api/admin/chat/history", {
            headers: {
                Authorization: token,
            },
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
