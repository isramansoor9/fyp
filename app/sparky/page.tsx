"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isUrdu } from "@/lib/uiLanguage";
import { urduFont } from "@/lib/urduFont";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { SendHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
      <div className={`min-h-screen flex flex-col bg-white ${urdu ? urduFont.className : ""}`}>
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-500 text-sm">{urdu ? "لوڈ ہو رہا ہے…" : "Loading…"}</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  const todayKey = localDateKey();

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-black ${urdu ? `${urduFont.className} urdu-text` : ""}`}>
      <LandingNavbar />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-8">
        <aside className="w-full shrink-0 lg:max-w-xs">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{urdu ? "چیٹ تاریخ" : "Chat history"}</h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedDateKey(todayKey);
                  void loadSessions();
                }}
                className="rounded-lg bg-[#c3bebb] px-3 py-1 text-xs font-semibold text-black transition hover:bg-[#b8b2af]"
              >
                {urdu ? "آج" : "Today"}
              </button>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              {urdu
                ? "ہر کیلینڈر دن الگ سیشن۔ پرانے دن منتخب کریں یا آج کی بات چیت جاری رکھیں۔"
                : "Each calendar day is its own chat. Pick a past day or continue today\u2019s conversation."}
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto lg:max-h-[70vh]">
              {loadingSessions ? (
                <div className="animate-pulse space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-gray-400">{urdu ? "ابھی تک کوئی سیشن نہیں" : "No sessions yet"}</p>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(s.dateKey)}
                    className={`flex w-full flex-col rounded-xl border px-3 py-2 text-left transition ${
                      s.dateKey === selectedDateKey
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-gray-900">{s.dateKey}</span>
                    <span className="truncate text-xs text-gray-500">{s.preview || `(${s.messageCount} messages)`}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-100 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lg text-white font-bold">
                ⚡
              </span>
              <div>
                <h1 className="text-xl font-bold">{urdu ? "اسپارکی" : "Sparky"}</h1>
                <p className="text-sm text-gray-500">
                  {urdu ? "ورچوئل آٹو الیکٹریشن انسٹرکٹر" : "Virtual auto electrician instructor"} ·{" "}
                  <span className="font-medium text-gray-700">{selectedDateKey}</span>
                </p>
              </div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-6 text-sm text-gray-600">
                {urdu ? (
                  <>
                    <p className="mb-2 font-medium text-gray-900">⚡ اسلام و علیکم</p>
                    <p className="leading-relaxed">
                      آٹو الیکٹریکل نظام، فالٹ ٹربل شوٹنگ، یا حفاظتی مشورہ — اپنا سوال درج کریں۔
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 font-medium text-gray-900">⚡ Hey there</p>
                    <p className="leading-relaxed">
                      Ask anything about automotive electrics — diagnostics, tools, circuits, safety. Messages for this calendar day stay in this chat.
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
                    className={`max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-relaxed sm:max-w-[85%] ${
                      mine
                        ? "border-gray-900 bg-black text-white"
                        : "border-gray-200 bg-gray-50 text-gray-900"
                    }`}
                  >
                    {!mine ? (
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {sending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  {urdu ? "سوچ رہا ہے…" : "Sparky is thinking…"}
                </div>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-gray-100 p-4 sm:p-6">
            <div className="flex gap-2">
              <textarea
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-black/5 focus:border-gray-400"
                placeholder={urdu ? "اپنا سوال لکھیں…" : "Ask Sparky anything…"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                rows={2}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-black px-4 py-3 text-white transition hover:bg-gray-900 disabled:bg-gray-300"
                aria-label="Send"
              >
                <SendHorizontal className="h-5 w-5" />
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
