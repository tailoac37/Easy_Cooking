# AI Chatbot Recipe Limit Update

## 📋 Tổng quan

Đã cập nhật AI Chatbot để hiển thị **tối đa 3 công thức** mỗi lần trả lời, giúp response ngắn gọn hơn và khuyến khích người dùng tương tác tiếp để khám phá thêm món ăn.

## 🎯 Thay đổi

### **Backend - ChatbotServiceIMPL.java**

#### 1. **Giới hạn số lượng recipes xuống 3**

| Method | Old Limit | New Limit |
|--------|-----------|-----------|
| `getPopularRecipes()` | 3 | 3 ✅ |
| `getTrendingRecipes()` | 10 → collapse to 3 | **3** ✅ |
| `searchRecipesByIngredients()` | 10 | **3** ✅ |
| `searchRecipesByTitle()` | 10 → collapse to 3 | **3** ✅ |

#### 2. **Thêm gợi ý tương tác**

Khi trả về 3 công thức, chatbot sẽ thêm hint để khuyến khích user hỏi thêm:

**Ví dụ responses:**

```
🔥 Popular Recipes:
"Đây là những món ăn được yêu thích nhất trên hệ thống:
[3 recipes...]

💡 Muốn xem thêm món khác? Hãy hỏi tôi về món ăn đang hot hoặc tìm theo nguyên liệu nhé!"
```

```
🔥 Trending Recipes:
"Đây là những món ăn đang hot nhất (nhiều lượt xem):
[3 recipes...]

💡 Thích món nào chưa? Bạn có thể hỏi tôi về món yêu thích hoặc tìm theo tên món nhé!"
```

```
🥘 Ingredient Search:
"Tôi đã tìm thấy các món ăn phù hợp với nguyên liệu: gà, khoai tây
[3 recipes...]

💡 Chưa có món ưng ý? Thử thêm/bớt nguyên liệu hoặc hỏi tôi về món hot nhé!"
```

```
🔍 Title Search:
"Kết quả tìm kiếm cho 'phở':
[3 recipes...]

💡 Muốn khám phá thêm? Hãy thử tìm theo nguyên liệu hoặc xem món đang hot!"
```

## 📊 Lợi ích

### ✅ **UX Improvements:**
- **Ngắn gọn hơn**: Không bị overwhelm bởi quá nhiều kết quả
- **Tương tác cao hơn**: Khuyến khích user hỏi thêm câu hỏi mới
- **Đa dạng hơn**: User được gợi ý khám phá các cách tìm kiếm khác nhau
- **Conversational**: Cảm giác như đang nói chuyện với assistant thực sự

### ✅ **Technical Benefits:**
- **Load nhanh hơn**: Ít data trả về từ backend
- **Scalable**: Dễ thêm pagination sau này nếu cần
- **Maintainable**: Code rõ ràng với comments

## 🎨 User Flow Example

```
User: "Món nào đang hot?"
Bot:  "Đây là những món ăn đang hot nhất (nhiều lượt xem):
       1. Phở Bò Hà Nội
       2. Bún Chả Hà Nội  
       3. Cơm Tấm Sườn Nướng
       
       💡 Thích món nào chưa? Bạn có thể hỏi tôi về món yêu thích 
          hoặc tìm theo tên món nhé!"

User: "Tìm món có gà"
Bot:  "Tôi đã tìm thấy các món ăn phù hợp với nguyên liệu: gà
       1. Gà kho gừng
       2. Gà xào sả ớt
       3. Phở gà
       
       💡 Chưa có món ưng ý? Thử thêm/bớt nguyên liệu hoặc 
          hỏi tôi về món hot nhé!"
```

## 🔧 Files Modified

```
projectCooking/src/main/java/projectCooking/Service/Implements/ChatbotServiceIMPL.java
  - Line 248-257: getTrendingRecipes() - limit to 3
  - Line 259-287: searchRecipesByIngredients() - limit to 3  
  - Line 289-300: searchRecipesByTitle() - limit to 3
  - Line 76-164: analyzeAndRespond() - added hint messages
```

## 🚀 Deployment

1. Backend đã được update
2. Restart backend server để áp dụng changes
3. Frontend không cần thay đổi (API response structure giữ nguyên)

## 📝 Future Enhancements

- [ ] Thêm pagination thực sự (offset/limit parameters)
- [ ] Track user queries để suggest better
- [ ] Add "Xem thêm 3 món" button
- [ ] Cache frequently searched recipes
- [ ] A/B test optimal number of results (3 vs 5 vs 10)

---

**Updated**: 2025-12-11  
**Changes**: Limited recipes to 3, added interactive hints  
**Impact**: Better UX, more engaging chatbot conversations
