import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization") || "";

    const body = await req.json();

    const res = await fetch("http://localhost:8081/api/user/report", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy report error:", err);
    return NextResponse.json(
      { message: "Lỗi proxy gửi báo cáo" },
      { status: 500 }
    );
  }
}
