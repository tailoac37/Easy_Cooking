# Fix WebSocket Realtime Notification Not Showing

## 🐛 **Vấn đề:**
- Notification được lưu vào database ✅
- WebSocket connect thành công ✅  
- Nhưng UI không update realtime ❌
- Phải refresh browser mới thấy notification

## 🔍 **Debug Steps:**

### Step 1: Add Logs to NotificationContext.tsx

Tìm dòng 66-76 trong `app/contexts/NotificationContext.tsx`:

```typescript
// CŨ:
useEffect(() => {
  if (loading) return;
  if (!token || !user) return;

  connectSocket(token, (msg: NotificationItem) => {
    setNotifications((prev) => [msg, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  return () => disconnectSocket();
}, [token, user, loading]);
```

**THAY BẰNG:**

```typescript
useEffect(() => {
  if (loading) return;
  if (!token || !user) return;

  console.log("🔌 Connecting WebSocket for user:", user.userName);

  connectSocket(token, (msg: NotificationItem) => {
    console.log("🔔 REALTIME NOTIFICATION RECEIVED:", msg);
    setNotifications((prev) => {
      console.log("📝 Previous notifications:", prev.length);
      const updated = [msg, ...prev];
      console.log("📝 Updated notifications:", updated.length);
      return updated;
    });
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      console.log(`📬 Unread count: ${prev} → ${newCount}`);
      return newCount;
    });
  }).then(() => {
    console.log("✅ WebSocket connected successfully");
  }).catch((err) => {
    console.error("❌ WebSocket connection failed:", err);
  });

  return () => {
    console.log("🔌 Disconnecting WebSocket");
    disconnectSocket();
  };
}, [token, user, loading]);
```

### Step 2: Test Notification

1. **Mở Browser Console** (F12)
2. **Login** vào app
3. Xem logs:
   ```
   🔌 Connecting WebSocket for user: <username>
   🟦 STOMP DEBUG: ...
   🟩 STOMP CONNECTED
   ✅ WebSocket connected successfully
   ```

4. **Trigger notification** (like recipe từ user khác)
5. Xem có log `🔔 REALTIME NOTIFICATION RECEIVED` không?

## 📊 **Expected Logs:**

### ✅ **Khi hoạt động đúng:**
```
🔌 Connecting WebSocket for user: user1
🟦 STOMP DEBUG: Connecting...
🟩 STOMP CONNECTED
✅ WebSocket connected successfully

// Khi có notification:
🔔 REALTIME NOTIFICATION RECEIVED: {...}
📝 Previous notifications: 5
📝 Updated notifications: 6
📬 Unread count: 2 → 3
```

### ❌ **Khi có lỗi:**

**Scenario 1: Không connect được**
```
🔌 Connecting WebSocket for user: user1
🟥 STOMP ERROR: ...
❌ WebSocket connection failed: ...
```
→ **Fix:** Check backend running, check token

**Scenario 2: Connect OK nhưng không nhận message**
```
🔌 Connecting WebSocket for user: user1
🟩 STOMP CONNECTED
✅ WebSocket connected successfully

// (trigger notification)
// ... KHÔNG CÓ LOG 🔔 ...
```
→ **Issue:** Backend send notification nhưng frontend không nhận

**Scenario 3: Nhận message nhưng UI không update**
```
🔔 REALTIME NOTIFICATION RECEIVED: {...}
📝 Previous notifications: 5
📝 Updated notifications: 6
// Nhưng UI không đổi
```
→ **Issue:** React state issue / component không re-render

## 🔧 **Common Fixes:**

### Fix 1: Username Mismatch

Backend send đến:
```java
messagingTemplate.convertAndSendToUser(
    receiver.getUserName(),  // ← Phải chính xác
    "/queue/notifications",
    notifDTO
);
```

Frontend must connect with same username:
```java
accessor.setUser(() -> username);  // WebSocketConfig
```

**Verify:** Add log in backend WebSocketConfig.java line 57:
```java
System.out.println("✅ WebSocket authenticated: " + username);
```

### Fix 2: Multiple WebSocket Connections

**Problem:** User có nhiều tabs → nhiều connections → message chỉ đến 1 connection

**Solution:** 
- Ensure `disconnectSocket()` được gọi khi unmount
- Check Network tab → WS → should only have 1 active connection

### Fix 3: Backend Not Sending

**Verify backend sending:**

In `NotificationService.java`, add log trước `convertAndSendToUser`:
```java
System.out.println("📨 [NOTIF] Sending to user: " + receiver.getUserName());
System.out.println("📨 [NOTIF] Message: " + notifDTO.getMessage());
```

## 🎯 **Quick Test Script:**

Paste vào browser console khi đã login:

```javascript
// Force trigger test notification
const testNotif = {
  id: 999,
  type: "LIKE",
  message: "TEST NOTIFICATION",
  senderName: "Test User",
  read: false,
  createdAt: new Date().toISOString()
};

// This won't work via WebSocket but tests if UI updates
// when state changes manually
```

## ✅ **Expected Result:**

Sau khi thêm logs, khi trigger notification (like/comment):

1. **Backend console:**
   ```
   📨 [NOTIF] Sending to user: user1
   📨 [NOTIF] Message: User2 đã thích bài viết của bạn
   ```

2. **Frontend console:**
   ```
   🔔 REALTIME NOTIFICATION RECEIVED: {id: 123, ...}
   📝 Previous notifications: 5
   📝 Updated notifications: 6
   📬 Unread count: 2 → 3
   ```

3. **UI:**
   - Notification icon badge updates +1
   - Số thông báo hiển thị realtime
   - Không cần refresh

---

**Next:** Sau khi thêm logs, chạy test và báo logs cho tôi biết để debug tiếp!
