import Image from "next/image";

interface CollectionCardProps {
  title: string;
  image: string;
  recipes: number;
}

export const CollectionCard = ({ title, image, recipes }: CollectionCardProps) => {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
      {/* IMAGE */}
      <div className="relative w-full h-[340px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-5 flex items-center justify-between">
        <h3 className="text-[20px] font-semibold text-gray-900 leading-snug max-w-[70%]">
          {title}
        </h3>

        <button className="border border-gray-300 text-gray-800 text-[13px] px-4 py-[6px] rounded-md hover:bg-gray-50 transition">
          {recipes} Recipes
        </button>
      </div>
    </div>
  );
};
