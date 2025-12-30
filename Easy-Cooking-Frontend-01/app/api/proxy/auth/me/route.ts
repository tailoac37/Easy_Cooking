import { UserProfile } from "@/app/types/userProfile";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  try {
    const res = await fetch("http://localhost:8081/api/user/me", {
      headers: { Authorization: authHeader || "" },
    });

    const data: UserProfile = await res.json();
    console.log(data);
    return NextResponse.json(data, { status: res.status });

  } catch (err) {
    console.error("Proxy /auth/me error:", err);
    return NextResponse.json({ message: "Lỗi proxy token" }, { status: 500 });
  }
}
