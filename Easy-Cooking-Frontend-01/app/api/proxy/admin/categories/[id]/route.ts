import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const token = req.headers.get("authorization") ?? "";
    const contentType = req.headers.get("content-type") ?? "";

    // ✅ FIX: Read raw body buffer instead of parsing FormData
    // This preserves the exact multipart boundary sent by the browser
    const bodyBuffer = await req.arrayBuffer();

    const backendRes = await fetch(
      `http://localhost:8081/api/admin/categories/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": contentType, // Keep original boundary
        },
        body: bodyBuffer,
      }
    );

    const text = await backendRes.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    return NextResponse.json(json, { status: backendRes.status });
  } catch (error) {
    console.error("❌ Proxy update category error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = req.headers.get("authorization") ?? "";

  const res = await fetch(
    `http://localhost:8081/api/admin/categories/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: token },
    }
  );

  const txt = await res.text();

  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ message: txt }, { status: res.status });
  }
}
