"use client";

import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* --- Top Section --- */}
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Left Side: Logo + text */}
          <div className="md:w-1/2">
            <img
              src="/logoEasyCooking.png"
              alt="Tastebite Logo"
              className="w-[100px] mb-4"
            />
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment"
            </p>
          </div>

          {/* Right Side: 3 Columns */}
          <div className="flex flex-wrap gap-10 md:gap-[80px] text-sm text-gray-600">
            {/* Column 1 */}
            <div>
              <h4 className="font-semibold text-black mb-3">Easy Cooking</h4>
              <ul className="space-y-2">
                <li><Link href="/about-us" className="hover:text-black transition">About us</Link></li>
                <li><Link href="/careers" className="hover:text-black transition">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-black transition">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-black transition">Feedback</Link></li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-black mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-black transition">Terms</a></li>
                <li><a href="#" className="hover:text-black transition">Conditions</a></li>
                <li><a href="#" className="hover:text-black transition">Cookies</a></li>
                <li><a href="#" className="hover:text-black transition">Copyright</a></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-black mb-3">Follow</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-black transition">Facebook</a></li>
                <li><a href="#" className="hover:text-black transition">Twitter</a></li>
                <li><a href="#" className="hover:text-black transition">Instagram</a></li>
                <li><a href="#" className="hover:text-black transition">Youtube</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Divider --- */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* --- Bottom Section --- */}
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-4">
          <p>© 2025 Easy Cooking – All rights reserved</p>

          {/* Social icons */}
          <div className="flex items-center gap-6 text-[18px] text-gray-600">
            <a href="#" className="hover:text-black transition"><FaFacebookF /></a>
            <a href="#" className="hover:text-black transition"><FaTwitter /></a>
            <a href="#" className="hover:text-black transition"><FaInstagram /></a>
            <a href="#" className="hover:text-black transition"><FaYoutube /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
