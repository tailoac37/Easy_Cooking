import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🔥 bắt buộc await

  if (!id) {
    return NextResponse.json(
      { error: "Missing recipe id" },
      { status: 400 }
    );
  }

  const token = req.headers.get("authorization") ?? "";
  const body = await req.json(); // {"adminNote": "..."} từ FE

  try {
    const backendURL = `http://localhost:8081/api/admin/recipes/${id}/reject`;

    const res = await fetch(backendURL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // 👉 Đọc response THÔ (chỉ 1 lần duy nhất)
    const raw = await res.text();

    let data;

    // 👉 Nếu parse được JSON → dùng JSON
    try {
      data = JSON.parse(raw);
    } catch {
      // 👉 Nếu không phải JSON → trả text
      data = raw;
    }

    return NextResponse.json(
      { message: data },
      { status: res.status }
    );
  } catch (err) {
    console.error("❌ Proxy reject recipe error:", err);
    return NextResponse.json(
      { error: "Proxy failed" },
      { status: 500 }
    );
  }
}
