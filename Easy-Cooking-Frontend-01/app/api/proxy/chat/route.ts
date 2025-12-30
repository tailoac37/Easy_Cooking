// app/api/chat/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Lấy token từ localStorage gửi qua Header không được
    // => FE phải truyền token vào Body hoặc Cookie.
    const token = req.headers.get("Authorization") || "";

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 401 }
      );
    }

    const backendRes = await fetch("http://localhost:8081/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // ⬅ token FE gửi lên
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });

    const result = await backendRes.json();

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Chat API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
