"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronRight, BookOpen, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { backendUrl } from "@/lib/backendUrl";

type QuizQuestion = { question: string; answer: string; difficulty: string };

type QuizModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (submission?: { questions: { question: string; answer: string }[]; userAnswers: string[]; judgeResults?: { marks: number; suggestion: string }[] }) => void;
  subtopicTitle: string;
  course: 1 | 2 | 3;
  userLevel?: string;
  userEmail?: string;
  userId?: string;
  semester?: string;
  urdu?: boolean;
};

export default function QuizModal({
  isOpen,
  onClose,
  onCompleted,
  subtopicTitle,
  course,
  userLevel = "easy",
  userEmail,
  userId,
  semester = "1",
  urdu = false,
}: QuizModalProps) {
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<"prompt" | "quiz" | "submitting" | "done">("prompt");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("prompt");
      setQuestions([]);
      setAnswers([]);
      setError(null);
    }
  }, [isOpen]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        title: subtopicTitle,
        level: userLevel,
      });
      if (course === 3) params.set("semester", semester);
      const res = await fetch(`/api/course${course}/quiz?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (urdu ? "کوئز لوڈ نہیں ہو سکا" : "Failed to load quiz"));
      if (!data.questions?.length) throw new Error(urdu ? "اس عنوان کے لیے سوالات دستیاب نہیں ہیں۔" : "No questions available for this topic.");
      setQuestions(data.questions);
      setAnswers(data.questions.map(() => ""));
      setStep("quiz");
    } catch (e) {
      setError(e instanceof Error ? e.message : (urdu ? "کوئز لوڈ نہیں ہو سکا" : "Failed to load quiz"));
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!userEmail && !userId) {
      setError(urdu ? "کوئز جمع کرانے کے لیے لاگ اِن ہونا ضروری ہے۔" : "You must be logged in to submit the quiz.");
      return;
    }
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch(backendUrl("/api/quiz/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          userId,
          subtopicName: subtopicTitle,
          course: `Course ${course}`,
          questions: questions.map((q) => ({
            question: q.question,
            answer: q.answer,
            difficulty: (q as { difficulty?: string }).difficulty ?? "Easy",
            knowledgeDimension: (q as { knowledgeDimension?: string }).knowledgeDimension ?? "Factual",
          })),
          userAnswers: answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (urdu ? "کوئز جمع نہیں ہو سکا" : "Failed to submit"));
      if (user && (typeof data.personalizationScore === "number" || typeof data.level === "string")) {
        setUser({
          ...user,
          ...(typeof data.personalizationScore === "number" ? { personalizationScore: data.personalizationScore } : {}),
          ...(typeof data.level === "string" ? { level: data.level } : {}),
        });
      }
      window.dispatchEvent(new Event("teachus:progress-updated"));
      setStep("done");
      if (onCompleted) {
        onCompleted({
          questions: questions.map((q) => ({ question: q.question, answer: q.answer })),
          userAnswers: answers,
          judgeResults: data.judgeResults ?? undefined,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : (urdu ? "کوئز جمع نہیں ہو سکا" : "Failed to submit quiz"));
      setStep("quiz");
    }
  };

  const updateAnswer = (index: number, value: string) => {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step === "prompt" || step === "done" ? onClose : undefined}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {step === "prompt" && (
          <div className="p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-black to-gray-700 flex items-center justify-center"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {urdu ? "فوری کوئز کے لیے تیار ہیں؟" : "Ready for a Quick Quiz?"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {urdu
                ? `اپنی سطح کے مطابق 5 ذاتی سوالات کے ساتھ "${subtopicTitle}" کی سمجھ چیک کریں۔ سکون سے جواب دیں۔`
                : `Test your understanding of "${subtopicTitle}" with 5 personalized questions based on your level. Take your time and answer thoughtfully.`}
            </p>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <button
              onClick={startQuiz}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {urdu ? "سوالات لوڈ ہو رہے ہیں..." : "Loading Questions..."}
                </>
              ) : (
                <>
                  {urdu ? "کوئز شروع کریں" : "Attempt Quiz"}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div className="p-8 md:p-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
              {urdu ? "کوئز:" : "Quiz:"} {subtopicTitle}
            </h2>
            <div className="space-y-8">
                {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-sm font-medium text-gray-500 mb-1">
                  {urdu ? "سوال" : "Question"} {i + 1} · {q.difficulty}
                  </p>
                  <p className="font-semibold text-gray-900 mb-3">{q.question}</p>
                  <textarea
                  value={answers[i]}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  placeholder={urdu ? "اپنا جواب یہاں لکھیں..." : "Type your answer here..."}
                  className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none resize-y transition text-black placeholder-black"
                  rows={4}
                  />
                </motion.div>
                ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
            <div className="mt-8 flex gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                {urdu ? "منسوخ کریں" : "Cancel"}
              </button>
              <button
                onClick={submitQuiz}
                className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-[1.02]"
              >
                {urdu ? "کوئز جمع کریں" : "Submit Quiz"}
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === "submitting" && (
          <div className="p-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-black animate-spin" />
            <p className="text-lg font-medium text-gray-700">{urdu ? "آپ کا کوئز جمع کیا جا رہا ہے..." : "Submitting your quiz..."}</p>
          </div>
        )}

        {step === "done" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 md:p-12 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{urdu ? "کوئز جمع ہو گیا!" : "Quiz Submitted!"}</h2>
            <p className="text-gray-600 mb-8">
              {urdu ? "آپ کے جوابات محفوظ ہو گئے ہیں۔ بہت خوب!" : "Your answers have been saved. Great job completing this quiz!"}
            </p>
            <button
              onClick={onClose}
              className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              {urdu ? "بند کریں" : "Close"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
