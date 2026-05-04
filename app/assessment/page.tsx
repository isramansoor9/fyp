"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
const API = "http://localhost:5000";

/** Matches curriculum / Sparky brown header */
const HEADER_BROWN = "#968e8a";

type AQ = {
  question: string;
  modelAnswer: string;
  difficulty: string;
  knowledgeDimension: string;
  sourceUrl: string;
};

export default function AssessmentPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);
  const uid = (user as { userId?: string } | null)?.userId ?? "";
  const email = user?.email ?? "";
  const enrolled =
    ((user as { course?: string; courseEnrolled?: string } | null)?.course ??
      (user as { courseEnrolled?: string } | null)?.courseEnrolled ??
      "") || "";

  const [questions, setQuestions] = useState<AQ[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [reviewOpen, setReviewOpen] = useState<boolean[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState<{ marks: number; suggestion: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login?returnTo=/assessment");
    }
  }, [isLoading, isLoggedIn, router]);

  const fetchQuestions = useCallback(async () => {
    if (!uid && !email) return;
    setLoadingQuestions(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${API}/api/assessment/random-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid || undefined,
          email: email || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Could not load questions.");
      const q = Array.isArray((data as { questions?: AQ[] }).questions) ? (data as { questions: AQ[] }).questions : [];
      setQuestions(q);
      setAnswers(q.map(() => ""));
      setReviewOpen(q.map(() => false));
    } catch (e) {
      setQuestions([]);
      setError(e instanceof Error ? e.message : "Failed to load assessment.");
    } finally {
      setLoadingQuestions(false);
    }
  }, [uid, email]);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    if (
      enrolled === "Course 1" ||
      enrolled === "Course 2" ||
      enrolled === "Course 3"
    ) {
      void fetchQuestions();
    }
  }, [isLoggedIn, user, enrolled, fetchQuestions]);

  const submitJudge = async () => {
    if (!questions.length || grading) return;
    setGrading(true);
    setError(null);
    try {
      const items = questions.map((q, i) => ({
        question: q.question,
        modelAnswer: q.modelAnswer,
        userAnswer: answers[i] ?? "",
        difficulty: q.difficulty,
        knowledgeDimension: q.knowledgeDimension,
      }));
      const res = await fetch(`${API}/api/quiz/judge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Grading failed.");
      const rr = Array.isArray((data as { results?: unknown }).results)
        ? ((data as { results: { marks: number; suggestion: string }[] }).results)
        : [];
      setResults(rr);
    } catch (e) {
      setResults(null);
      setError(e instanceof Error ? e.message : "Submission failed.");
    } finally {
      setGrading(false);
    }
  };

  const totalMarks = results ? results.reduce((s, r) => s + Number(r.marks || 0), 0) : null;
  const maxMarks = questions.length * 10;

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex flex-col bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-800 ${urdu ? urduFont.className : ""}`}
      >
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: HEADER_BROWN }} />
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  if (!["Course 1", "Course 2", "Course 3"].includes(enrolled)) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-900 ${urdu ? `${urduFont.className} urdu-text` : ""}`}
      >
        <LandingNavbar />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl mb-4">{urdu ? "سب سے پہلے اندراج کریں" : "Enrollment required"}</h1>
            <p className="text-base leading-relaxed text-gray-700 mb-8 md:text-lg">
              {urdu
                ? "آٹومیٹڈ اسیسمنٹ آپ کے موجودہ کورس سے سوالات کھینچتی ہے۔ براہ کرم پہلے کوئی کورس منتخب کریں۔"
                : "Automated assessment pulls randomized questions from the course you're enrolled in. Please enroll from a course page first."}
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-xl px-6 py-3 text-base font-bold text-white transition hover:opacity-95"
              style={{ backgroundColor: HEADER_BROWN }}
            >
              {urdu ? "ڈیش بورڈ پر جائیں" : "Go to dashboard"}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-900 ${urdu ? `${urduFont.className} urdu-text` : ""}`}
    >
      <LandingNavbar />
      <main className="mx-auto w-full max-w-[min(100%,1100px)] px-4 py-8 sm:px-6 md:px-7 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#c3bebb]/45 bg-white shadow-sm">
          <div className="border-b border-[#c3bebb]/35 px-5 py-4 text-white sm:px-6 sm:py-5" style={{ backgroundColor: HEADER_BROWN }}>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{urdu ? "خودکار اسیسمنٹ" : "Automated assessment"}</h1>
            <p className="mt-2 text-base text-white/95 md:text-lg">
              {urdu ? "کورس" : "Course"}: <span className="font-semibold text-white">{enrolled}</span>
            </p>
            <p className="mt-1 text-sm text-white/90 md:text-base">
              {urdu
                ? "پانچ بے ترتیب سوالات — جمع کرانے کے بعد آپ کو اسکور اور جائزہ ملے گا۔"
                : "Five randomized questions from your course submit for AI feedback like the topic quizzes."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void fetchQuestions()}
                disabled={loadingQuestions}
                className="rounded-lg border border-white/35 bg-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/25 disabled:opacity-50 md:text-base"
              >
                {loadingQuestions ? (urdu ? "لوڈ…" : "Loading…") : urdu ? "نئے سوالات" : "New questions"}
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-base text-red-800">{error}</div>
        ) : null}

        {results && totalMarks !== null ? (
          <div className="mb-8 rounded-2xl border border-[#c3bebb]/40 bg-[#faf8f7] p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide md:text-sm" style={{ color: HEADER_BROWN }}>
              {urdu ? "نتیجہ" : "Score"}
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">
              {totalMarks} / {maxMarks}
            </p>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {urdu ? "نیچے ہر سوال کے لیے جائزہ دیکھیں۔" : "Review each question below for detailed feedback."}
            </p>
          </div>
        ) : null}

        <div className="space-y-6">
          {loadingQuestions && !questions.length ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin" style={{ color: HEADER_BROWN }} />
            </div>
          ) : null}

          {questions.map((q, i) => {
            const open = reviewOpen[i] ?? false;
            const r = results?.[i];
            return (
              <div key={i} className="rounded-2xl border border-[#c3bebb]/40 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5c5755] md:text-sm">
                    {urdu ? "سوال" : "Q"}
                    {i + 1} · {q.difficulty}
                  </span>
                  {r ? (
                    <span
                      className="rounded-full px-3 py-0.5 text-xs font-bold text-white md:text-sm"
                      style={{ backgroundColor: HEADER_BROWN }}
                    >
                      {r.marks}/10
                    </span>
                  ) : null}
                </div>
                <p className="mb-3 text-base font-medium leading-relaxed text-gray-900 md:text-lg">{q.question}</p>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-[#c3bebb]/45 bg-[#faf8f7] px-4 py-3 text-base outline-none transition focus:border-[#968e8a] focus:ring-2 focus:ring-[#968e8a]/25 md:text-lg"
                  placeholder={urdu ? "اپنا جواب لکھیں…" : "Your answer…"}
                  value={answers[i] ?? ""}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  disabled={grading}
                />

                <button
                  type="button"
                  className="mt-3 flex items-center gap-1 text-sm font-semibold md:text-base"
                  style={{ color: HEADER_BROWN }}
                  onClick={() =>
                    setReviewOpen((prev) => {
                      const n = [...prev];
                      n[i] = !n[i];
                      return n;
                    })
                  }
                >
                  {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  {urdu ? "ماڈل جواب اور ویڈیو" : "Review model answer & resource"}
                </button>

                {open ? (
                  <div className="mt-3 rounded-xl border border-[#c3bebb]/35 bg-[#f4f3f2] p-4 text-base leading-relaxed md:p-5">
                    <p className="mb-2 font-semibold text-gray-900">{urdu ? "ماڈل جواب" : "Model answer"}</p>
                    <p className="mb-4 whitespace-pre-wrap text-gray-800">{q.modelAnswer || "—"}</p>
                    {q.sourceUrl ? (
                      <p>
                        <span className="font-semibold text-gray-900">{urdu ? "وسیلہ (ویڈیو)" : "Resource (video)"}: </span>
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium underline underline-offset-2 hover:opacity-90"
                          style={{ color: HEADER_BROWN }}
                        >
                          {q.sourceUrl}
                        </a>
                      </p>
                    ) : (
                      <p className="text-gray-500">{urdu ? "کوئی لنک دستیاب نہیں۔" : "No source URL for this item."}</p>
                    )}
                  </div>
                ) : null}

                {r ? (
                  <div className="mt-4 rounded-xl border border-[#c3bebb]/35 bg-[#ebe8e6]/60 px-4 py-3 text-base md:px-5 md:py-4">
                    <p className="mb-1 font-semibold text-gray-900">{urdu ? "تجاویز" : "Feedback"}</p>
                    <p className="text-gray-800">{r.suggestion}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {questions.length > 0 ? (
          <div className="mt-10 flex justify-end">
            <button
              type="button"
              onClick={() => void submitJudge()}
              disabled={grading}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-base font-bold text-white transition hover:opacity-95 disabled:bg-[#c3bebb] disabled:text-gray-600 md:text-lg"
              style={{ backgroundColor: HEADER_BROWN }}
            >
              {grading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {grading ? (urdu ? "چیک ہو رہا ہے…" : "Grading…") : urdu ? "جمع کروائیں" : "Submit for grading"}
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
