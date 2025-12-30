// app/api/proxy/notification/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    // Next 14: params là Promise
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification id" },
        { status: 400 }
      );
    }

    const token = req.headers.get("authorization") || "";

    const backendURL = `http://localhost:8081/api/user/notifications/${id}/read`;

    const res = await fetch(backendURL, {
      method: "PATCH",
      headers: {
        Authorization: token,
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
    console.error("❌ Read Notification Proxy Error:", err);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}
