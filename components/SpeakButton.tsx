"use client";

import { useCallback, useEffect, useState } from "react";
import { Square, Volume2 } from "lucide-react";

/** Strip markdown / code blocks for TTS (Urdu + English). */
export function stripMarkdownForSpeech(raw: string): string {
  const s = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/[*_>#|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > 32000 ? `${s.slice(0, 32000)}…` : s;
}

type SpeakButtonProps = {
  text: string;
  /** BCP 47, e.g. en-US, ur-PK */
  lang: string;
  className?: string;
  /** Accessible label */
  label?: string;
  /** `onPrimary` = light controls on brown/dark bubbles (e.g. Sparky user messages). */
  variant?: "default" | "onPrimary";
};

export function SpeakButton({
  text,
  lang,
  className = "",
  label = "Listen",
  variant = "default",
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const cleaned = stripMarkdownForSpeech(text);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (!cleaned || cleaned.length < 2) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(cleaned);
    u.lang = lang;
    u.rate = lang.toLowerCase().startsWith("ur") ? 0.88 : 0.92;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }, [cleaned, lang]);

  const toggle = useCallback(() => {
    if (speaking) stop();
    else play();
  }, [speaking, stop, play]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  if (!cleaned || cleaned.length < 2) return null;

  const baseBtn =
    variant === "onPrimary"
      ? "border-white/35 bg-white/15 text-white hover:bg-white/25 hover:border-white/50"
      : "border-[#c3bebb]/50 bg-white text-[#5c5755] hover:border-[#968e8a] hover:bg-[#faf8f7] hover:text-gray-900";

  return (
    <button
      type="button"
      onClick={toggle}
      title={speaking ? "Stop" : label}
      aria-label={speaking ? "Stop speaking" : label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${variant === "onPrimary" ? "focus-visible:ring-white/70" : "focus-visible:ring-[#968e8a]"} ${baseBtn} ${className}`}
    >
      {speaking ? <Square className="h-4 w-4 fill-current" strokeWidth={0} /> : <Volume2 className="h-5 w-5" strokeWidth={2} />}
    </button>
  );
}
