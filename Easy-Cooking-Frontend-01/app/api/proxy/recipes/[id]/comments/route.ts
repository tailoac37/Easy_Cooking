import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const { id } = await context.params;


  const token = req.headers.get("authorization") || "";

  try {
    const res = await fetch(
      `http://localhost:8081/api/recipes/${id}/comments`,
      {
        cache: "no-store",
        headers: {
          Authorization: token,
        },
      }
    );

    // Nếu backend trả lỗi
    if (!res.ok) {
      const text = await res.text();
      console.error("🔥 Backend GET error:", text);
      return NextResponse.json(
        { error: "Backend error", detail: text },
        { status: res.status }
      );
    }

    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      // Nếu backend trả text "done", chuyển thành JSON hợp lệ luôn
      return NextResponse.json({ message: text });
    }

  } catch (e: any) {
    console.error("🔥 Proxy GET exception:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: any) {
  const { id } = await context.params;

  const token = req.headers.get("authorization") || "";
  const body = await req.json();

  try {
    const res = await fetch(
      `http://localhost:8081/api/user/recipes/${id}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      }
    );

    // Nếu backend trả lỗi
    if (!res.ok) {
      const text = await res.text();
      console.error("🔥 Backend POST error:", text);
      return NextResponse.json(
        { error: "Backend error", detail: text },
        { status: res.status }
      );
    }

    const text = await res.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);        // Nếu backend trả JSON
    } catch (err) {
      console.warn("⚠ Backend trả plain text:", text);

      // Nếu backend trả "done" hoặc "ok"
      return NextResponse.json({ message: text });
    }

  } catch (e: any) {
    console.error("🔥 Proxy POST exception:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
