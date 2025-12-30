import Image from "next/image";

export default function Section2AboutIntro() {
  return (
    <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
      {/* Text bên trái */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Simple, Easy <br /> Recipes for all
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          Juicy meatballs brisket slammin&apos; baked shoulder. Juicy smoker soy
          sauce burgers brisket, polenta mustard hunk greens. Wine technique
          snack skewers chuck excess. Oil heat slowly, slices natural delicious,
          set aside magic tbsp skillet, bay leaves brown centerpiece.
        </p>
      </div>

      {/* Ảnh bên phải */}
      <div className="flex justify-center">
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-xl overflow-hidden">
          <Image
            src="/banner02.jpg"
            alt="Blueberry Bowl"
            fill
            className="object-cover rounded-xl shadow-md"
          />
        </div>
      </div>
    </section>
  );
}
