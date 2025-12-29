# Fix "Không rõ" Reporter Name in Admin Report Detail

## 🐛 Problem:
Admin report detail page shows "(Không rõ)" for reporter name even after backend fix

## 🔍 Root Cause:
**Frontend is using wrong field name!**

### Backend sends:
```json
{
  "reportId": 1,
  "reporterId": 123,
  "reporterName": "Nguyễn Văn A",  // ✅ This exists!
  "recipeId": 456,
  "recipeTitle": "Phở Bò",
  ...
}
```

### Frontend tries to access:
```tsx
<p>{report.userName || "(Không rõ)"}</p>  // ❌ WRONG FIELD!
```

`report.userName` doesn't exist in API response → shows "(Không rõ)"

## ✅ Solution:

**File:** `app/admin/reports/[id]/page.tsx`

**Line 84** - Change:

```tsx
// ❌ BEFORE:
<div>
    <p className="text-xs text-gray-500 mb-1">Người báo cáo</p>
    <p>{report.userName || "(Không rõ)"}</p>
</div>

// ✅ AFTER:
<div>
    <p className="text-xs text-gray-500 mb-1">Người báo cáo</p>
    <p>{report.reporterName || "(Không rõ)"}</p>
</div>
```

**Also check line 74 in `app/admin/reports/page.tsx` (list page):**

```tsx
// If exists, change:
Người báo cáo: {r.userName || "(Không rõ)"}

// To:
Người báo cáo: {r.reporterName || "(Không rõ)"}
```

## 🧪 After Fix:

1. Save files
2. Refresh browser (Next.js should hot reload)
3. Open admin report detail
4. Now shows: "Nguyễn Văn A" instead of "(Không rõ)"

## 📝 Summary of All Changes:

### Backend (`ReportMapper.java`) - ✅ DONE:
- Line 35: `dto.setReporterName(report.getReporter().getFullName())`
- Line 48: `dto.setReportedUserName(report.getReportedUser().getFullName())`

### Frontend - ⚠️ TODO:
- `app/admin/reports/[id]/page.tsx` line 84: `report.userName` → `report.reporterName`
- `app/admin/reports/page.tsx` line 74: `r.userName` → `r.reporterName` (if exists)

---

**Status:** Backend fixed ✅ | Frontend needs 1 line change
