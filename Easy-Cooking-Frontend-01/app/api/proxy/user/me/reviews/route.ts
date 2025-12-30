import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization");

        if (!token) {
            return NextResponse.json(
                { message: "Missing token" },
                { status: 401 }
            );
        }

        const backendRes = await fetch(
            "http://localhost:8081/api/user/me/reviews",
            {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!backendRes.ok) {
            return NextResponse.json(
                { message: `Backend error (${backendRes.status})` },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("❌ Error in /api/proxy/user/me/reviews:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
