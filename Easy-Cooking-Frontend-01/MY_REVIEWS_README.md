# My Reviews Feature - Đánh Giá Công Thức Của Tôi

## 📋 Tổng quan

Feature này cho phép người dùng xem và quản lý tất cả các đánh giá (reviews) mà họ đã viết cho các công thức nấu ăn.

## 🎯 API Endpoint

**Backend**: `GET /api/user/me/reviews`
- File: `UserProfileAPI.java` 
- Service: `UserProfileService.getUserReviews()`
- Response: `List<UserReviewWithRecipeDTO>`

## 📁 Files đã tạo

### 1. **API Proxy Route**
```
app/api/proxy/user/me/reviews/route.ts
```
- Proxy request từ frontend → backend
- Xử lý authorization token
- Return danh sách reviews

### 2. **Type Definitions**
```
app/types/userReview.ts
```
- `RecipeReviewDTO`: Thông tin đánh giá
- `UserReviewWithRecipe`: Kết hợp review + recipe info

### 3. **Main Page - My Reviews**
```
app/my-reviews/page.tsx
```
- Trang chính hiển thị tất cả reviews
- URL: `/my-reviews`
- Features:
  - ✅ Hiển thị recipe info (ảnh, tên, category)
  - ✅ Hiển thị review content (title, text, images)
  - ✅ Hiển thị metadata (difficulty, time, date)
  - ✅ Edit/Delete buttons (nếu có quyền)
  - ✅ Link đến recipe detail

### 4. **Widget Component**
```
app/components/review/MyReviewsWidget.tsx
```
- Component nhỏ gọn để embed vào profile/dashboard
- Hiển thị 3 reviews gần nhất
- Link "Xem tất cả" → `/my-reviews`

## 🎨 UI Design

### Layout chính:
```
┌─────────────────────────────────────────────────┐
│  Đánh Giá Của Tôi                               │
│  Quản lý tất cả đánh giá bạn đã viết            │
├─────────────────────────────────────────────────┤
│  Tổng cộng: 5 đánh giá                          │
├─────────────────────────────────────────────────┤
│  ┌──────────┬───────────────────────────────┐  │
│  │  Image   │  Recipe Title                  │  │
│  │  [Phở]   │  Độ khó: Trung bình           │  │
│  │          │  Category | 45 phút            │  │
│  │          ├───────────────────────────────┤  │
│  │          │  📝 Review Title               │  │
│  │          │  Review content text...        │  │
│  │          │  ⏱️ Thời gian: 50 phút         │  │
│  │          ├───────────────────────────────┤  │
│  │          │  [img] [img] [img]  (photos)  │  │
│  │          ├───────────────────────────────┤  │
│  │          │  📅 12/11/2025  [Edit] [Xóa]  │  │
│  └──────────┴───────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Features:
- ✨ **Responsive design** - Mobile & Desktop friendly
- 🎨 **Orange accent colors** - Phù hợp theme cooking
- 🖼️ **Recipe thumbnails** - Hiển thị ảnh món ăn
- 📸 **User images** - Gallery ảnh user upload
- 🏷️ **Difficulty badges** - Màu theo độ khó (Dễ/TB/Khó)
- ⚡ **Hover effects** - Shadow & scale animation
- 🔗 **Easy navigation** - Click anywhere → recipe detail

## 🚀 Cách sử dụng

### 1. Truy cập trang My Reviews:
```typescript
// Direct link
<Link href="/my-reviews">Đánh giá của tôi</Link>
```

### 2. Sử dụng Widget:
```typescript
import MyReviewsWidget from "@/app/components/review/MyReviewsWidget";

// Trong profile page
<MyReviewsWidget limit={3} />
```

### 3. Fetch reviews programmatically:
```typescript
const loadReviews = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/proxy/user/me/reviews", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    console.log(data); // UserReviewWithRecipe[]
};
```

## 📊 Data Structure

### Response từ API:
```json
[
  {
    "review": {
      "reviewId": 1,
      "recipeId": 1,
      "recipeName": "Phở Bò",
      "userId": 1,
      "userName": "user1",
      "userAvatar": "https://...",
      "title": "Ngon tuyệt vời!",
      "reviewContent": "Món phở này rất ngon...",
      "userImages": ["https://...", "https://..."],
      "actualCookingTime": 50,
      "createdAt": "2025-12-11T10:00:00",
      "updatedAt": "2025-12-11T10:00:00",
      "isChange": true,
      "isDelete": true
    },
    "recipeId": 1,
    "recipeTitle": "Phở Bò Hà Nội",
    "recipeImageUrl": "https://...",
    "recipeDescription": "Món phở bò truyền thống...",
    "category": "Món chính",
    "difficultyLevel": "MEDIUM",
    "prepTime": 30,
    "cookTime": 240
  }
]
```

## 🛠️ Todo / Future Enhancements

- [ ] Implement Edit Review functionality
- [ ] Implement Delete Review functionality  
- [ ] Add filtering by recipe category
- [ ] Add sorting (newest/oldest)
- [ ] Add search within reviews
- [ ] Add pagination for large lists
- [ ] Add review statistics (total reviews, avg cooking time)

## 🎯 Testing

### Test Cases:
1. ✅ User có reviews → hiển thị danh sách đầy đủ
2. ✅ User chưa có reviews → hiển thị empty state
3. ✅ User chưa login → hiển thị error message
4. ✅ Click recipe title/image → navigate to recipe detail
5. ✅ Edit button chỉ hiện khi `isChange = true`
6. ✅ Delete button chỉ hiện khi `isDelete = true`

### Test URLs:
- Main page: `http://localhost:3000/my-reviews`
- API: `http://localhost:3000/api/proxy/user/me/reviews`

## 📸 Screenshots

Xem file ảnh demo: `my_reviews_page_*.png`

---

**Created**: 2025-12-11  
**API**: `/api/user/me/reviews`  
**Pages**: `/my-reviews`
