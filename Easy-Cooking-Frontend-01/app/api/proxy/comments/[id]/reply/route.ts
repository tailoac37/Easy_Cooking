import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";  // bắt buộc khi dùng params + fetch động

export async function POST(req: NextRequest, context: any) {
    const { id } = await context.params;   // ⭐ FIX CHÍNH: params là Promise

    const token = req.headers.get("authorization") || "";
    const body = await req.json();

    try {
        const res = await fetch(
            `http://localhost:8081/api/user/comments/${id}/reply`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify(body),
            }
        );

        const text = await res.text();

        try {
            return NextResponse.json(JSON.parse(text));
        } catch {
            return NextResponse.json({ message: text });
        }

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
