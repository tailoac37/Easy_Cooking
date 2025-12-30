"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "@/app/lib/socketClient";
import { useAuth } from "./AuthContext";
import { NotificationItem } from "@/app/types/notification";

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (n: NotificationItem) => void;
  updateRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  deleteAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ============================================================
  // 1) LOAD ALL NOTIFICATIONS
  useEffect(() => {
    if (!token) return;       // ⛔ CHỐT CHẶN QUAN TRỌNG
    if (!user) return;

    fetch("/api/proxy/notification", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: NotificationItem[]) => {
        if (!Array.isArray(data)) return;
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      })
      .catch((err) => console.error("❌ Load notification error:", err));
  }, [token, user]);

  // ============================================================
  // 2) LOAD UNREAD COUNT
  useEffect(() => {
    if (!token) return;      // ⛔ CHỐT CHẶN QUAN TRỌNG
    if (!user) return;
console.log("TOKEN SEND:", token);

    fetch("/api/proxy/notification/unread", {
      
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUnreadCount(data.length);
        else if (data?.unreadCount !== undefined)
          setUnreadCount(data.unreadCount);
      })
      .catch((err) => console.error("❌ Load unread error:", err));
  }, [token, user]);

  // ============================================================
  // 3) REALTIME SOCKET
  // ============================================================
  useEffect(() => {
    if (loading) return;
    if (!token || !user) return;

    connectSocket(token, (msg: NotificationItem) => {
      setNotifications((prev) => [msg, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => disconnectSocket();
  }, [token, user, loading]);

  // ============================================================
  // 4) MARK READ
  // ============================================================
  const updateRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  // ============================================================
  // 5) DELETE ONE
  // ============================================================
  const deleteNotification = async (id: number) => {
    if (!token) return;

    await fetch(`/api/proxy/notification/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ============================================================
  // 6) DELETE ALL
  // ============================================================
  const deleteAllNotifications = async () => {
    if (!token) return;

    await fetch(`/api/proxy/notification`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification: () => { },
        updateRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be inside provider");
  return ctx;
};
