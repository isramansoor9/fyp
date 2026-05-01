"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type SiteNavbarProps = {
  urdu: boolean;
  right: ReactNode;
};

export function SiteNavbar({ urdu, right }: SiteNavbarProps) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-lg font-bold text-black tracking-wide transition-colors duration-200 group-hover:text-gray-700">
            Teachus
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
            {urdu ? "اسپارکی" : "Sparky"}
          </span>
          <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
            {urdu ? "خودکار اسیسمنٹ" : "Automated Assessment"}
          </span>
          <span className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
            {urdu ? "کورسز" : "Courses"}
          </span>
          <Link
            href="/dashboard"
            className="text-sm cursor-pointer hover:text-gray-700 transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
          >
            {urdu ? "یوزر ڈیش بورڈ" : "User Dashboard"}
          </Link>
        </div>
      </div>

      {right}
    </nav>
  );
}
