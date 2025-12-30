export interface Category {
  categoryId: number;           // ID danh mục
  name: string;                 // Tên danh mục
  description: string | null;   // Mô tả (có thể null)
  imageUrl: string | null;      // Ảnh (có thể null)
  createdAt: string;            // Ngày tạo dạng "yyyy-MM-dd"
}
