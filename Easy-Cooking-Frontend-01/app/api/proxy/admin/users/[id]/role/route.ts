import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 PARAMS LÀ PROMISE
) {
  // 🔥 UNWRAP PROMISE
  const { id } = await context.params;

  const token = req.headers.get("authorization") ?? "";
  const body = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const backendURL = `http://localhost:8081/api/admin/users/${id}/role`;

    const res = await fetch(backendURL, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    return NextResponse.json({ message: text }, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy Role Error:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
