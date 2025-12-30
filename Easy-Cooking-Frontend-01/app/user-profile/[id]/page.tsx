'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  FaUser,
  FaEnvelope,
  FaInfoCircle,
  FaRegHeart,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
} from 'react-icons/fa'
import { UserProfile } from '@/app/types/userProfile'
import { ReportRequest } from '@/app/types/report'


export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const hasToken = !!token
  const isMyProfile = user && user.userId === Number(id)

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return
      setLoading(true)
      try {
        const headers: HeadersInit = hasToken
          ? { Authorization: token!.startsWith('Bearer ') ? token! : `Bearer ${token}` }
          : {}

        const res = await fetch(`/api/proxy/user/${id}`, { headers })
        const data = await res.json()
        console.log('✅ User detail:', data)
        setProfile(data);
        setIsFollowing(data.following);
      } catch (err) {
        console.error('❌ Lỗi tải user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, hasToken, token])
  // FOLLOW
  const handleFollow = async () => {
    if (!token) {
      alert("Bạn cần đăng nhập để theo dõi.");
      return;
    }

    const res = await fetch(`/api/proxy/user/${id}/follow`, {
      method: "POST",
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setIsFollowing(true);
      setProfile(prev => prev ? { ...prev, following: true } : prev);
    }
  };
  //UNFOLLOW
  const handleUnfollow = async () => {
    if (!token) {
      alert("Bạn cần đăng nhập để hủy theo dõi.");
      return;
    }

    const res = await fetch(`/api/proxy/user/${id}/follow`, {
      method: "DELETE",
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setIsFollowing(false);
      setProfile(prev => prev ? { ...prev, following: false } : prev);
    }
  };

  // 🚨 REPORT USER
  const [showReportUser, setShowReportUser] = useState(false);
  const [reportReason, setReportReason] = useState("SPAM");
  const [reportDescription, setReportDescription] = useState("");

  // 🚨 REPORT USER
  const handleReportUser = async () => {
    if (!token) {
      alert("Bạn cần đăng nhập để báo cáo người dùng.");
      return;
    }

    const payload: ReportRequest = {
      reportedUserId: Number(id),
      reportType: "USER",
      reason: reportReason as any,
      description: reportDescription,
    };

    const res = await fetch("/api/proxy/user/report", {
      method: "POST",
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Đã gửi báo cáo người dùng thành công!");
      setShowReportUser(false);
      setReportDescription("");
    } else {
      alert("Không thể gửi báo cáo.");
    }
  };




  if (loading) return <p className="text-center py-20 text-gray-500">Đang tải...</p>
  if (!profile) return <p className="text-center py-20 text-gray-500">Không tìm thấy người dùng.</p>

  return (
    <section className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isMyProfile ? 'Hồ sơ của bạn' : 'Hồ sơ người dùng'}
        </h1>

        {isMyProfile ? (
          <Link
            href="/profile"
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition"
          >
            <FaEdit /> Chỉnh sửa
          </Link>
        ) : hasToken ? (
          <div className="flex gap-3">
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              className={`flex items-center gap-2 px-5 py-2 rounded-md border transition ${isFollowing
                ? "border-orange-500 text-orange-500"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
            >
              <FaRegHeart />
              {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
            </button>

            {/* 🚨 NÚT BÁO CÁO NGƯỜI DÙNG */}
            <button
              onClick={() => setShowReportUser(true)}
              className="px-5 py-2 rounded-md border border-red-400 text-red-600 hover:bg-red-50 transition"
            >
              Báo cáo
            </button>
          </div>

        ) : (
          <p className="text-gray-500 text-sm">🔒 Đăng nhập để kết bạn hoặc theo dõi</p>
        )}
      </div>

      {/* Avatar + Basic Info */}
      <div className="flex items-center gap-6 mb-10">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-200">
          <Image
            src={profile.avatarUrl || '/avatarTruongHop.jpg'}
            alt="User Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mt-3">
            {profile.fullName || 'Người dùng'}
          </h2>
          <p className="text-gray-600">@{profile.userName}</p>
          <p className="text-sm text-gray-400 mt-1">
            {profile.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
          </p>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-xs text-gray-600 mb-2">HỌ VÀ TÊN</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaUser className="text-gray-400 mr-2" />
            <p className="text-gray-900">{profile.fullName || '(Chưa đặt)'}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">TÊN NGƯỜI DÙNG</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaUser className="text-gray-400 mr-2" />
            <p className="text-gray-900">@{profile.userName}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">EMAIL</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaEnvelope className="text-gray-400 mr-2" />
            <p className="text-gray-900">
              {isMyProfile ? profile.email : 'Ẩn để bảo mật'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">TRẠNG THÁI</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            {profile.active ? (
              <FaCheckCircle className="text-green-500 mr-2" />
            ) : (
              <FaTimesCircle className="text-red-500 mr-2" />
            )}
            <p className="text-gray-900">
              {profile.active ? 'Đang hoạt động' : 'Bị khóa / Chưa kích hoạt'}
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-2">GIỚI THIỆU</label>
          <div className="flex items-start border-b border-gray-300 pb-1">
            <FaInfoCircle className="text-gray-400 mr-2 mt-1" />
            <p className="text-gray-900">{profile.bio || 'Chưa có giới thiệu.'}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">NGÀY TẠO TÀI KHOẢN</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <p className="text-gray-900">{profile.createdAt}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-2">CẬP NHẬT GẦN NHẤT</label>
          <div className="flex items-center border-b border-gray-300 pb-1">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <p className="text-gray-900">{profile.updateAt}</p>
          </div>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-10">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{profile.totalRecipes}</p>
          <p className="text-sm text-gray-600">Tổng công thức</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{profile.totalLike}</p>
          <p className="text-sm text-gray-600">Tổng lượt thích</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{profile.followerCount}</p>
          <p className="text-sm text-gray-600">Người theo dõi</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-2xl font-bold text-orange-500">{profile.totalView}</p>
          <p className="text-sm text-gray-600">Lượt xem công thức</p>
        </div>
      </div>

      {/* Công thức */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isMyProfile ? 'Công thức của bạn' : `Công thức của ${profile.fullName}`}
        </h2>
        {profile.myRecipe?.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.myRecipe.map((r) => (
              <Link
                href={`/recipes/${r.recipeId}`}
                key={r.recipeId}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                <Image
                  src={r.imageUrl || "/avatarTruongHop.jpg"}
                  alt={r.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-48"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{r.description}</p>
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
          <p className="text-gray-500">
            {isMyProfile
              ? 'Bạn chưa đăng công thức nào.'
              : `${profile.fullName || 'Người dùng này'} chưa đăng công thức nào.`}
          </p>
        )}
      </div>
      {showReportUser && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-96 p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Báo cáo người dùng</h2>

            <label className="text-sm">Lý do</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="SPAM">Spam / Quấy rối</option>
              <option value="INAPPROPRIATE">Nội dung không phù hợp</option>
              <option value="COPYRIGHT">Vi phạm bản quyền</option>
              <option value="OTHER">Khác</option>
            </select>

            <label className="text-sm">Mô tả</label>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="w-full border p-2 rounded h-24 mb-4"
              placeholder="Nhập mô tả chi tiết..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportUser(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleReportUser}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  )

}


