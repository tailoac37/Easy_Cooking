"use client";

export default function ActivityRow({ action }: { action: any }) {
  return (
    <div className="px-4 py-3 border-t grid grid-cols-[1fr,2fr,1fr] text-sm items-center">

      {/* Admin info */}
      <div>
        <p className="font-medium">{action.adminUserName}</p>
        <p className="text-xs text-gray-500">{action.adminEmail}</p>
      </div>

      {/* Action + Note */}
      <div className="text-gray-700 text-[13px] leading-5">
        {action.adminNote || "(Không có ghi chú)"}

        {action.recipeTitle && (
          <div className="text-xs text-gray-500 mt-1">
            Công thức: <b>{action.recipeTitle}</b>
          </div>
        )}

        {action.categoryName && (
          <div className="text-xs text-gray-500 mt-1">
            Danh mục: <b>{action.categoryName}</b>
          </div>
        )}

        {action.targetUserName && (
          <div className="text-xs text-gray-500 mt-1">
            Tác động lên user: <b>{action.targetUserName}</b>
          </div>
        )}
      </div>

      {/* Time */}
      <div className="text-right text-xs text-gray-500">
        {new Date(action.createdAt).toLocaleString("vi-VN")}
      </div>
    </div>
  );
}
