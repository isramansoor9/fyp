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
};

type Props = {
  content: string;
};

// ─── Constants (aligned with curriculum / learn table browns) ───────────────

const RESOURCE_HEADING = "### Personalized Recommendation Resources";

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
  "[&_blockquote]:border-l-4 [&_blockquote]:border-[#c3bebb] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700";

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
            <ReactMarkdown>{section.body}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: ResourceItem }) {
  const ytId = extractYouTubeVideoId(resource.url);
  const kindLabel = resource.kind === "video" ? "Video" : resource.kind === "article" ? "Article" : "Link";

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#c3bebb]/35 bg-[#faf8f7] shadow-sm transition-all duration-200 hover:border-[#968e8a]/55 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#968e8a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ebe8e6]"
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
        <p className="mt-auto truncate pt-3 font-mono text-[11px] text-[#5c5755] md:text-xs" title={resource.url}>
          {resource.url}
        </p>
      </div>
    </a>
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
    <div className="space-y-7">

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
                Quick revision cards built from this lesson. Tap a card to flip it.
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
            <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 bg-[#ebe8e6]">
              {flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                const cardTint = idx % 2 === 0 ? "bg-[#faf8f7]" : "bg-[#f0ebe8]";
                const backTint = idx % 2 === 0 ? "bg-[#e8e4e2]" : "bg-[#ddd8d5]";
                return (
                  <button
                    key={`${card.front}-${idx}`}
                    type="button"
                    onClick={() => toggleCard(idx)}
                    className="group min-h-[14rem] md:min-h-[15rem] text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#968e8a] rounded-xl"
                    aria-label={`Flip flashcard ${idx + 1}: ${card.front}`}
                  >
                    <div
                      className={`relative h-full min-h-[14rem] md:min-h-[15rem] w-full rounded-xl border border-[#c3bebb]/35 shadow-sm transition-[transform,box-shadow] duration-300 [transform-style:preserve-3d] ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      } group-hover:shadow-md`}
                    >
                      <div className={`absolute inset-0 rounded-xl ${cardTint} p-5 md:p-6 [backface-visibility:hidden] border border-[#c3bebb]/25`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-[#ebe8e6] text-[#5c5755] border border-[#c3bebb]/40">
                            {card.tag}
                          </span>
                          <span className="text-sm text-[#968e8a] font-bold tabular-nums">{idx + 1}</span>
                        </div>
                        <div className="mt-5 flex items-center min-h-[5rem]">
                          <p className="text-lg md:text-xl font-bold text-gray-900 leading-snug">{card.front}</p>
                        </div>
                      </div>
                      <div
                        className={`absolute inset-0 rounded-xl ${backTint} p-5 md:p-6 text-gray-900 [transform:rotateY(180deg)] [backface-visibility:hidden] border border-[#c3bebb]/35`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-[#c3bebb]/25 text-[#5c5755] border border-[#c3bebb]/40">
                            Answer
                          </span>
                          <span className="text-sm text-[#968e8a] font-bold tabular-nums">{idx + 1}</span>
                        </div>
                        <div className="mt-4 max-h-[11rem] overflow-y-auto pr-1">
                          <p className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">{card.back}</p>
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
            <h3 className="text-xl md:text-2xl font-bold tracking-tight">Recommended learning resources</h3>
            <p className="text-sm md:text-base text-white/90 mt-1.5 max-w-3xl leading-relaxed">
              {helperText || "Curated links to deepen your understanding of this topic."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 md:p-5 lg:grid-cols-3">
            {[...resources]
              .sort((a, b) => {
                const score = (r: ResourceItem) => (extractYouTubeVideoId(r.url) ? 1 : 0);
                return score(b) - score(a);
              })
              .map((resource, idx) => (
                <ResourceCard key={`${resource.url}-${idx}`} resource={resource} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
