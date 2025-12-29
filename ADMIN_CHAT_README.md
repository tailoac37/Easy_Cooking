# Implement Admin Realtime Chat

Đã hoàn thành chức năng Chat nội bộ cho Admin! 🚀

## 🛠️ Changes:

### Backend:
1. **Added `AdminChatMessageDTO.java`**: Model cho tin nhắn chat (sender info, content, type).
2. **Added `AdminChatController.java`**:
   - URL: `/app/admin/chat` (Send message)
   - URL: `/app/admin/chat.addUser` (Join notification)
   - Subscribe: `/topic/admin-chat` (Receive messages)

### Frontend:
1. **New Page `app/admin/chat/page.tsx`**:
   - Giao diện chat đẹp mắt, giống Messenger/Zalo.
   - Kết nối realtime với WebSocket.
   - Hiển thị avatar, tên người gửi, thời gian.
   - Auto-scroll khi có tin nhắn mới.
2. **Updated `app/admin/layout.tsx`**:
   - Thêm menu **"Chat nội bộ"** vào thanh bên trái.

## ⚠️ Action Required:

Do đã thay đổi code Java (thêm Controller mới), bạn cần **RESTART BACKEND** để chức năng hoạt động.

1. Tắt backend hiện tại (Ctrl+C).
2. Chạy lại backend.

## 🧪 How to Test:

1. Đăng nhập vào 2 trình duyệt khác nhau bằng 2 tài khoản Admin khác nhau (hoặc cùng 1 tk cũng được).
2. Vào menu **Admin > Chat nội bộ**.
3. Chat thử → Tin nhắn sẽ hiện ngay lập tức bên kia (Realtime).
