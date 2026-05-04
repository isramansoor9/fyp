"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import ContentLoader from "@/components/ContentLoader";
import QuizModal from "@/components/QuizModal";
import PersonalizedContentRenderer from "@/components/PersonalizedContentRenderer";
import { isUrdu } from "@/lib/uiLanguage";

type ContentState = {
  title: string | null;
  content: string | null;
  loading: boolean;
  error: string | null;
};

type JudgeResult = { marks: number; suggestion: string };
type QuizReview = {
  questions: { question: string; answer: string }[];
  userAnswers: string[];
  judgeResults?: JudgeResult[] | null;
  submittedAt?: string | null;
};

function ContentView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const titleParam = searchParams.get("title");
  const topicParam = searchParams.get("topic");
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizReview, setQuizReview] = useState<QuizReview | null>(null);
  const [state, setState] = useState<ContentState>({
    title: null,
    content: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    if (!titleParam) {
      setState({ title: null, content: null, loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    const userId = (user as { userId?: string } | null)?.userId || "";
    const userEmail = (user as { email?: string } | null)?.email || "";

    (async () => {
      try {
        const subtopicRes = await fetch(
          `http://localhost:5000/api/subtopic/${encodeURIComponent(titleParam)}?course=${encodeURIComponent("Course 2")}&userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail)}`
        );
        if (subtopicRes.ok) {
          const subtopicData = await subtopicRes.json();
          if (subtopicData?.quiz?.questions?.length) {
            setQuizCompleted(true);
            setQuizReview({
              questions: subtopicData.quiz.questions,
              userAnswers: subtopicData.quiz.userAnswers || [],
              judgeResults: subtopicData.quiz.judgeResults || [],
              submittedAt: subtopicData.quiz.submittedAt || null,
            });
          }
          if (subtopicData?.contentGenerated && typeof subtopicData?.content === "string" && subtopicData.content.trim()) {
            setState({
              title: subtopicData.subtopic || decodeURIComponent(titleParam),
              content: subtopicData.content,
              loading: false,
              error: null,
            });
            return;
          }
        }

        const userLevel = ((user as { level?: string } | null)?.level) || "easy";
        const res = await fetch(
          `/api/course2/content?title=${encodeURIComponent(titleParam)}&level=${encodeURIComponent(userLevel)}`
        );
        if (!res.ok) throw new Error("Content not found");
        const data: { title: string; content: string } = await res.json();
        let finalContent = data.content;

        // Personalize and store on miss
        try {
          const qaRes = await fetch(`/api/course2/quiz?title=${encodeURIComponent(titleParam)}&level=${userLevel}&all=true`);
          const qaData = await qaRes.json();
          const quizQAs = qaData.quizQAs ?? qaData.questions ?? [];
          const personalizeRes = await fetch("http://localhost:5000/api/personalize/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userId || undefined,
              email: userEmail || undefined,
              course: "Course 2",
              topic: topicParam || "",
              subtopicName: data.title,
              userLevel,
              baseContent: data.content,
              quizQAs: Array.isArray(quizQAs) ? quizQAs : [],
            }),
          });
          if (personalizeRes.ok) {
            const p = await personalizeRes.json();
            if (typeof p.content === "string" && p.content.trim()) finalContent = p.content;
          }
        } catch (e) {
          console.error("[Personalize] Failed, using base content:", e);
        }

        await fetch("http://localhost:5000/api/user/subtopic/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId || undefined,
            email: userEmail || undefined,
            course: "Course 2",
            topic: topicParam || "",
            subtopicName: data.title,
            studied: true,
            content: finalContent,
          }),
        }).catch(() => {});
        window.dispatchEvent(new Event("teachus:progress-updated"));

        setState({
          title: data.title,
          content: finalContent,
          loading: false,
          error: null,
        });
      } catch {
        setState({
          title: decodeURIComponent(titleParam),
          content: null,
          loading: false,
          error: "Content not found",
        });
      }
    })();
  }, [titleParam, topicParam, isLoggedIn, authLoading, pathname, router, searchParams, user]);

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] flex items-center justify-center text-gray-600">
        <p>{urdu ? "لاگ اِن کی طرف منتقل کیا جا رہا ہے..." : "Redirecting to login..."}</p>
      </div>
    );
  }

  if (!titleParam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] flex items-center justify-center text-gray-600">
        <div className="text-center p-8">
          <p className="mb-4">{urdu ? "کوئی سب ٹاپک منتخب نہیں کیا گیا۔" : "No subtopic selected."}</p>
          <button
            onClick={() => router.push("/course2/learn")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {urdu ? "نصاب پر واپس جائیں" : "Back to Curriculum"}
          </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return <ContentLoader urdu={urdu} />;
  }

  if (state.error || !state.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] flex items-center justify-center text-gray-600">
        <div className="text-center p-8 max-w-md">
          <p className="text-gray-900 font-medium mb-2">Content not found</p>
          <p className="text-sm mb-4 opacity-90">
            No easy-level content found for &quot;{state.title || titleParam}&quot;.
          </p>
          <button
            onClick={() => router.push("/course2/learn")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            {urdu ? "نصاب پر واپس جائیں" : "Back to Curriculum"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? "urdu-text" : ""}`}
    >
      <LandingNavbar
        rightPrefix={
          <Link
            href="/course2/learn"
            className="px-3 py-2 sm:px-4 text-sm font-semibold rounded-lg border border-black/15 text-gray-900 hover:bg-black/5 transition-colors whitespace-nowrap"
          >
            {urdu ? "نصاب پر واپس جائیں" : "Back to Curriculum"}
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <article className="rounded-2xl border border-[#c3bebb]/40 bg-[#f4f3f2] shadow-sm p-6 md:p-10 lg:p-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 pb-5 border-b border-[#c3bebb]/30 leading-tight tracking-tight">
            {state.title}
          </h1>
          <PersonalizedContentRenderer content={state.content} speechLang={urdu ? "ur-PK" : "en-US"} />
          {!quizCompleted && (
            <div className="mt-10 pt-8 border-t border-[#c3bebb]/25">
              <button
                onClick={() => setShowQuiz(true)}
                className="w-full py-4 px-6 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 shadow-lg"
              >
                Attempt Quiz
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          {quizCompleted && quizReview && (
            <div className="mt-8 pt-6 border-t border-[#c3bebb]/25">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Your Quiz Review</h2>
              <p className="text-xs text-gray-600 mb-4">
                Submitted at:{" "}
                {quizReview.submittedAt ? new Date(quizReview.submittedAt).toLocaleString() : "—"}
              </p>
              <div className="space-y-4 text-base md:text-lg leading-relaxed">
                {quizReview.questions.map((q, idx) => {
                  const judge = quizReview.judgeResults?.[idx];
                  return (
                    <div key={idx} className="border border-[#c3bebb]/30 rounded-xl p-4 bg-[#ebe8e6]">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-medium text-gray-900">Q{idx + 1}. {q.question}</p>
                        {judge != null && <span className="text-xs font-semibold text-gray-600 shrink-0">{judge.marks}/10</span>}
                      </div>
                      <p className="text-gray-700"><span className="font-semibold">Your answer:</span> {quizReview.userAnswers?.[idx] || "—"}</p>
                      <p className="text-gray-500 text-xs mt-1"><span className="font-semibold">Model answer:</span> {q.answer}</p>
                      {judge?.suggestion && (
                        <p className="mt-2 pt-2 border-t border-[#c3bebb]/25 text-gray-700 italic">
                          <span className="font-semibold not-italic">Teacher suggestion:</span> {judge.suggestion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </article>
        <QuizModal
          isOpen={showQuiz}
          onClose={() => setShowQuiz(false)}
          onCompleted={(submission) => {
            setQuizCompleted(true);
            if (submission) setQuizReview({ ...submission, submittedAt: new Date().toISOString() });
          }}
          subtopicTitle={state.title || titleParam || ""}
          course={2}
          userLevel={(user as { level?: string })?.level || "easy"}
          userEmail={(user as { email?: string })?.email}
          userId={(user as { userId?: string })?.userId}
          urdu={urdu}
        />
      </main>
    </div>
  );
}

export default function Course2ContentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] flex items-center justify-center text-gray-600">
          <p>Loading...</p>
        </div>
      }
    >
      <ContentView />
    </Suspense>
  );
}
