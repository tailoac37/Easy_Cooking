import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const newPassword = searchParams.get("newPassword");

    if (!email || !newPassword) {
        return NextResponse.json(
            { success: false, message: "Email và mật khẩu mới là bắt buộc" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(
            `http://localhost:8081/api/auth/changePassword?email=${encodeURIComponent(email)}&newPassword=${encodeURIComponent(newPassword)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { success: false, message: "Không thể kết nối tới server" },
            { status: 500 }
        );
    }
}
