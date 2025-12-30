import Image from "next/image";

export default function Section1AboutHeader() {
    return (
        <>
        <div className="mb-20">
            <div className="border-b border-gray-200">
                <h2 className="text-[30px] font-semibold text-gray-900 py-8">
                    About
                </h2>
            </div>
            <div>
                {/* Tiêu đề chính */}
                <h1 className="text-[30px] md:text-[30px] font-bold text-gray-900 mb-8 leading-tight py-8">
                    We’re a group of foodies who love <br className="hidden sm:block" />
                    cooking and the internet
                </h1>

                {/* Ảnh minh họa */}
                <div className="relative w-full max-w-5xl rounded-xl overflow-hidden pb-10">
                    <img
                        src="/banner01.jpg"
                        alt="photo"
                        className="w-full h-[400px] object-cover rounded-xl shadow-md"
                    />
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                    Food qualities braise chicken cuts bowl through slices butternut snack. Tender meat juicy dinners.
                    One-pot low heat plenty of time adobo fat raw soften fruit. sweet renders bone-in marrow
                    richness kitchen, fricassee basted pork shoulder. Delicious butternut squash hunk.
                </p>
            </div>
        </div>
        </>
    );
}
