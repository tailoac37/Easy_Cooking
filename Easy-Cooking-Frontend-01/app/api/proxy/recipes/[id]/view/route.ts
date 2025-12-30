import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: any) {
  const { id } = await context.params;

  const token = req.headers.get("authorization") || "";

  try {
    const headers: any = {};
    if (token) {
      headers.Authorization = token;
    }

    const res = await fetch(
      `http://localhost:8081/api/recipes/${id}/view`,
      {
        method: "PATCH",
        headers,
      }
    );

    // 🔥 Nếu backend trả lỗi
    if (!res.ok) {
      const text = await res.text();
      console.error("🔥 Backend error:", text);
      return NextResponse.json(
        { error: "Backend error", detail: text },
        { status: res.status }
      );
    }

    const text = await res.text();

    // 🔥 Thử parse JSON
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      // Nếu backend trả text "done" hoặc "ok"
      return NextResponse.json({ message: text });
    }

  } catch (e: any) {
    console.error("🔥 Proxy exception:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
