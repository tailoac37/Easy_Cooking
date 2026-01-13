from ultralytics import YOLO
import sys

try:
    with open("d:/AI_nhandienhinhanh/model_info.txt", "w", encoding="utf-8") as f:
        f.write("⏳ Đang tải model food_yolo (1).pt để kiểm tra...\n")
        # Load model
        model = YOLO(r"d:/AI_nhandienhinhanh/food_yolo (1).pt")
        
        # In thông tin cơ bản
        f.write("\n✅ Model tải thành công!\n")
        
        # Kiểm tra các class (danh sách món ăn nó học được)
        names = model.names
        f.write(f"\n📊 Tổng số món ăn (classes) nhận diện được: {len(names)}\n")
        f.write("-" * 30 + "\n")
        
        # In danh sách chi tiết
        for id, name in names.items():
            f.write(f"  {id}: {name}\n")
            
        f.write("-" * 30 + "\n")
        f.write("ℹ️ Nhận xét: File model có vẻ hợp lệ và đọc được metadata.\n")
        print("Done writing info.")

except Exception as e:
    with open("d:/AI_nhandienhinhanh/model_info.txt", "w", encoding="utf-8") as f:
        f.write(f"\n❌ Lỗi khi đọc file model: {e}")
    print(f"Error: {e}")
