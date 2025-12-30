import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const query = new URL(req.url).searchParams.toString();

  try {
    const res = await fetch(
      `http://localhost:8081/api/admin/users?${query}`,
      {
        method: "GET",
        headers: { Authorization: token },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
