import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, context: any) {
  try {
    // 🔥 FIX QUAN TRỌNG: unwrap params
    const { id } = await context.params;

    if (!id) {
      console.error("❌ ID is missing in unlike!");
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const token = req.headers.get("authorization") || "";

    // 🔗 Backend URL chính xác
    const backendURL = `http://localhost:8081/api/user/recipes/${id}/like`;

    // Forward request
    const res = await fetch(backendURL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      cache: "no-store",
    });

    // LOG backend response — quan trọng khi debug 400
    const text = await res.text();
    console.log("🔥 BACKEND RESPONSE (UNLIKE):", text);

    return new NextResponse(text, { status: res.status });

  } catch (error: any) {
    console.error("❌ Proxy Unlike Error:", error);
    return NextResponse.json(
      { error: "Unlike failed", detail: error?.message },
      { status: 500 }
    );
  }
}
