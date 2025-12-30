import { NextRequest, NextResponse } from "next/server";

const backend = "http://localhost:8081";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";

  // Lấy query string đầy đủ
  const query = new URL(req.url).searchParams.toString();

  try {
    const res = await fetch(`${backend}/api/admin/recipes?${query}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy admin recipes error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
