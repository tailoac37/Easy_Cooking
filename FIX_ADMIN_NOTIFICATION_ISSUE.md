# Fix Admin Approve/Reject Realtime Notification

## 🐛 **Vấn đề:**
Backend bị crash khi bạn sửa code để thêm notification vào `AdminRecipeServiceIMPL.java`

## 🔧 **Giải pháp đơn giản:**

### OPTION 1: Use existing NotificationService method (RECOMMENDED)

Thay vì access `messagingTemplate` trực tiếp, dùng method có sẵn trong `NotificationService`.

**File cần sửa:** `AdminRecipeServiceIMPL.java`

**Trong method `approveRecipe()`**, thay thế đoạn code từ dòng 160-187:

```java
// ❌ XÓA ĐOẠN NÀY:
// ✅ Send realtime notification to recipe owner
try {
    String adminUsername = jwtService.extractUserName(token);
    projectCooking.Repository.Entity.User admin = new projectCooking.Repository.Entity.User();
    admin.setUserName(adminUsername);
    admin.setFullName("Admin");
    
    String message = "Bài viết '" + recipe.getTitle() + "' của bạn đã được duyệt";
    if (request != null && request.getAdminNote() != null && !request.getAdminNote().isEmpty()) {
        message += ". Admin ghi chú: \" + request.getAdminNote();
    }
    
    projectCooking.Model.NotificationDTO notif = new projectCooking.Model.NotificationDTO();
    notif.setType("ADMIN_MESSAGE");
    notif.setTitle("Công thức được duyệt");
    notif.setMessage(message);
    notif.setSenderName("Admin");
    notif.setRecipeId(recipe.getRecipeId());
    notif.setRead(false);
    
    // Send via WebSocket
    notificationService.messagingTemplate.convertAndSendToUser(
            recipe.getUser().getUserName(),
            "/queue/notifications",
            notif);
} catch (Exception e) {
    System.err.println("❌ Failed to send approval notification: " + e.getMessage());
}
```

**✅ THAY BẰNG:**

```java
// ✅ Send realtime notification to recipe owner
try {
    String message = "Bài viết '" + recipe.getTitle() + "' của bạn đã được duyệt";
    if (request != null && request.getAdminNote() != null && !request.getAdminNote().isEmpty()) {
        message += ". Admin ghi chú: " + request.getAdminNote();
    }
    
    // Use existing NotificationService method
    User admin = new User();
    admin.setFullName("Admin");
    
    notificationService.AdminSendReportedNotification(
        admin,
        recipe,
        message,
        null,
        "duyệt công thức"
    );
} catch (Exception e) {
    System.err.println("❌ Failed to send approval notification: " + e.getMessage());
}
```

---

**Trong method `rejectRecipe()`**, thay thế đoạn code từ dòng 211-238:

```java
// ❌ XÓA ĐOẠN CŨNG TƯƠNG TỰ

// ✅ Send realtime notification to recipe owner  
try {
    String message = "Bài viết '" + recipe.getTitle() + "' của bạn đã bị từ chối";
    if (request != null && request.getAdminNote() != null && !request.getAdminNote().isEmpty()) {
        message += ". Lý do: " + request.getAdminNote();
    }
    
    // Use existing NotificationService method
    User admin = new User();
    admin.setFullName("Admin");
    
    notificationService.AdminSendReportedNotification(
        admin,
        recipe,
        message,
        null,
        "từ chối công thức"
    );
} catch (Exception e) {
    System.err.println("❌ Failed to send rejection notification: " + e.getMessage());
}
```

---

## 🎯 OPTION 2: Simple Fix - REMOVE notification code (temporary)

Nếu muốn backend chạy được ngay:

1. **Xóa hết code notification** trong cả 2 method `approveRecipe()` và `rejectRecipe()`
2. Chỉ giữ lại:
   ```java
   // Log action and notify
   actionLogger.logRecipeApproval(token, recipe, request != null ? request.getAdminNote() : null);
   
   return "Recipe '" + recipe.getTitle() + "' has been approved successfully";
   ```

3. Backend sẽ chạy được nhưng **KHÔNG có realtime notification** (giống như trước đó)

---

## ✅ Recommended: OPTION 1

Dùng `AdminSendReportedNotification()` method có sẵn - nó đã handle tất cả logic notification + WebSocket send.

---

**After fixing:**
1. Save file
2. Restart backend
3. Test approve/reject recipe → Should send realtime notification!
