import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 🔥 UNWRAP params
  const { id } = await context.params;

  const token = req.headers.get("authorization") ?? "";
  const body = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  try {
    const backendURL = `http://localhost:8081/api/admin/users/${id}/status`;

    const res = await fetch(backendURL, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // backend trả về text thuần "User X status updated"
    const resultText = await res.text();

    return NextResponse.json(
      { message: resultText },
      { status: res.status }
    );
  } catch (err) {
    console.error("❌ Proxy Status Error:", err);
    return NextResponse.json(
      { error: "Proxy status update failed" },
      { status: 500 }
    );
  }
}
