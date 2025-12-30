import Image from "next/image";
import { FaHeart, FaEye } from "react-icons/fa";

interface RecipeItemProps {
  name: string;
  image: string;
  likeCount: number;
  viewCount: number;
  userName: string;
}

export const RecipeItem = ({
  name,
  image,
  likeCount,
  viewCount,
  userName,
}: RecipeItemProps) => {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white border border-gray-100">
      
      {/* IMAGE */}
      <div className="relative w-full h-[240px]">
        <Image
          src={image || "/placeholder.png"}
          alt={name}
          fill
          className="object-cover"
          sizes="100%"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-[16px] font-bold text-gray-800 mb-1 line-clamp-2">
          {name}
        </h3>

        <p className="text-sm text-gray-500 mb-3">@{userName}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <FaHeart className="text-red-500" /> {likeCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <FaEye className="text-blue-500" /> {viewCount ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};
