// app/api/proxy/notification/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const backendURL = "http://localhost:8081/api/user/notifications";

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
    console.error("❌ Notification Proxy Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

//Xoa het
export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const backendURL = "http://localhost:8081/api/user/notifications";

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
    console.error("❌ Delete All Notifications Error:", err);
    return NextResponse.json(
      { error: "Failed to delete all notifications" },
      { status: 500 }
    );
  }
}
