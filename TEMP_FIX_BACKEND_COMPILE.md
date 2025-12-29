# TEMPORARY FIX - Comment Out Admin Notification

Backend đang fail compile. Để chạy được ngay, hãy comment out notification code tạm thời.

## File: `AdminRecipeServiceIMPL.java`

### In `approveRecipe()` method (lines 160-179):

Comment out toàn bộ try-catch block:

```java
// Log action and notify
actionLogger.logRecipeApproval(token, recipe, request != null ? request.getAdminNote() : null);

/*  // ❌ TEMPORARY COMMENTED OUT
// ✅ Send realtime notification to recipe owner
try {
    String message = "Bài viết '" + recipe.getTitle() + "' của bạn đã được duyệt";
    if (request != null && request.getAdminNote() != null && !request.getAdminNote().isEmpty()) {
        message += ". Admin ghi chú: " + request.getAdminNote();
    }
    
    // Use existing NotificationService method
    projectCooking.Repository.Entity.User admin = new projectCooking.Repository.Entity.User();
    admin.setFullName("Admin");
    
    notificationService.AdminSendReportedNotification(
            admin,
            recipe,
            message,
            null,
            "duyệt công thức");
} catch (Exception e) {
    System.err.println("❌ Failed to send approval notification: " + e.getMessage());
}
*/

return "Recipe '" + recipe.getTitle() + "' has been approved successfully";
```

### In `rejectRecipe()` method (lines 203-222):

Tương tự, comment out:

```java
// Log action and notify
actionLogger.logRecipeRejection(token, recipe, request != null ? request.getAdminNote() : null);

/*  // ❌ TEMPORARY COMMENTED OUT
// ✅ Send realtime notification to recipe owner
try {
    String message = "Bài viết '" + recipe.getTitle() + "' của bạn đã bị từ chối";
    if (request != null && request.getAdminNote() != null && !request.getAdminNote().isEmpty()) {
        message += ". Lý do: " + request.getAdminNote();
    }
    
    // Use existing NotificationService method
    projectCooking.Repository.Entity.User admin = new projectCooking.Repository.Entity.User();
    admin.setFullName("Admin");
    
    notificationService.AdminSendReportedNotification(
            admin,
            recipe,
            message,
            null,
            "từ chối công thức");
} catch (Exception e) {
    System.err.println("❌ Failed to send rejection notification: " + e.getMessage());
}
*/

return "Recipe '" + recipe.getTitle() + "' has been rejected";
```

## After This:

1. Backend sẽ chạy được
2. Admin có thể duyệt/từ chối bài
3. Nhưng **KHÔNG có realtime notification** (giống như trước đó)
4. Sau đó chúng ta debug lại notification issue

---

**Priority:** Get backend running first, fix notification later!
