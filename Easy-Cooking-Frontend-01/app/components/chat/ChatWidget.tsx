"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Đóng chat khi click ra ngoài
    useEffect(() => {
        const close = (e: any) => {
            if (!open) return;
            const box = document.getElementById("chat-box");
            const button = document.getElementById("chat-btn");

            if (box && !box.contains(e.target) && button && !button.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;

        setMessages(prev => [...prev, { from: "user", text: userMsg }]);
        setInput("");

        try {
            const res = await fetch("/api/proxy/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ message: userMsg })
            });

            const data = await res.json();

            setMessages(prev => [
                ...prev,
                {
                    from: "bot",
                    text: data.response || "",
                    recipes: data.recipes || []
                }
            ]);

            setTimeout(() => {
                containerRef.current?.scrollTo({
                    top: containerRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 50);

        } catch {
            setMessages(prev => [...prev, { from: "bot", text: "⚠ Lỗi kết nối tới server!" }]);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                id="chat-btn"
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 shadow-lg flex items-center justify-center text-3xl z-[99999]"
            >
                💬
            </button>

            {/* Chat Box */}
            {open && (
                <div
                    id="chat-box"
                    className="fixed bottom-24 right-6 w-96 bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col overflow-hidden animate-fadeIn z-[99999]"
                >
                    {/* Header */}
                    <div className="bg-orange-500 text-white p-3 font-semibold flex justify-between">
                        <span>EasyCooking AI</span>
                        <button onClick={() => setOpen(false)}>✖</button>
                    </div>

                    {/* Content */}
                    <div
                        ref={containerRef}
                        className="p-4 overflow-y-auto space-y-4 bg-gray-50 max-h-[70vh] h-[420px]"
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className="space-y-2">
                                {/* Text bubble */}
                                {msg.text && (
                                    <div
                                        className={`p-3 max-w-[85%] rounded-xl text-sm ${
                                            msg.from === "user"
                                                ? "bg-orange-100 ml-auto"
                                                : "bg-white shadow-sm mr-auto"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                )}

                                {/* Recipe cards */}
                                {msg.recipes && msg.recipes.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3 mr-auto">
                                        {msg.recipes.map((r: any) => (
                                            <div
                                                key={r.recipeId}
                                                onClick={() => router.push(`/recipes/${r.recipeId}`)}
                                                className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition active:scale-[0.98]"
                                            >
                                                <img
                                                    src={r.imageUrl}
                                                    alt={r.title}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div className="text-sm max-w-[200px]">
                                                    <p className="font-semibold text-gray-800">
                                                        {r.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {r.description}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        👁 {r.viewCount}   ❤️ {r.likeCount}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input
                            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 rounded-lg"
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
