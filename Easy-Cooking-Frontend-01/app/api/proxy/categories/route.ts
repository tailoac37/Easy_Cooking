import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const backendURL = "http://localhost:8081/api/categories";

    const res = await fetch(backendURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Categories Proxy Error:", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 }
    );
  }
}
