import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const token = req.headers.get("authorization") ?? "";

  try {
    const res = await fetch(
      `http://localhost:8081/api/admin/categories/${id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: token,
        },
      }
    );

    const txt = await res.text();
    let json;

    try {
      json = JSON.parse(txt);
    } catch {
      json = { message: txt };
    }

    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy deactivate category error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
