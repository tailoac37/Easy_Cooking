import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Section4AboutLocation() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16 border-t border-gray-200">
      {/* Tiêu đề */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Operating from NYC, Dubai and London
      </h3>

      {/* Mô tả */}
      <p className="text-gray-700 leading-relaxed mb-8">
        Gastronomy atmosphere set aside. Slice butternut cooking home.
        Delicious romantic undisturbed raw platter will meld. Thick skewers
        skillet natural, smoker soy sauce wait roux. Slices rosette bone-in
        simmer precision alongside baby leeks. Crafting renders aromatic
        enjoyment.
      </p>

      <hr className="border-gray-200 mb-6" />

      {/* Mạng xã hội */}
      <div className="flex gap-6 text-gray-700 text-xl">
        <a
          href="#"
          className="hover:text-orange-500 transition"
          aria-label="Facebook"
        >
          <FaFacebookF />
        </a>
        <a
          href="#"
          className="hover:text-orange-500 transition"
          aria-label="Twitter"
        >
          <FaTwitter />
        </a>
        <a
          href="#"
          className="hover:text-orange-500 transition"
          aria-label="Instagram"
        >
          <FaInstagram />
        </a>
      </div>
    </section>
  );
}
