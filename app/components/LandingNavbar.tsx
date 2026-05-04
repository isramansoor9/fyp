"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Menu, User, X } from "lucide-react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";

type LandingNavbarProps = {
  /** Shown only where passed (e.g. dashboard): appears before Login/profile on the right. */
  rightPrefix?: ReactNode;
};

const linkClass =
  "text-sm text-gray-800 py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors";
const linkClassDesktop = "text-sm text-gray-800 hover:text-gray-600 transition-colors";

export function LandingNavbar({ rightPrefix }: LandingNavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoggedIn, isLoading } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const navLinks = (
    <>
      <Link href="/sparky" className={linkClassDesktop}>
        {urdu ? "اسپارکی" : "Sparky"}
      </Link>
      <Link href="/assessment" className={linkClassDesktop}>
        {urdu ? "خودکار اسیسمنٹ" : "Automated Assessment"}
      </Link>
      <Link href="/#explore-courses" className={linkClassDesktop}>
        {urdu ? "کورسز" : "Courses"}
      </Link>
      <Link href="/dashboard" className={`cursor-pointer ${linkClassDesktop}`}>
        {urdu ? "یوزر ڈیش بورڈ" : "User Dashboard"}
      </Link>
    </>
  );

  const mobileNavLinks = (
    <>
      <Link href="/sparky" className={linkClass} onClick={() => setMenuOpen(false)}>
        {urdu ? "اسپارکی" : "Sparky"}
      </Link>
      <Link href="/assessment" className={linkClass} onClick={() => setMenuOpen(false)}>
        {urdu ? "خودکار اسیسمنٹ" : "Automated Assessment"}
      </Link>
      <Link href="/#explore-courses" className={linkClass} onClick={() => setMenuOpen(false)}>
        {urdu ? "کورسز" : "Courses"}
      </Link>
      <Link href="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
        {urdu ? "یوزر ڈیش بورڈ" : "User Dashboard"}
      </Link>
    </>
  );

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <nav className="flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-8 py-4">
        <div className="flex items-center min-w-0 flex-1 gap-4 lg:gap-10">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0 min-w-0">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-black tracking-wide transition-colors duration-200 group-hover:text-gray-700 truncate">
              Teachus
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 shrink-0">{navLinks}</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {rightPrefix ? (
            <div className="hidden items-center gap-3 sm:gap-4 lg:flex">{rightPrefix}</div>
          ) : null}
          {!isLoading && isLoggedIn && user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-2.5 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 max-w-[10rem] sm:max-w-none"
            >
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate">{getDisplayName(user)}</span>
            </Link>
          ) : !isLoading ? (
            <Link
              href="/login"
              className="bg-black text-white px-3 sm:px-6 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 whitespace-nowrap shrink-0"
            >
              {urdu ? "لاگ اِن" : "Login"}
            </Link>
          ) : (
            <div className="h-10 w-20 sm:w-24 rounded bg-gray-100 animate-pulse shrink-0" aria-hidden="true" />
          )}

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-800 hover:bg-gray-100 border border-gray-200 shrink-0"
            aria-expanded={menuOpen}
            aria-controls="landing-nav-mobile-menu"
            aria-label={menuOpen ? (urdu ? "مینو بند کریں" : "Close menu") : urdu ? "مینو کھولیں" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="w-6 h-6" strokeWidth={2} /> : <Menu className="w-6 h-6" strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div
          id="landing-nav-mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-0.5 shadow-inner max-h-[min(70vh,calc(100dvh-5rem))] overflow-y-auto"
        >
          {rightPrefix ? (
            <div
              className="mb-2 flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3 sm:gap-4"
              onClick={() => setMenuOpen(false)}
            >
              {rightPrefix}
            </div>
          ) : null}
          {mobileNavLinks}
        </div>
      ) : null}
    </div>
  );
}
