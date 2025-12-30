import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // 🔥 BẮT BUỘC PHẢI AWAIT

  if (!id) {
    return NextResponse.json(
      { error: "Missing user id" },
      { status: 400 }
    );
  }

  const token = req.headers.get("authorization") ?? "";

  try {
    const backendURL = `http://localhost:8081/api/admin/users/${id}`;

    const res = await fetch(backendURL, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy user detail error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
