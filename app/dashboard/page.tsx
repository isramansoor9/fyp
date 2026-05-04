"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, getDisplayName } from "@/contexts/AuthContext";
import { isUrdu, normalizeLanguage, type UILanguage } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { backendUrl } from "@/lib/backendUrl";

/** Matches Sparky / assessment brown theme */
const HEADER_BROWN = "#968e8a";

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
    fetch(backendUrl("/api/user/dashboard-summary"), {
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
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5]">
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!loading && !userTyped) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-900">
        <LandingNavbar />
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#c3bebb]/50 bg-white shadow-sm"
            style={{ color: HEADER_BROWN }}
          >
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">You&apos;re not logged in</h1>
          <p className="mb-8 max-w-md text-gray-600">
            Please log in to access your personalized dashboard, track progress, and manage your courses.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="rounded-xl px-8 py-3 font-semibold text-white transition hover:opacity-95"
              style={{ backgroundColor: HEADER_BROWN }}
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl border-2 px-8 py-3 font-semibold transition hover:bg-[#f4f3f2]"
              style={{ borderColor: HEADER_BROWN, color: HEADER_BROWN }}
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
      const res = await fetch(backendUrl("/api/user/language"), {
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
    <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-900 ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <LandingNavbar
        rightPrefix={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-[#c3bebb]/40 bg-white/80 p-1">
              <button
                type="button"
                onClick={() => handleLanguageSwitch("english")}
                disabled={updatingLanguage}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${!urdu ? "text-white" : "text-gray-700 hover:bg-[#f4f3f2]"}`}
                style={!urdu ? { backgroundColor: HEADER_BROWN } : undefined}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSwitch("urdu")}
                disabled={updatingLanguage}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${urdu ? "text-white" : "text-gray-700 hover:bg-[#f4f3f2]"}`}
                style={urdu ? { backgroundColor: HEADER_BROWN } : undefined}
              >
                اردو
              </button>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white transition hover:opacity-95"
              style={{ backgroundColor: HEADER_BROWN }}
            >
              {urdu ? "لاگ آؤٹ" : "Logout"}
            </button>
          </>
        }
      />
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:mb-12 lg:grid-cols-4 lg:gap-5">
          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
                style={{ backgroundColor: HEADER_BROWN }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{(userTyped.course || userTyped.courseEnrolled) ? "1" : "0"}</p>
                <p className="text-xs text-gray-600 sm:text-sm">{urdu ? "داخلہ شدہ کورسز" : "Enrolled Courses"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
                style={{ backgroundColor: HEADER_BROWN }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{summary?.quizzesAttempted ?? 0}</p>
                <p className="text-xs text-gray-600 sm:text-sm">{urdu ? "مکمل کوئزز" : "Quizzes Completed"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
                style={{ backgroundColor: HEADER_BROWN }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">{Math.round((summary?.averageQuizScore ?? 0) * 10)}%</p>
                <p className="text-xs text-gray-600 sm:text-sm">{urdu ? "پیش رفت" : "Progress"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
                style={{ backgroundColor: HEADER_BROWN }}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums sm:text-2xl">0</p>
                <p className="text-xs text-gray-600 sm:text-sm">{urdu ? "اسپارکی چیٹس" : "Sparky Chats"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main: course + profile (left); quick links + subtopics (right) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-8 lg:col-span-8">
            {(userTyped?.course || userTyped?.courseEnrolled) ? (
              <div className="overflow-hidden rounded-2xl border border-[#c3bebb]/45 bg-white shadow-sm">
                <div className="border-b border-[#c3bebb]/35 px-5 py-4 text-white sm:px-6 sm:py-5" style={{ backgroundColor: HEADER_BROWN }}>
                  <h2 className="text-lg font-bold sm:text-xl">{urdu ? "آپ کا موجودہ کورس" : "Your Current Course"}</h2>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 rounded-xl border border-[#c3bebb]/40 bg-[#f4f3f2]/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-6">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-semibold tracking-tight text-gray-900">{userTyped.course || userTyped.courseEnrolled}</h3>
                      <p className="mt-2 text-sm text-gray-600">{urdu ? "اپنی سیکھنے کی پیش رفت جاری رکھیں" : "Continue your learning journey"}</p>
                    </div>
                    <Link
                      href={(userTyped.course || userTyped.courseEnrolled) === "Course 1" ? "/course1/learn" : (userTyped.course || userTyped.courseEnrolled) === "Course 2" ? "/course2/learn" : "/course3/learn"}
                      className="inline-flex shrink-0 items-center justify-center rounded-xl px-7 py-3 text-sm font-semibold text-white transition hover:opacity-95 sm:mt-0"
                      style={{ backgroundColor: HEADER_BROWN }}
                    >
                      {urdu ? "سیکھنا جاری رکھیں" : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#c3bebb]/45 bg-white shadow-sm">
                <div className="border-b border-[#c3bebb]/35 px-5 py-4 text-white sm:px-6 sm:py-5" style={{ backgroundColor: HEADER_BROWN }}>
                  <h2 className="text-lg font-bold sm:text-xl">{urdu ? "آپ کا موجودہ کورس" : "Your Current Course"}</h2>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="py-4 text-center sm:py-8">
                    <div
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#c3bebb]/40 bg-[#f4f3f2]"
                      style={{ color: HEADER_BROWN }}
                    >
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">{urdu ? "ابھی کوئی کورس نہیں" : "No Courses Yet"}</h3>
                    <p className="mx-auto mb-8 max-w-md text-gray-600">
                      {urdu
                        ? "آپ نے ابھی تک کسی کورس میں داخلہ نہیں لیا۔ ہمارے ووکیشنل ٹریننگ پروگرامز دیکھیں اور آج ہی جاب ریڈی اسکلز بنانا شروع کریں!"
                        : "You haven't enrolled in any courses yet. Explore our vocational training programs and start building job-ready skills today!"}
                    </p>
                    <Link
                      href="/#explore-courses"
                      className="inline-block rounded-xl px-8 py-3 font-semibold text-white transition hover:opacity-95"
                      style={{ backgroundColor: HEADER_BROWN }}
                    >
                      {urdu ? "کورسز دیکھیں" : "Explore Courses"}
                    </Link>
                  </div>

                  <div className="mt-6 border-t border-[#c3bebb]/35 pt-8 sm:mt-8">
                    <h3 className="mb-5 text-lg font-semibold" style={{ color: HEADER_BROWN }}>
                      {urdu ? "آپ کے لیے تجویز کردہ" : "Recommended for You"}
                    </h3>
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
                            className="group overflow-hidden rounded-xl border border-[#c3bebb]/40 transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="h-32 overflow-hidden sm:h-36">
                              <img
                                src={course.img}
                                alt={course.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                            <div className="bg-white p-4">
                              <h4 className="text-sm font-semibold text-gray-900">{course.name}</h4>
                              <p className="text-xs text-gray-500">{course.duration}</p>
                              <p className="mt-1 text-xs font-medium" style={{ color: HEADER_BROWN }}>
                                {actionLabel}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile: welcome strip + details (below current course) */}
            <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold" style={{ color: HEADER_BROWN }}>
                {urdu ? "پروفائل معلومات" : "Profile Information"}
              </h3>
              <div className="mb-6 flex flex-col gap-5 border-b border-[#c3bebb]/35 pb-6 sm:flex-row sm:items-center sm:gap-6">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm sm:h-24 sm:w-24 sm:text-3xl"
                  style={{ backgroundColor: HEADER_BROWN }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">{urdu ? "خوش آمدید" : "Welcome back"}</p>
                  <p className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{userTyped && getDisplayName(userTyped)}</p>
                  <p className="mt-1 truncate text-sm text-gray-600">{userTyped.email}</p>
                  <p className="mt-2 text-sm text-gray-500">{urdu ? `رکنیت کی تاریخ: ${joinedDate}` : `Member since ${joinedDate}`}</p>
                </div>
              </div>
              <dl className="space-y-0 divide-y divide-[#ebe8e6]">
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "یوزر آئی ڈی" : "User ID"}</dt>
                  <dd className="min-w-0 text-right font-mono text-sm font-medium text-gray-900">
                    <span className="inline-block max-w-full break-all rounded border border-[#c3bebb]/40 bg-[#faf8f7] px-2 py-1">{userTyped.userId ?? "—"}</span>
                  </dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "علاقہ (شہر)" : "Region (City)"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium text-gray-900">{userTyped.region || userTyped.city || "—"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "فون" : "Phone"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium text-gray-900">{userTyped.phone || "—"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">CNIC</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium text-gray-900">
                    {typeof userTyped.cnic === "string" ? userTyped.cnic.replace(/(\d{5})(\d{7})(\d{1})/, "$1-$2-$3") : "—"}
                  </dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "لیول" : "Level"}</dt>
                  <dd className="text-sm font-medium capitalize text-gray-900">{summary?.level || userTyped.level || "easy"}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "پرسنلائزیشن اسکور" : "Personalization Score"}</dt>
                  <dd className="text-sm font-medium tabular-nums text-gray-900">{summary?.personalizationScore ?? userTyped.personalizationScore ?? 40}</dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "آخری پڑھے گئے سب ٹاپک" : "Last Subtopic Studied"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium text-gray-900" title={typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : ""}>
                    <span className="break-words">{typeof userTyped.lastSubTopicStudied === "string" ? userTyped.lastSubTopicStudied : "—"}</span>
                  </dd>
                </div>
                <div className="flex gap-3 py-3 sm:items-start sm:justify-between">
                  <dt className="shrink-0 text-sm text-gray-600">{urdu ? "موجودہ ٹاپک" : "Current Topic"}</dt>
                  <dd className="min-w-0 max-w-[58%] text-right text-sm font-medium text-gray-900" title={typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : ""}>
                    <span className="break-words">{typeof userTyped.currentTopic === "string" ? userTyped.currentTopic : "—"}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
            <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold" style={{ color: HEADER_BROWN }}>
                {urdu ? "فوری ایکشنز" : "Quick Actions"}
              </h3>
              <div className="space-y-2">
                <Link
                  href="/#explore-courses"
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#c3bebb]/50 hover:bg-[#f4f3f2]/80"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition group-hover:opacity-90"
                    style={{ backgroundColor: HEADER_BROWN }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{urdu ? "کورسز دیکھیں" : "Browse Courses"}</p>
                    <p className="text-xs text-gray-500">{urdu ? "اپنی اگلی اسکل تلاش کریں" : "Find your next skill"}</p>
                  </div>
                </Link>

                <Link
                  href="/sparky"
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-[#c3bebb]/50 hover:bg-[#f4f3f2]/80"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition group-hover:opacity-90"
                    style={{ backgroundColor: HEADER_BROWN }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{urdu ? "اسپارکی سے چیٹ کریں" : "Chat with Sparky"}</p>
                    <p className="text-xs text-gray-500">{urdu ? "اے آئی کی مدد" : "AI-powered assistance"}</p>
                  </div>
                </Link>

                <Link
                  href="/assessment"
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-[#c3bebb]/50 hover:bg-[#f4f3f2]/80"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white transition group-hover:opacity-90"
                    style={{ backgroundColor: HEADER_BROWN }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{urdu ? "اسیسمنٹ دیں" : "Take Assessment"}</p>
                    <p className="text-xs text-gray-500">{urdu ? "اپنا علم جانچیں" : "Test your knowledge"}</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-4 text-lg font-bold" style={{ color: HEADER_BROWN }}>
                {urdu ? "پڑھے گئے سب ٹاپکس" : "Studied Subtopics"}
              </h3>
              <div className="max-h-[min(22rem,55vh)] space-y-2 overflow-y-auto pr-1">
                {(summary?.studiedSubtopics?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-600">{urdu ? "ابھی تک کوئی سب ٹاپک نہیں پڑھا گیا۔" : "No studied subtopics yet."}</p>
                )}
                {(summary?.studiedSubtopics || []).slice(0, 20).map((s) => (
                  <Link
                    key={s.title}
                    href={
                      courseName === "Course 3"
                        ? `/course3/content?semester=1&title=${encodeURIComponent(s.title)}`
                        : `${courseContentBase}?title=${encodeURIComponent(s.title)}`
                    }
                    className="block truncate rounded-lg border border-[#c3bebb]/35 bg-[#faf8f7] px-3 py-2.5 text-sm text-gray-900 transition-colors hover:border-[#968e8a]/50 hover:bg-[#f4f3f2]"
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

