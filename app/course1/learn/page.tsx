"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LandingNavbar } from "@/app/components/LandingNavbar";
import { isUrdu } from "@/lib/uiLanguage";
import { TocBilingualLabel } from "@/lib/tocUrduDisplay";
import { COURSE1_TOC_URDU } from "@/lib/tocUrdu/course1TocUrdu";

interface Subtopic {
  id: string;
  title: string;
}

interface TopicGroup {
  id: string;
  title: string;
  subtopics: Subtopic[];
}

interface TocData {
  theoryTopics: TopicGroup[];
  practicalTopics: TopicGroup[];
}

interface FlatSubtopic extends Subtopic {
  topicId: string;
  topicTitle: string;
  globalIndex: number;
  section: "theory" | "practical";
}

function normalizeProgressKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildFlatList(data: TocData): FlatSubtopic[] {
  const list: FlatSubtopic[] = [];
  let index = 0;
  data.theoryTopics.forEach((topic) => {
    topic.subtopics.forEach((sub) => {
      list.push({
        ...sub,
        topicId: topic.id,
        topicTitle: topic.title,
        globalIndex: index++,
        section: "theory",
      });
    });
  });
  data.practicalTopics.forEach((topic) => {
    topic.subtopics.forEach((sub) => {
      list.push({
        ...sub,
        topicId: topic.id,
        topicTitle: topic.title,
        globalIndex: index++,
        section: "practical",
      });
    });
  });
  return list;
}

const FOUNDATION_BROWN = "#968e8a";
const courseContentPanelClass =
  "rounded-2xl border border-gray-200/70 bg-[#f4f3f2] overflow-hidden shadow-none";

/** Matches course 1 hero body copy (“Designed for beginners…”) */
const curriculumBodyTextClass = "text-gray-600 text-lg leading-relaxed";

/** Extra spacing between Ref. and Topic columns */
const tableRefHeadClass =
  "text-left pl-4 pr-8 sm:pr-10 py-3 text-base font-bold text-white whitespace-nowrap";
const tableTopicHeadClass = "text-left pl-2 sm:pl-4 pr-4 py-3 text-base font-bold text-white";
const tableRefCellClass =
  "pl-4 pr-8 sm:pr-10 py-3 align-middle text-[#5c5755] w-20 shrink-0 tabular-nums";
const tableTopicCellClass = "pl-2 sm:pl-4 pr-4 py-3 align-middle min-w-0";

/** Expanded sub-rows under a main topic (smaller text + tighter rows than topic header rows) */
const subtopicRefCellClass =
  "pl-4 pr-6 sm:pr-8 py-1.5 align-top text-[#5c5755] shrink-0 tabular-nums text-xs font-mono font-semibold min-w-[4rem]";
const subtopicTopicCellClass =
  "pl-2 sm:pl-3 pr-3 py-1.5 align-top min-w-0";
const subtopicLockCellClass =
  "pl-2 pr-4 sm:pr-5 py-1.5 align-top text-right w-10 shrink-0";

