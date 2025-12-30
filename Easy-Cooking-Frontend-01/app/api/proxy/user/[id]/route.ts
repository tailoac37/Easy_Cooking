import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://localhost:8081/api";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 🔥 lấy params từ Promise
  const { id } = await context.params;

  // 🔥 lấy token từ FE (optional cho user profile)
  const token = req.headers.get("authorization") || "";

  // 🔥 gọi BE endpoint
  const headers: HeadersInit = token
    ? { Authorization: token }
    : {};

  const response = await fetch(`${BASE_URL}/getUser/${id}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `Backend error: ${response.status}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
