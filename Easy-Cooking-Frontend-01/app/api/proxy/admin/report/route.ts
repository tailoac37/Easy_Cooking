import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization") ?? "";
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";

  const backendURL = `http://localhost:8081/api/admin/report${status ? "?status=" + status : ""}`;

  const res = await fetch(backendURL, {
    method: "GET",
    headers: { Authorization: token },
  });

  const txt = await res.text();
  try {
    return NextResponse.json(JSON.parse(txt), { status: res.status });
  } catch {
    return NextResponse.json({ message: txt }, { status: res.status });
  }
}
