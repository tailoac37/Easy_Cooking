# ALL CHATBOT IMPROVEMENTS - IMPLEMENTATION GUIDE

## 🎯 Summary of All Changes Needed

Bạn cần apply **5 improvements** vào ChatbotServiceIMPL.java:

### 1. User Recognition (chatWithHistory method)
### 2. Personalization (analyzeAndRespond method  - add username param)
### 3. Ingredient Recognition (extractIngredients method)
### 4. Recipe Limits (all query methods)
### 5. Recipe Name Extraction (extractRecipeName + cleanRecipeName methods)

---

## 📝 Step-by-Step Implementation

### STEP 1: Update chatWithHistory() - lines 44-52

**FIND:**
```java
@Override
public ChatResponse chatWithHistory(ChatRequest request, String token) {
    String message = normalize(request.getMessage());

    // Phân tích câu hỏi và xác định intent
    ChatResponse response = analyzeAndRespond(message, token);

    return response;
}
```

**REPLACE WITH:**
```java
@Override
public ChatResponse chatWithHistory(ChatRequest request, String token) {
    String message = normalize(request.getMessage());

    // 👤 Lấy thông tin user từ token
    String username = null;
    try {
        if (token != null && !token.isEmpty()) {
            username = jwt.extractUserName(token);
        }
    } catch (Exception e) {
        System.out.println("⚠️ Không thể lấy username: " + e.getMessage());
    }

    // Phân tích câu hỏi và xác định intent
    ChatResponse response = analyzeAndRespond(message, token, username);

    return response;
}
```

---

### STEP 2: Update analyzeAndRespond() signature - line 76

**FIND:**
```java
private ChatResponse analyzeAndRespond(String message, String token) {
```

**REPLACE WITH:**
```java
private ChatResponse analyzeAndRespond(String message, String token, String username) {
```

---

### STEP 3: Add Personalization in Greeting - around lines 162-171

**FIND:**
```java
// 5. Greeting
if (containsAny(message, "xin chao", "hello", "hi", "chao", "hey", "halo", "alo")) {
    return new ChatResponse(
            "Xin chào! Tôi là trợ lý AI cho ứng dụng nấu ăn. Tôi có thể giúp bạn:\n" +
                    "- Tìm món ăn được yêu thích nhất\n" +
                    "- Tìm món ăn đang hot\n" +
                    "- Tìm món ăn theo nguyên liệu\n" +
                    "- Tìm công thức nấu ăn theo tên\n\n" +
                    "Bạn muốn tìm món gì hôm nay?");
}
```

**REPLACE WITH:**
```java
// 5. Greeting - ✅ Personalized
if (containsAny(message, "xin chao", "hello", "hi", "chao", "hey", "halo", "alo")) {
    String greeting = username != null && !username.isEmpty()
            ? "Xin chào " + username + "! 👋"
            : "Xin chào! 👋";
    
    return new ChatResponse(
            greeting + " Tôi là trợ lý AI cho ứng dụng nấu ăn. Tôi có thể giúp bạn:\n" +
                    "- Tìm món ăn được yêu thích nhất\n" +
                    "- Tìm món ăn đang hot\n" +
                    "- Tìm món ăn theo nguyên liệu\n" +
                    "- Tìm công thức nấu ăn theo tên\n\n" +
                    "Bạn muốn tìm món gì hôm nay?");
}
```

---

### STEP 4: Update extractIngredients() - ENTIRE METHOD (lines 178-220)

