"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Instruction, RecipeForm } from "../types/recipeUpload";

export default function CreateRecipePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{
    categoryId: number;
    name: string;
    description: string;
  }[]>([]);


  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/proxy/categories");

        if (!res.ok) throw new Error("Không thể tải danh mục");

        const data = await res.json();

        // Backend trả về danh sách CategoriesDTO
        setCategories(data);
      } catch (e) {
        console.error("Lỗi load categories:", e);
      }
    };

    loadCategories();
  }, []);

  const [formData, setFormData] = useState<RecipeForm>({
    title: "",
    description: "",
    difficultyLevel: "MEDIUM",
    prepTime: "",
    cookTime: "",
    servings: "",
    categoryId: 1,
    ingredients: [""],
    nutrition: [""],
    instructions: [
      {
        instruction: "",
        files: [],       // danh sách file ảnh
        previews: [],    // danh sách ảnh preview
      }
    ],
    tags: ["recipe", "homecook"],
    image_primary: null,
  });

  /* =======================================================
     STATE HELPERS
  ======================================================== */

  const handleChange = (key: keyof RecipeForm, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /* =======================================================
     INGREDIENTS
  ======================================================== */

  const addIngredient = () =>
    handleChange("ingredients", [...formData.ingredients, ""]);

  const updateIngredient = (i: number, val: string) => {
    const arr = [...formData.ingredients];
    arr[i] = val;
    handleChange("ingredients", arr);
  };

  const removeIngredient = (i: number) => {
    handleChange(
      "ingredients",
      formData.ingredients.filter((_, idx) => idx !== i)
    );
  };

  /* =======================================================
     NUTRITION
  ======================================================== */
  const addNutrition = () =>
    handleChange("nutrition", [...formData.nutrition, ""]);

  const updateNutrition = (i: number, val: string) => {
    const arr = [...formData.nutrition];
    arr[i] = val;
    handleChange("nutrition", arr);
  };

  const removeNutrition = (i: number) => {
    handleChange(
      "nutrition",
      formData.nutrition.filter((_, idx) => idx !== i)
    );
  };

  /* =======================================================
     INSTRUCTIONS
  ======================================================== */

  const addInstruction = () =>
    handleChange("instructions", [
      ...formData.instructions,
      {
        instruction: "",
        files: [],       // thêm vào
        previews: []     // thêm vào
      }
    ]);


  const updateInstruction = <K extends keyof Instruction>(
    index: number,
    field: K,
    value: Instruction[K]
  ) => {
    const arr = [...formData.instructions];
    arr[index] = { ...arr[index], [field]: value };
    handleChange("instructions", arr);
  };

  const removeInstruction = (index: number) => {
    handleChange(
      "instructions",
      formData.instructions.filter((_, i) => i !== index)
    );
  };

  /* =======================================================
     IMAGES
  ======================================================== */

  const handlePrimaryImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleChange("image_primary", file);
  };
  const removePrimaryImage = () => {
    handleChange("image_primary", null);
  };


  const handleInstructionImages = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormData(prev => {
      const clone = [...prev.instructions];
      const step = clone[index];

      const newFiles = step.files ? [...step.files] : [];
      const newPreviews = step.previews ? [...step.previews] : [];

      Array.from(files).forEach(file => {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });

      clone[index] = {
        ...step,
        files: newFiles,
        previews: newPreviews,
      };

      return { ...prev, instructions: clone };
    });
  };
  const removeStepImage = (stepIndex: number, imageIndex: number) => {
    setFormData(prev => {
      const clone = [...prev.instructions];
      const step = clone[stepIndex];

      const newFiles = [...(step.files || [])];
      const newPreviews = [...(step.previews || [])];

      newFiles.splice(imageIndex, 1);
      newPreviews.splice(imageIndex, 1);

      clone[stepIndex] = {
        ...step,
        files: newFiles,
        previews: newPreviews,
      };

      return { ...prev, instructions: clone };
    });
  };


  /* =======================================================
     SUBMIT
  ======================================================== */

  const handleSubmit = async (e: FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Bạn cần đăng nhập!");

      if (!formData.image_primary) {
        alert("Vui lòng chọn ảnh đại diện!");
        return;
      }

      const hasStepImage = formData.instructions.some(s => s.files && s.files.length > 0);
      if (!hasStepImage) {
        alert("Cần ít nhất 1 ảnh cho bước nấu!");
        return;
      }
      const selectedCategory = categories.find(
        c => c.categoryId === formData.categoryId
      );
      const fd = new FormData();

      const payload = {
        title: formData.title,
        description: formData.description,
        difficultyLevel: formData.difficultyLevel,
        prepTime: Number(formData.prepTime),
        cookTime: Number(formData.cookTime),
        servings: Number(formData.servings),
        category: {
          name: selectedCategory?.name || "",
          description: selectedCategory?.description || ""
        },

        ingredients: formData.ingredients.filter(i => i.trim() !== ""),
        nutrition: formData.nutrition.filter(n => n.trim() !== ""),

        instructions: formData.instructions.map(s => ({
          instruction: s.instruction,
          image: s.files && s.files.length > 0 ? true : false,
        })),

        tags: formData.tags
      };


      fd.append("recipes", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      fd.append("image_primary", formData.image_primary);

      formData.instructions.forEach(step => {
        if (step.files && step.files.length > 0) {
          step.files.forEach(file => fd.append("image", file));
        }
      });
      const res = await fetch("/api/proxy/recipes", {
        method: "POST",
        headers: {
          Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        },
        body: fd,

      });

      const data = await res.json();


      if (!res.ok) {
        alert(data.message || "Đăng công thức thất bại!");
        return;
      }

      alert("Đăng công thức thành công!");
      router.push("/upload-recipe");

    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);   // ✅ luôn tắt loading
    }
  };




  /* =======================================================
     UI
  ======================================================== */

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-8">Đăng Công Thức Mới</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow border space-y-8"
      >
        {/* TITLE */}
        <div>
          <label className="font-medium">Tên món ăn</label>
          <input
            className="w-full border rounded px-3 py-2 mt-2"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-medium">Mô tả</label>
          <textarea
            className="w-full border rounded px-3 py-2 mt-2"
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* DIFFICULTY */}
        <div>
          <label className="font-medium">Độ khó</label>
          <select
            className="w-full border rounded px-3 py-2 mt-2"
            value={formData.difficultyLevel}
            onChange={(e) =>
              handleChange("difficultyLevel", e.target.value as any)
            }
          >
            <option value="EASY">Dễ</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="HARD">Khó</option>
          </select>
        </div>
        {/* CATEGORY */}
        <div>
          <label className="font-medium">Danh mục</label>
          <select
            className="w-full border rounded px-3 py-2 mt-2"
            value={formData.categoryId}
            onChange={(e) => handleChange("categoryId", Number(e.target.value))}
          >
            <option value="">-- Chọn danh mục --</option>

            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* TIME */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <label>Chuẩn bị (phút)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-2"
              value={formData.prepTime}
              onChange={(e) => handleChange("prepTime", e.target.value)}
            />
          </div>

          <div>
            <label>Nấu (phút)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-2"
              value={formData.cookTime}
              onChange={(e) => handleChange("cookTime", e.target.value)}
            />
          </div>

          <div>
            <label>Khẩu phần</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-2"
              value={formData.servings}
              onChange={(e) => handleChange("servings", e.target.value)}
            />
          </div>
        </div>

        {/* PRIMARY IMAGE */}
        <div>
          {/* input file ẩn */}
          <input
            id="primaryImageInput"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePrimaryImage}
          />

          {/* Button thêm ảnh */}
          <button
            type="button"
            onClick={() => document.getElementById("primaryImageInput")?.click()}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            + Thêm ảnh món ăn
          </button>

          {/* Preview ảnh */}
          {formData.image_primary && (
            <div className="mt-4 w-64 relative">
              <img
                src={URL.createObjectURL(formData.image_primary)}
                className="w-64 h-40 object-cover rounded"
              />

              <button
                type="button"
                onClick={removePrimaryImage}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          )}

        </div>


        {/* INGREDIENTS */}
        <div>
          <label className="font-medium">Nguyên liệu</label>
          {formData.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <input
                value={ing}
                className="flex-1 border rounded px-3 py-2"
                onChange={(e) => updateIngredient(i, e.target.value)}
              />
              <button type="button" className="text-red-500" onClick={() => removeIngredient(i)}>
                ✕
              </button>
            </div>
          ))}

          <button type="button" className="text-orange-500 mt-2" onClick={addIngredient}>
            + Thêm nguyên liệu
          </button>
        </div>

        {/* NUTRITION */}
        <div>
          <label className="font-medium">Dinh dưỡng</label>
          {formData.nutrition.map((n, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <input
                value={n}
                className="flex-1 border rounded px-3 py-2"
                onChange={(e) => updateNutrition(i, e.target.value)}
              />
              <button type="button" className="text-red-500" onClick={() => removeNutrition(i)}>
                ✕
              </button>
            </div>
          ))}

          <button type="button" className="text-orange-500 mt-2" onClick={addNutrition}>
            + Thêm dinh dưỡng
          </button>
        </div>
        {/* TAGS */}
        <div>
          <label className="font-medium">Thẻ tag</label>

          {formData.tags.map((tag, i) => (
            <div key={i} className="flex gap-3 mt-2">
              <input
                value={tag}
                className="flex-1 border rounded px-3 py-2"
                onChange={(e) => {
                  const clone = [...formData.tags];
                  clone[i] = e.target.value;
                  handleChange("tags", clone);
                }}
              />
              <button
                type="button"
                className="text-red-500"
                onClick={() => {
                  handleChange(
                    "tags",
                    formData.tags.filter((_, idx) => idx !== i)
                  );
                }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            className="text-orange-500 mt-2"
            onClick={() => handleChange("tags", [...formData.tags, ""])}
          >
            + Thêm tag
          </button>
        </div>

        {/* INSTRUCTIONS */}
        <div>
          <label className="font-medium">Các bước thực hiện</label>

          {formData.instructions.map((inst, i) => (
            <div key={i} className="border p-4 mt-4 bg-gray-50 rounded">
              <div className="flex justify-between">
                <b>Bước {i + 1}</b>
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeInstruction(i)}
                >
                  ✕ Xóa
                </button>
              </div>

              {/* Mô tả bước */}
              <input
                className="w-full border rounded px-3 py-2 mt-2"
                value={inst.instruction}
                onChange={(e) =>
                  updateInstruction(i, "instruction", e.target.value)
                }
                placeholder="Mô tả bước..."
              />

              {/* Input file ẩn */}
              <input
                id={`stepImageInput_${i}`}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleInstructionImages(i, e)}
              />

              {/* Button thêm ảnh */}
              <button
                type="button"
                onClick={() =>
                  document.getElementById(`stepImageInput_${i}`)?.click()
                }
                className="mt-3 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                + Thêm ảnh cho bước {i + 1}
              </button>

              {/* Preview nhiều ảnh */}
              {inst.previews && inst.previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {inst.previews.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={src}
                        className="w-32 h-24 object-cover rounded border"
                      />

                      <button
                        type="button"
                        onClick={() => removeStepImage(i, idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                </div>
              )}
            </div>
          ))}

          {/* nút thêm bước */}
          <button
            type="button"
            className="text-orange-500 mt-3"
            onClick={addInstruction}
          >
            + Thêm bước
          </button>
        </div>



        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-2 rounded flex items-center gap-2 disabled:opacity-70"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
          )}
          {loading ? "Đang đăng..." : "Đăng công thức"}
        </button>
      </form>
    </section>
  );
}
