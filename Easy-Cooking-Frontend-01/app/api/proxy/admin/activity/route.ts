import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const backend = "http://localhost:8081";

  // Lấy query ?page=...&searchTerm=...&sortBy=...
  const query = new URL(req.url).searchParams.toString();

  try {
    const res = await fetch(`${backend}/api/admin/activity?${query}`, {
      method: "GET",
      headers: { Authorization: token },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy activity error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
