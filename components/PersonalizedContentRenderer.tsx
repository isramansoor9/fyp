"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { SpeakButton } from "@/components/SpeakButton";

// ─── Types ─────────────────────────────────────────────────────────────────

type ResourceItem = {
  title: string;
  url: string;
  description?: string;
  kind: "video" | "article" | "resource";
};

type Flashcard = {
  front: string;
  /** Short preview for grid tiles */
  back: string;
  /** Full answer text for expanded modal */
  backFull: string;
};

type ContentSection = {
  id: string;
  title: string;
  body: string;
};

type Props = {
  content: string;
  /** Locale hint: Urdu (`ur-*`) hides lesson TTS; still drives Urdu UI labels for resources. English enables TTS. */
  speechLang?: string;
};

// ─── Constants (aligned with curriculum / learn table browns) ───────────────
// English (legacy) + Urdu heading from backend `_append_reference_resource_section`

const RESOURCE_HEADINGS_EN = "### Personalized Recommendation Resources";
const RESOURCE_HEADINGS_UR = "### ذاتی تجویز کردہ وسائل";

/** Table header brown — same as Course 1 learn `FOUNDATION_BROWN` */
const HEADER_BROWN = "#968e8a";

// ─── Content Section Parser ─────────────────────────────────────────────────

function parseContentIntoSections(markdown: string): ContentSection[] {
  const lines = markdown.split("\n");
  const sections: ContentSection[] = [];
  let idCounter = 0;

  let currentTitle = "";
  let currentBody: string[] = [];

  const flush = () => {
    const body = currentBody.join("\n").trim();
    if (!body) return;
    const title = currentTitle || "Overview";
    sections.push({
      id: `sec-${idCounter++}`,
      title,
      body,
    });
    currentBody = [];
  };

  for (const line of lines) {
    const h2 = line.match(/^##(?!#)\s+(.+)/);
    const h3 = line.match(/^###(?!#)\s+(.+)/);

    if (h2 || h3) {
      flush();
      currentTitle = (h2 ? h2[1] : h3![1]).trim();
    } else {
      currentBody.push(line);
    }
  }
  flush();

  // If nothing was parsed (flat content with no headings), treat whole thing as one section
  if (sections.length === 0 && markdown.trim()) {
    sections.push({ id: "sec-0", title: "Content", body: markdown.trim() });
  }

  return sections;
}

// ─── Resource Helpers ───────────────────────────────────────────────────────

function getResourceKind(url: string): ResourceItem["kind"] {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "video";
  if (lower.includes("medium.com") || lower.includes("wikipedia.org")) return "article";
  return "resource";
}

/** Returns 11-char video id for standard YouTube / YouTube Shorts URLs, or null. */
function extractYouTubeVideoId(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const isId = (s: string | undefined | null) => !!s && /^[a-zA-Z0-9_-]{11}$/.test(s);

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return isId(id) ? id! : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && isId(parts[1])) return parts[1];
      if (parts[0] === "embed" && isId(parts[1])) return parts[1];
      if (parts[0] === "live" && isId(parts[1])) return parts[1];
      const v = u.searchParams.get("v");
      return isId(v) ? v! : null;
    }
  } catch {
    return null;
  }
  return null;
}

function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

function prettifyHostTitle(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const base = host.split(".")[0] || "Resource";
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Recommended Resource";
  }
}

function normalizeResourceLine(line: string): string {
  return line.replace(/[\u200e\u200f\u202a-\u202e\u061c]/g, "").trim();
}

function parseMarkdownResourceLine(line: string): { title?: string; url?: string; description?: string } {
  const raw = normalizeResourceLine(line);
  // Markdown list: - or * ; link may contain non-ASCII title
  const markdownLink = raw.match(
    /^\s*[-*]\s*\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)\s*(?:[-–—]\s*(.+))?$/i
  );
  if (markdownLink) {
    let url = markdownLink[2]?.trim() ?? "";
    url = url.replace(/[),.;]+$/, "");
    return {
      title: markdownLink[1]?.trim() || undefined,
      url,
      description: markdownLink[3]?.trim(),
    };
  }
  const oldStyle = raw.match(/^\s*>\s*\d+\.\s*([^:]+):\s*(https?:\/\/\S+)/i);
  if (oldStyle) {
    return { title: oldStyle[1]?.trim(), url: oldStyle[2]?.trim().replace(/[),.;]+$/, ""), description: "Recommended from your current learning context." };
  }
  // Plain URL on its own or after bullet text
  const urls = raw.match(/https?:\/\/[^\s\)\]>'"]+/gi);
  if (urls?.length) {
    const url = urls[urls.length - 1].replace(/[),.;]+$/, "");
    const titlePart = raw.replace(url, "").replace(/^\s*[-*]\s*/, "").replace(/[-–—]\s*$/, "").trim();
    return {
      url,
      title: titlePart || undefined,
      description: "Recommended from your current learning context.",
    };
  }
  return {};
}

