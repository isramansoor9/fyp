"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/contexts/AuthContext";
import QuizModal from "@/components/QuizModal";
import ContentLoader from "@/components/ContentLoader";

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
  const { isLoggedIn, isLoading: authLoading, user } = useAuth();
  const semesterParam = searchParams.get("semester");
  const titleParam = searchParams.get("title");
  const topicParam = searchParams.get("topic");

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
    if (!titleParam || !semesterParam) {
      setState({
        title: null,
        content: null,
        loading: false,
        error: null,
      });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    const userId = (user as { userId?: string } | null)?.userId || "";
    const userEmail = (user as { email?: string } | null)?.email || "";

    (async () => {
      try {
        const subtopicRes = await fetch(
          `http://localhost:5000/api/subtopic/${encodeURIComponent(titleParam)}?course=${encodeURIComponent("Course 3")}&userId=${encodeURIComponent(userId)}&email=${encodeURIComponent(userEmail)}`
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

        const params = new URLSearchParams({
          semester: semesterParam,
          title: titleParam,
        });
        const res = await fetch(`/api/course3/content?${params}`);
        if (!res.ok) throw new Error("Content not found");
        const data: { title: string; content: string } = await res.json();
        let finalContent = data.content;

        const userLevel = ((user as { level?: string } | null)?.level) || "easy";
        try {
          const qaParams = new URLSearchParams({ title: titleParam, level: userLevel, semester: semesterParam!, all: "true" });
          const qaRes = await fetch(`/api/course3/quiz?${qaParams}`);
          const qaData = await qaRes.json();
          const quizQAs = qaData.quizQAs ?? qaData.questions ?? [];
          const personalizeRes = await fetch("http://localhost:5000/api/personalize/content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: userId || undefined,
              email: userEmail || undefined,
              course: "Course 3",
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
        } catch {}

        await fetch("http://localhost:5000/api/user/subtopic/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId || undefined,
            email: userEmail || undefined,
            course: "Course 3",
            topic: topicParam || "",
            subtopicName: data.title,
            studied: true,
            content: finalContent,
          }),
        }).catch(() => {});

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
  }, [titleParam, topicParam, semesterParam, isLoggedIn, authLoading, pathname, router, searchParams, user]);

  if (!authLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  if (!titleParam || !semesterParam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-500 mb-4">No subtopic selected.</p>
          <button
            onClick={() => router.push("/course3/learn")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  if (state.loading) {
    return <ContentLoader />;
  }

  if (state.error || !state.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <p className="text-gray-700 font-medium mb-2">Content not found</p>
          <p className="text-gray-500 text-sm mb-4">
            No content found for &quot;{state.title || titleParam}&quot;.
          </p>
          <button
            onClick={() => router.push("/course3/learn")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              Course 3 · Content
            </p>
          </div>
          <button
            onClick={() => router.push("/course3/learn")}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Curriculum
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
            {state.title}
          </h1>
          <div className="content-body text-gray-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h1,h2,h3]:mt-6 [&_h1,h2,h3]:mb-3 [&_p]:my-3 [&_ul]:my-4 [&_li]:ml-6 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-gray-900">
            <ReactMarkdown>{state.content}</ReactMarkdown>
          </div>
          {!quizCompleted && (
            <div className="mt-10 pt-8 border-t border-gray-100">
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
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Quiz Review</h2>
              <p className="text-xs text-gray-500 mb-4">
                Submitted at:{" "}
                {quizReview.submittedAt ? new Date(quizReview.submittedAt).toLocaleString() : "—"}
              </p>
              <div className="space-y-4 text-sm">
                {quizReview.questions.map((q, idx) => {
                  const judge = quizReview.judgeResults?.[idx];
                  return (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="font-medium text-gray-900">Q{idx + 1}. {q.question}</p>
                        {judge != null && <span className="text-xs font-semibold text-gray-600 shrink-0">{judge.marks}/10</span>}
                      </div>
                      <p className="text-gray-700"><span className="font-semibold">Your answer:</span> {quizReview.userAnswers?.[idx] || "—"}</p>
                      <p className="text-gray-500 text-xs mt-1"><span className="font-semibold">Model answer:</span> {q.answer}</p>
                      {judge?.suggestion && (
                        <p className="mt-2 pt-2 border-t border-gray-200 text-gray-700 italic">
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
          course={3}
          userLevel={(user?.level as string) || "easy"}
          userEmail={user?.email}
          userId={(user?.userId as string) || undefined}
          semester={semesterParam || "1"}
        />
      </main>
    </div>
  );
}

export default function Course3ContentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <ContentView />
    </Suspense>
  );
}
