"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import chatbotIcon from "@/app/images/chatbot.png";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import ReactMarkdown from "react-markdown";
import { SpeakButton } from "@/components/SpeakButton";

const API = "http://localhost:5000";

type SessionRow = {
  dateKey: string;
  preview: string;
  messageCount: number;
};

type ChatMsg = { role: string; content: string; at?: string };

function localDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SparkyPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);
  const uid = (user as { userId?: string } | null)?.userId ?? "";
  const email = user?.email ?? "";

  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(localDateKey);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login?returnTo=/sparky");
    }
  }, [isLoading, isLoggedIn, router]);

  const loadSessions = useCallback(async () => {
    if (!uid && !email) return;
    setLoadingSessions(true);
    try {
      const qs = new URLSearchParams();
      if (uid) qs.set("userId", uid);
      if (email) qs.set("email", email);
      const res = await fetch(`${API}/api/sparky/sessions?${qs}`);
      const data = await res.json().catch(() => ({}));
      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [uid, email]);

  const loadMessagesForDay = useCallback(
    async (dateKey: string) => {
      if (!uid && !email) return;
      const qs = new URLSearchParams({ dateKey });
      if (uid) qs.set("userId", uid);
      if (email) qs.set("email", email);
      try {
        const res = await fetch(`${API}/api/sparky/session?${qs}`);
        const data = await res.json().catch(() => ({}));
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch {
        setMessages([]);
      }
    },
    [uid, email]
  );

  useEffect(() => {
    if (isLoggedIn) void loadSessions();
  }, [isLoggedIn, loadSessions]);

  useEffect(() => {
    if (isLoggedIn && selectedDateKey) void loadMessagesForDay(selectedDateKey);
  }, [isLoggedIn, selectedDateKey, loadMessagesForDay]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    try {
      const res = await fetch(`${API}/api/sparky/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid || undefined,
          email: email || undefined,
          message: text,
          dateKey: selectedDateKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Request failed.");
      const next = Array.isArray(data.messages) ? data.messages : [];
      setMessages(next);
      await loadSessions();
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: urdu ? "خرابی واقع ہوئی۔ دوبارہ کوشش کریں۔" : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-800"
      >
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-lg text-gray-700">{urdu ? "لوڈ ہو رہا ہے…" : "Loading…"}</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const todayKey = localDateKey();

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-900 ${urdu ? "urdu-text" : ""}`}
    >
      <LandingNavbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:max-w-sm">
          <div className="rounded-2xl border border-[#c3bebb]/45 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{urdu ? "چیٹ تاریخ" : "Chat history"}</h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedDateKey(todayKey);
                  void loadSessions();
                }}
                className="rounded-lg bg-[#968e8a] px-3 py-2 text-sm font-bold text-white transition hover:opacity-95"
              >
                {urdu ? "آج" : "Today"}
              </button>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-700 md:text-base">
              {urdu
                ? "ہر کیلینڈر دن الگ سیشن۔ پرانے دن منتخب کریں یا آج کی بات چیت جاری رکھیں۔"
                : "Each calendar day is its own chat. Pick a past day or continue today\u2019s conversation."}
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto lg:max-h-[70vh]">
              {loadingSessions ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-[#ebe8e6]" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-base text-gray-600 md:text-lg">{urdu ? "ابھی تک کوئی سیشن نہیں" : "No sessions yet"}</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(s.dateKey)}
                    className={`flex w-full flex-col rounded-xl border px-3 py-3 text-left transition md:px-4 md:py-3.5 ${
                      s.dateKey === selectedDateKey
                        ? "border-[#968e8a] bg-[#f4f3f2] shadow-sm"
                        : "border-[#c3bebb]/40 bg-white hover:border-[#968e8a]/50"
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-900 md:text-base">{s.dateKey}</span>
                    <span className="mt-0.5 truncate text-sm text-gray-600 md:text-base">
                      {s.preview || `(${s.messageCount} messages)`}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border border-[#c3bebb]/45 bg-white shadow-sm">
          <header
            className="relative border-b border-[#c3bebb]/35 px-5 py-4 text-white sm:px-7 sm:py-5"
            style={{ backgroundColor: "#968e8a" }}
          >
            <div className="max-w-[calc(100%-7.5rem)] sm:max-w-[calc(100%-9rem)]">
              <div className="flex flex-row items-center gap-3 sm:gap-4" dir={urdu ? "rtl" : "ltr"}>
                <Image
                  src={chatbotIcon}
                  alt={urdu ? "اسپارکی" : "Sparky"}
                  width={48}
                  height={48}
                  className="h-10 w-10 shrink-0 object-contain md:h-11 md:w-11 lg:h-12 lg:w-12"
                  priority
                />
                <div className={`min-w-0 flex-1 ${urdu ? "urdu-text" : ""}`}>
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
                    {urdu ? "اسپارکی" : "Sparky"}
                  </h1>
                  <p className="mt-1 text-base text-white/95 md:text-lg">
                    {urdu ? "ورچوئل آٹو الیکٹریشن انسٹرکٹر" : "Virtual auto electrician instructor"}
                  </p>
                </div>
              </div>
            </div>
            <div className={`absolute top-4 sm:top-5 ${urdu ? "left-5 sm:left-7" : "right-5 sm:right-7"}`}>
              <span className={`block ${urdu ? "text-left" : "text-right"} text-lg font-semibold tabular-nums text-white md:text-xl`}>
                {selectedDateKey}
              </span>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto bg-[#f4f3f2]/50 px-4 py-5 sm:px-7 sm:py-6">
            {messages.length === 0 ? (
              <div className="rounded-2xl border border-[#c3bebb]/35 bg-white p-6 text-base leading-relaxed text-gray-800 md:p-8 md:text-lg">
                {urdu ? (
                  <>
                    <p className="mb-3 text-lg font-bold text-gray-900 md:text-xl">السلام علیکم</p>
                    <p>
                      آٹو الیکٹریکل نظام، فالٹ ٹربل شوٹنگ، یا حفاظتی مشورہ اپنا سوال درج کریں۔
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-3 text-lg font-bold text-gray-900 md:text-xl">Hey there !</p>
                    <p>
                      Ask anything about automotive electrics diagnostics, tools, circuits, safety. Messages for this
                      calendar day stay in this chat.
                    </p>
                  </>
                )}
              </div>
            ) : null}
            {messages.map((m, idx) => {
              const mine = (m.role || "").toLowerCase() === "user";
              return (
                <div
                  key={`${idx}-${m.at ?? ""}-${m.role}`}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl border px-4 py-3 leading-relaxed sm:max-w-[85%] md:px-5 md:py-4 ${
                      mine
                        ? "border-[#7a736f] bg-[#968e8a] text-white md:text-lg"
                        : "border-[#c3bebb]/45 bg-white text-gray-900 prose prose-lg max-w-none md:text-lg [&_p]:my-2 [&_li]:my-1"
                    }`}
                  >
                    {!urdu ? (
                      <div className={`mb-2 flex ${mine ? "justify-start" : "justify-end"}`}>
                        <SpeakButton
                          text={m.content}
                          lang="en-US"
                          variant={mine ? "onPrimary" : "default"}
                          className="!h-9 !w-9"
                          label="Listen"
                        />
                      </div>
                    ) : null}
                    {!mine ? (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap text-base md:text-lg">{m.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {sending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-[#c3bebb]/40 bg-white px-4 py-3 text-base text-gray-600 md:px-5 md:py-4 md:text-lg">
                  {urdu ? "سوچ رہا ہے…" : "Sparky is thinking…"}
                </div>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-[#c3bebb]/30 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                className="min-h-[56px] flex-1 resize-none rounded-xl border border-[#c3bebb]/45 bg-[#faf8f7] px-4 py-3 text-base outline-none transition focus:border-[#968e8a] focus:ring-2 focus:ring-[#968e8a]/25 md:min-h-[60px] md:px-5 md:py-3.5 md:text-lg"
                placeholder={urdu ? "اپنا سوال لکھیں…" : "Ask Sparky anything…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={sending}
                rows={2}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#968e8a] px-6 py-3.5 text-base font-bold text-white transition hover:opacity-95 disabled:bg-[#c3bebb] disabled:text-gray-600 md:px-8 md:text-lg"
              >
                {urdu ? "بھیجیں" : "Send"}
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
