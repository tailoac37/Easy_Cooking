"use client";

import { useEffect, useState, type ReactNode } from "react";

// ========= TYPES =========

interface OverviewStats {
  totalRecipes: number;
  approvedRecipes: number;
  pendingRecipes: number;
  rejectedRecipes: number;
  totalLikes: number;
  totalViews: number;
  totalFollowers: number;
  totalFollowing: number;
  engagementRate: number;
}

interface RecipesStats {
  totalRecipes: number;
  statusBreakdown: Record<string, number>;
  difficultyBreakdown: Record<string, number>;
  averageViews: number;
  averageLikes: number;
}

interface TimelinePoint {
  day: string;
  count: number;
}

interface TopRecipe {
  id?: number;
  title: string;
  thumbnail?: string;
  views: number;
}

interface EngagementStats {
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  likeRate: number;
  commentRate: number;
}

interface CategoryItem {
  name: string;
  count: number;
}

interface Follower {
  userId: number;
  username: string;
  fullName?: string | null;
  avatarUrl?: string | null;
}

interface SocialStats {
  followerCount: number;
  followingCount: number;
  recentFollowers: Follower[];
}

interface GrowthStats {
  periodDays: number;
  newRecipes: number;
  recipeGrowthRate: number;
}

// ========= MAIN PAGE =========

