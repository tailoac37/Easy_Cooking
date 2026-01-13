from fastapi import FastAPI, File, UploadFile, HTTPException
from ultralytics import YOLO
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from deep_translator import GoogleTranslator
import io
import base64
from typing import Optional
import traceback
import numpy as np
import torch.nn.functional as F
torch.utils.backcompat.broadcast_warning.enabled = True
torch.utils.backcompat.keepdim_warning.enabled = True

# ==================== KHỞI TẠO FASTAPI ====================
app = FastAPI(
    title="AI Nhận Diện Nguyên Liệu Nấu Ăn",
    description="API để nhận diện nguyên liệu từ hình ảnh",
    version="1.0.6"
)

# Cho phép CORS (để Frontend gọi được)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên chỉ định domain cụ thể
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== TỪ ĐIỂN NGUYÊN LIỆU ====================
TU_DIEN_NGUYEN_LIEU = {
    'duck': 'vịt', 'goose': 'ngỗng',
    'crab': 'cua', 'snail': 'ốc', 'clam': 'nghêu', 'oyster': 'hàu', 'squid': 'mực',
    'octopus': 'bạch tuộc', 'eel': 'lươn',
    'tofu': 'đậu phụ', 'soybean': 'đậu nành',
    'bean': 'đậu', 'beans': 'đậu', 'mung bean': 'đậu xanh', 'black bean': 'đậu đen',
    'peanut': 'lạc', 'sesame': 'mè',
    'corn': 'ngô', 'sweet corn': 'bắp ngọt',
    'cassava': 'sắn', 'taro': 'khoai môn',
    'sweet potato': 'khoai lang',
    'water spinach': 'rau muống',
    'morning glory': 'rau muống',
    'basil': 'húng quế', 'mint': 'húng bạc hà',
    'cilantro': 'ngò', 'coriander': 'rau mùi',
    'dill': 'thì là',
    'perilla': 'tía tô',
    'fish sauce': 'nước mắm',
    'soy sauce': 'xì dầu',
    'vinegar': 'giấm',
    'chili sauce': 'tương ớt',
    'tomato sauce': 'tương cà',
    'shrimp paste': 'mắm tôm',
    'fermented fish': 'mắm cá',
    'pickled vegetable': 'dưa muối',
    'pickled cabbage': 'dưa cải',
    'banana flower': 'hoa chuối',
    'lotus root': 'ngó sen',
    'bamboo shoot': 'măng',
    'young jackfruit': 'mít non',
    'papaya': 'đu đủ',
    'green papaya': 'đu đủ xanh',
    'longan': 'nhãn',
    'lychee': 'vải',
    'dragon fruit': 'thanh long',
    'mango': 'xoài',
    'guava': 'ổi',
    'sapodilla': 'hồng xiêm',
    'custard apple': 'na',
    'starfruit': 'khế',
    'rambutan': 'chôm chôm',
    'durian': 'sầu riêng',
    'passion fruit': 'chanh dây',
    'watermelon': 'dưa hấu',
    'melon': 'dưa gang',
    'pomelo': 'bưởi',
    'grape': 'nho',
    'pear': 'lê',
    'plum': 'mận',
    'persimmon': 'hồng',
    'coconut': 'dừa',
    'young coconut': 'dừa non',
    'coconut milk': 'nước cốt dừa',
    'chestnut': 'hạt dẻ',
    'walnut': 'óc chó',
    'cashew': 'hạt điều',
    'almond': 'hạnh nhân',
    'breadfruit': 'sa kê',
    'herbal leaves': 'lá thuốc',
    'lemongrass': 'sả',
    'turmeric': 'nghệ',
    'galangal': 'riềng',
    'kohlrabi': 'su hào',
    'okra': 'đậu bắp',
    'eggplant': 'cà tím',
    'green bean': 'đậu que',
    'yardlong bean': 'đậu đũa',
    'chayote': 'su su',
    'gourd': 'bí',
    'pumpkin': 'bí đỏ',
    'winter melon': 'bí đao',
    'bitter melon': 'mướp đắng',
    'luffa': 'mướp',
    'cantaloupe': 'dưa lưới',
    'seaweed': 'rong biển',
    'kelp': 'tảo bẹ',
    'clam broth': 'nước nghêu',
    'chicken broth': 'nước gà',
    'beef broth': 'nước bò',
    'pork bone': 'xương heo',
    'shrimp shell': 'vỏ tôm',
    'rice noodle': 'bún',
    'vermicelli': 'miến',
    'pho noodle': 'bánh phở',
    'sticky rice': 'gạo nếp',
    'brown rice': 'gạo lứt',
    'broken rice': 'gạo tấm',
    'tea': 'trà',
    'coffee': 'cà phê' ,
    'anchovy': 'cá cơm',
    'mackerel': 'cá nục',
    'sardine': 'cá mòi',
    'tilapia': 'cá rô phi',
    'snakehead fish': 'cá quả',
    'carp': 'cá chép',
    'catfish': 'cá trê',
    'goby': 'cá bống',
    'salmon': 'cá hồi',
    'tuna': 'cá ngừ',
    'beef tendon': 'gân bò',
    'beef tripe': 'lòng bò',
    'pork belly': 'ba chỉ',
    'pork rib': 'sườn heo',
    'pork skin': 'da heo',
    'duck egg': 'trứng vịt',
    'century egg': 'trứng bắc thảo',
    'balut': 'trứng vịt lộn',
    'quail egg': 'trứng cút',
    'chicken liver': 'gan gà',
    'pork liver': 'gan heo',
    'blood pudding': 'tiết',
    'shrimp roe': 'trứng tôm',
    'fish roe': 'trứng cá',
    'sea cucumber': 'hải sâm',
    'sea urchin': 'nhím biển',
    'frog': 'ếch',
    'field crab': 'cua đồng',
    'river snail': 'ốc sông',
    'apple snail': 'ốc bươu',
    'clam': 'sò',
    'scallop': 'sò điệp',
    'conch': 'ốc giác',
    'lobster': 'tôm hùm',
    'mantis shrimp': 'tôm tích',
    'herbal chicken': 'gà ác',
    'silkie chicken': 'gà ác',
    'pigeon': 'chim bồ câu',
    'sparrow': 'chim sẻ',
    'turkey': 'gà tây',
    'goat': 'dê',
    'rabbit': 'thỏ',
    'venison': 'thịt nai',
    'wild boar': 'lợn rừng',
    'cinnamon': 'quế',
    'star anise': 'hoa hồi',
    'cardamom': 'thảo quả',
    'clove': 'đinh hương',
    'bay leaf': 'lá nguyệt quế',
    'betel leaf': 'lá trầu',
    'banana leaf': 'lá chuối',
    'pandan leaf': 'lá dứa',
    'guava leaf': 'lá ổi',
    'tea leaf': 'lá chè',
    'lotus seed': 'hạt sen',
    'mung bean sprout': 'giá đỗ',
    'bean sprout': 'giá',
    'pickled onion': 'củ kiệu',
    'pickled garlic': 'tỏi ngâm',
    'pickled chili': 'ớt ngâm',
    'pickled eggplant': 'cà muối',
    'pickled bamboo shoot': 'măng muối',
    'pickled papaya': 'đu đủ muối',
    'pickled radish': 'củ cải muối',
    'radish': 'củ cải',
    'turnip': 'củ cải trắng',
    'daikon': 'củ cải Nhật',
    'water chestnut': 'củ mã thầy',
    'arrowroot': 'củ dong',
    'yam': 'củ từ',
    'lotus stem': 'thân sen',
    'banana stem': 'thân chuối',
    'young corn': 'bắp non',
    'pea': 'đậu Hà Lan',
    'snow pea': 'đậu tuyết',
    'broad bean': 'đậu tằm',
    'lentil': 'đậu lăng',
    'chickpea': 'đậu gà',
    'pumpkin seed': 'hạt bí',
    'sunflower seed': 'hạt hướng dương',
    'sesame oil': 'dầu mè',
    'peanut oil': 'dầu lạc',
    'soybean oil': 'dầu đậu nành',
    'fish oil': 'dầu cá',
    'lard': 'mỡ heo',
    'chili powder': 'bột ớt',
    'turmeric powder': 'bột nghệ',
    'curry powder': 'bột cà ri',
    'five spice powder': 'ngũ vị hương',
    'peppercorn': 'hạt tiêu',
    'white pepper': 'tiêu trắng',
    'black pepper': 'tiêu đen',
    'rock sugar': 'đường phèn',
    'palm sugar': 'đường thốt nốt',
    'molasses': 'mật mía',
    'honey': 'mật ong',
    'shrimp cracker': 'bánh phồng tôm',
    'rice paper': 'bánh tráng',
    'rice flour': 'bột gạo',
    'glutinous rice flour': 'bột nếp',
    'tapioca starch': 'bột sắn',
    'corn starch': 'bột bắp',
    'wheat flour': 'bột mì',
    
    # --- YOLO Classes (Food) ---
    'tomato': 'cà chua', 'carrot': 'cà rốt', 'cabbage': 'bắp cải', 'cucumber': 'dưa chuột',
    'potato': 'khoai tây', 'pumpkin': 'bí đỏ', 'mushroom': 'nấm', 'broccoli': 'súp lơ xanh',
    'bell pepper': 'ớt chuông', 'zucchini': 'bí ngòi', 'apple': 'táo', 'banana': 'chuối',
    'orange': 'cam', 'lemon': 'chanh', 'strawberry': 'dâu tây', 'pineapple': 'dứa',
    'pomegranate': 'lựu', 'chicken': 'thịt gà', 'fish': 'cá', 'shrimp': 'tôm',
    'crab': 'cua', 'lobster': 'tôm hùm', 'egg': 'trứng', 'cheese': 'phô mai',
    'bread': 'bánh mì', 'milk': 'sữa'
}

