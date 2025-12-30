import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = "http://localhost:8081/api/recipes/popular";

    const res = await fetch(url, { method: "GET", cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch top view recipes" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 }
    );
  }
}
