"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

// ─── Types ─────────────────────────────────────────────────────────────────

type ResourceItem = {
  title: string;
  url: string;
  description?: string;
  kind: "video" | "article" | "resource";
};

type Flashcard = {
  front: string;
  back: string;
  tag: string;
};

type ContentSection = {
  id: string;
  title: string;
  body: string;
  icon: SectionIconKey;
};

type SectionIconKey =
  | "overview"
  | "objectives"
  | "explanation"
  | "keyterms"
  | "diagnostic"
  | "faults"
  | "practice"
  | "safety"
  | "summary"
  | "default";

type Props = {
  content: string;
};

// ─── Constants ──────────────────────────────────────────────────────────────

const RESOURCE_HEADING = "### Personalized Recommendation Resources";

// ─── Section Icon Mapping ───────────────────────────────────────────────────

function classifySection(title: string): SectionIconKey {
  const t = title.toLowerCase();
  if (t.includes("overview") || t.includes("prerequisite") || t.includes("technical")) return "overview";
  if (t.includes("learning objective") || t.includes("objective")) return "objectives";
  if (t.includes("explanation") || t.includes("operational") || t.includes("system-level") || t.includes("concept")) return "explanation";
  if (t.includes("key term") || t.includes("definition") || t.includes("glossary") || t.includes("terminology")) return "keyterms";
  if (t.includes("diagnostic") || t.includes("procedure") || t.includes("step") || t.includes("troubleshoot") || t.includes("fault")) return "faults";
  if (t.includes("practice") || t.includes("exercise") || t.includes("activity") || t.includes("test") || t.includes("assessment")) return "practice";
  if (t.includes("safety") || t.includes("precaution") || t.includes("warning")) return "safety";
  if (t.includes("summary") || t.includes("conclusion") || t.includes("review")) return "summary";
  if (t.includes("introduction") || t.includes("intro")) return "overview";
  return "default";
}

type IconConfig = {
  bg: string;
  border: string;
  accent: string;
  iconColor: string;
  svg: React.ReactNode;
};

function getSectionIcon(key: SectionIconKey): IconConfig {
  const configs: Record<SectionIconKey, IconConfig> = {
    overview: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      accent: "border-l-slate-600",
      iconColor: "text-slate-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M10 2L2 7l8 5 8-5-8-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M2 13l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
    },
    objectives: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      accent: "border-l-blue-500",
      iconColor: "text-blue-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    explanation: {
      bg: "bg-violet-50",
      border: "border-violet-100",
      accent: "border-l-violet-500",
      iconColor: "text-violet-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 9v5M10 6v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    keyterms: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      accent: "border-l-amber-500",
      iconColor: "text-amber-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    diagnostic: {
      bg: "bg-cyan-50",
      border: "border-cyan-100",
      accent: "border-l-cyan-500",
      iconColor: "text-cyan-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    faults: {
      bg: "bg-red-50",
      border: "border-red-100",
      accent: "border-l-red-400",
      iconColor: "text-red-500",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M10 3L2 17h16L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 8v4M10 14v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    practice: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      accent: "border-l-emerald-500",
      iconColor: "text-emerald-600",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M4 5h12M4 10h8M4 15h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    safety: {
      bg: "bg-orange-50",
      border: "border-orange-100",
      accent: "border-l-orange-500",
      iconColor: "text-orange-500",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    summary: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      accent: "border-l-gray-700",
      iconColor: "text-gray-700",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <path d="M5 7l2 2 4-4M5 13l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 8h2M14 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    default: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      accent: "border-l-gray-400",
      iconColor: "text-gray-500",
      svg: (
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7h6M7 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  };
  return configs[key];
}

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
      icon: classifySection(title),
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
    sections.push({ id: "sec-0", title: "Content", body: markdown.trim(), icon: "default" });
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

function prettifyHostTitle(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const base = host.split(".")[0] || "Resource";
    return base.charAt(0).toUpperCase() + base.slice(1);
  } catch {
    return "Recommended Resource";
  }
}

function parseMarkdownResourceLine(line: string): { title?: string; url?: string; description?: string } {
  const markdownLink = line.match(/^\s*-\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\s*(?:-\s*(.+))?\s*$/i);
  if (markdownLink) {
    return { title: markdownLink[1]?.trim(), url: markdownLink[2]?.trim(), description: markdownLink[3]?.trim() };
  }
  const oldStyle = line.match(/^\s*>\s*\d+\.\s*([^:]+):\s*(https?:\/\/\S+)\s*$/i);
  if (oldStyle) {
    return { title: oldStyle[1]?.trim(), url: oldStyle[2]?.trim(), description: "Recommended from your current learning context." };
  }
  const plainUrl = line.match(/(https?:\/\/\S+)/i);
  if (plainUrl) {
    return { url: plainUrl[1]?.trim(), description: "Recommended from your current learning context." };
  }
  return {};
}

