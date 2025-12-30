import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");

    if (!email || !otp) {
        return NextResponse.json(
            { success: false, message: "Email và OTP là bắt buộc" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(
            `http://localhost:8081/api/auth/verifyOTP?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }
        );

        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { success: false, message: "Không thể kết nối tới server" },
            { status: 500 }
        );
    }
}
