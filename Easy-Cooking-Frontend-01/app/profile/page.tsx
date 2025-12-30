"use client";

import Image from "next/image";
import { FaUser, FaEnvelope, FaInfoCircle, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserProfile } from "../types/userProfile";
import { UserUpdateInfo } from "../types/userUpdateInfor";
import { userInfo } from "os";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    bio: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 🔹 Lấy thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/proxy/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn("Token hết hạn hoặc không hợp lệ");
          localStorage.removeItem("token");
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data);
        setFormData({
          fullName: data.fullName || "",
          userName: data.userName || "",
          email: data.email || "",
          bio: data.bio || "",
        });
      } catch (err) {
        console.error("❌ Lỗi fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🧠 Nếu chưa đăng nhập
  if (loading) return <p className="text-center py-20 text-gray-500">Đang tải...</p>;
  if (!user)
    return (
      <section className="flex justify-center items-center min-h-screen text-gray-600">
        <div className="text-center">
          <p>Vui lòng đăng nhập để xem hồ sơ.</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Đăng nhập
          </button>
        </div>
      </section>
    );

  // 📝 Hàm lưu thông tin
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập lại!");
        return;
      }

      // 🧠 Kiểm tra định dạng email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert("❌ Địa chỉ email không hợp lệ. Vui lòng nhập lại!");
        setIsSaving(false);
        return;
      }

      // 🧠 Kiểm tra xác nhận mật khẩu (nếu có nhập)
      if (
        passwords.newPassword &&
        passwords.newPassword !== passwords.confirmPassword
      ) {
        alert("❌ Mật khẩu mới và xác nhận không khớp!");
        setIsSaving(false);
        return;
      }

      // 🟢 Dữ liệu JSON kiểu camelCase
      const userInfor: UserUpdateInfo = {
        fullName: formData.fullName,
        userName: formData.userName,
        email: formData.email,
        bio: formData.bio,
        oldPassword: passwords.oldPassword || "",
        newPassword: passwords.newPassword || "",
      };

      // 🟢 Tạo FormData
      const form = new FormData();

      // ✅ Phần quan trọng: ép JSON thành Blob có Content-Type = application/json
      const jsonBlob = new Blob([JSON.stringify(userInfor)], {
        type: "application/json",
      });
      form.append("UserInfor", jsonBlob);

      // ✅ Nếu có ảnh đại diện
      if (avatarFile) form.append("avatar", avatarFile);

      const res = await fetch("/api/proxy/user/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const text = await res.text();
      console.log("📩 Raw backend response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        alert(data.message || "❌ Cập nhật thất bại!");
      } else {
        alert("✅ Hồ sơ đã được cập nhật thành công!");
        setUser((prev) => (prev ? { ...prev, ...formData } : prev));
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu thông tin:", err);
      alert("Không thể kết nối tới server!");
    } finally {
      setIsSaving(false);
    }
  };



  // 🖼️ Preview ảnh
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const initials = user.userName
    ? user.userName.charAt(0).toUpperCase()
    : "U";


  return (
    <section className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
        >
          {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
        </button>
      </div>

      {/* Avatar + Info */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-100">
          {previewUrl || user.avatarUrl ? (
            <Image
              src={previewUrl || user.avatarUrl!}
              alt={user.fullName || user.userName || "Avatar"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-orange-500 flex items-center justify-center text-white font-semibold text-4xl rounded-full">
              {user.fullName?.trim()
                ? user.fullName.trim().charAt(0).toUpperCase()
                : user.userName?.trim()
                  ? user.userName.trim().charAt(0).toUpperCase()
                  : "U"}
            </div>
          )}

          {/* Nút chọn ảnh */}
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 cursor-pointer hover:bg-black/70 transition"
          >
            Đổi ảnh
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mt-3">
            {formData.fullName || "Người dùng"}
          </h2>
          <p className="text-gray-600">@{formData.userName}</p>
          <p className="text-sm text-gray-400 mt-1">
            {user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
          </p>
        </div>
      </div>



      {/* Thông tin cá nhân */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* fullName */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">HỌ VÀ TÊN</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-900"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
        </div>

        {/* userName */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">TÊN NGƯỜI DÙNG</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-900"
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
            />
          </div>
        </div>

        {/* email */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">EMAIL</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaEnvelope className="text-gray-400 mr-2" />
            <input
              type="email"
              className="flex-1 bg-transparent outline-none text-gray-900"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        {/* bio */}
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-2">GIỚI THIỆU (BIO)</label>
          <div className="flex items-start border-b border-gray-300 pb-1">
            <FaInfoCircle className="text-gray-400 mr-2 mt-1" />
            <textarea
              rows={3}
              placeholder="Giới thiệu về bản thân..."
              className="flex-1 bg-transparent outline-none text-gray-900 resize-none"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu */}
      <div className="border-t border-gray-200 pt-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FaLock className="text-gray-500" /> Đổi mật khẩu
          </h2>
          <Link
            href="/forgot-password"
            className="text-sm text-[#003459] hover:underline"
          >
            Quên mật khẩu cũ? Dùng OTP
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">MẬT KHẨU CŨ</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-[#003459] transition"
              value={passwords.oldPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, oldPassword: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">MẬT KHẨU MỚI</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-[#003459] transition"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">XÁC NHẬN MẬT KHẨU MỚI</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="w-full border border-gray-200 rounded-lg p-2 outline-none focus:border-[#003459] transition"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
            />
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2">
          * Để trống nếu bạn không muốn thay đổi mật khẩu
        </p>
      </div>

      {/* Thống kê + Công thức */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-10">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{user.totalRecipes}</p>
          <p className="text-sm text-gray-600">Công thức</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{user.totalLike}</p>
          <p className="text-sm text-gray-600">Lượt thích</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{user.followerCount}</p>
          <p className="text-sm text-gray-600">Người theo dõi</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{user.totalView}</p>
          <p className="text-sm text-gray-600">Lượt xem</p>
        </div>
      </div>

      {/* Công thức của tôi */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Công thức của tôi</h2>

        {user.myRecipe?.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.myRecipe.map((r) => (
              <Link
                key={r.recipeId}
                href={`/recipes/${r.recipeId}`}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition block"
              >
                <Image
                  src={r.imageUrl || "/TruongHop.jpg"}
                  alt={r.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-48"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {r.description}
                  </p>
                  <div className="flex justify-between items-center mt-3 text-sm text-gray-400">
                    <span>👁 {r.viewCount}</span>
                    <span>❤️ {r.likeCount}</span>
                    <span>⏱ {r.cookTime ?? 0} phút</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Bạn chưa đăng công thức nào.</p>
        )}
      </div>

    </section>
  );
}
