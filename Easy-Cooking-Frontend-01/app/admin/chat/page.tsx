"use client";

import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import EmojiPicker from "emoji-picker-react";
import { Smile, Paperclip, Send, X, Reply } from "lucide-react";

interface ChatMessage {
    id?: number;
    senderUsername: string;
    senderFullName: string;
    senderAvatarUrl: string | null;
    content: string;
    timestamp: string;
    type: "CHAT" | "JOIN" | "LEAVE" | "IMAGE";
    // Reply fields
    replyToId?: number;
    replyToName?: string;
    replyToText?: string;
}

export default function AdminChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [connected, setConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch History
        fetch("/api/proxy/admin/chat/history", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMessages(data);
            })
            .catch(err => console.error(err));

        // WebSocket
        const socket = new SockJS("http://localhost:8081/ws");
        const client = new Client({
            webSocketFactory: () => socket as any,
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                setConnected(true);
                client.subscribe("/topic/admin-chat", (message) => {
                    if (message.body) {
                        setMessages((prev) => [...prev, JSON.parse(message.body)]);
                    }
                });
                client.publish({
                    destination: "/app/admin/chat.addUser",
                    body: JSON.stringify({ type: "JOIN" }),
                });
            },
        });

        client.activate();
        clientRef.current = client;

        return () => client.deactivate();
    }, []);

    const sendMessage = (content: string, type: string = "CHAT") => {
        if (!clientRef.current || !connected) return;

        const msgPayload: any = { content, type };

        if (replyTo) {
            msgPayload.replyToId = replyTo.id;
            msgPayload.replyToName = replyTo.senderFullName;
            msgPayload.replyToText = replyTo.type === 'IMAGE' ? '[Hình ảnh]' : replyTo.content;
            setReplyTo(null); // Clear reply after send
        }

        clientRef.current.publish({
            destination: "/app/admin/chat",
            body: JSON.stringify(msgPayload),
        });
    };

    const handleSendText = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue, "CHAT");
        setInputValue("");
        setShowEmoji(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/proxy/admin/chat/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                sendMessage(data.url, "IMAGE");
            }
        } catch (err) {
            alert("Lỗi upload ảnh");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-white rounded-xl shadow border overflow-hidden relative">
            {/* HEADER */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center z-10">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        💬 Admin Group Chat
                        <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                    </h1>
                    <p className="text-xs text-gray-500">
                        {messages.length} tin nhắn • {connected ? "Đang kết nối" : "Mất kết nối..."}
                    </p>
                </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F2F5]">
                {messages.map((msg, index) => {
                    const isMe = msg.senderUsername === currentUser?.userName;
                    if (msg.type === "JOIN" || msg.type === "LEAVE") {
                        return (
                            <div key={index} className="flex justify-center my-2">
                                <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">
                                    {msg.senderFullName} {msg.type === "JOIN" ? "đã tham gia" : "đã rời"} đoạn chat
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} group`}>
                            <img
                                src={msg.senderAvatarUrl || "https://files.catbox.moe/3k42l7.jpg"}
                                className="w-8 h-8 rounded-full object-cover border bg-white"
                            />

                            <div className={`max-w-[70%] relative`}>
                                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? "justify-end" : ""}`}>
                                    <span className="text-xs text-gray-500 font-medium">{msg.senderFullName}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {/* REPLY BLOCK inside Message */}
                                {msg.replyToId && (
                                    <div className={`text-xs mb-1 p-2 rounded-lg border-l-4 opacity-80 ${isMe ? "bg-blue-700/20 border-blue-300 text-white" : "bg-gray-200 border-gray-400 text-gray-600"
                                        }`}>
                                        <div className="font-bold">{msg.replyToName}</div>
                                        <div className="truncate">{msg.replyToText}</div>
                                    </div>
                                )}

                                {/* CONTENT */}
                                <div className={`px-4 py-2 shadow-sm rounded-2xl relative ${isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border"
                                    }`}>
                                    {msg.type === "IMAGE" ? (
                                        <img src={msg.content} className="max-w-full rounded-lg max-h-60 object-contain cursor-pointer" />
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    )}
                                </div>

                                {/* ACTION Buttons (Show on Hover) */}
                                <button
                                    onClick={() => setReplyTo(msg)}
                                    className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-100 shadow opacity-0 group-hover:opacity-100 transition
                        ${isMe ? "-left-10" : "-right-10 text-gray-600"}
                    `}
                                    title="Trả lời"
                                >
                                    <Reply size={14} />
                                </button>

                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="bg-white border-t p-3">
                {/* Reply Banner */}
                {replyTo && (
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-2 border-l-4 border-blue-500">
                        <div className="text-sm">
                            <span className="font-bold text-blue-600">Đang trả lời {replyTo.senderFullName}</span>
                            <p className="text-gray-500 truncate text-xs">{replyTo.type === 'IMAGE' ? '[Hình ảnh]' : replyTo.content}</p>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition relative"
                        title="Gửi ảnh"
                    >
                        <Paperclip size={20} />
                        {isUploading && <span className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>}
                    </button>

                    <div className="relative flex-1">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendText();
                                }
                            }}
                            placeholder="Nhập tin nhắn..."
                            className="w-full border rounded-2xl px-4 py-3 pr-10 hover:border-blue-400 focus:outline-none focus:border-blue-600 resize-none max-h-32 bg-gray-50"
                            rows={1}
                        />

                        {/* Emoji Trigger */}
                        <button
                            onClick={() => setShowEmoji(!showEmoji)}
                            className="absolute right-3 bottom-3 text-gray-400 hover:text-yellow-500 transition"
                        >
                            <Smile size={20} />
                        </button>

                        {/* Emoji Picker Popover */}
                        {showEmoji && (
                            <div className="absolute bottom-12 right-0 z-50 shadow-xl rounded-xl border">
                                <EmojiPicker
                                    onEmojiClick={(emojiData) => setInputValue(prev => prev + emojiData.emoji)}
                                    width={300}
                                    height={400}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSendText}
                        disabled={!inputValue.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
