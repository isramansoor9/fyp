"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Target, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

export default function Course3LearnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [completedContentSet, setCompletedContentSet] = useState<Set<string>>(new Set());
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
        const u = user as { userId?: string; email?: string } | null;
        if (u?.userId || u?.email) {
          const allSubtopics = data.topics.flatMap((t) =>
            t.subtopics.flatMap((s) =>
              s.subSubtopics?.length ? s.subSubtopics.map((ss) => ss.contentKey) : [s.contentKey]
            )
          );
          fetch("http://localhost:5000/api/user/course-progress/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: u?.userId,
              email: u?.email,
              course: "Course 3",
              subtopics: allSubtopics,
            }),
          }).catch(() => {});
        }
        const initialTopics: Record<string, boolean> = {};
        const initialSubtopics: Record<string, boolean> = {};
        data.topics.forEach((t, i) => {
          initialTopics[t.id] = i === 0;
          t.subtopics.forEach((s) => {
            if (s.subSubtopics?.length) initialSubtopics[s.id] = false;
          });
        });
        setOpenTopics(initialTopics);
        setOpenSubtopics(initialSubtopics);
      })
      .catch(() => setError("Failed to load table of contents"))
      .finally(() => setLoading(false));
  }, [semester, user]);

  const toggleTopic = (id: string) => {
    setOpenTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubtopic = (id: string) => {
    setOpenSubtopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const flatContentKeys = useMemo(() => buildFlatContentKeys(topics), [topics]);
  const lastCompletedIndex = useMemo(() => {
    const studiedIndices = flatContentKeys
      .filter((f) => completedContentSet.has(f.contentKey))
      .map((f) => f.globalIndex);
    return studiedIndices.length ? Math.max(...studiedIndices) : -1;
  }, [flatContentKeys, completedContentSet]);
  const maxUnlockedIndex = lastCompletedIndex + 1;

  const isContentLocked = (contentKey: string): boolean => {
    const found = flatContentKeys.find((f) => f.contentKey === contentKey);
    if (!found) return true;
    const isStudied = completedContentSet.has(contentKey);
    return !isStudied && found.globalIndex > maxUnlockedIndex;
  };

  useEffect(() => {
    const u = user as { userId?: string; email?: string } | null;
    if (!u?.userId && !u?.email) return;
    const refreshProgress = () => {
      fetch("http://localhost:5000/api/user/course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u?.userId,
          email: u?.email,
          course: "Course 3",
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.resolve({ subtopics: {} })))
        .then((d: { subtopics?: Record<string, { hasContent?: boolean }> }) => {
          const completed = Object.entries(d.subtopics || {})
            .filter(([, meta]) => Boolean(meta?.hasContent))
            .map(([subtopic]) => subtopic);
          setCompletedContentSet(new Set(completed));
        })
        .catch(() => {});
    };
    refreshProgress();

    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshProgress();
    };
    const onFocus = () => refreshProgress();
    const onPageShow = () => refreshProgress();
    const onProgressSync = () => refreshProgress();
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

  const goToContent = (contentKey: string, topicTitle?: string) => {
    if (isContentLocked(contentKey)) return;
    const params = new URLSearchParams({ semester, title: contentKey });
    if (topicTitle) params.set("topic", topicTitle);
    router.push("/course3/content?" + params.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Course 3</p>
              <p className="text-sm font-bold text-gray-900">Auto Electrician G-III Level</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/course3")}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Overview
          </button>
        </div>
      </nav>

      <header className="px-6 pt-12 pb-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-gray-700" />
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-gray-500">
            Structured Learning Path
          </p>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Course 3 – Curriculum Explorer
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed mb-2">
          Select a semester, then expand topics to view subtopics. Some subtopics
          have sub-subtopics. Click any item to open its content (Theory + Practical).
        </p>

        <div className="mt-6 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600">Semester</span>
          <div
            role="tablist"
            className="inline-flex rounded-xl bg-gray-100 p-1 shadow-inner"
            aria-label="Select semester"
          >
            <button
              role="tab"
              aria-selected={semester === "1"}
              onClick={() => setSemester("1")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                semester === "1"
                  ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-200/80"
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
                  ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-200/80"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semester 2
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-gray-500">
            Loading curriculum…
          </div>
        )}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center text-red-600">
            {error}
          </div>
        )}
        {!loading && !error && topics.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <BookOpen className="w-5 h-5 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">
                Topics (Theory + Practical)
              </h2>
            </div>
            <div className="space-y-4">
              {topics.map((topic) => {
                const open = openTopics[topic.id];
                const subtopicCount = topic.subtopics.length;
                return (
                  <div
                    key={topic.id}
                    className="border border-gray-200 rounded-xl bg-gray-50/80 overflow-hidden transition-shadow duration-300 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                          Topic {topic.id}
                        </span>
                        <span className="text-sm md:text-base font-semibold text-gray-900">
                          {topic.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {subtopicCount} subtopic{subtopicCount !== 1 ? "s" : ""}
                      </span>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                          open ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {open && (
                      <ul className="px-4 pb-4 md:px-5 md:pb-5 pt-1 space-y-1 bg-gray-50 border-t border-gray-100">
                        {topic.subtopics.map((sub) => {
                          const hasChildren = sub.subSubtopics && sub.subSubtopics.length > 0;
                          const subOpen = openSubtopics[sub.id];

                          if (hasChildren) {
                            return (
                              <li key={sub.id} className="space-y-0.5">
                                <div className="flex items-center gap-1 rounded-md overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => toggleSubtopic(sub.id)}
                                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200/80"
                                    aria-expanded={subOpen}
                                  >
                                    <ChevronRight
                                      className={`w-4 h-4 transition-transform duration-200 ${
                                        subOpen ? "rotate-90" : ""
                                      }`}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => goToContent(sub.contentKey, topic.title)}
                                    disabled={isContentLocked(sub.contentKey)}
                                    title={isContentLocked(sub.contentKey) ? "Complete previous topics first" : undefined}
                                    className={`flex-1 flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors min-w-0 ${
                                      isContentLocked(sub.contentKey)
                                        ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                                        : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                                    }`}
                                  >
                                    <span className="text-[10px] font-mono font-semibold text-gray-500 w-14 flex-shrink-0">
                                      {sub.id}
                                    </span>
                                    <span className="flex-1 truncate">{sub.title}</span>
                                    {isContentLocked(sub.contentKey) && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                                  </button>
                                </div>
                                {subOpen && sub.subSubtopics && (
                                  <ul className="ml-6 pl-3 border-l-2 border-gray-200 space-y-0.5">
                                    {sub.subSubtopics.map((subsub) => (
                                      <li key={subsub.id}>
                                        <button
                                          type="button"
                                          onClick={() => goToContent(subsub.contentKey, topic.title)}
                                          disabled={isContentLocked(subsub.contentKey)}
                                          title={isContentLocked(subsub.contentKey) ? "Complete previous topics first" : undefined}
                                          className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                                            isContentLocked(subsub.contentKey)
                                              ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                                              : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                                          }`}
                                        >
                                          <span className="text-[10px] font-mono font-semibold text-gray-500 w-14 flex-shrink-0">
                                            {subsub.id}
                                          </span>
                                          <span className="flex-1 truncate">{subsub.title}</span>
                                          {isContentLocked(subsub.contentKey) && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          }

                          return (
                            <li key={sub.id}>
                              <button
                                type="button"
                                onClick={() => goToContent(sub.contentKey, topic.title)}
                                disabled={isContentLocked(sub.contentKey)}
                                title={isContentLocked(sub.contentKey) ? "Complete previous topics first" : undefined}
                                className={`w-full flex items-center gap-2 rounded-md pl-9 pr-3 py-2 text-left text-sm transition-colors ${
                                  isContentLocked(sub.contentKey)
                                    ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                                    : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                                }`}
                              >
                                <span className="text-[10px] font-mono font-semibold text-gray-500 w-14 flex-shrink-0">
                                  {sub.id}
                                </span>
                                <span className="flex-1 truncate">{sub.title}</span>
                                {isContentLocked(sub.contentKey) && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