export default function Course1LearnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const urdu = isUrdu((user as { preferredLanguage?: string } | null)?.preferredLanguage);
  const [completedContentSet, setCompletedContentSet] = useState<Set<string>>(new Set());
  const [progressLoading, setProgressLoading] = useState(true);

  const [toc, setToc] = useState<TocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flatSubtopics = useMemo(
    () => (toc ? buildFlatList(toc) : []),
    [toc]
  );

  const maxUnlockedIndex = useMemo(() => {
    let contiguousCompleted = 0;
    for (const item of flatSubtopics) {
      if (completedContentSet.has(normalizeProgressKey(item.title))) {
        contiguousCompleted += 1;
        continue;
      }
      break;
    }
    return contiguousCompleted; // immediate next topic after contiguous completed block
  }, [flatSubtopics, completedContentSet]);

  const [openTheoryTopics, setOpenTheoryTopics] = useState<
    Record<string, boolean>
  >({});
  const [openPracticalTopics, setOpenPracticalTopics] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetch("/api/course1/toc")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load curriculum");
        return res.json();
      })
      .then((data: TocData) => {
        setToc(data);
        const u = user as { userId?: string; email?: string } | null;
        const allSubtopics = [
          ...data.theoryTopics.flatMap((t) => t.subtopics.map((s) => s.title)),
          ...data.practicalTopics.flatMap((t) => t.subtopics.map((s) => s.title)),
        ];
        if (u?.userId || u?.email) {
          fetch("http://localhost:5000/api/user/course-progress/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: u?.userId,
              email: u?.email,
              course: "Course 1",
              subtopics: allSubtopics,
            }),
          }).catch(() => {});
        }
        const theoryOpen: Record<string, boolean> = {};
        data.theoryTopics.forEach((t, i) => {
          theoryOpen[t.id] = i === 0;
        });
        setOpenTheoryTopics(theoryOpen);
        const practicalOpen: Record<string, boolean> = {};
        data.practicalTopics.forEach((t, i) => {
          practicalOpen[t.id] = i === 0;
        });
        setOpenPracticalTopics(practicalOpen);
      })
      .catch(() => setError("Failed to load table of contents"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const u = user as { userId?: string; email?: string; course?: string; courseEnrolled?: string } | null;
    if (!u?.userId && !u?.email) return;
    const refreshProgress = (silent = false) => {
      if (!silent) setProgressLoading(true);
      fetch("http://localhost:5000/api/user/course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u?.userId,
          email: u?.email,
          course: "Course 1",
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.resolve({ subtopics: {} })))
        .then((d: { subtopics?: Record<string, { hasContent?: boolean; studied?: boolean }> }) => {
          const completed = Object.entries(d.subtopics || {})
            .filter(([, meta]) => Boolean(meta?.hasContent) || Boolean(meta?.studied))
            .map(([subtopic]) => normalizeProgressKey(subtopic));
          setCompletedContentSet(new Set(completed));
        })
        .catch(() => {})
        .finally(() => setProgressLoading(false));
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
  }, [user]);

  const toggleTheoryTopic = (id: string) => {
    setOpenTheoryTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const togglePracticalTopic = (id: string) => {
    setOpenPracticalTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSubtopicSkeletonRows = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <tr key={`sk-${i}`} className="border-b border-gray-300/35 bg-[#faf8f7]">
        <td className={`${subtopicRefCellClass} w-24`}>
          <div className="h-3 rounded bg-gray-200 animate-pulse w-12" />
        </td>
        <td className={`${subtopicTopicCellClass}`} colSpan={2}>
          <div className="h-3 rounded bg-gray-200 animate-pulse max-w-xl" />
        </td>
      </tr>
    ));

  const renderSubtopicTableRows = (topic: TopicGroup, section: "theory" | "practical") => {
    if (progressLoading) return renderSubtopicSkeletonRows(topic.subtopics.length);
    return topic.subtopics.flatMap((sub, index) => {
      const flat = flatSubtopics.find(
        (f) =>
          f.id === sub.id &&
          f.topicId === topic.id &&
          f.section === section
      );
      if (!flat) return [];
      /** Same ref format as Course 2 tables: "1.1", "2.3" — no letter prefix */
      const label = `${topic.id}.${index + 1}`;
      const isStudied = completedContentSet.has(normalizeProgressKey(sub.title));
      const isLocked = !isStudied && flat.globalIndex > maxUnlockedIndex;

      return [
        <tr key={sub.id} className="border-b border-gray-300/30 bg-[#faf8f7] hover:bg-[#f0ebe8]/90 transition-colors">
          <td className={subtopicRefCellClass}>{label}</td>
          <td className={subtopicTopicCellClass}>
            <button
              type="button"
              onClick={() => {
                if (isLocked) return;
                router.push(
                  `/course1/content?title=${encodeURIComponent(sub.title)}&topic=${encodeURIComponent(topic.title)}`
                );
              }}
              disabled={isLocked}
              title={isLocked ? "Complete previous topics first" : undefined}
              className={`w-full text-left text-sm font-normal leading-snug rounded px-0.5 py-px -mx-0.5 transition-colors ${
                isLocked
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-800 hover:bg-[#eae4e2]/70 cursor-pointer"
              }`}
            >
              <TocBilingualLabel
                english={sub.title}
                urdu={urdu}
                map={COURSE1_TOC_URDU}
                className="line-clamp-4"
              />
            </button>
          </td>
          <td className={subtopicLockCellClass}>
            {isLocked ? <Lock className="inline-block w-3.5 h-3.5 text-gray-400" aria-hidden /> : null}
          </td>
        </tr>,
      ];
    });
  };

  if (!toc) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? "urdu-text" : ""}`}>
        <LandingNavbar />
        <main className="px-6 pb-16 max-w-7xl mx-auto pt-12">
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500 text-lg">
              Loading curriculum…
            </div>
          )}
          {error && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-red-600 text-lg">
              {error}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600 ${urdu ? "urdu-text" : ""}`}>
      <LandingNavbar />

      <header className="px-6 pt-8 pb-10 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 leading-tight">
          Course 1 <span className="text-[#968e8a]">Curriculum Explorer</span>
        </h1>
        <p className={`${curriculumBodyTextClass} max-w-3xl`}>
          Theory is listed first, then Practical, as per the course curriculum.
          Expand a topic to see subtopics and click any subtopic to open its
          content.
        </p>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto space-y-6">
        <section className={courseContentPanelClass}>
          <div className="p-4 md:p-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{urdu ? "نظریہ" : "Theory"}</h2>
            </div>
            <div className="overflow-x-auto rounded-xl bg-[#ebe8e6]">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: FOUNDATION_BROWN }}>
                    <th className={tableRefHeadClass}>{urdu ? "حوالہ" : "Ref."}</th>
                    <th className={tableTopicHeadClass}>{urdu ? "عنوان" : "Topic"}</th>
                    <th className="text-right pl-2 pr-4 sm:pr-6 py-3 text-base font-bold text-white w-36 shrink-0">
                      {urdu ? "اسباق" : "Lessons"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {toc.theoryTopics.map((topic, topicIdx) => {
                    const open = openTheoryTopics[topic.id];
                    const zebra = topicIdx % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]";
                    return (
                      <Fragment key={topic.id}>
                        <tr className={`border-b border-gray-300/40 ${zebra}`}>
                          <td className={tableRefCellClass}>{topic.id}</td>
                          <td className={tableTopicCellClass}>
                            <button
                              type="button"
                              onClick={() => toggleTheoryTopic(topic.id)}
                              className="w-full flex items-center gap-2 text-left font-medium text-gray-900 text-base hover:opacity-90 transition-opacity"
                            >
                              <ChevronRight
                                className={`w-4 h-4 text-[#968e8a] shrink-0 transform transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                              />
                              <TocBilingualLabel
                                english={topic.title}
                                urdu={urdu}
                                map={COURSE1_TOC_URDU}
                                className="leading-snug"
                              />
                            </button>
                          </td>
                          <td className="pl-2 pr-4 sm:pr-6 py-3 align-middle text-right tabular-nums text-[#5c5755] shrink-0">
                            {topic.subtopics.length}{" "}
                            {urdu ? "ذیلی عنوانات" : "subtopics"}
                          </td>
                        </tr>
                        {open && renderSubtopicTableRows(topic, "theory")}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={courseContentPanelClass}>
          <div className="p-4 md:p-5">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">{urdu ? "عملی" : "Practical"}</h2>
            </div>
            <div className="overflow-x-auto rounded-xl bg-[#ebe8e6]">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: FOUNDATION_BROWN }}>
                    <th className={tableRefHeadClass}>{urdu ? "حوالہ" : "Ref."}</th>
                    <th className={tableTopicHeadClass}>{urdu ? "عنوان" : "Topic"}</th>
                    <th className="text-right pl-2 pr-4 sm:pr-6 py-3 text-base font-bold text-white w-36 shrink-0">
                      {urdu ? "اسباق" : "Lessons"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {toc.practicalTopics.map((topic, topicIdx) => {
                    const open = openPracticalTopics[topic.id];
                    const zebra = topicIdx % 2 === 0 ? "bg-[#f5f4f3]" : "bg-[#e8e4e2]";
                    return (
                      <Fragment key={topic.id}>
                        <tr className={`border-b border-gray-300/40 ${zebra}`}>
                          <td className={tableRefCellClass}>{topic.id}</td>
                          <td className={tableTopicCellClass}>
                            <button
                              type="button"
                              onClick={() => togglePracticalTopic(topic.id)}
                              className="w-full flex items-center gap-2 text-left font-medium text-gray-900 text-base hover:opacity-90 transition-opacity"
                            >
                              <ChevronRight
                                className={`w-4 h-4 text-[#968e8a] shrink-0 transform transition-transform duration-300 ${open ? "rotate-90" : ""}`}
                              />
                              <TocBilingualLabel
                                english={topic.title}
                                urdu={urdu}
                                map={COURSE1_TOC_URDU}
                                className="leading-snug"
                              />
                            </button>
                          </td>
                          <td className="pl-2 pr-4 sm:pr-6 py-3 align-middle text-right tabular-nums text-[#5c5755] shrink-0">
                            {topic.subtopics.length}{" "}
                            {urdu ? "ذیلی عنوانات" : "subtopics"}
                          </td>
                        </tr>
                        {open && renderSubtopicTableRows(topic, "practical")}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
