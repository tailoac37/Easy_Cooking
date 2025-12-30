// app/api/proxy/notification/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, ctx: any) {
  try {
    const { id } = await ctx.params; // NextJS 14: params là Promise

    if (!id) {
      return NextResponse.json(
        { error: "Missing notification id" },
        { status: 400 }
      );
    }

    const token = req.headers.get("authorization") || "";

    const backendURL = `http://localhost:8081/api/user/notifications/${id}`;

    const res = await fetch(backendURL, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type");
    let data;

    if (contentType?.includes("application/json")) data = await res.json();
    else data = await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Delete Notification Error:", err);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
