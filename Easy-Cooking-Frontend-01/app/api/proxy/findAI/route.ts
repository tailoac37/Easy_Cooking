import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const backendRes = await fetch(
      "http://localhost:8081/api/find/AI",
      {
        method: "POST",
        headers: {
          // KHÔNG ĐƯỢC SET Content-Type ở đây — browser tự set boundary
          Authorization: req.headers.get("Authorization") || "",
        },
        body: formData,
      }
    );

    const text = await backendRes.text();

    // Nếu backend trả HTML hoặc text — vẫn trả JSON để FE không crash
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: backendRes.status });
    } catch (e) {
      return NextResponse.json(
        { error: "Backend returned invalid JSON", raw: text },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Proxy AI failed",
        detail: err.message,
      },
      { status: 500 }
    );
  }
}
