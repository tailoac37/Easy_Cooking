import Image from "next/image";

interface RecipeCardProps {
  title: string;
  image: string;
}

export default function RecipeCard({ title, image }: RecipeCardProps) {
  return (
    <div className="flex flex-col gap-2 hover:scale-[1.02] transition-transform">
      {/* Hình món ăn */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Tên món */}
      <p className="text-[14px] font-medium text-gray-800 leading-snug">
        {title}
      </p>
    </div>
  );
}
