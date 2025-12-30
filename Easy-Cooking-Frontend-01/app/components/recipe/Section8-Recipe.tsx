"use client";

export default function Section8Recipe() {
  return (
    <section className="mt-20">
      {/* Tiêu đề */}
      <h2 className="text-[50px] font-bold">Already made this?</h2>

      {/* Nút Share feedback */}
      <button
        className="my-5 border border-gray-800 rounded-md px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 transition"
        onClick={() => alert("Feedback feature coming soon!")}
      >
        Share your feedback
      </button>

      {/* Đường line cam */}
      <div className="h-[10px] bg-orange-500 mt-6 w-full"></div>
    </section>
  );
}
