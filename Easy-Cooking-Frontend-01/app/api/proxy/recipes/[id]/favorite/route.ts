import { NextRequest, NextResponse } from "next/server";

/* ===========================
    POST → Add Favorite
=========================== */
export async function POST(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const backendRes = await fetch(
      `http://localhost:8081/api/user/recipes/${id}/favorite`,
      {
        method: "POST",
        headers: {
          Authorization: token,
        },
      }
    );

    const raw = await backendRes.text();

    return NextResponse.json(
      { success: backendRes.ok, message: raw },
      { status: backendRes.status }
    );
  } catch (error) {
    console.error("❌ Favorite Proxy Error (POST):", error);
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}

/* ===========================
    DELETE → Remove Favorite
=========================== */
export async function DELETE(req: NextRequest, context: any) {
  try {
    const { id } = await context.params;

    const token = req.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 401 });
    }

    const backendRes = await fetch(
      `http://localhost:8081/api/user/recipes/${id}/favorite`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      }
    );

    const raw = await backendRes.text();

    return NextResponse.json(
      { success: backendRes.ok, message: raw },
      { status: backendRes.status }
    );
  } catch (error) {
    console.error("❌ Favorite Proxy Error (DELETE):", error);
    return NextResponse.json({ message: "Proxy error" }, { status: 500 });
  }
}

/* ===========================
    GET → Get Favorite List
=========================== */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization");

    if (!token) {
      return NextResponse.json(
        { message: "Missing token" },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      "http://localhost:8081/api/user/recipes/favorite",
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
      }
    );

    const text = await backendRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text; // fallback
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error("❌ GET favorites Proxy Error:", error);
    return NextResponse.json({ message: "Proxy error FE → BE" }, { status: 500 });
  }
}

