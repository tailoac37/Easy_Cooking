package projectCooking.Service.Implements;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import projectCooking.Model.RecipesDTO; // Đã dùng ở dưới
import projectCooking.Request.ChatRequest;
import projectCooking.Response.ChatResponse;
import projectCooking.Service.ChatbotService;
import projectCooking.Service.JWTService;

@Service
public class ChatbotServiceIMPL implements ChatbotService {

    @Autowired
    private JWTService jwt;

    // URL của Python AI Service
    private static final String AI_SERVICE_URL = "http://localhost:5000/chat";

    @Override
    public ChatResponse chat(String message, String token) {
        ChatRequest request = new ChatRequest();
        request.setMessage(message);
        request.setHistory(new ArrayList<>());
        return chatWithHistory(request, token);
    }

    @Override
    public ChatResponse chatWithHistory(ChatRequest request, String token) {
        try {
            // 1. Chuẩn bị request gửi sang Python
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Tạo body JSON: {"message": "..."}
            Map<String, String> map = new HashMap<>();
            map.put("message", request.getMessage());

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(map, headers);

            // 2. Gọi API Python (POST)
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVICE_URL, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String aiMessage = (String) response.getBody().get("response");
                List<Map<String, Object>> recipesData = (List<Map<String, Object>>) response.getBody().get("data");

                List<RecipesDTO> recipesList = new ArrayList<>();

                if (recipesData != null) {
                    for (Map<String, Object> r : recipesData) {
                        try {
                            RecipesDTO dto = new RecipesDTO();

                            // Safe casting for Integer fields
                            Object rId = r.get("recipeId");
                            if (rId instanceof Integer)
                                dto.setRecipeId((Integer) rId);
                            else if (rId != null)
                                dto.setRecipeId(Integer.parseInt(rId.toString()));

                            dto.setTitle(r.get("title") != null ? r.get("title").toString() : "Món ăn");
                            dto.setDescription(r.get("description") != null ? r.get("description").toString() : "");

                            // Handle image
                            Object img = r.get("image");
                            dto.setImageUrl(img != null ? img.toString() : "");

                            // Handle time
                            Object time = r.get("time");
                            if (time instanceof Integer)
                                dto.setCookTime((Integer) time);
                            else if (time != null)
                                dto.setCookTime(Integer.parseInt(time.toString()));

                            // Handle ingredients
                            Object ingsObj = r.get("ingredients");
                            if (ingsObj instanceof List) {
                                dto.setIngredients((List<String>) ingsObj);
                            } else {
                                dto.setIngredients(new ArrayList<>());
                            }

                            recipesList.add(dto);
                        } catch (Exception e) {
                            System.out.println("⚠️ Lỗi parse món ăn từ AI: " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                }

                // Trả về kết quả từ AI kèm danh sách món ăn
                return new ChatResponse(aiMessage, recipesList, "AI_Search");
            }

        } catch (Exception e) {
            System.out.println("⚠️ Lỗi gọi AI Service: " + e.getMessage());
            // Fallback: Nếu Python chưa chạy thì trả lời mặc định
            return new ChatResponse("Xin lỗi, đầu bếp AI đang nghỉ ngơi (Service chưa bật). Vui lòng thử lại sau!");
        }

        return new ChatResponse("Có lỗi xảy ra khi kết nối với AI.");
    }

    /*
     * 
     * // CODE CŨ (RULE-BASED) - GIỮ LẠI ĐỂ THAM KHẢO
     * 
     * 
     * @Autowired
     * private RecipesRepo recipeRepo;
     * 
     * @Autowired
     * private ModelMapper modelMapper;
     * 
     * @Autowired
     * private LikeRepo likeRepo;
     * 
     * private String normalize(String text) { ... }
     * private ChatResponse analyzeAndRespond(...) { ... }
     * 
     * // (Toàn bộ logic if-else cũ đã được comment lại ở đây)
     * // Nếu muốn dùng lại logic cũ, hãy uncomment phần này và implement lại các
     * method.
     */
}
