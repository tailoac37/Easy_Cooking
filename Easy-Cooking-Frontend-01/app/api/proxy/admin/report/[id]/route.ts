import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = req.headers.get("authorization") ?? "";

  const res = await fetch(`http://localhost:8081/api/admin/report/${id}`, {
    headers: { Authorization: token },
  });

  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ message: txt }, { status: res.status });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = req.headers.get("authorization") ?? "";
  const body = await req.json();

  const res = await fetch(`http://localhost:8081/api/admin/report/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ message: txt }, { status: res.status });
  }
}
