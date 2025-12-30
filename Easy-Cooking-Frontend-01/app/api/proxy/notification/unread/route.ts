// app/api/proxy/notification/unread/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const rawToken = req.headers.get("authorization");

    if (!rawToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const token = rawToken.startsWith("Bearer ")
      ? rawToken
      : `Bearer ${rawToken}`;

    const backendURL =
      "http://localhost:8081/api/user/notification/unread";

    const res = await fetch(backendURL, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Unread Notification Proxy Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch unread notifications" },
      { status: 500 }
    );
  }
}
