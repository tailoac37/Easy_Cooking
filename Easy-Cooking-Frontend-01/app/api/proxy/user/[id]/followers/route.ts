import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  const { id } = await context.params; // ⭐ QUAN TRỌNG

  try {
    const backendRes = await fetch(
      `http://localhost:8081/api/${id}/followers`,
      { method: "GET" }
    );

    const text = await backendRes.text();
    console.log("📌 Followers raw response:", text);

    try {
      return NextResponse.json(JSON.parse(text));   // Nếu backend trả JSON
    } catch {
      return NextResponse.json({ message: text });  // Nếu backend trả text
    }

  } catch (err: any) {
    console.error("❌ Followers proxy error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
