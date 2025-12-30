import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await context.params;
  const token = req.headers.get("authorization") ?? "";
  const backend = "http://localhost:8081";

  if (!adminId) {
    return NextResponse.json(
      { error: "Missing admin id" },
      { status: 400 }
    );
  }

  const query = new URL(req.url).searchParams.toString();

  try {
    const res = await fetch(
      `${backend}/api/admin/activity/${adminId}?${query}`,
      {
        method: "GET",
        headers: { Authorization: token },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy admin activity error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