# ==================== KHỞI TẠO MODEL ====================
print("🔄 Đang tải AI model...")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"💻 Sử dụng thiết bị: {device.upper()}")

try:
    # Load BLIP
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    model = model.to(device)
    model.eval()
    
    # Load YOLO
    print("🔄 Đang tải YOLO model...")
    try:
        yolo_model = YOLO(r"d:/AI_nhandienhinhanh/food_yolo (1).pt")
        print("✅ YOLO Model đã sẵn sàng!")
    except Exception as yolo_err:
        print(f"❌ Lỗi tải YOLO: {yolo_err}")
        yolo_model = None

    translator = GoogleTranslator(source='auto', target='vi')
    print("✅ Các Model đã sẵn sàng!")
except Exception as e:
    print(f"❌ Lỗi khi tải model: {e}")
    raise

# ==================== HÀM DỊCH ====================
def dich_sang_tieng_viet(text: str) -> str:
    """Dịch text từ tiếng Anh sang tiếng Việt"""
    if not text or len(text.strip()) == 0:
        return text
    
    words = text.lower().split(',')
    translated_words = []
    
    for word in words:
        word = word.strip()
        if not word:
            continue
        
        # Kiểm tra trong từ điển trước
        if word in TU_DIEN_NGUYEN_LIEU:
            translated_words.append(TU_DIEN_NGUYEN_LIEU[word])
        else:
            # Fallback sang Google Translate
            try:
                translated = translator.translate(word)
                translated_words.append(translated)
            except Exception as e:
                print(f"⚠️ Không dịch được '{word}': {e}")
                translated_words.append(word)
    
    return ', '.join(translated_words) if translated_words else text