function splitContentAndResources(raw: string): { mainMarkdown: string; helperText: string; resources: ResourceItem[] } {
  const lines = raw.split("\n");
  const markerIndex = lines.findIndex((line) => line.trim() === RESOURCE_HEADING);
  if (markerIndex === -1) return { mainMarkdown: raw, helperText: "", resources: [] };

  const mainMarkdown = lines.slice(0, markerIndex).join("\n").trim();
  const sectionLines = lines.slice(markerIndex + 1).filter((line) => line.trim().length > 0);

  let helperText = "";
  const resources: ResourceItem[] = [];
  for (const line of sectionLines) {
    if (!helperText && !line.trim().startsWith("-") && !line.trim().startsWith(">")) {
      helperText = line.trim();
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
    const bodyText = trimSummary(currentBody.join(" ").trim(), 260);
    if (!currentHeading || !bodyText) return;
    cards.push({ front: currentHeading, back: bodyText, tag: "Key Concept" });
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
  return paragraphs.slice(0, 8).map((p, idx) => ({
    front: `Revision Card ${idx + 1}`,
    back: trimSummary(p, 260),
    tag: "Quick Review",
  }));
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ResourceIcon({ kind }: { kind: ResourceItem["kind"] }) {
  if (kind === "video") {
    return (
      <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 10.5L10.5 13.2V7.8L15 10.5Z" fill="currentColor" />
        <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 9L21 7V14L17 12V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4H17L21 8V20H7V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M17 4V8H21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 12H18M10 15H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="6" width="4" height="14" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

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
  const cfg = getSectionIcon(section.icon);

  return (
    <div
      className={`rounded-xl border ${cfg.border} border-l-4 ${cfg.accent} shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors duration-150 ${
          isOpen ? cfg.bg : "bg-white hover:" + cfg.bg
        }`}
        aria-expanded={isOpen}
      >
        {/* Section number badge */}
        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-[11px] font-bold tabular-nums">
          {index + 1}
        </span>

        {/* Icon */}
        <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border ${cfg.border} ${cfg.bg} ${cfg.iconColor}`}>
          {cfg.svg}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-semibold text-gray-900 leading-snug">{section.title}</span>

        {/* Chevron */}
        <span
          className={`shrink-0 transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className={`px-5 pt-3 pb-5 ${cfg.bg} border-t ${cfg.border}`}>
          <div className="prose prose-sm max-w-none text-gray-700 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_h4]:text-sm [&_h4]:font-semibold [&_p]:my-2.5 [&_ul]:my-3 [&_ol]:my-3 [&_li]:ml-5 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-gray-900 [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600">
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function PersonalizedContentRenderer({ content }: Props) {
  const { mainMarkdown, helperText, resources } = splitContentAndResources(content);
  const sections = useMemo(() => parseContentIntoSections(mainMarkdown), [mainMarkdown]);
  const flashcards = useMemo(() => buildFlashcards(mainMarkdown), [mainMarkdown]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6">

      {/* ── Flashcard Panel ──────────────────────────────────────────────── */}
      {flashcards.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
                <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5" aria-hidden="true">
                  <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Flashcards</h3>
                <p className="text-xs text-gray-500 mt-0.5">Quick revision cards from this lesson</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                {flashcards.length} cards
              </span>
              <button
                type="button"
                onClick={() => setShowFlashcards((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors shadow-sm"
              >
                {showFlashcards ? (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Hide
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Show
                  </>
                )}
              </button>
            </div>
          </div>

          {showFlashcards && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
              {flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                return (
                  <button
                    key={`${card.front}-${idx}`}
                    type="button"
                    onClick={() => toggleCard(idx)}
                    className="group h-52 text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded-xl"
                    aria-label={`Flip flashcard ${idx + 1}: ${card.front}`}
                  >
                    <div
                      className={`relative h-full w-full rounded-xl border border-gray-200 shadow-sm transition-[transform,box-shadow,border-color] duration-300 [transform-style:preserve-3d] ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      } group-hover:shadow-md group-hover:border-gray-300`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 rounded-xl bg-white p-5 [backface-visibility:hidden]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 border border-gray-200">
                            {card.tag}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{idx + 1}</span>
                        </div>
                        <div className="h-[calc(100%-2.5rem)] mt-4 flex items-center">
                          <p className="text-base font-semibold text-gray-900 leading-snug">{card.front}</p>
                        </div>
                      </div>
                      {/* Back */}
                      <div className="absolute inset-0 rounded-xl bg-gray-900 p-5 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-white/10 text-gray-200 border border-white/20">
                            Details
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{idx + 1}</span>
                        </div>
                        <div className="mt-4 h-[calc(100%-2.5rem)] overflow-y-auto pr-1">
                          <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">{card.back}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Content Sections ─────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <div className="space-y-3">
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
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3L3 7L12 11L21 7L12 3Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 9.5V14.5C6 16.7 8.7 18.5 12 18.5C15.3 18.5 18 16.7 18 14.5V9.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recommended Learning Resources</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {helperText || "Curated resources to deepen your understanding of this topic."}
              </p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 gap-2.5">
            {resources.map((resource, idx) => (
              <a
                key={`${resource.url}-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5 transition-all duration-150 hover:bg-white hover:border-gray-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                  <ResourceIcon kind={resource.kind} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors leading-snug">
                    {resource.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{resource.description}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5 truncate">{resource.url}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 mt-1 shrink-0 group-hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
