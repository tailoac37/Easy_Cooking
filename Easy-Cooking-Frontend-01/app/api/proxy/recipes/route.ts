import { NextResponse } from "next/server";

// 🟢 GET: Lấy danh sách công thức
export async function GET(req: Request) {
  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ message: "Thiếu token" }, { status: 401 });
  }

  try {
    const res = await fetch("http://localhost:8081/api/recipes", {
      headers: {
        Authorization: token,
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : [data], {
      status: res.status,
    });
  } catch (err) {
    console.error("❌ Proxy lỗi (GET /recipes):", err);
    return NextResponse.json({ message: "Lỗi proxy recipe" }, { status: 500 });
  }
}

// 🟠 POST: Đăng công thức mới (FormData)
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization") || "";
    const contentType = req.headers.get("content-type") || "";
    const backendUrl = "http://localhost:8081/api/user/recipes";

    // ✅ Không dùng req.formData() — đọc raw stream multipart
    const bodyBuffer = await req.arrayBuffer();

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": contentType, // ⚡ Giữ nguyên boundary từ client
      },
      body: bodyBuffer,
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    console.log("📦 Backend status:", res.status);
    console.log("📦 Backend response:", data);

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Proxy lỗi (POST /recipes):", err);
    return NextResponse.json(
      { message: "Lỗi proxy khi đăng công thức" },
      { status: 500 }
    );
  }
}
