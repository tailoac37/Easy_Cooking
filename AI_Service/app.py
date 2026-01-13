import os
import json
import mysql.connector
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
from groq import Groq
from dotenv import load_dotenv

# Load biến môi trường
load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# CẤU HÌNH (Bạn điền API Key vào file .env hoặc sửa trực tiếp)
# ---------------------------------------------------------
# Đăng ký free tại: https://console.groq.com/
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "gsk_...") 

# Database Config (Lấy từ project Java của bạn)
DB_CONFIG = {
    'user': os.getenv("DB_USER", "root"),
    'password': os.getenv("DB_PASSWORD", "yOZWPcsKsBIQtLeeQwjWiTojgLGijClo"),
    'host': os.getenv("DB_HOST", "ballast.proxy.rlwy.net"),
    'port': int(os.getenv("DB_PORT", 12168)),
    'database': os.getenv("DB_NAME", "railway"),
    'raise_on_warnings': True
}

# ---------------------------------------------------------
# KHỞI TẠO AI MODEL & VECTOR DB
# ---------------------------------------------------------
print("⏳ Đang tải mô hình Embedding (có thể mất 1-2 phút lần đầu)...")
embed_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2') 
# Model này nhẹ, chạy tốt trên CPU, tạo vector 384 chiều

dimension = 384
index = faiss.IndexFlatL2(dimension)
recipes_data = [] # Lưu thông tin món ăn để mapping lại từ vector