# ==================== HÀM NHẬN DIỆN (FIXED) ====================
def nhan_dien_nguyen_lieu_core(image: Image.Image) -> dict:
    """Hàm core nhận diện nguyên liệu - Tích hợp YOLO + BLIP"""
    try:
        # BƯỚC 1: Convert
        if image.mode != 'RGB':
            image = image.convert('RGBA').convert('RGB')
        
        # --- CHẠY YOLO (trước khi resize cho BLIP) ---
        yolo_ingredients = []
        try:
            if yolo_model:
                # YOLO tự resize ảnh nếu cần, ta truyền ảnh gốc
                yolo_results = yolo_model(image)
                for result in yolo_results:
                    for box in result.boxes:
                        cls_id = int(box.cls[0])
                        cls_name = yolo_model.names[cls_id]
                        yolo_ingredients.append(cls_name)
                # Deduplicate
                yolo_ingredients = list(set(yolo_ingredients))
                print(f"🔍 YOLO phát hiện: {yolo_ingredients}")
        except Exception as e:
            print(f"⚠️ Lỗi YOLO inference: {e}")

        # Resize về kích thước cố định (384x384) cho BLIP
        image_blip = image.resize((384, 384), Image.LANCZOS)
        print(f"✅ Resize về: {image_blip.size}")
        
        # BƯỚC 2: Chuyển sang tensor (DÙNG PIL trực tiếp, không qua numpy)
        from torchvision import transforms
        
        transform = transforms.Compose([
            transforms.ToTensor(),  # Chuyển PIL → Tensor [0, 1]
            transforms.Normalize(
                mean=[0.48145466, 0.4578275, 0.40821073],
                std=[0.26862954, 0.26130258, 0.27577711]
            )
        ])
        
        img_tensor = transform(image_blip).unsqueeze(0).to(device)  # [1, 3, 384, 384]
        
        print(f"✅ Đã tạo tensor: {img_tensor.shape}")
        
        # BƯỚC 3: Generate BLIP
        with torch.no_grad():
            out = model.generate(
                pixel_values=img_tensor,
                max_length=50,
                num_beams=3
            )
            
            mo_ta = processor.tokenizer.decode(out[0], skip_special_tokens=True)
            
            print(f"🔍 Mô tả AI: {mo_ta}")
            
            # BƯỚC 4: Trích xuất nguyên liệu từ BLIP
            stop_words = {'on', 'a', 'an', 'the', 'white', 'background', 'wooden', 
                         'table', 'cutting', 'board', 'plate', 'bowl', 'basket', 
                         'in', 'with', 'and', 'of', 'is', 'are', 'image', 'photo'}
            
            words = mo_ta.lower().split()
            blip_ingredients = []
            
            for word in words:
                word = word.strip('.,!?;:()')
                if word and word not in stop_words and len(word) > 2:
                    blip_ingredients.append(word)
            
            # Kết hợp YOLO và BLIP: Ưu tiên YOLO
            all_ingredients = yolo_ingredients + blip_ingredients
            final_ingredients = list(dict.fromkeys(all_ingredients))
            
            nguyen_lieu_en = ', '.join(final_ingredients) if final_ingredients else mo_ta
            nguyen_lieu_vi = dich_sang_tieng_viet(nguyen_lieu_en)
            mo_ta_vi = dich_sang_tieng_viet(mo_ta)
        
        return {
            'success': True,
            'data': {
                'ingredients_vi': nguyen_lieu_vi,
                'ingredients_en': nguyen_lieu_en,
                'description_vi': mo_ta_vi,
                'description_en': mo_ta
            }
        }
        
    except Exception as e:
        print(f"❌ Lỗi trong nhan_dien_nguyen_lieu_core: {e}")
        print(traceback.format_exc())
        return {
            'success': False,
            'error': f"Lỗi xử lý ảnh: {str(e)}"
        }
# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "🥬 AI Nhận Diện Nguyên Liệu API",
        "status": "running",
        "version": "1.0.1",
        "endpoints": {
            "POST /detect": "Upload file ảnh để nhận diện",
            "POST /detect-base64": "Gửi base64 image để nhận diện",
            "GET /health": "Kiểm tra trạng thái API"
        }
    }

@app.get("/health")
async def health_check():
    """Kiểm tra API có hoạt động không"""
    return {
        "status": "healthy",
        "device": device,
        "model_loaded": model is not None
    }

@app.post("/detect")
async def detect_ingredients(file: UploadFile = File(...)):
    """
    Nhận diện nguyên liệu từ file upload
    
    - **file**: File ảnh (JPG, PNG, ...)
    
    Returns: JSON với thông tin nguyên liệu
    """
    try:
        # Kiểm tra file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail=f"File phải là ảnh, nhận được: {file.content_type}"
            )
        
        print(f"📥 Nhận file: {file.filename} ({file.content_type})")
        
        # Đọc file
        contents = await file.read()
        print(f"📦 Kích thước file: {len(contents)} bytes")
        
        # Mở ảnh
        try:
            image = Image.open(io.BytesIO(contents))
            print(f"✅ Mở ảnh thành công: {image.format} {image.size} {image.mode}")
        except Exception as img_error:
            raise HTTPException(
                status_code=400,
                detail=f"Không thể mở ảnh: {str(img_error)}"
            )
        
        # Nhận diện
        result = nhan_dien_nguyen_lieu_core(image)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Lỗi trong detect_ingredients: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

@app.post("/detect-base64")
async def detect_ingredients_base64(data: dict):
    """
    Nhận diện nguyên liệu từ base64 image
    
    Body JSON:
    {
        "image": "base64_string_here"
    }
    
    Returns: JSON với thông tin nguyên liệu
    """
    try:
        # Lấy base64 string
        base64_string = data.get("image")
        if not base64_string:
            raise HTTPException(status_code=400, detail="Thiếu trường 'image'")
        
        print(f"📥 Nhận base64 string (độ dài: {len(base64_string)})")
        
        # Xử lý base64 (loại bỏ prefix nếu có)
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
        
        # Decode base64 thành image
        try:
            image_bytes = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_bytes))
            print(f"✅ Decode base64 thành công: {image.format} {image.size}")
        except Exception as decode_error:
            raise HTTPException(
                status_code=400,
                detail=f"Không thể decode base64: {str(decode_error)}"
            )
        
        # Nhận diện
        result = nhan_dien_nguyen_lieu_core(image)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Lỗi trong detect_ingredients_base64: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

# ==================== CHẠY SERVER ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)  # HF Spaces dùng port 7860