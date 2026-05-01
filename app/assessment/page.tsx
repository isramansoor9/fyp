"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { SiteNavbar } from "../components/SiteNavbar";
import { User as UserIcon, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  const navbarRight = useMemo(
    () => (
      <Link
        href="/dashboard"
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
      >
        <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
          <UserIcon className="w-4 h-4" />
        </span>
        <span className="max-w-[120px] truncate">{user?.email ?? ""}</span>
      </Link>
    ),
    [user?.email]
  );

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
      <div className={`min-h-screen bg-white flex items-center justify-center ${urdu ? urduFont.className : ""}`}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  if (!["Course 1", "Course 2", "Course 3"].includes(enrolled)) {
    return (
      <div className={`min-h-screen bg-white text-black ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
        <SiteNavbar urdu={urdu} right={navbarRight} />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{urdu ? "سب سے پہلے اندراج کریں" : "Enrollment required"}</h1>
          <p className="text-gray-600 mb-8">
            {urdu ? "آٹومیٹڈ اسیسمنٹ آپ کے موجودہ کورس سے سوالات کھینچتی ہے۔ براہ کرم پہلے کوئی کورس منتخب کریں۔" : "Automated assessment pulls randomized questions from the course you're enrolled in. Please enroll from a course page first."}
          </p>
          <Link href="/dashboard" className="inline-block rounded-xl bg-black px-6 py-3 text-white font-medium hover:bg-gray-900">
            {urdu ? "ڈیش بورڈ پر جائیں" : "Go to dashboard"}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-black ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <SiteNavbar urdu={urdu} right={navbarRight} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{urdu ? "خودکار اسیسمنٹ" : "Automated assessment"}</h1>
          <p className="text-gray-600 text-sm">
            {urdu ? "کورس" : "Course"}: <span className="font-semibold text-gray-900">{enrolled}</span>
            {" · "}
            {urdu
              ? "پانچ بے ترتیب سوالات — جمع کرانے کے بعد آپ کو اسکور اور جائزہ ملے گا۔"
              : "Five randomized questions from your course — submit for AI feedback like the topic quizzes."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fetchQuestions()}
              disabled={loadingQuestions}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingQuestions ? (urdu ? "لوڈ…" : "Loading…") : urdu ? "نئے سوالات" : "New questions"}
            </button>
          </div>
        </header>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        {results && totalMarks !== null ? (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{urdu ? "نتیجہ" : "Score"}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalMarks} / {maxMarks}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {urdu ? "نیچے ہر سوال کے لیے جائزہ دیکھیں۔" : "Review each question below for detailed feedback."}
            </p>
          </div>
        ) : null}

        <div className="space-y-6">
          {loadingQuestions && !questions.length ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-gray-300" />
            </div>
          ) : null}

          {questions.map((q, i) => {
            const open = reviewOpen[i] ?? false;
            const r = results?.[i];
            return (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {urdu ? "سوال" : "Q"}
                    {i + 1} · {q.difficulty}
                  </span>
                  {r ? (
                    <span className="rounded-full bg-[#c3bebb] px-3 py-0.5 text-xs font-bold text-black">
                      {r.marks}/10
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-900 font-medium leading-relaxed mb-3">{q.question}</p>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
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
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black"
                  onClick={() =>
                    setReviewOpen((prev) => {
                      const n = [...prev];
                      n[i] = !n[i];
                      return n;
                    })
                  }
                >
                  {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  {urdu ? "ماڈل جواب اور ویڈیو" : "Review model answer & resource"}
                </button>

                {open ? (
                  <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm leading-relaxed">
                    <p className="font-semibold text-gray-900 mb-2">{urdu ? "ماڈل جواب" : "Model answer"}</p>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{q.modelAnswer || "—"}</p>
                    {q.sourceUrl ? (
                      <p>
                        <span className="font-semibold text-gray-900">{urdu ? "وسیلہ (ویڈیو)" : "Resource (video)"}: </span>
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black underline underline-offset-2 hover:text-gray-700"
                        >
                          {q.sourceUrl}
                        </a>
                      </p>
                    ) : (
                      <p className="text-gray-400">{urdu ? "کوئی لنک دستیاب نہیں۔" : "No source URL for this item."}</p>
                    )}
                  </div>
                ) : null}

                {r ? (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                    <p className="font-semibold text-gray-900 mb-1">{urdu ? "تجاویز" : "Feedback"}</p>
                    <p className="text-gray-700">{r.suggestion}</p>
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
              className="inline-flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-white font-semibold transition hover:bg-gray-900 disabled:bg-gray-400"
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
