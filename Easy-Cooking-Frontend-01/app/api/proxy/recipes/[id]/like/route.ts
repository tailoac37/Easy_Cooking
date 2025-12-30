import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, context: any) {
  try {
    // ⬅ ĐÚNG CHUẨN NextJS 14: params là Promise nên phải await
    const { id } = await context.params;

    if (!id) {
      console.error("❌ ID is missing!");
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const token = req.headers.get("authorization") || "";

    const backendURL = `http://localhost:8081/api/user/recipes/${id}/like`;

    const res = await fetch(backendURL, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // Backend có thể trả JSON hoặc "ok"
    const contentType = res.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    console.log("🔥 BACKEND RESPONSE:", data);

    return NextResponse.json({ data }, { status: res.status });
    
  } catch (error: any) {
    console.error("❌ Proxy Like Error:", error);
    return NextResponse.json(
      { error: "Like failed", detail: error?.message },
      { status: 500 }
    );
  }
}
