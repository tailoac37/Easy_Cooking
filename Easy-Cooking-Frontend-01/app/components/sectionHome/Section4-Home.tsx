"use client";

import { useState } from "react";

export default function Section4Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert("Vui lòng nhập email!");
    if (!/\S+@\S+\.\S+/.test(email)) return alert("Email không hợp lệ!");

    try {
      setStatus("loading");

      // ⚡ Giả lập API gửi email – sau này bạn có thể thay bằng:
      // await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) })
      await new Promise((res) => setTimeout(res, 1000));

      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      setStatus("error");
    }
  };

  return (
    <section className="bg-[#FFD8C2] py-20 mt-[40px]">
      <div className="max-w-3xl mx-auto text-center px-6">

        {/* Tiêu đề */}
        <h2 className="text-[42px] sm:text-[48px] font-extrabold text-gray-900 leading-tight mb-4">
          Những món ngon  
          <br />
          gửi thẳng vào hộp thư của bạn
        </h2>

        {/* Mô tả */}
        <p className="text-gray-800 text-[28px] mb-10">
          Nhận các công thức nấu ăn được chọn lọc mỗi tuần
        </p>

        {/* Form nhập email */}
        <form onSubmit={handleSubmit} className="flex justify-center mx-auto mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="w-full px-4 py-3 text-[15px] rounded-l-md outline-none border border-gray-300 focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#FF5C1D] text-white font-semibold px-6 rounded-r-md hover:bg-[#e34c14] transition-all disabled:opacity-70"
          >
            {status === "loading" ? "ĐANG GỬI..." : "ĐĂNG KÝ"}
          </button>
        </form>

        {/* Trạng thái phản hồi */}
        {status === "success" && (
          <p className="text-green-700 text-sm mb-3">✅ Cảm ơn! Bạn đã đăng ký nhận tin.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 text-sm mb-3">❌ Có lỗi xảy ra, vui lòng thử lại.</p>
        )}

        {/* Điều khoản */}
        <p className="text-[13px] text-gray-700">
          Khi đăng ký nhận tin, bạn đồng ý với{" "}
          <a href="#" className="underline hover:text-red-600">
            Điều khoản sử dụng
          </a>
        </p>

      </div>
    </section>
  );
}
