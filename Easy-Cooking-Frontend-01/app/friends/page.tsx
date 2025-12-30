'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'

export default function FriendsPage() {
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // ⭐ Danh sách người theo dõi bạn
  const [followers, setFollowers] = useState<any[]>([])

  // ⭐ Danh sách bạn đang theo dõi
  const [following, setFollowing] = useState<any[]>([])

  // 🔍 API tìm kiếm user (debounce 400ms)
  useEffect(() => {
    if (search.trim().length === 0) {
      setSearchResults([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `/api/proxy/user/search?find=${encodeURIComponent(search)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        )

        if (!res.ok) throw new Error('Lỗi khi fetch API')

        const data = await res.json()
        console.log('✅ Search result:', data)

        setSearchResults(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('❌ Lỗi khi tìm kiếm:', err)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [search])

  // ⭐ Lấy danh sách người theo dõi bạn
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!user) return

      try {
        const res = await fetch(`/api/proxy/user/${user.userId}/followers`)
        const text = await res.text()

        console.log("📌 Followers raw:", text)

        let data = []
        try {
          data = JSON.parse(text)
        } catch {}

        if (Array.isArray(data)) {
          setFollowers(data)
        }
      } catch (err) {
        console.error('❌ Lỗi khi tải followers:', err)
      }
    }

    fetchFollowers()
  }, [user])

  // ⭐ Lấy danh sách bạn đang theo dõi
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user) return

      try {
        const res = await fetch(`/api/proxy/user/${user.userId}/following`)
        const text = await res.text()

        console.log("📌 Following raw:", text)

        let data = []
        try {
          data = JSON.parse(text)
        } catch {}

        if (Array.isArray(data)) {
          setFollowing(data)
        }
      } catch (err) {
        console.error('❌ Lỗi khi tải following:', err)
      }
    }

    fetchFollowing()
  }, [user])

  return (
    <section className="container mx-auto px-4 py-12">

      {/* ⭐ Ô tìm kiếm */}
      <div className="mb-12">
        <h1 className="text-3xl font-semibold mb-6">Tìm kiếm người dùng</h1>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nhập tên hoặc username..."
          className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-700"
        />

        {/* ⭐ Danh sách kết quả tìm kiếm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {loading ? (
            <p className="text-gray-400 col-span-full text-center">🔍 Đang tìm kiếm...</p>
          ) : searchResults.length > 0 ? (
            searchResults.map((u) => (
              <Link
                key={u.userId}
                href={`/user-profile/${u.userId}`}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <img
                  src={u.avatarUrl || '/avatarTruongHop.jpg'}
                  alt={u.fullName || u.userName}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {u.fullName || '(Chưa đặt tên)'}
                  </h2>
                  <p className="text-sm text-gray-500">@{u.userName}</p>
                  <p className="text-xs text-gray-400 mt-1">{u.email}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center mt-4">
              Không tìm thấy người dùng nào.
            </p>
          )}
        </div>
      </div>

      {/* ⭐ Người theo dõi bạn */}
      {user && (
        <div className="border-t border-gray-200 pt-10 mb-12">
          <h2 className="text-2xl font-semibold mb-6">Người đang theo dõi bạn</h2>

          {followers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {followers.map((f) => (
                <Link
                  href={`/user-profile/${f.userId}`}
                  key={f.userId}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={f.avatarUrl || '/avatarTruongHop.jpg'}
                    alt={f.fullName || f.userName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {f.fullName || f.userName}
                    </h3>
                    <p className="text-sm text-gray-500">@{f.userName}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Chưa có ai theo dõi bạn.</p>
          )}
        </div>
      )}

      {/* ⭐ Bạn đang theo dõi */}
      {user && (
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold mb-6">Bạn đang theo dõi</h2>

          {following.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {following.map((f) => (
                <Link
                  href={`/user-profile/${f.userId}`}
                  key={f.userId}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={f.avatarUrl || '/avatarTruongHop.jpg'}
                    alt={f.fullName || f.userName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {f.fullName || f.userName}
                    </h3>
                    <p className="text-sm text-gray-500">@{f.userName}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Bạn chưa theo dõi ai.</p>
          )}
        </div>
      )}
    </section>
  )
}