function isResourceSectionHeading(line: string): boolean {
  const t = line.trim();
  return t === RESOURCE_HEADINGS_EN || t === RESOURCE_HEADINGS_UR || t.startsWith(RESOURCE_HEADINGS_EN) || t.startsWith(RESOURCE_HEADINGS_UR);
}

function splitContentAndResources(raw: string): { mainMarkdown: string; helperText: string; resources: ResourceItem[] } {
  const lines = raw.split("\n");
  const markerIndex = lines.findIndex((line) => isResourceSectionHeading(line));
  if (markerIndex === -1) return { mainMarkdown: raw, helperText: "", resources: [] };

  const mainMarkdown = lines.slice(0, markerIndex).join("\n").trim();
  const sectionLines = lines.slice(markerIndex + 1).filter((line) => line.trim().length > 0);

  let helperText = "";
  const resources: ResourceItem[] = [];
  for (const line of sectionLines) {
    const trimmed = normalizeResourceLine(line);
    if (!trimmed) continue;
    const looksLikeResource =
      trimmed.startsWith("-") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith(">") ||
      /^https?:\/\//i.test(trimmed);
    if (!helperText && !looksLikeResource) {
      helperText = trimmed;
      continue;
    }
    const parsed = parseMarkdownResourceLine(line);
    if (!parsed.url || parsed.url === "#") continue;
    const kind = getResourceKind(parsed.url);
    resources.push({
      title: parsed.title || prettifyHostTitle(parsed.url),
      url: parsed.url,
      description:
        parsed.description ||
        (kind === "video"
          ? "Watch this short video to reinforce concepts quickly."
          : "Read this concise reference to strengthen your understanding."),
      kind,
    });
  }
  return { mainMarkdown, helperText, resources };
}

// ─── Flashcard Helpers ──────────────────────────────────────────────────────

