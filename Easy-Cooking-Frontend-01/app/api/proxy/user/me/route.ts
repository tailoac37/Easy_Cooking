import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());
  console.log("📩 Headers nhận được từ FE:", headers); // 🟢 thêm dòng này để kiểm tra

  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  try {
    const res = await fetch("http://localhost:8081/api/user/me", {
      headers: { Authorization: token },
    });

    const data = await res.json();
    console.log("✅ Backend /user/me trả về:", data); // 🟢 log thêm nếu cần

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy lỗi:", err);
    return NextResponse.json({ message: "Lỗi proxy" }, { status: 500 });
  }
}
