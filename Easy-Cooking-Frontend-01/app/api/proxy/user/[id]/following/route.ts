import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("📌 FOLLOWING — userId:", id);

  if (!id) {
    return NextResponse.json({ message: "Missing ID" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(
      `http://localhost:8081/api/${id}/following`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const text = await backendRes.text();
    console.log("📌 Raw backend response (following):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("❌ Proxy error:", err);
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}
