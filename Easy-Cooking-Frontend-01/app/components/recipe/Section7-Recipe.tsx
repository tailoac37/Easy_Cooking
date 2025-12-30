"use client";

import { useState } from "react";

export default function Section7Recipe() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) return alert("Vui lòng nhập email hợp lệ!");

    // 🔹 Giả lập lưu email (sau này có thể gọi API thật)
    console.log("✅ Email đã đăng ký nhận tin:", email);

    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-md p-6 transition">
      <h2 className="text-xl font-bold mb-2 text-gray-900">
        Deliciousness to your inbox 🍰
      </h2>

      {!submitted ? (
        <>
          <p className="text-gray-700 text-sm mb-4">
            Nhận công thức mới, mẹo nấu ăn và gợi ý món ngon mỗi tuần!
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition font-medium"
            >
              JOIN
            </button>
          </form>

          <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
            Bằng cách tham gia, bạn đồng ý với{" "}
            <a href="#" className="underline hover:text-orange-600">
              điều khoản sử dụng
            </a>{" "}
            của chúng tôi.
          </p>
        </>
      ) : (
        <div className="text-center text-gray-800 py-4">
          <p className="text-lg font-semibold mb-1">🎉 Đăng ký thành công!</p>
          <p className="text-sm text-gray-600">
            Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận công thức mới mỗi tuần nhé.
          </p>
        </div>
      )}
    </div>
  );
}
