import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const token = req.headers.get("authorization") ?? "";
    const contentType = req.headers.get("content-type") ?? "";

    try {
        const bodyBuffer = await req.arrayBuffer();

        const res = await fetch("http://localhost:8081/api/admin/chat/upload", {
            method: "POST",
            headers: {
                Authorization: token,
                "Content-Type": contentType, // Keep boundary
            },
            body: bodyBuffer,
        });

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
