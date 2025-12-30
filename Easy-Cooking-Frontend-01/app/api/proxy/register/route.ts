import { NextResponse } from "next/server";

// Proxy tới backend thật (Render)
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const res = await fetch("http://localhost:8081/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy register error:", err);
    return NextResponse.json(
      { message: "Lỗi kết nối server đăng ký" },
      { status: 500 }
    );
  }
}
