import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, ctx: any) {
  try {
    const { id } = await ctx.params;

    const token = req.headers.get("authorization");

    const backendURL = `http://localhost:8081/api/categories/${id}`;

    // Tạo header động — KHÔNG gửi Authorization rỗng!!!
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = token;
    }

    const res = await fetch(backendURL, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // Nếu BE lỗi → log ra dễ debug
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Backend Error:", text);
      return NextResponse.json(
        { error: "Backend failed", detail: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ Proxy ERROR:", err);
    return NextResponse.json(
      { error: "Proxy crashed" },
      { status: 500 }
    );
  }
}