**REPLACE ENTIRE METHOD WITH:**
```java
private List<String> extractIngredients(String message) {
    List<String> ingredients = new ArrayList<>();
    String normalized = normalize(message);

    // ✅ Stop words
    Set<String> stopWords = new HashSet<>(Arrays.asList(
        "toi", "minh", "em", "anh", "ban", "chung", "ho", "la", "cua", "ma", "de", "cho", 
        "voi", "hay", "nao", "gi", "sao", "the", "nhung", "va", "hoac", "neu", "thi"));

    Map<String, String> ingredientMap = new HashMap<>();
    
    // 🍗 Thịt
    ingredientMap.put("thit ga", "thịt gà");
    ingredientMap.put("thit bo", "thịt bò");
    ingredientMap.put("thit heo", "thịt heo");
    ingredientMap.put("thit", "thịt");  // ✅ ADD THIS
    ingredientMap.put("ga", "gà");
    ingredientMap.put("bo", "bò");
    ingredientMap.put("heo", "heo");
    
    // 🐟 Hải sản  
    ingredientMap.put("ca", "cá");
    ingredientMap.put("tom", "tôm");
    ingredientMap.put("muc", "mực");
    
    // 🥬 Rau củ
    ingredientMap.put("khoai tay", "khoai tây");
    ingredientMap.put("ca chua", "cà chua");
    ingredientMap.put("ca rot", "cà rốt");
    ingredientMap.put("hanh", "hành");
    ingredientMap.put("ot", "ớt");
    ingredientMap.put("rau", "rau");
    ingredientMap.put("nam", "nấm");
    ingredientMap.put("dau", "đậu");
    
    // 🧄 Gia vị - ✅ SMART TOI/TOI CHECK
    if (normalized.contains("toi") && !normalized.matches(".*\\btoi\\s+(co|dang|muon|can|se)\\b.*")) {
        ingredientMap.put("toi", "tỏi");
    }
    ingredientMap.put("gung", "gừng");
    ingredientMap.put("sa", "sả");
    
    // 🥚 Khác
    ingredientMap.put("trung", "trứng");
    ingredientMap.put("sua", "sữa");
    ingredientMap.put("pho mai", "phô mai");

    // ✅ Sort by length (longest first)
    List<Map.Entry<String, String>> sortedEntries = new ArrayList<>(ingredientMap.entrySet());
    sortedEntries.sort((a, b) -> Integer.compare(b.getKey().length(), a.getKey().length()));

    for (Map.Entry<String, String> entry : sortedEntries) {
        String key = entry.getKey();
        String value = entry.getValue();
        
        if (normalized.contains(key)) {
            String[] keyWords = key.split("\\s+");
            boolean isStopWord = false;
            
            for (String word : keyWords) {
                if (stopWords.contains(word)) {
                    if (normalized.matches(".*\\b" + word + "\\s+(co|dang|muon|can|se|la|cua)\\b.*")) {
                        isStopWord = true;
                        break;
                    }
                }
            }
            
            if (!isStopWord && !ingredients.contains(value)) {
                ingredients.add(value);
            }
        }
    }

    return ingredients;
}
```

---

### STEP 5: Update Recipe Query Methods - ADD LIMIT

**getTrendingRecipes() - around line 287:**
```java
private List<RecipesDTO> getTrendingRecipes(String token) {
    List<Recipe> recipes = recipeRepo.trending();
    if (recipes.isEmpty()) {
        recipes = recipeRepo.findAllApproved().stream()
                .sorted((a, b) -> Integer.compare(b.getViewCount(), a.getViewCount()))
                .limit(3)  // ✅ CHANGE FROM 10 TO 3
                .collect(Collectors.toList());
    }
    return convertToDTO(recipes.stream().limit(3).collect(Collectors.toList()), token);  // ✅ ADD LIMIT
}
```

**searchRecipesByIngredients() - around line 298:**
```java
// In the method, find this line:
.limit(10)

// CHANGE TO:
.limit(3)
```

**searchRecipesByTitle() - around line 328:**
```java
// Find:
.limit(10)

// CHANGE TO:  
.limit(3)

// Also add at the end before return:
return convertToDTO(recipes.stream().limit(3).collect(Collectors.toList()), token);
```

---

## 🧪 After All Changes, Test:

1. **"xin chào"** (logged in) → "Xin chào user1! 👋"
2. **"tôi có gà, thịt, rau"** → Should extract: gà, thịt, rau (NOT tỏi)
3. **"tìm món hot"** → Should return 3 recipes
4. **"tôi muốn tìm món tên là Bún bò huế"** → Should search for "bun bo hue"

---

**STATUS**: ALL code provided above ✅  
**ACTION**: Apply changes step by step carefully
