"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { User } from "lucide-react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";

type LandingNavbarProps = {
  /** Shown only where passed (e.g. dashboard): appears before Login/profile on the right. */
  rightPrefix?: ReactNode;
};

export function LandingNavbar({ rightPrefix }: LandingNavbarProps) {
  const { user, isLoggedIn, isLoading } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);

  return (
    <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-[#c3bebb] z-50 shadow-sm border-b border-black/10">
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
          <Link href="/sparky" className="text-sm text-gray-800">
            {urdu ? "اسپارکی" : "Sparky"}
          </Link>
          <Link href="/assessment" className="text-sm text-gray-800">
            {urdu ? "خودکار اسیسمنٹ" : "Automated Assessment"}
          </Link>
          <Link href="/#explore-courses" className="text-sm text-gray-800">
            {urdu ? "کورسز" : "Courses"}
          </Link>
          <Link
            href="/dashboard"
            className="cursor-pointer text-sm text-gray-800"
          >
            {urdu ? "یوزر ڈیش بورڈ" : "User Dashboard"}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {rightPrefix}
        {!isLoading && isLoggedIn && user ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
          >
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </span>
            <span className="max-w-[120px] truncate">{getDisplayName(user)}</span>
          </Link>
        ) : !isLoading ? (
          <Link
            href="/login"
            className="bg-black text-white px-6 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 transform hover:scale-105 hover:shadow-lg"
          >
            {urdu ? "لاگ اِن" : "Login"}
          </Link>
        ) : (
          <div className="h-10 w-24 rounded bg-gray-100 animate-pulse" aria-hidden="true" />
        )}
      </div>
    </nav>
  );
}
