# Fix Category Update Error

## 🐛 Problem:
Cập nhật danh mục (category) bị lỗi khi submit

## 🔍 Root Cause:
**File:** `app/admin/categories/EditModal.tsx` Line 25-29

```tsx
// ❌ PROBLEM:
const res = await fetch(`/api/proxy/admin/categories/${id}`, {
  method: "PATCH",
  headers: getAuthHeader() as HeadersInit,  // ← Sets Content-Type!
  body: formData,  // ← FormData needs browser to set Content-Type with boundary
});
```

**Issue:** When using `FormData`, browser MUST set `Content-Type: multipart/form-data; boundary=...` automatically. If you manually set headers from `getAuthHeader()`, it might include `Content-Type: application/json` which conflicts with FormData.

## ✅ Solution:

**Change lines 25-29:**

```tsx
// ✅ BEFORE:
const res = await fetch(`/api/proxy/admin/categories/${id}`, {
  method: "PATCH",
  headers: getAuthHeader() as HeadersInit,
  body: formData,
});

// ✅ AFTER:
const res = await fetch(`/api/proxy/admin/categories/${id}`, {
  method: "PATCH",
  headers: {
    Authorization: getAuthHeader().Authorization || "",
    // DO NOT set Content-Type - let browser do it for FormData
  },
  body: formData,
});
```

**Key Change:** Only include `Authorization` header, remove all other headers to avoid Content-Type conflict.

## 🧪 Test After Fix:

1. Open admin → Categories
2. Click "Chỉnh sửa" on any category
3. Change name/description/image
4. Click "Lưu thay đổi"
5. Should work without error ✅

## 📝 Why This Happens:

FormData with file upload requires:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
```

If you set `Content-Type: application/json` manually, backend cannot parse the multipart data → ERROR!

**Solution:** Let browser handle Content-Type for FormData requests.

---

**Status:** Need manual 1-line change in EditModal.tsx
**Priority:** High - blocks category updates
