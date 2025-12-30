import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  try {
    // 🟢 Phải dùng formData(), không dùng json()
    const formData = await req.formData();
    console.log("📦 FormData nhận từ FE:", Array.from(formData.entries()));

    // 🟢 Gửi sang backend thật (PUT)
    const res = await fetch("http://localhost:8081/api/user/me", {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: formData, // ✅ giữ nguyên định dạng multipart/form-data
    });

    // ✅ backend có thể trả text hoặc JSON
    const text = await res.text();
    console.log("📩 Raw backend response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy lỗi khi cập nhật user:", err);
    return NextResponse.json({ message: "Lỗi proxy" }, { status: 500 });
  }
}
