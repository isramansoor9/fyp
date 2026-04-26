"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

type ResourceItem = {
  title: string;
  url: string;
  description?: string;
  kind: "video" | "article" | "resource";
};

type Props = {
  content: string;
};

type Flashcard = {
  front: string;
  back: string;
  tag: string;
};

const RESOURCE_HEADING = "### Personalized Recommendation Resources";

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
    return {
      title: markdownLink[1]?.trim(),
      url: markdownLink[2]?.trim(),
      description: markdownLink[3]?.trim(),
    };
  }

  const oldStyle = line.match(/^\s*>\s*\d+\.\s*([^:]+):\s*(https?:\/\/\S+)\s*$/i);
  if (oldStyle) {
    return {
      title: oldStyle[1]?.trim(),
      url: oldStyle[2]?.trim(),
      description: "Recommended from your current learning context.",
    };
  }

  const plainUrl = line.match(/(https?:\/\/\S+)/i);
  if (plainUrl) {
    return {
      title: undefined,
      url: plainUrl[1]?.trim(),
      description: "Recommended from your current learning context.",
    };
  }

  return {};
}

function splitContentAndResources(raw: string): { mainMarkdown: string; helperText: string; resources: ResourceItem[] } {
  const lines = raw.split("\n");
  const markerIndex = lines.findIndex((line) => line.trim() === RESOURCE_HEADING);
  if (markerIndex === -1) {
    return { mainMarkdown: raw, helperText: "", resources: [] };
  }

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
    cards.push({
      front: currentHeading,
      back: bodyText,
      tag: "Key Concept",
    });
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

  // Fallback: build cards from paragraph chunks if markdown has no clear headings.
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

export default function PersonalizedContentRenderer({ content }: Props) {
  const { mainMarkdown, helperText, resources } = splitContentAndResources(content);
  const flashcards = useMemo(() => buildFlashcards(mainMarkdown), [mainMarkdown]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (idx: number) => {
    setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="content-body text-gray-700 leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_h1,h2,h3]:mt-6 [&_h1,h2,h3]:mb-3 [&_p]:my-3 [&_ul]:my-4 [&_li]:ml-6 [&_li]:my-1 [&_strong]:font-semibold [&_strong]:text-gray-900">
      {flashcards.length > 0 && (
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Flashcards</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Focused revision cards generated from this lesson. Open a card to review key points without losing your place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700">
                  {flashcards.length} cards
                </span>
                <button
                  type="button"
                  onClick={() => setShowFlashcards((v) => !v)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-semibold shadow-sm hover:bg-gray-800 transition-colors"
                >
                  {showFlashcards ? "Hide Flashcards" : "Show Flashcards"}
                </button>
              </div>
            </div>
          </div>

          {showFlashcards && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {flashcards.map((card, idx) => {
                const isFlipped = !!flippedCards[idx];
                return (
                  <button
                    key={`${card.front}-${idx}`}
                    type="button"
                    onClick={() => toggleCard(idx)}
                    className="group h-56 text-left [perspective:1200px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded-xl"
                    aria-label={`Flip flashcard ${idx + 1}: ${card.front}`}
                  >
                    <div
                      className={`relative h-full w-full rounded-xl border border-gray-200 shadow-sm transition-[transform,box-shadow,border-color] duration-300 [transform-style:preserve-3d] ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      } group-hover:shadow-md group-hover:border-gray-300`}
                    >
                      <div className="absolute inset-0 rounded-xl bg-white p-5 [backface-visibility:hidden]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                            {card.tag}
                          </span>
                          <span className="text-xs text-gray-400">{idx + 1}</span>
                        </div>
                        <div className="h-[calc(100%-2.5rem)] mt-4 flex items-center">
                          <p className="text-base md:text-lg font-semibold text-gray-900 leading-snug">
                            {card.front}
                          </p>
                        </div>
                    </div>

                      <div className="absolute inset-0 rounded-xl border border-gray-300 bg-gray-900 p-5 text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <div className="flex items-start justify-between gap-3">
                          <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide bg-white/10 text-gray-100 border border-white/20">
                            Details
                          </span>
                          <span className="text-xs text-gray-300">{idx + 1}</span>
                        </div>
                        <div className="mt-4 h-[calc(100%-2.5rem)] overflow-y-auto pr-1">
                          <p className="text-sm leading-relaxed text-gray-100 whitespace-pre-wrap">{card.back}</p>
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

      <ReactMarkdown>{mainMarkdown}</ReactMarkdown>

      {resources.length > 0 && (
        <section className="mt-10 pt-7 border-t border-gray-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3L3 7L12 11L21 7L12 3Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 9.5V14.5C6 16.7 8.7 18.5 12 18.5C15.3 18.5 18 16.7 18 14.5V9.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Recommended Learning Resources</h3>
              <p className="text-sm text-gray-600 mt-1">
                {helperText ||
                  "These resources are selected for this lesson to help you revise faster and close understanding gaps."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {resources.map((resource, idx) => (
              <a
                key={`${resource.url}-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <ResourceIcon kind={resource.kind} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-black transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">{resource.description}</p>
                    <p className="text-xs text-gray-500 mt-2 truncate">{resource.url}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 mt-1 shrink-0 group-hover:text-gray-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
