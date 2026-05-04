"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { isUrdu, normalizeLanguage, type UILanguage } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { LandingNavbar } from "@/app/components/LandingNavbar";

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
  const router = useRouter();
  const { user, setUser, isLoading: loading, logout } = useAuth();
  const userTyped = user as User | null;
  const [summary, setSummary] = useState<{
    quizzesAttempted: number;
    studiedSubtopics: { title: string }[];
    averageQuizScore: number;
    personalizationScore: number;
    level: string;
  } | null>(null);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);

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
          averageQuizScore: typeof d.averageQuizScore === "number" ? d.averageQuizScore : 0,
          personalizationScore:
            typeof d.personalizationScore === "number"
              ? d.personalizationScore
              : (userTyped?.personalizationScore ?? 40),
          level: typeof d.level === "string" ? d.level : (userTyped?.level || "easy"),
        });
      })
      .catch(() => {});
  }, [userTyped?.userId, userTyped?.email]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!loading && !userTyped) {
    return (
      <div className="min-h-screen bg-white text-black">
        <LandingNavbar />
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
    router.replace("/");
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

  const courseName = (userTyped.course || userTyped.courseEnrolled) as string | undefined;
  const courseContentBase =
    courseName === "Course 1" ? "/course1/content" :
    courseName === "Course 2" ? "/course2/content" :
    courseName === "Course 3" ? "/course3/content?semester=1" :
    "";

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <LandingNavbar
        rightPrefix={
          <>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleLanguageSwitch("english")}
                disabled={updatingLanguage}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${!urdu ? "bg-black text-white" : "text-gray-700 hover:bg-white"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSwitch("urdu")}
                disabled={updatingLanguage}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${urdu ? "bg-black text-white" : "text-gray-700 hover:bg-white"}`}
              >
                اردو
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-black text-white px-5 py-2 rounded text-sm font-medium transition-all duration-300 hover:bg-gray-800 hover:scale-105"
            >
              {urdu ? "لاگ آؤٹ" : "Logout"}
            </button>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
        {/* Welcome */}
        <section className="mb-8 flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:mb-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white shadow-md transition-transform duration-300 hover:scale-[1.02] sm:h-24 sm:w-24 sm:text-3xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6f6461]">
                {urdu ? "خوش آمدید" : "Welcome back"}
              </p>
              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {userTyped && getDisplayName(userTyped)}
              </h1>
              <p className="mt-1 truncate text-sm text-gray-500">{userTyped.email}</p>
              <p className="mt-2 text-sm text-gray-400">
                {urdu ? `رکنیت کی تاریخ: ${joinedDate}` : `Member since ${joinedDate}`}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:mb-12 lg:grid-cols-4 lg:gap-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{(userTyped.course || userTyped.courseEnrolled) ? "1" : "0"}</p>
                <p className="text-xs text-gray-500 sm:text-sm">{urdu ? "داخلہ شدہ کورسز" : "Enrolled Courses"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{summary?.quizzesAttempted ?? 0}</p>
                <p className="text-xs text-gray-500 sm:text-sm">{urdu ? "مکمل کوئزز" : "Quizzes Completed"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{Math.round((summary?.averageQuizScore ?? 0) * 10)}%</p>
                <p className="text-xs text-gray-500 sm:text-sm">{urdu ? "پیش رفت" : "Progress"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12" style={{ backgroundColor: "#c3bebb" }}>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">0</p>
                <p className="text-xs text-gray-500 sm:text-sm">{urdu ? "اسپارکی چیٹس" : "Sparky Chats"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main: course + sidebar */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-8 lg:col-span-8">
            {(userTyped?.course || userTyped?.courseEnrolled) ? (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-5 text-lg font-bold text-[#6f6461] sm:text-xl">{urdu ? "آپ کا موجودہ کورس" : "Your Current Course"}</h2>
                <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-gray-50/80 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold tracking-tight">{userTyped.course || userTyped.courseEnrolled}</h3>
                    <p className="mt-2 text-sm text-gray-600">{urdu ? "اپنی سیکھنے کی پیش رفت جاری رکھیں" : "Continue your learning journey"}</p>
                  </div>
                  <Link
                    href={(userTyped.course || userTyped.courseEnrolled) === "Course 1" ? "/course1/learn" : (userTyped.course || userTyped.courseEnrolled) === "Course 2" ? "/course2/learn" : "/course3/learn"}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-md sm:mt-0"
                  >
                    {urdu ? "سیکھنا جاری رکھیں" : "Continue Learning"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="py-6 text-center sm:py-10">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "#c3bebb" }}>
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
                    href="/#explore-courses"
                    className="inline-block rounded-xl bg-black px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-lg"
                  >
                    {urdu ? "کورسز دیکھیں" : "Explore Courses"}
                  </Link>
                </div>

                {/* Course Preview Cards */}
                <div className="mt-6 border-t border-gray-100 pt-8 sm:mt-8">
                  <h3 className="mb-5 text-lg font-semibold text-[#6f6461]">{urdu ? "آپ کے لیے تجویز کردہ" : "Recommended for You"}</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-5">
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
                          className="group overflow-hidden rounded-xl border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="h-32 overflow-hidden sm:h-36">
                            <img
                              src={course.img}
                              alt={course.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                          <div className="bg-white p-4">
                            <h4 className="text-sm font-semibold">{course.name}</h4>
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

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-[#6f6461]">{urdu ? "پروفائل معلومات" : "Profile Information"}</h3>
              <dl className="space-y-0 divide-y divide-gray-100">
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "یوزر آئی ڈی" : "User ID"}</dt>
                  <dd className="min-w-0 text-right font-mono text-sm font-medium">
                    <span className="inline-block max-w-full rounded bg-gray-100 px-2 py-1 break-all">{userTyped.userId ?? "—"}</span>
                  </dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "علاقہ (شہر)" : "Region (City)"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium">{userTyped.region || userTyped.city || "—"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "فون" : "Phone"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium">{userTyped.phone || "—"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">CNIC</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium">{typeof userTyped.cnic === "string" ? userTyped.cnic.replace(/(\d{5})(\d{7})(\d{1})/, "$1-$2-$3") : "—"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "لیول" : "Level"}</dt>
                  <dd className="text-sm font-medium capitalize">{summary?.level || userTyped.level || "easy"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "پرسنلائزیشن اسکور" : "Personalization Score"}</dt>
                  <dd className="text-sm font-medium tabular-nums">{summary?.personalizationScore ?? userTyped.personalizationScore ?? 40}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "آخری پڑھے گئے سب ٹاپک" : "Last Subtopic Studied"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium" title={typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : ""}>
                    <span className="break-words">{typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : "—"}</span>
                  </dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-500">{urdu ? "موجودہ ٹاپک" : "Current Topic"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium" title={typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : ""}>
                    <span className="break-words">{typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : "—"}</span>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-[#6f6461]">{urdu ? "فوری ایکشنز" : "Quick Actions"}</h3>
              <div className="space-y-2">
                <Link
                  href="/#explore-courses"
                  className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-gray-50"
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

                <Link
                  href="/sparky"
                  className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-300 group-hover:bg-black">
                    <svg className="h-5 w-5 text-gray-600 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{urdu ? "اسپارکی سے چیٹ کریں" : "Chat with Sparky"}</p>
                    <p className="text-xs text-gray-400">{urdu ? "اے آئی کی مدد" : "AI-powered assistance"}</p>
                  </div>
                </Link>

                <Link
                  href="/assessment"
                  className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-300 group-hover:bg-black">
                    <svg className="h-5 w-5 text-gray-600 transition-colors duration-300 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{urdu ? "اسیسمنٹ دیں" : "Take Assessment"}</p>
                    <p className="text-xs text-gray-400">{urdu ? "اپنا علم جانچیں" : "Test your knowledge"}</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-[#6f6461]">{urdu ? "پڑھے گئے سب ٹاپکس" : "Studied Subtopics"}</h3>
              <div className="max-h-[min(22rem,55vh)] space-y-2 overflow-y-auto pr-1">
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
                    className="block truncate rounded-lg border border-gray-100 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
                    title={s.title}
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