export default function StatisticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [recipesStats, setRecipesStats] = useState<RecipesStats | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [topRecipes, setTopRecipes] = useState<TopRecipe[]>([]);
  const [engagement, setEngagement] = useState<EngagementStats | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [social, setSocial] = useState<SocialStats | null>(null);
  const [growth, setGrowth] = useState<GrowthStats | null>(null);

  const [loading, setLoading] = useState(true);

  // -------- TOKEN FETCH WRAPPER ----------
  const fetchWithToken = async <T,>(url: string): Promise<T> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Thiếu token");

    const res = await fetch(url, {
      headers: {
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Lỗi API: ${res.status}`);

    return res.json() as Promise<T>;
  };

  // -------- FETCH ALL API ----------
  const fetchData = async () => {
    try {
      const overviewData = await fetchWithToken<OverviewStats>(
        "/api/proxy/user/statistics/overview"
      );
      const recipesData = await fetchWithToken<RecipesStats>(
        "/api/proxy/user/statistics/recipes"
      );
      const timelineData = await fetchWithToken<{
        dailyRecipeCount: Record<string, number>;
        periodDays: number;
      }>("/api/proxy/user/statistics/timeline");
      const topData = await fetchWithToken<{ recipes: TopRecipe[] }>(
        "/api/proxy/user/statistics/top-recipes"
      );
      const engagementData = await fetchWithToken<EngagementStats>(
        "/api/proxy/user/statistics/engagement"
      );
      const categoriesData = await fetchWithToken<{
        categoryBreakdown: Record<string, number>;
      }>("/api/proxy/user/statistics/categories");
      const socialData = await fetchWithToken<SocialStats>(
        "/api/proxy/user/statistics/social"
      );
      const growthData = await fetchWithToken<GrowthStats>(
        "/api/proxy/user/statistics/growth"
      );

      setOverview(overviewData);
      setRecipesStats(recipesData);

      const tlArr: TimelinePoint[] = Object.entries(
        timelineData.dailyRecipeCount || {}
      ).map(([day, count]) => ({ day, count }));
      setTimeline(tlArr);

      setTopRecipes(topData.recipes || []);
      setEngagement(engagementData);

      const catArr: CategoryItem[] = Object.entries(
        categoriesData.categoryBreakdown || {}
      ).map(([name, count]) => ({ name, count }));
      setCategories(catArr);

      setSocial(socialData);
      setGrowth(growthData);
    } catch (err) {
      console.error("Lỗi API thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="p-6">Đang tải thống kê...</p>;

  if (!overview || !recipesStats || !engagement || !social || !growth)
    return (
      <p className="p-6 text-red-500">
        Không thể tải đầy đủ dữ liệu thống kê. Vui lòng thử lại sau.
      </p>
    );

  return (
    <div className="container mx-auto p-6 space-y-10">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trung tâm thống kê</h1>
        <p className="text-gray-500 mt-1">
          Tổng quan hiệu suất hoạt động cá nhân trên EasyCooking.
        </p>
      </div>

      {/* ===== OVERVIEW CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        <InfoCard label="Tổng công thức" value={overview.totalRecipes} />
        <InfoCard label="Đã duyệt" value={overview.approvedRecipes} />
        <InfoCard label="Lượt xem" value={overview.totalViews} />
        <InfoCard label="Lượt thích" value={overview.totalLikes} />
        <InfoCard
          label="Tỷ lệ tương tác"
          value={`${overview.engagementRate.toFixed(1)}%`}
        />
      </div>

      {/* ===== TIMELINE — TABLE ===== */}
      <Box>
        <h3 className="text-lg font-semibold mb-4">Lượt công thức theo ngày</h3>

        {timeline.length === 0 ? (
          <EmptyText />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-1/2">Ngày</Th>
                <Th className="w-1/2">Số công thức</Th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((t, i) => (
                <tr key={i}>
                  <Td className="w-1/2">{t.day}</Td>
                  <Td className="w-1/2 font-semibold">{t.count}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Box>

      {/* ===== TWO COLUMNS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Top Recipes */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">Top công thức nổi bật</h3>

            {topRecipes.length === 0 ? (
              <EmptyText text="Chưa có công thức nổi bật" />
            ) : (
              <ul className="space-y-3">
                {topRecipes.map((r) => (
                  <li key={r.id} className="flex items-center gap-4">
                    <img
                      src={r.thumbnail || "/default-food.jpg"}
                      alt={r.title}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-sm text-gray-500">{r.views} lượt xem</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Box>

          {/* Recent Followers */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">Người theo dõi gần đây</h3>

            {social.recentFollowers.length === 0 ? (
              <EmptyText text="Chưa có follower" />
            ) : (
              <ul className="space-y-3">
                {social.recentFollowers.map((f) => (
                  <li className="flex items-center gap-3" key={f.userId}>
                    <img
                      src={f.avatarUrl || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{f.username}</p>
                      <p className="text-xs text-gray-500">{f.fullName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Box>

          {/* Categories */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">Thống kê danh mục</h3>

            {categories.length === 0 ? (
              <EmptyText />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th className="w-1/2">Danh mục</Th>
                    <Th className="w-1/2">Số lượng</Th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c, i) => (
                    <tr key={i}>
                      <Td className="w-1/2">{c.name}</Td>
                      <Td className="w-1/2 font-semibold">{c.count}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Box>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Status & Difficulty */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">
              Trạng thái & độ khó công thức
            </h3>

            <h4 className="font-medium mb-2">Trạng thái</h4>
            <KeyValueTable data={recipesStats.statusBreakdown} />

            <h4 className="font-medium mt-5 mb-2">Độ khó</h4>
            <KeyValueTable data={recipesStats.difficultyBreakdown} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <MiniCard label="Lượt xem TB" value={recipesStats.averageViews} />
              <MiniCard label="Lượt thích TB" value={recipesStats.averageLikes} />
            </div>
          </Box>

          {/* Engagement */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">Tương tác nội dung</h3>

            <KeyValueTable
              data={{
                "Tổng lượt thích": engagement.totalLikes,
                "Tổng lượt xem": engagement.totalViews,
                "Tổng bình luận": engagement.totalComments,
                "Tỷ lệ thích (%)": engagement.likeRate.toFixed(2),
              }}
            />
          </Box>

          {/* Growth */}
          <Box>
            <h3 className="text-lg font-semibold mb-4">Tăng trưởng công thức</h3>

            <KeyValueTable
              data={{
                "Công thức mới": growth.newRecipes,
                "Tỷ lệ tăng trưởng (%)": growth.recipeGrowthRate.toFixed(2),
                "Khoảng thời gian (ngày)": growth.periodDays,
              }}
            />
          </Box>
        </div>
      </div>
    </div>
  );
}

// ========= SHARED COMPONENTS =========

const Box = ({ children }: { children: ReactNode }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    {children}
  </div>
);

const InfoCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <p className="text-xs text-gray-500 uppercase">{label}</p>
    <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
  </div>
);

const MiniCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-gray-50 p-4 rounded-xl">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-base font-bold text-gray-800 mt-1">{value}</p>
  </div>
);

const EmptyText = ({ text = "Chưa có dữ liệu" }: { text?: string }) => (
  <p className="text-gray-400 text-sm text-center py-4">{text}</p>
);

// ==== TABLE BASE COMPONENTS (CHUẨN KHÔNG LỆCH) ====

const Table = ({ children }: { children: ReactNode }) => (
  <table className="w-full border-collapse text-sm border border-gray-300">
    {children}
  </table>
);

const Th = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <th
    className={`p-3 border border-gray-300 bg-gray-100 font-semibold text-gray-700 text-left ${className}`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <td
    className={`p-3 border border-gray-300 text-gray-700 text-left ${className}`}
  >
    {children}
  </td>
);

// ==== KEY VALUE TABLE FIX LỆCH ====

const KeyValueTable = ({ data }: { data: Record<string, number | string> }) => (
  <table className="w-full border-collapse text-sm border border-gray-300">
    <tbody>
      {Object.entries(data).map(([k, v], i) => (
        <tr key={i}>
          <td className="p-3 border border-gray-300 bg-gray-100 font-medium w-1/2">
            {k}
          </td>
          <td className="p-3 border border-gray-300 font-semibold text-gray-900 w-1/2">
            {v}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);
