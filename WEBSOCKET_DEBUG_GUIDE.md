# WebSocket Realtime Notification Debugging Guide

## 🔍 Current Configuration

### Backend (`WebSocketConfig.java`)
```java
✅ Endpoint: /ws
✅ Allowed Origins: * (all)
✅ SockJS: enabled
✅ Broker: /topic, /queue
✅ User Prefix: /user
✅ JWT Authentication: enabled
```

### Frontend (`socketClient.ts`)
```javascript
✅ URL: http://localhost:8081/ws
✅ Subscribe: /user/queue/notifications
✅ JWT Token: Sent in connect headers
```

### Notification Service
```java
✅ All notification methods use:
   messagingTemplate.convertAndSendToUser(
       receiver.getUserName(),
       "/queue/notifications",
       notifDTO
   );
```

## 🧪 Test Steps

### 1. Check Backend WebSocket Connection

**Open browser console → Network → WS tab**

Expected to see:
```
ws://localhost:8081/ws/xxx/websocket
Status: 101 Switching Protocols
```

### 2. Check Frontend Connection Logs

Look for in browser console:
```
🟦 STOMP DEBUG: ... (connection logs)
🟩 STOMP CONNECTED
```

If you see `🟥 STOMP ERROR` → JWT token issue

### 3. Trigger a Notification

Try these actions:
1. **Like a recipe** → Should send notification to recipe owner
2. **Comment on recipe** → Should notify owner
3. **Follow someone** → Should notify that user

### 4. Check Backend Logs

Should see:
```
WebSocket authenticated: <username>
📨 [NOTIF] Send to: <receiver_username>
```

## ⚠️ Common Issues & Fixes

### Issue 1: WebSocket not connecting
**Symptoms:** No WS connection in Network tab

**Fixes:**
- Check backend is running on port 8081
- Check CORS settings
- Verify `/ws` endpoint is accessible

**Test:**
```bash
curl http://localhost:8081/ws/info
# Should return SockJS server info
```

### Issue 2: Connected but no notifications
**Symptoms:** Connected successfully but no messages received

**Possible Causes:**
1. **Username mismatch** 
   - Backend send to: `receiver.getUserName()`
   - Frontend subscribe: `/user/queue/notifications`
   - JWT must extract correct username

2. **Notification not triggered**
   - Service method not called
   - Condition skips sending (e.g., `sender == receiver`)

**Debug:**
Add logs in backend:
```java
System.out.println("📨 [NOTIF] Sending to: " + receiver.getUserName());
System.out.println("📨 [NOTIF] Message: " + notifDTO);
```

### Issue 3: JWT Authentication Failed
**Symptoms:** Connection rejected, error in backend

**Fixes:**
- Verify token is valid and not expired
- Check token format: `Bearer <token>`
- Ensure JWTService.extractUserName() works correctly

**Test:**
```java
// In WebSocketConfig interceptor, add:
System.out.println("📨 Token received: " + token);
System.out.println("📨 Username extracted: " + username);
```

### Issue 4: Multiple Connections
**Symptoms:** User receives duplicate notifications

**Fix:**
- Ensure `disconnectSocket()` is called on logout/unmount
- Only one WebSocket connection per user

## 🔧 Quick Diagnostic Script

Add this to test WebSocket manually:

```javascript
// In browser console (when logged in):
const token = localStorage.getItem('token'); // or wherever you store it

const socket = new SockJS("http://localhost:8081/ws");
const client = new Stomp.Client({
  webSocketFactory: () => socket,
  connectHeaders: { Authorization: `Bearer ${token}` },
  debug: (str) => console.log(str),
  onConnect: () => {
    console.log("✅ MANUAL TEST CONNECTED");
    client.subscribe("/user/queue/notifications", (msg) => {
      console.log("🔔 RECEIVED:", JSON.parse(msg.body));
    });
  }
});
client.activate();
```

## 📊 Expected Flow

```
1. User A likes User B's recipe
   ↓
2. Backend: LikeService calls notificationService.sendLikeNotification()
   ↓
3. NotificationService:
   - Creates Notification entity
   - Saves to database
   - Calls messagingTemplate.convertAndSendToUser(userB.getUserName(), ...)
   ↓
4. Spring WebSocket:
   - Finds WebSocket session for userB
   - Sends message to /user/queue/notifications
   ↓
5. Frontend (User B):
   - Receives message in subscribe callback
   - Calls onMessage(parsed)
   - Updates UI with notification
```

## 🐛 Debug Checklist

- [ ] Backend running on port 8081?
- [ ] Frontend connects to correct URL?
- [ ] JWT token valid and included?
- [ ] Username extraction working?
- [ ] Notification service method called?
- [ ] `convertAndSendToUser` called with correct username?
- [ ] Frontend subscribed to `/user/queue/notifications`?
- [ ] No JavaScript errors in console?
- [ ] WebSocket connection shows in Network tab?
- [ ] Backend logs show "WebSocket authenticated: <user>"?

## 🎯 Next Steps

If still not working after this checklist:

1. **Add detailed logging** to both frontend and backend
2. **Test with simple message** (hardcoded notification)
3. **Check database** - are notifications being saved?
4. **Verify WebSocket session** - is user's session active when notification sent?

---

**Last Updated:** 2025-12-11  
**Status:** Configuration looks correct - likely a runtime issue  
**Contact:** Check backend console and browser console for specific errors
