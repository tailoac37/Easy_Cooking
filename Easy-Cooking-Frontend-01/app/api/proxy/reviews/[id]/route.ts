import { NextRequest, NextResponse } from "next/server";

const API_BASE = "http://localhost:8081/api";

export async function POST(req: NextRequest, context: any) {
  const { id } = await context.params;

  const token = req.headers.get("authorization") ?? "";
  const form = await req.formData();

  const backendForm = new FormData();

  const review = form.get("review");
  if (review instanceof Blob) {
    backendForm.append("review", review, "review.json"); // ⭐ GIỮ NGUYÊN BLOB
  } else {
    return NextResponse.json({ error: "review must be Blob" }, { status: 400 });
  }

  const images = form.getAll("images");
  images.forEach((img) => backendForm.append("images", img as File));

  const backendRes = await fetch(`${API_BASE}/user/review/${id}`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: backendForm,
  });

  const raw = await backendRes.text();

  try {
    return NextResponse.json(JSON.parse(raw), {
      status: backendRes.status,
    });
  } catch {
    return NextResponse.json({ raw }, { status: backendRes.status });
  }
}


export async function GET(req: NextRequest, context: any) {
  const { id } = await context.params; // ⭐ giữ nguyên

  const token = req.headers.get("authorization") ?? "";

  const headers: any = {};
  if (token) {
    headers.Authorization = token;
  }

  const backendRes = await fetch(`${API_BASE}/review/${id}`, {
    headers,
    cache: "no-store",
  });

  const text = await backendRes.text();

  try {
    return NextResponse.json(JSON.parse(text), {
      status: backendRes.status,
    });
  } catch {
    return NextResponse.json({ raw: text }, {
      status: backendRes.status,
    });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  const { id } = await context.params; // ⭐ giữ nguyên
  const token = req.headers.get("authorization") ?? "";
  const body = await req.json();

  const backendRes = await fetch(`${API_BASE}/user/review/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await backendRes.text();

  try {
    return NextResponse.json(JSON.parse(text), {
      status: backendRes.status,
    });
  } catch {
    return NextResponse.json({ raw: text }, {
      status: backendRes.status,
    });
  }
}
