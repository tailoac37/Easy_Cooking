import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ==========================
// ⭐ PUT: UPDATE COMMENT
// ==========================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ⭐ FIX: params là Promise → phải await
  const { id } = await context.params;

  const token = req.headers.get("authorization") || "";
  const body = await req.json(); // { contents: "..." }

  try {
    const res = await fetch(
      `http://localhost:8081/api/user/comments/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ message: text });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ==========================
// ⭐ DELETE COMMENT
// ==========================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = req.headers.get("authorization") || "";

  try {
    const res = await fetch(
      `http://localhost:8081/api/user/comments/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: token },
      }
    );

    const text = await res.text();
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ message: text });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
