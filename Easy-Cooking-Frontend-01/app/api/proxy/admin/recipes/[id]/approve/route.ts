import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = req.headers.get("authorization") ?? "";
  const body = await req.json();

  try {
    const backendURL = `http://localhost:8081/api/admin/recipes/${id}/approve`;

    const res = await fetch(backendURL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // 👉 ĐỌC BODY MỘT LẦN DUY NHẤT
    const raw = await res.text();

    let data;

    // 👉 cố parse JSON
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw; // fallback về text
    }

    return NextResponse.json(
      { message: data },
      { status: res.status }
    );

  } catch (err) {
    console.error("❌ Proxy approve recipe error:", err);
    return NextResponse.json(
      { error: "Proxy failed" },
      { status: 500 }
    );
  }
}