function stripMarkdownSyntax(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimSummary(text: string, maxLength = 220): string {
  const cleaned = stripMarkdownSyntax(text);
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function buildFlashcards(markdown: string): Flashcard[] {
  const lines = markdown.split("\n");
  const cards: Flashcard[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  const pushCard = () => {
    const rawBody = currentBody.join(" ").trim();
    const bodyText = trimSummary(rawBody, 260);
    const backFull = stripMarkdownSyntax(rawBody) || bodyText;
    if (!currentHeading || !bodyText) return;
    cards.push({ front: currentHeading, back: bodyText, backFull });
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const headingMatch = line.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      pushCard();
      currentHeading = stripMarkdownSyntax(headingMatch[1] || "");
      currentBody = [];
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ") || line.match(/^\d+\.\s+/)) {
      currentBody.push(line.replace(/^(-|\*|\d+\.)\s+/, ""));
      continue;
    }
    currentBody.push(line);
  }
  pushCard();

  if (cards.length > 0) return cards.slice(0, 12);

  const paragraphs = markdown
    .split(/\n\s*\n/g)
    .map((p) => stripMarkdownSyntax(p))
    .filter((p) => p.length > 60);
  return paragraphs.slice(0, 8).map((p, idx) => {
    const backFull = stripMarkdownSyntax(p) || trimSummary(p, 260);
    return {
      front: "Study point",
      back: trimSummary(p, 260),
      backFull,
    };
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

const proseLessonClass =
  "prose prose-lg max-w-none text-gray-800 leading-relaxed " +
  "[&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-6 [&_h1]:mb-3 " +
  "[&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-5 [&_h2]:mb-2.5 " +
  "[&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-4 [&_h3]:mb-2 " +
  "[&_h4]:text-base [&_h4]:md:text-lg [&_h4]:font-semibold [&_h4]:text-gray-900 " +
  "[&_p]:my-3 [&_p]:text-base [&_p]:md:text-lg " +
  "[&_ul]:my-3 [&_ol]:my-3 [&_li]:ml-6 [&_li]:my-1.5 [&_li]:text-base [&_li]:md:text-lg " +
  "[&_strong]:font-semibold [&_strong]:text-gray-900 " +
  "[&_code]:bg-[#ebe8e6] [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-[#c3bebb] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 " +
  "[&_hr]:hidden [&_hr]:m-0 [&_hr]:h-0 [&_hr]:border-0";

const markdownComponents = {
  hr: () => null,
} as const;

function SectionAccordion({
  section,
  defaultOpen = false,
  index,
}: {
  section: ContentSection;
  defaultOpen?: boolean;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const bodyZebra = index % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]";

  return (
    <div className="rounded-xl border border-[#c3bebb]/40 overflow-hidden shadow-sm bg-[#ebe8e6]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 text-left transition-colors duration-150 text-white hover:opacity-[0.97]"
        style={{ backgroundColor: HEADER_BROWN }}
        aria-expanded={isOpen}
      >
        <span className="shrink-0 min-w-[2.25rem] text-lg md:text-xl font-bold tabular-nums text-white/90">
          {index + 1}.
        </span>
        <span className="flex-1 text-lg md:text-xl lg:text-2xl font-bold leading-snug pr-2">{section.title}</span>
        <span
          className={`shrink-0 transition-transform duration-200 text-white/90 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6 md:w-7 md:h-7">
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={`px-5 py-5 md:px-7 md:py-7 border-t border-[#c3bebb]/35 ${bodyZebra}`}>
          <div className={proseLessonClass}>
            <ReactMarkdown components={markdownComponents}>{section.body}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource, isUrdu }: { resource: ResourceItem; isUrdu: boolean }) {
  const ytId = extractYouTubeVideoId(resource.url);
  const kindLabel = resource.kind === "video" ? (isUrdu ? "ویڈیو" : "Video") : resource.kind === "article" ? (isUrdu ? "مضمون" : "Article") : isUrdu ? "لنک" : "Link";
  const openLabel = isUrdu ? "باہر کھولیں (نیا ٹیب)" : "Open link (new tab)";

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#c3bebb]/35 bg-[#faf8f7] shadow-sm transition-all duration-200 hover:border-[#968e8a]/55 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#968e8a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ebe8e6]"
      title={openLabel}
    >
      {ytId ? (
        <div className="relative aspect-video w-full shrink-0 bg-[#2a2624]">
          <img
            src={youtubeThumbnailUrl(ytId)}
            alt={`${resource.title} — YouTube thumbnail`}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" aria-hidden />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#968e8a] shadow-lg ring-2 ring-white/80 transition-transform duration-200 group-hover:scale-110"
            aria-hidden
          >
            <svg className="ml-0.5 h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          </div>
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-[2px]">
            YouTube
          </span>
        </div>
      ) : (
        <div className="flex h-36 w-full shrink-0 flex-col items-center justify-center gap-2 border-b border-[#c3bebb]/30 bg-gradient-to-br from-[#e8e4e2] to-[#d4cfcc] px-4">
          <span className="rounded-md border border-[#c3bebb]/45 bg-[#faf8f7]/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#5c5755]">
            {kindLabel}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="text-base font-bold leading-snug text-gray-900 decoration-[#968e8a] underline-offset-2 group-hover:underline md:text-lg">
          {resource.title}
        </p>
        {resource.description && (
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-700 md:text-base">{resource.description}</p>
        )}
        <p className="mt-2 break-all font-mono text-[11px] leading-snug text-[#968e8a] underline-offset-2 group-hover:underline md:text-xs" title={resource.url}>
          {resource.url}
        </p>
        <span className="mt-2 inline-block text-xs font-semibold text-[#968e8a]">{openLabel} →</span>
      </div>
    </a>
  );
}

function FlashcardModal({
  card,
  entered,
  onClose,
}: {
  card: Flashcard;
  entered: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Flashcard"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close flashcard"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-[#c3bebb]/50 bg-white shadow-2xl transition-all duration-500 ease-out will-change-transform max-h-[min(88vh,52rem)] ${
          entered ? "translate-y-0 scale-100 rotate-0 opacity-100" : "translate-y-10 scale-[0.88] rotate-[-8deg] opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 justify-end border-b border-[#c3bebb]/35 px-3 py-2.5 sm:px-4 sm:py-3"
          style={{ backgroundColor: HEADER_BROWN }}
        >
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/15 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: HEADER_BROWN }}>
            Question
          </p>
          <p className="mt-2 text-lg font-bold leading-snug text-gray-900 sm:text-xl md:text-2xl">{card.front}</p>
          <div className="my-6 border-t-2 border-[#c3bebb]/35 sm:my-7" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: HEADER_BROWN }}>
            Answer
          </p>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-800 sm:text-lg">{card.backFull}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function PersonalizedContentRenderer({ content, speechLang = "en-US" }: Props) {
  const { mainMarkdown, helperText, resources } = splitContentAndResources(content);
  const sections = useMemo(() => parseContentIntoSections(mainMarkdown), [mainMarkdown]);
  const flashcards = useMemo(() => buildFlashcards(mainMarkdown), [mainMarkdown]);
  const isUrduUI = speechLang.toLowerCase().startsWith("ur");
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashModalIndex, setFlashModalIndex] = useState<number | null>(null);
  const [flashModalEntered, setFlashModalEntered] = useState(false);

  useEffect(() => {
    if (flashModalIndex === null) {
      setFlashModalEntered(false);
      return;
    }
    setFlashModalEntered(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlashModalEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [flashModalIndex]);

  return (
    <div className="space-y-7">
      {!isUrduUI ? (
        <div className="flex justify-end">
          <SpeakButton
            text={mainMarkdown}
            lang={speechLang}
            label="Listen to lesson"
          />
        </div>
      ) : null}

      {/* ── Flashcard Panel ──────────────────────────────────────────────── */}
      {flashcards.length > 0 && (
        <section className="rounded-2xl border border-[#c3bebb]/40 overflow-hidden shadow-sm bg-[#ebe8e6]">
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 md:px-6 md:py-5 border-b border-[#c3bebb]/35 text-white"
            style={{ backgroundColor: HEADER_BROWN }}
          >
            <div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Flashcards</h3>
              <p className="text-sm md:text-base text-white/90 mt-1 max-w-xl">
                Quick revision cards from this lesson. Click a card to open it with the full answer.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
                {flashcards.length} cards
              </span>
              <button
                type="button"
                onClick={() => setShowFlashcards((v) => !v)}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-gray-900 text-sm md:text-base font-bold hover:bg-[#f4f3f2] transition-colors shadow-md"
              >
                {showFlashcards ? "Hide cards" : "Show cards"}
              </button>
            </div>
          </div>

          {showFlashcards && (
            <div className="grid grid-cols-1 gap-4 bg-[#ebe8e6] p-5 sm:grid-cols-2 md:gap-5 md:p-6 lg:grid-cols-3">
              {flashcards.map((card, idx) => (
                <button
                  key={`${card.front}-${idx}`}
                  type="button"
                  onClick={() => setFlashModalIndex(idx)}
                  className="group flex min-h-[10.5rem] flex-col rounded-xl border border-[#c3bebb]/40 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#968e8a] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#968e8a] md:min-h-[11rem] md:p-5"
                  aria-label={`Open flashcard: ${card.front}`}
                >
                  <p className="line-clamp-3 text-base font-bold leading-snug text-gray-900 md:text-lg">{card.front}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600 md:text-base">{card.back}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {flashModalIndex !== null && flashcards[flashModalIndex] && (
        <FlashcardModal
          card={flashcards[flashModalIndex]}
          entered={flashModalEntered}
          onClose={() => setFlashModalIndex(null)}
        />
      )}

      {/* ── Content Sections ─────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <SectionAccordion
              key={section.id}
              section={section}
              index={idx}
              defaultOpen={true}
            />
          ))}
        </div>
      )}

      {/* ── Recommended Resources ────────────────────────────────────────── */}
      {resources.length > 0 && (
        <section className="rounded-2xl border border-[#c3bebb]/40 overflow-hidden shadow-sm bg-[#ebe8e6]">
          <div
            className="px-5 py-4 md:px-6 md:py-5 border-b border-[#c3bebb]/35 text-white"
            style={{ backgroundColor: HEADER_BROWN }}
          >
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">
              {isUrduUI ? "تجویز کردہ ذرائع" : "Recommended learning resources"}
            </h3>
            <p className="text-sm md:text-base text-white/90 mt-1.5 max-w-3xl leading-relaxed">
              {helperText ||
                (isUrduUI
                  ? "یہ لنکس نئے ٹیب میں کھلیں گے۔ یوٹیوب ویڈیوز کے لیے تھمب نیل دکھایا گیا ہے۔"
                  : "Curated links to deepen your understanding of this topic. YouTube items show thumbnails; all links open in a new tab.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 md:p-5 lg:grid-cols-3">
            {[...resources]
              .sort((a, b) => {
                const score = (r: ResourceItem) => (extractYouTubeVideoId(r.url) ? 1 : 0);
                return score(b) - score(a);
              })
              .map((resource, idx) => (
                <ResourceCard key={`${resource.url}-${idx}`} resource={resource} isUrdu={isUrduUI} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
