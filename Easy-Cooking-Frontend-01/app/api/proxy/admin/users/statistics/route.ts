import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";

  try {
    const res = await fetch(
      "http://localhost:8081/api/admin/users/statistics",
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy Error", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
