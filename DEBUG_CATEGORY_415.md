# Category Update 415 Error - Debug Summary

## 🐛 Problem:
- ✅ Update WITHOUT image → Works
- ❌ Update WITH image → 415 Unsupported Media Type

## 🔍 What We Know:

1. **Frontend sends correct FormData:**
   - `categories` part: Blob with `type: "application/json"` ✅
   - `image` part: File object ✅
   - Headers: Only `Authorization` (no Content-Type) ✅

2. **Direct backend call:**
   - Blocked by CORS (expected) ✅
   - This confirms proxy is the issue

3. **Backend endpoint:**
   ```java
   @PatchMapping("/api/admin/categories/{id}")
   public String updateCategories(
       @RequestHeader("Authorization") String auth,
       @RequestPart(value = "image", required = false) MultipartFile image,
       @RequestPart(value = "categories", required = false) CategoriesRequest categories,
       @PathVariable("id") Integer Id
   )
   ```
   - Expects multipart/form-data ✅
   - Both parts are `required = false` ✅

## 🧪 Test Matrix:

| Scenario | Result |
|----------|--------|
| Update: name only (no image) | ✅ Works |
| Update: name + image | ❌ 415 Error |
| Create: name + image | ❓ Need to test |

## 🎯 Next Steps:

### Step 1: Test CREATE with image
Go to Admin → Categories → + Add
- Enter name, description
- Select image
- Save

**If CREATE works:**
→ Issue is in PATCH proxy route (`/api/proxy/admin/categories/[id]/route.ts`)
→ Compare with POST proxy route (`/api/proxy/admin/categories/route.ts`)

**If CREATE fails:**
→ Issue is in how Frontend sends FormData OR backend multipart config
→ Check Spring Boot multipart settings

### Step 2: Compare Proxy Routes

**POST proxy (CREATE)** - Check file:
`app/api/proxy/admin/categories/route.ts`

**PATCH proxy (UPDATE)** - Check file:
`app/api/proxy/admin/categories/[id]/route.ts`

Look for differences in:
- How they read FormData
- How they forward to backend
- Headers they set/remove

### Step 3: Potential Fixes

**Fix A: Stream FormData properly in proxy**
```typescript
// Instead of:
const form = await req.formData();
body: form

// Try:
const form = await req.formData();
const backendForm = new FormData();
// Copy parts individually
for (const [key, value] of form.entries()) {
  backendForm.append(key, value);
}
body: backendForm
```

**Fix B: Don't use proxy for multipart**
```tsx
// Frontend: Send directly to backend with proper CORS handling
// Backend: Add CORS config to allow localhost:3000
```

**Fix C: Use different upload strategy**
```tsx
// 1. Upload image first → get URL
// 2. Send categories + imageUrl as JSON (not multipart)
```

## 📋 Error Details:

```
POST http://localhost:3000/api/proxy/admin/categories/1 
415 (Unsupported Media Type)
```

**415 means:** Backend received the request but doesn't accept the Content-Type.

**Possible causes:**
1. Proxy changes `Content-Type` header
2. Proxy breaks multipart boundary
3. Backend sees wrong Content-Type
4. FormData parts missing Content-Type

## 🔧 Quick Debug Commands:

### Check what proxy receives:
Add to `/api/proxy/admin/categories/[id]/route.ts`:
```typescript
const form = await req.formData();
for (const [key, value] of form.entries()) {
  console.log(`📦 Part: ${key}`, value instanceof File ? `File: ${value.name}` : value);
}
```

### Check backend logs:
Look for multipart parsing errors in Spring Boot console

---

**Status:** Debugging proxy multipart forwarding issue
**Priority:** High - blocks category image updates