def load_data_from_db():
    global recipes_data, index
    print("⏳ Đang kết nối Database để lấy món ăn...")
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor(dictionary=True)
        
        # Chỉ lấy món đã duyệt (APPROVED)
        query = """
            SELECT recipe_id, title, description, ingredients, nutrition, cook_time, image_url 
            FROM recipes 
            WHERE status = 'APPROVED'
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not rows:
            print("⚠️ Không tìm thấy món ăn nào trong DB!")
            return

        texts_to_embed = []
        recipes_data = []
        
        print(f"✅ Tìm thấy {len(rows)} món ăn. Đang tạo Vector...")
        
        for row in rows:
            # Tạo đoạn văn mô tả món ăn để AI hiểu
            # Cấu trúc: "Tên món: Phở. Mô tả: ... Nguyên liệu: ... Thời gian: ..."
            text = f"Tên món: {row['title']}. Mô tả: {row['description']}. Nguyên liệu: {row['ingredients']}. Thời gian nấu: {row['cook_time']} phút."
            texts_to_embed.append(text)
            recipes_data.append(row)
            
        # Tạo vectors
        embeddings = embed_model.encode(texts_to_embed)
        
        # Add vào FAISS
        index = faiss.IndexFlatL2(dimension) # Reset index
        index.add(np.array(embeddings).astype('float32'))
        
        print("✅ Đã nạp dữ liệu vào bộ nhớ AI thành công!")
        
        cursor.close()
        cnx.close()
    except Exception as e:
        print(f"❌ Lỗi kết nối DB: {e}")
        # Dữ liệu mẫu nếu không nối được DB
        print("⚠️ Đang chạy chế độ dữ liệu giả lập (Mock Data)")
        mock_data = [
            {"recipe_id": 1, "title": "Phở Bò", "description": "Món nước truyền thống", "ingredients": "Bánh phở, bò", "cook_time": 30},
            {"recipe_id": 2, "title": "Cơm sườn", "description": "Cơm tấm sài gòn", "ingredients": "Sườn, cơm, trứng", "cook_time": 45}
        ]
        recipes_data = mock_data
        texts = [f"{r['title']} {r['ingredients']}" for r in mock_data]
        embs = embed_model.encode(texts)
        index.add(np.array(embs).astype('float32'))

# Load dữ liệu ngay khi khởi động
load_data_from_db()

# ---------------------------------------------------------
# API XỬ LÝ CHAT
# ---------------------------------------------------------
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"response": "Bạn chưa nhập câu hỏi!"})

    # 1. Tìm kiếm context liên quan (Retrieval)
    print(f"🔍 Đang tìm kiếm thông tin cho: {user_message}")
    query_vector = embed_model.encode([user_message])
    k = 3 # Lấy 3 món liên quan nhất
    distances, indices = index.search(np.array(query_vector).astype('float32'), k)
    
    context_str = ""
    found_recipes = []
    
    for idx in indices[0]:
        if idx < len(recipes_data):
            r = recipes_data[idx]
            found_recipes.append(r)
            context_str += f"- Món {r['title']}: {r['description']} (Nguyên liệu: {r['ingredients']})\n"

    # 2. Gọi AI (Generation)
    try:
        # Nếu chưa có key thì trả lời theo Rule-based nhẹ
        if not GROQ_API_KEY or "gsk_..." in GROQ_API_KEY:
            ai_response = f"Tôi tìm thấy {len(found_recipes)} món phù hợp:\n"
            for r in found_recipes:
                ai_response += f"🍲 **{r['title']}**: {r['description']}\n"
            ai_response += "\n(Lưu ý: Đây là phản hồi tự động vì chưa cấu hình Groq API Key)"
        else:
            client = Groq(api_key=GROQ_API_KEY)
            
            system_prompt = f"""
            Bạn là một đầu bếp AI thông thái của ứng dụng 'Easy Cooking'.
            Dưới đây là một số món ăn tìm được từ database có thể liên quan:
            {context_str}

            YÊU CẦU QUAN TRỌNG:
            1. Dựa vào các món ăn trên để trả lời câu hỏi của người dùng.
            2. Nếu người dùng chỉ CHÀO HỎI (vd: "xin chào", "hi"), hoặc hỏi chuyện phiếm, hoặc các món ăn trên KHÔNG LIÊN QUAN gì đến câu hỏi -> Hãy trả lời bình thường và THÊM CỤM TỪ "[NO_RECIPES]" vào cuối câu.
            3. Nếu người dùng thực sự HỎI VỀ MÓN ĂN và các món trên có liên quan -> Hãy giới thiệu chúng và KHÔNG thêm "[NO_RECIPES]".
            """
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.3-70b-versatile", # Model mới nhất, miễn phí
            )
            ai_response = chat_completion.choices[0].message.content

            # Xử lý logic ẩn recipes
            if "[NO_RECIPES]" in ai_response:
                ai_response = ai_response.replace("[NO_RECIPES]", "").strip()
                found_recipes = [] # Xóa list recipes để không trả về Java

    except Exception as e:
        print(f"Lỗi gọi AI: {e}")
        ai_response = "Xin lỗi, hiện tại đầu bếp AI đang bận. Vui lòng thử lại sau."
        found_recipes = [] # Clear recipes on error

    # 3. Format lại data để trả về cho Frontend hiển thị
    formatted_recipes = []
    for r in found_recipes:
        # Map field từ DB sang DTO mà Frontend cần
        # Lưu ý: check kỹ tên cột trong DB của bạn
        formatted_recipes.append({
            "recipeId": r['recipe_id'],
            "title": r['title'],
            "description": r['description'],
            "image": r.get('image_url', ''), # Nếu có link ảnh
            "time": r['cook_time'],
            "ingredients": r['ingredients'].split('@') if '@' in r['ingredients'] else r['ingredients'].split(','),
            "like": False # Default
        })

    return jsonify({
        "response": ai_response,
        "data": formatted_recipes # Trả về list món để Java map vào DTO
    })

# Endpoint để trigger load lại dữ liệu nếu DB thay đổi
@app.route('/sync', methods=['POST'])
def sync_data():
    load_data_from_db()
    return jsonify({"status": "success", "message": "Đã cập nhật dữ liệu món ăn mới nhất!"})

if __name__ == '__main__':
    # Chạy trên port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
