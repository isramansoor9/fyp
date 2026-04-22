"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import { isUrdu, normalizeLanguage, type UILanguage } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";

type User = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  city?: string;
  region?: string;
  phone?: string;
  cnic?: string;
  course?: string | null;
  courseEnrolled?: string | null;
  level?: string;
  preferredLanguage?: UILanguage;
  personalizationScore?: number;
  lastSubTopicStudied?: string | null;
  currentTopic?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export default function DashboardPage() {
  const { user, setUser, isLoading: loading, logout } = useAuth();
  const userTyped = user as User | null;
  const [summary, setSummary] = useState<{ quizzesAttempted: number; studiedSubtopics: { title: string }[] } | null>(null);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!loading && !userTyped) {
    return (
      <div className="min-h-screen bg-white text-black">
        {/* Nav */}
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-white/95 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-lg font-bold text-black tracking-wide">Teachus</span>
          </Link>
          <Link
            href="/login"
            className="bg-black text-white px-6 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:scale-105"
          >
            Login
          </Link>
        </nav>

        <div className="flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">You're not logged in</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Please log in to access your personalized dashboard, track progress, and manage your courses.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800 hover:scale-105 hover:shadow-lg"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border-2 border-black text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-black hover:text-white hover:scale-105"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!userTyped) return null;
  const urdu = isUrdu(userTyped.preferredLanguage);
  const initials = (userTyped.firstName?.[0] || userTyped.lastName?.[0] || userTyped.name?.[0] || userTyped.email?.[0] || "?").toString().toUpperCase();
  const joinedDate = userTyped.createdAt ? new Date(userTyped.createdAt).toLocaleDateString(urdu ? "ur-PK" : "en-US", { year: "numeric", month: "long", day: "numeric" }) : (urdu ? "دستیاب نہیں" : "N/A");

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleLanguageSwitch = async (nextLanguage: UILanguage) => {
    if (normalizeLanguage(userTyped.preferredLanguage) === nextLanguage || updatingLanguage) return;
    setUpdatingLanguage(true);
    try {
      const res = await fetch("http://localhost:5000/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userTyped.userId,
          email: userTyped.email,
          preferredLanguage: nextLanguage,
        }),
      });
      if (!res.ok) throw new Error("Failed to update language");
      setUser({ ...userTyped, preferredLanguage: nextLanguage });
    } catch (error) {
      console.error(error);
      alert(urdu ? "زبان تبدیل نہیں ہو سکی۔ دوبارہ کوشش کریں۔" : "Could not switch language. Please try again.");
    } finally {
      setUpdatingLanguage(false);
    }
  };

  useEffect(() => {
    if (!userTyped?.userId && !userTyped?.email) return;
    fetch("http://localhost:5000/api/user/dashboard-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userTyped?.userId,
        email: userTyped?.email,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((d) => {
        if (!d) return;
        setSummary({
          quizzesAttempted: d.quizzesAttempted || 0,
          studiedSubtopics: d.studiedSubtopics || [],
        });
      })
      .catch(() => {});
  }, [userTyped?.userId, userTyped?.email]);

  const courseName = (userTyped.course || userTyped.courseEnrolled) as string | undefined;
  const courseContentBase =
    courseName === "Course 1" ? "/course1/content" :
    courseName === "Course 2" ? "/course2/content" :
    courseName === "Course 3" ? "/course3/content?semester=1" :
    "";

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-lg font-bold text-black tracking-wide">Teachus</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => handleLanguageSwitch("english")}
              disabled={updatingLanguage}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${!urdu ? "bg-black text-white" : "text-gray-700 hover:bg-white"}`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSwitch("urdu")}
              disabled={updatingLanguage}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${urdu ? "bg-black text-white" : "text-gray-700 hover:bg-white"}`}
            >
              اردو
            </button>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium max-w-[140px] truncate hidden sm:inline">
              {userTyped && getDisplayName(userTyped)}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-5 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:scale-105"
          >
            {urdu ? "لاگ آؤٹ" : "Logout"}
          </button>
        </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <div className="w-24 h-24 bg-black rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-transform duration-300 hover:scale-105">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{userTyped && getDisplayName(userTyped)}</h1>
            <p className="text-gray-500 mt-1">{userTyped.email}</p>
            <p className="text-sm text-gray-400 mt-1">{urdu ? `رکنیت کی تاریخ: ${joinedDate}` : `Member since ${joinedDate}`}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{(userTyped.course || userTyped.courseEnrolled) ? "1" : "0"}</p>
                <p className="text-sm text-gray-500">{urdu ? "داخلہ شدہ کورسز" : "Enrolled Courses"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.quizzesAttempted ?? 0}</p>
                <p className="text-sm text-gray-500">{urdu ? "مکمل کوئزز" : "Quizzes Completed"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-gray-500">{urdu ? "پیش رفت" : "Progress"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">{urdu ? "اسپارکی چیٹس" : "Sparky Chats"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Course Section */}
          <div className="lg:col-span-2">
            {(userTyped?.course || userTyped?.courseEnrolled) ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4">{urdu ? "آپ کا موجودہ کورس" : "Your Current Course"}</h2>
                <div className="p-6 rounded-xl border border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold">{userTyped.course || userTyped.courseEnrolled}</h3>
                  <p className="text-gray-500 text-sm mt-2">{urdu ? "اپنی سیکھنے کی پیش رفت جاری رکھیں" : "Continue your learning journey"}</p>
                  <Link
                    href={(userTyped.course || userTyped.courseEnrolled) === "Course 1" ? "/course1/learn" : (userTyped.course || userTyped.courseEnrolled) === "Course 2" ? "/course2/learn" : "/course3/learn"}
                    className="inline-block mt-4 bg-black text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:scale-105"
                  >
                    {urdu ? "سیکھنا جاری رکھیں" : "Continue Learning"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#c3bebb" }}>
                    <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{urdu ? "ابھی کوئی کورس نہیں" : "No Courses Yet"}</h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {urdu
                      ? "آپ نے ابھی تک کسی کورس میں داخلہ نہیں لیا۔ ہمارے ووکیشنل ٹریننگ پروگرامز دیکھیں اور آج ہی جاب ریڈی اسکلز بنانا شروع کریں!"
                      : "You haven't enrolled in any courses yet. Explore our vocational training programs and start building job-ready skills today!"}
                  </p>
                  <Link
                    href="/#courses"
                    className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800 hover:scale-105 hover:shadow-lg"
                  >
                    {urdu ? "کورسز دیکھیں" : "Explore Courses"}
                  </Link>
                </div>

                {/* Course Preview Cards */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">{urdu ? "آپ کے لیے تجویز کردہ" : "Recommended for You"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { name: "Course 1", duration: "3 Months", img: "/images/image2.png", href: "/course1" },
                      { name: "Course 2", duration: "6 Months", img: "/images/image3.png", href: "/course2" },
                      { name: "Course 3", duration: "12 Months", img: "/images/image4.png", href: "/course3" },
                    ].map((course) => {
                      const isCurrentCourse = (userTyped.course || userTyped.courseEnrolled) === course.name;
                      const actionLabel = isCurrentCourse
                        ? (urdu ? "سیکھنا جاری رکھیں" : "Continue Learning")
                        : (urdu ? `${course.name} پر جائیں` : `Go to ${course.name}`);
                      return (
                        <Link
                          key={course.name}
                          href={course.href}
                          className="group rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                          <div className="h-28 overflow-hidden">
                            <img
                              src={course.img}
                              alt={course.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="p-3 bg-white">
                            <h4 className="font-semibold text-sm">{course.name}</h4>
                            <p className="text-xs text-gray-500">{course.duration}</p>
                            <p className="text-xs font-medium text-black mt-1">{actionLabel}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">{urdu ? "پروفائل معلومات" : "Profile Information"}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "یوزر آئی ڈی" : "User ID"}</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{userTyped.userId ?? "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "علاقہ (شہر)" : "Region (City)"}</span>
                  <span className="text-sm font-medium">{userTyped.region || userTyped.city || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "فون" : "Phone"}</span>
                  <span className="text-sm font-medium">{userTyped.phone || "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">CNIC</span>
                  <span className="text-sm font-medium">{typeof userTyped.cnic === "string" ? userTyped.cnic.replace(/(\d{5})(\d{7})(\d{1})/, "$1-$2-$3") : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "لیول" : "Level"}</span>
                  <span className="text-sm font-medium capitalize">{userTyped.level || "easy"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "پرسنلائزیشن اسکور" : "Personalization Score"}</span>
                  <span className="text-sm font-medium">{userTyped.personalizationScore ?? 40}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{urdu ? "آخری پڑھے گئے سب ٹاپک" : "Last Subtopic Studied"}</span>
                  <span className="text-sm font-medium truncate max-w-[140px]" title={typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : ""}>{typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : "—"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 text-sm">{urdu ? "موجودہ ٹاپک" : "Current Topic"}</span>
                  <span className="text-sm font-medium truncate max-w-[140px]" title={typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : ""}>{typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : "—"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">{urdu ? "فوری ایکشنز" : "Quick Actions"}</h3>
              <div className="space-y-3">
                <Link
                  href="/#courses"
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-black transition-colors duration-300">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{urdu ? "کورسز دیکھیں" : "Browse Courses"}</p>
                    <p className="text-xs text-gray-400">{urdu ? "اپنی اگلی اسکل تلاش کریں" : "Find your next skill"}</p>
                  </div>
                </Link>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 group text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-black transition-colors duration-300">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{urdu ? "اسپارکی سے چیٹ کریں" : "Chat with Sparky"}</p>
                    <p className="text-xs text-gray-400">{urdu ? "اے آئی کی مدد" : "AI-powered assistance"}</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-gray-50 group text-left">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 group-hover:bg-black transition-colors duration-300">
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{urdu ? "اسیسمنٹ دیں" : "Take Assessment"}</p>
                    <p className="text-xs text-gray-400">{urdu ? "اپنا علم جانچیں" : "Test your knowledge"}</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">{urdu ? "پڑھے گئے سب ٹاپکس" : "Studied Subtopics"}</h3>
              <div className="space-y-2 max-h-72 overflow-auto">
                {(summary?.studiedSubtopics?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-500">{urdu ? "ابھی تک کوئی سب ٹاپک نہیں پڑھا گیا۔" : "No studied subtopics yet."}</p>
                )}
                {(summary?.studiedSubtopics || []).slice(0, 20).map((s) => (
                  <Link
                    key={s.title}
                    href={
                      courseName === "Course 3"
                        ? `/course3/content?semester=1&title=${encodeURIComponent(s.title)}`
                        : `${courseContentBase}?title=${encodeURIComponent(s.title)}`
                    }
                    className="block text-sm px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 truncate"
                    title={s.title}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

