import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ChatWidget from "./components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "cooking_app",
  description: "cooking_app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-[#ffffff]">
        <AuthProvider>
          <NotificationProvider>
            <Header />
            <main>
              {children}
              <ChatWidget/> {/* Widget luôn hiện */}
            </main>
            <Footer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
