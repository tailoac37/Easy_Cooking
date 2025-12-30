import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

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

    // 🔥 SAFE-PARSE: tránh JSON.parse error khi BE trả về text
    let data;
    const text = await res.text();

    try {
      data = JSON.parse(text);
    } catch {
      data = text; // nếu không phải JSON → trả text
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy report error:", err);
    return NextResponse.json(
      { error: "Proxy error" },
      { status: 500 }
    );
  }
}
