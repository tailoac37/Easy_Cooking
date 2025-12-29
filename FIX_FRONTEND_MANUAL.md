# FIX FRONTEND "Không rõ" - MANUAL EDIT

## 🎯 Quick Fix (1 từ)

### File 1: `app/admin/reports/[id]/page.tsx`

**Line 84** - Tìm dòng:
```tsx
<p>{report.userName || "(Không rõ)"}</p>
```

**Đổi thành:**
```tsx
<p>{report.reporterName || "(Không rõ)"}</p>
```

**Chỉ cần đổi:** `userName` → `reporterName`

---

### File 2: `app/admin/reports/page.tsx`

**Line 74** - Tìm dòng:
```tsx
Người báo cáo: {r.userName || "(Không rõ)"}
```

**Đổi thành:**
```tsx
Người báo cáo: {r.reporterName || "(Không rõ)"}
```

**Chỉ cần đổi:** `userName` → `reporterName`

---

## ✅ After Edit:

1. **Save files** (Ctrl+S)
2. **Browser auto-refresh** (Next.js hot reload)
3. **Test:** Mở admin report detail
4. **Result:** Sẽ hiện tên thật thay vì "(Không rõ)"

---

## 📝 Why This Works:

**Backend API trả về:**
```json
{
  "reporterName": "Nguyễn Văn A",  // ✅ This field existe
  "reporterId": 123
}
```

**Frontend đang dùng:**
```tsx
report.userName  // ❌ Field này không tồn tại!
```

**Nên đổi thành:**
```tsx
report.reporterName  // ✅ Match với backend
```

---

**STATUS:** Manual edit needed (PowerShell có issue với UTF-8 encoding)
**TIME:** < 30 seconds to fix
**FILES:** 2 files, 1 word change each
