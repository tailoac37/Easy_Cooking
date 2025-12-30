import { NextRequest, NextResponse } from "next/server";

// =======================
// FOLLOW — POST
// =======================
export async function POST(req: NextRequest, context: any) {
  const { id } = await context.params;   // ⭐ FIX LỖI QUAN TRỌNG
  const token = req.headers.get("authorization") || "";

  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(
      `http://localhost:8081/api/user/${id}/follow`,
      {
        method: "POST",
        headers: { Authorization: token },
      }
    );

    const text = await backendRes.text();
    console.log("✅ Raw backend response (POST):", text);

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ message: text });
    }

  } catch (e: any) {
    console.error("❌ Follow proxy error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}



// =======================
// UNFOLLOW — DELETE
// =======================
export async function DELETE(req: NextRequest, context: any) {
  const { id } = await context.params;   // ⭐ FIX LỖI QUAN TRỌNG
  const token = req.headers.get("authorization") || "";

  if (!token) {
    return NextResponse.json({ message: "Token missing" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(
      `http://localhost:8081/api/user/${id}/follow`,
      {
        method: "DELETE",
        headers: { Authorization: token },
      }
    );

    const text = await backendRes.text();
    console.log("🗑️ Raw backend response (DELETE):", text);

    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ message: text });
    }

  } catch (e: any) {
    console.error("❌ Unfollow proxy error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
