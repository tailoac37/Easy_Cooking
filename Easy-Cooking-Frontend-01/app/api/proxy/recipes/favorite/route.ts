import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    if (!token) return NextResponse.json({ message: "Missing token" }, { status: 401 });

    const backend = await fetch(
      "http://localhost:8081/api/user/recipes/favorite",
      { headers: { Authorization: token } }
    );

    const raw = await backend.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    return NextResponse.json(data, { status: backend.status });
  } catch (err) {
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");
    if (!token) return NextResponse.json({ message: "Missing token" }, { status: 401 });

    // ⭐ Lấy id từ query
    const recipeId = req.nextUrl.searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { message: "Missing recipeId" },
        { status: 400 }
      );
    }

    // ⭐ Forward DELETE tới backend
    const backend = await fetch(
      `http://localhost:8081/api/user/recipes/${recipeId}/favorite`,
      {
        method: "DELETE",
        headers: { Authorization: token },
      }
    );

    const raw = await backend.text();
    return NextResponse.json({ message: raw }, { status: backend.status });
  } catch (err) {
    console.error("❌ Favorite DELETE Error:", err);
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
