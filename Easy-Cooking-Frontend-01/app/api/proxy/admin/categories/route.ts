import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization") || "";
    const contentType = req.headers.get("content-type") || "";
    const bodyBuffer = await req.arrayBuffer();

    const backendRes = await fetch(
      "http://localhost:8081/api/admin/categories",
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": contentType, // giữ nguyên boundary
        },
        body: bodyBuffer,
      }
    );

    const text = await backendRes.text();
    let json;

    try { json = JSON.parse(text); }
    catch { json = { raw: text }; }

    return NextResponse.json(json, { status: backendRes.status });
  } catch (e) {
    console.error("❌ Proxy category error:", e);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
