"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { isUrdu } from "@/lib/uiLanguage";
import { backendUrl } from "@/lib/backendUrl";
import { urduFont } from "@/lib/urduFont";

interface SubSubtopic {
  id: string;
  title: string;
  contentKey: string;
}

interface Subtopic {
  id: string;
  title: string;
  contentKey: string;
  subSubtopics?: SubSubtopic[];
}

interface Topic {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

function normalizeProgressKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildFlatContentKeys(topics: Topic[]): { contentKey: string; globalIndex: number }[] {
  const list: { contentKey: string; globalIndex: number }[] = [];
  let index = 0;
  topics.forEach((topic) => {
    topic.subtopics.forEach((sub) => {
      if (sub.subSubtopics?.length) {
        sub.subSubtopics.forEach((ss) => {
          list.push({ contentKey: ss.contentKey, globalIndex: index++ });
        });
      } else {
        list.push({ contentKey: sub.contentKey, globalIndex: index++ });
      }
    });
  });
  return list;
}

const FOUNDATION_BROWN = "#968e8a";
const courseContentPanelClass =
  "rounded-2xl border border-gray-200/70 bg-[#f4f3f2] overflow-hidden shadow-none";
const curriculumBodyTextClass = "text-gray-600 text-lg leading-relaxed";

/** Extra spacing between Ref. and Topic columns */
const tableRefHeadClass =
  "text-left pl-4 pr-8 sm:pr-10 py-3 text-base font-bold text-white whitespace-nowrap";
const tableTopicHeadClass = "text-left pl-2 sm:pl-4 pr-4 py-3 text-base font-bold text-white";
const tableRefCellClass =
  "pl-4 pr-8 sm:pr-10 py-3 align-middle text-[#5c5755] w-20 shrink-0 tabular-nums";
const tableTopicCellClass = "pl-2 sm:pl-4 pr-4 py-3 align-middle min-w-0";

/** Expanded sub-rows: same typography as Course 1/2 nested lesson rows */
const subtopicRefCellClass =
  "pl-4 pr-6 sm:pr-8 py-1.5 align-top text-[#5c5755] shrink-0 tabular-nums text-xs font-mono font-semibold min-w-[4rem]";
const subtopicTopicCellClass =
  "pl-2 sm:pl-3 pr-3 py-1.5 align-top min-w-0";
const subtopicLockCellClass =
  "pl-2 pr-4 sm:pr-5 py-1.5 align-top text-right w-10 shrink-0";

/** Sub-subtopic rows: Topic text aligns with parent title (after expand chevron + gap), not with chevron */
const subtopicNestedChildTopicCellClass =
  "pl-10 sm:pl-11 pr-3 py-1.5 align-top min-w-0";

const nestedSubtopicRowClass =
  "border-b border-gray-300/30 bg-[#faf8f7] hover:bg-[#f0ebe8]/90 transition-colors";

/** Display refs like Course 2: "1.1", nested "1.2.1"; not raw API/content keys */
function lessonDisplayRef(topicId: string, subOrdinal: number, subSubOrdinal?: number): string {
  if (subSubOrdinal !== undefined) return `${topicId}.${subOrdinal}.${subSubOrdinal}`;
  return `${topicId}.${subOrdinal}`;
}

const PROGRESS_FETCH_MS = 8_000;

export default function Course3LearnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);
  const userProgressId = ((user as { userId?: string; email?: string } | null)?.userId ??
    "").toString();
  const userProgressEmail =
    ((user as { email?: string } | null)?.email ?? "").toString();
  const [completedContentSet, setCompletedContentSet] = useState<Set<string>>(new Set());
  /** Must end up false without a logged-in user, or expanded lesson rows skeleton forever */
  const [progressLoading, setProgressLoading] = useState(false);
  const [semester, setSemester] = useState<"1" | "2">("1");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({});
  const [openSubtopics, setOpenSubtopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/course3/toc?semester=" + semester)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load curriculum");
        return res.json();
      })
      .then((data: { topics: Topic[] }) => {
        setTopics(data.topics);
        const uId = userProgressId.trim();
        const uEm = userProgressEmail.trim();
        if (uId || uEm) {
          const allSubtopics = data.topics.flatMap((t) =>
            t.subtopics.flatMap((s) =>
              s.subSubtopics?.length ? s.subSubtopics.map((ss) => ss.contentKey) : [s.contentKey]
            )
          );
          const initCtl = new AbortController();
          const initDeadline = window.setTimeout(() => initCtl.abort(), PROGRESS_FETCH_MS);
          fetch(backendUrl("/api/user/course-progress/init"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: uId || undefined,
              email: uEm || undefined,
              course: "Course 3",
              subtopics: allSubtopics,
            }),
            signal: initCtl.signal,
          })
            .catch(() => {})
            .finally(() => clearTimeout(initDeadline));
        }
        const initialTopics: Record<string, boolean> = {};
        const initialSubtopics: Record<string, boolean> = {};
        data.topics.forEach((t) => {
          initialTopics[t.id] = false;
          t.subtopics.forEach((s) => {
            if (s.subSubtopics?.length) initialSubtopics[s.id] = false;
          });
        });
        setOpenTopics(initialTopics);
        setOpenSubtopics(initialSubtopics);
      })
      .catch(() => setError("Failed to load table of contents"))
      .finally(() => setLoading(false));
  }, [semester, userProgressId, userProgressEmail]);

  const toggleTopic = (id: string) => {
    setOpenTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubtopic = (id: string) => {
    setOpenSubtopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const flatContentKeys = useMemo(() => buildFlatContentKeys(topics), [topics]);

  /** Course 3 PDF blends theory + practical; split topic list for layout matching Course 1/2. */
  const theoryTopicsPartition = useMemo(() => {
    if (topics.length === 0) return [];
    const mid = Math.ceil(topics.length / 2);
    return topics.slice(0, mid);
  }, [topics]);

  const practicalTopicsPartition = useMemo(() => {
    if (topics.length === 0) return [];
    const mid = Math.ceil(topics.length / 2);
    return topics.slice(mid);
  }, [topics]);
  const maxUnlockedIndex = useMemo(() => {
    let contiguousCompleted = 0;
    for (const item of flatContentKeys) {
      if (completedContentSet.has(normalizeProgressKey(item.contentKey))) {
        contiguousCompleted += 1;
        continue;
      }
      break;
    }
    return contiguousCompleted; // immediate next topic after contiguous completed block
  }, [flatContentKeys, completedContentSet]);

  const isContentLocked = (contentKey: string): boolean => {
    const found = flatContentKeys.find((f) => f.contentKey === contentKey);
    if (!found) return true;
    const isStudied = completedContentSet.has(normalizeProgressKey(contentKey));
    return !isStudied && found.globalIndex > maxUnlockedIndex;
  };

  useEffect(() => {
    if (!userProgressId && !userProgressEmail) {
      setCompletedContentSet(new Set());
      setProgressLoading(false);
      return;
    }
    const uid = userProgressId;
    const em = userProgressEmail;

    const refreshProgress = (silent = false) => {
      if (!silent) setProgressLoading(true);
      const ctl = new AbortController();
      const deadline = window.setTimeout(() => ctl.abort(), PROGRESS_FETCH_MS);

      fetch(backendUrl("/api/user/course-progress"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid || undefined,
          email: em || undefined,
          course: "Course 3",
        }),
        signal: ctl.signal,
      })
        .then((r) => (r.ok ? r.json() : Promise.resolve({ subtopics: {} })))
        .then((d: { subtopics?: Record<string, { hasContent?: boolean; studied?: boolean }> }) => {
          const completed = Object.entries(d.subtopics || {})
            .filter(([, meta]) => Boolean(meta?.hasContent) || Boolean(meta?.studied))
            .map(([subtopic]) => normalizeProgressKey(subtopic));
          setCompletedContentSet(new Set(completed));
        })
        .catch(() => {})
        .finally(() => {
          clearTimeout(deadline);
          setProgressLoading(false);
        });
    };
    refreshProgress();

    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshProgress(true);
    };
    const onFocus = () => refreshProgress(true);
    const onPageShow = () => refreshProgress(true);
    const onProgressSync = () => refreshProgress(true);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("teachus:progress-updated", onProgressSync);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("teachus:progress-updated", onProgressSync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userProgressId, userProgressEmail]);

  const goToContent = (contentKey: string, topicTitle?: string) => {
    if (isContentLocked(contentKey)) return;
    const params = new URLSearchParams({ semester, title: contentKey });
    if (topicTitle) params.set("topic", topicTitle);
    router.push("/course3/content?" + params.toString());
  };

  const renderLessonSkeletonRows = (topicId: string, count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <tr key={`sk-${topicId}-${i}`} className="border-b border-gray-300/35 bg-[#faf8f7]">
        <td className={`${subtopicRefCellClass} w-24`}>
          <div className="h-3 rounded bg-gray-200 animate-pulse w-12" />
        </td>
        <td className={`${subtopicTopicCellClass}`} colSpan={2}>
          <div className="h-3 rounded bg-gray-200 animate-pulse max-w-xl" />
        </td>
      </tr>
    ));

  const lessonBtnClassName = (locked: boolean) =>
    `text-left text-sm font-normal leading-snug rounded px-0.5 py-px -mx-0.5 transition-colors ${
      locked
        ? "text-gray-400 cursor-not-allowed"
        : "text-gray-800 hover:bg-[#eae4e2]/70 cursor-pointer"
    }`;

  /** Inline `<tr>` siblings in the same table as topic headers (same pattern as Course 1/2). */
  const renderLessonRowsForTopic = (topic: Topic) => {
    if (progressLoading) return renderLessonSkeletonRows(topic.id, topic.subtopics.length);

    return topic.subtopics.flatMap((sub, subIdx) => {
      const si = subIdx + 1;
      const baseRef = lessonDisplayRef(topic.id, si);
      const childrenCount = sub.subSubtopics?.length ?? 0;
      const subOpen = openSubtopics[sub.id];
      const locked = isContentLocked(sub.contentKey);

      if (childrenCount > 0 && sub.subSubtopics) {
        return [
          <tr key={sub.id} className={nestedSubtopicRowClass}>
            <td className={subtopicRefCellClass}>{baseRef}</td>
            <td className={subtopicTopicCellClass}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSubtopic(sub.id)}
                  className="shrink-0 flex items-center justify-center text-gray-500 hover:bg-[#eae4e2]/70 rounded p-1 -ml-1"
                  aria-expanded={subOpen}
                >
                  <ChevronRight
                    className={`w-4 h-4 text-[#968e8a] shrink-0 transform transition-transform duration-300 ${
                      subOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (locked) return;
                    goToContent(sub.contentKey, topic.title);
                  }}
                  disabled={locked}
                  title={locked ? "Complete previous topics first" : undefined}
                  className={`flex-1 min-w-0 self-center ${lessonBtnClassName(locked)}`}
                >
                  <span className="line-clamp-4 leading-snug">{sub.title}</span>
                </button>
              </div>
            </td>
            <td className={subtopicLockCellClass}>
              {locked ? (
                <Lock className="inline-block w-3.5 h-3.5 text-gray-400" aria-hidden />
              ) : null}
            </td>
          </tr>,
          ...(subOpen
            ? sub.subSubtopics.map((subsub, j) => {
                const lockedSub = isContentLocked(subsub.contentKey);
                return (
                  <tr key={subsub.id} className={nestedSubtopicRowClass}>
                    <td className={subtopicRefCellClass}>
                      {lessonDisplayRef(topic.id, si, j + 1)}
                    </td>
                    <td className={subtopicNestedChildTopicCellClass}>
                      <button
                        type="button"
                        onClick={() => {
                          if (lockedSub) return;
                          goToContent(subsub.contentKey, topic.title);
                        }}
                        disabled={lockedSub}
                        title={lockedSub ? "Complete previous topics first" : undefined}
                        className={`w-full ${lessonBtnClassName(lockedSub)}`}
                      >
                        <span className="line-clamp-4">{subsub.title}</span>
                      </button>
                    </td>
                    <td className={subtopicLockCellClass}>
                      {lockedSub ? (
                        <Lock className="inline-block w-3.5 h-3.5 text-gray-400" aria-hidden />
                      ) : null}
                    </td>
                  </tr>
                );
              })
            : []),
        ];
      }

      return [
        <tr key={sub.id} className={nestedSubtopicRowClass}>
          <td className={subtopicRefCellClass}>{baseRef}</td>
          <td className={subtopicTopicCellClass}>
            <button
              type="button"
              onClick={() => {
                if (locked) return;
                goToContent(sub.contentKey, topic.title);
              }}
              disabled={locked}
              title={locked ? "Complete previous topics first" : undefined}
              className={`w-full ${lessonBtnClassName(locked)}`}
            >
              <span className="line-clamp-4">{sub.title}</span>
            </button>
          </td>
          <td className={subtopicLockCellClass}>
            {locked ? (
              <Lock className="inline-block w-3.5 h-3.5 text-gray-400" aria-hidden />
            ) : null}
          </td>
        </tr>,
      ];
    });
  };

  const renderTopicTableRows = (list: Topic[]) =>
    list.map((topic, topicIdx) => {
      const open = openTopics[topic.id];
      const subtopicCount = topic.subtopics.length;
      const zebra = topicIdx % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]";
      return (
        <Fragment key={topic.id}>
          <tr className={`border-b border-gray-300/40 ${zebra}`}>
            <td className={tableRefCellClass}>{topic.id}</td>
            <td className={tableTopicCellClass}>
              <button
                type="button"
                onClick={() => toggleTopic(topic.id)}
                className="w-full flex items-center gap-2 text-left font-medium text-gray-900 text-base hover:opacity-90 transition-opacity"
              >
                <ChevronRight
                  className={`w-4 h-4 text-[#968e8a] shrink-0 transform transition-transform duration-300 ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <span className="leading-snug">{topic.title}</span>
              </button>
            </td>
            <td className="pl-2 pr-4 sm:pr-6 py-3 align-middle text-right tabular-nums text-[#5c5755] shrink-0">
              {subtopicCount} subtopic{subtopicCount !== 1 ? "s" : ""}
            </td>
          </tr>
          {open && renderLessonRowsForTopic(topic)}
        </Fragment>
      );
    });

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? `${urduFont.className} urdu-text` : ""}`}
    >
      <LandingNavbar />

      <header className="px-6 pt-8 pb-10 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 leading-tight">
          Course 3 <span className="text-[#968e8a]">Curriculum Explorer</span>
        </h1>
        <p className={`${curriculumBodyTextClass} max-w-3xl mb-4`}>
          Choose a semester. Theory modules are listed first, then Practical, using the same
          table layout as Course 1 and Course 2. Expand a chapter to view lessons as some lessons
          list nested items. Click a lesson to open its content (theory + practical combined).
        </p>

        <div
          role="tablist"
          className="inline-flex rounded-xl bg-[#ebe8e6] p-1 border border-gray-200/70"
          aria-label="Select semester"
        >
          <button
            role="tab"
            aria-selected={semester === "1"}
            onClick={() => setSemester("1")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              semester === "1"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Semester 1
          </button>
          <button
            role="tab"
            aria-selected={semester === "2"}
            onClick={() => setSemester("2")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              semester === "2"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Semester 2
          </button>
        </div>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-6">
        {loading && (
          <div className={`${courseContentPanelClass} p-8 text-center text-gray-500 text-lg`}>
            Loading curriculum…
          </div>
        )}
        {error && (
          <div className={`${courseContentPanelClass} p-8 text-center text-red-600 text-lg`}>
            {error}
          </div>
        )}
        {!loading && !error && topics.length === 0 && (
          <div className={`${courseContentPanelClass} p-8 text-center text-[#5c5755] text-lg`}>
            No table of contents for this semester yet.
          </div>
        )}
        {!loading && !error && topics.length > 0 && (
          <>
            <section className={courseContentPanelClass}>
              <div className="p-4 md:p-5">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Theory</h2>
                </div>
                <div className="overflow-x-auto rounded-xl bg-[#ebe8e6]">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: FOUNDATION_BROWN }}>
                        <th className={tableRefHeadClass}>Ref.</th>
                        <th className={tableTopicHeadClass}>Topic</th>
                        <th className="text-right pl-2 pr-4 sm:pr-6 py-3 text-base font-bold text-white w-36 shrink-0">
                          Lessons
                        </th>
                      </tr>
                    </thead>
                    <tbody>{renderTopicTableRows(theoryTopicsPartition)}</tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className={courseContentPanelClass}>
              <div className="p-4 md:p-5">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Practical</h2>
                </div>
                <div className="overflow-x-auto rounded-xl bg-[#ebe8e6]">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: FOUNDATION_BROWN }}>
                        <th className={tableRefHeadClass}>Ref.</th>
                        <th className={tableTopicHeadClass}>Topic</th>
                        <th className="text-right pl-2 pr-4 sm:pr-6 py-3 text-base font-bold text-white w-36 shrink-0">
                          Lessons
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {practicalTopicsPartition.length > 0 ? (
                        renderTopicTableRows(practicalTopicsPartition)
                      ) : (
                        <tr className="bg-[#f5f4f3] border-b border-gray-300/40">
                          <td
                            className="px-4 py-8 text-center text-[#5c5755]"
                            colSpan={3}
                          >
                            Additional modules appear in Theory for this semester.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
