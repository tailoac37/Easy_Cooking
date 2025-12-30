import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendResponse = await fetch(
      "http://localhost:8081/api/recipes/find",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await backendResponse.text();

    return new NextResponse(text, {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Proxy error", detail: err.message },
      { status: 500 }
    );
  }
}
