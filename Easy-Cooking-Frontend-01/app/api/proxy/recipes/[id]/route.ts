import { NextRequest, NextResponse } from "next/server";
// chi tiết công thức 
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 params là Promise
) {
  const { id } = await context.params;           // 👈 phải await
  const token = req.headers.get("authorization") || "";

  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    // Only add Authorization header if token exists
    if (token) {
      headers.Authorization = token;
    }

    const res = await fetch(
      `http://localhost:8081/api/recipes/${id}`,
      { headers }
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: `Lỗi backend (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Lỗi proxy /api/proxy/recipes/[id]:", error);
    return NextResponse.json(
      { message: "Lỗi kết nối backend" },
      { status: 500 }
    );
  }
}

//sua cong thuc

export async function PUT(req: NextRequest, context: any): Promise<NextResponse> {
  try {
    // ⭐ NextJS 14: params là Promise -> phải await
    const { id } = await context.params;
    const recipeId = id;

    console.log("👉 Updating recipe:", recipeId);

    if (!recipeId) {
      return NextResponse.json({ message: "Missing recipe ID" }, { status: 400 });
    }

    const token = req.headers.get("Authorization");
    console.log("👉 Token:", token);

    if (!token) {
      return NextResponse.json(
        { message: "Missing Bearer Token" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const recipesJson = formData.get("recipes");
    console.log("👉 Has recipes JSON:", !!recipesJson);

    if (!recipesJson) {
      return NextResponse.json(
        { message: "Missing recipes JSON" },
        { status: 400 }
      );
    }

    // ⭐ Forward form
    const forward = new FormData();
    forward.append("recipes", recipesJson);

    // Primary image
    const imagePrimary = formData.get("image_primary");
    if (imagePrimary instanceof File) {
      console.log("👉 Has image_primary");
      forward.append("image_primary", imagePrimary);
    }

    // Step images
    const images = formData.getAll("image");
    console.log("👉 Total step images:", images.length);

    images.forEach((img) => {
      if (img instanceof File) forward.append("image", img);
    });

    console.log("👉 Sending to backend...");

    const backendRes = await fetch(
      `http://localhost:8081/api/user/recipes/${recipeId}`,
      {
        method: "PUT",
        headers: {
          Authorization: token,
        },
        body: forward,
      }
    );

    console.log("👉 Backend status:", backendRes.status);

    let backendData = null;
    try {
      backendData = await backendRes.json();
    } catch (_) {
      console.log("⚠ Backend returned non-JSON");
    }

    console.log("👉 Backend response:", backendData);

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Backend error", backendData },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(
      { message: "Update success", backendData },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("❌ INTERNAL ERROR:", err);
    return NextResponse.json(
      { message: "Internal error", error: err.message },
      { status: 500 }
    );
  }
}







