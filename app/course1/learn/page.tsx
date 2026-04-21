"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Target, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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

export default function Course1LearnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [studiedSet, setStudiedSet] = useState<Set<string>>(new Set());

  const [toc, setToc] = useState<TocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flatSubtopics = useMemo(
    () => (toc ? buildFlatList(toc) : []),
    [toc]
  );

  const lastCompletedIndex = useMemo(() => {
    const studiedIndices = flatSubtopics
      .filter((f) => studiedSet.has(f.title))
      .map((f) => f.globalIndex);
    return studiedIndices.length ? Math.max(...studiedIndices) : 0;
  }, [flatSubtopics, studiedSet]);

  const maxUnlockedIndex = lastCompletedIndex + 1;

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
    fetch("http://localhost:5000/api/user/course-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: u?.userId,
        email: u?.email,
        course: "Course 1",
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.resolve({ studiedSubtopics: [] })))
      .then((d: { studiedSubtopics?: string[] }) => {
        setStudiedSet(new Set(d.studiedSubtopics || []));
      })
      .catch(() => {});
  }, [user]);

  const toggleTheoryTopic = (id: string) => {
    setOpenTheoryTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const togglePracticalTopic = (id: string) => {
    setOpenPracticalTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSubtopics = (
    topic: TopicGroup,
    section: "theory" | "practical"
  ) => {
    return topic.subtopics.map((sub, index) => {
      const flat = flatSubtopics.find(
        (f) =>
          f.id === sub.id &&
          f.topicId === topic.id &&
          f.section === section
      );
      if (!flat) return null;
      const label = section === "theory" ? `T${topic.id}.${index + 1}` : `P${topic.id}.${index + 1}`;
      const isStudied = studiedSet.has(sub.title);
      const isLocked = !isStudied && flat.globalIndex > maxUnlockedIndex;

      return (
        <li key={sub.id}>
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
            className={`w-full flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors ${
              isLocked
                ? "text-gray-400 cursor-not-allowed bg-gray-100/50"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <span className="text-[10px] font-mono font-semibold text-gray-500 w-16">
              {label}
            </span>
            <span className="flex-1 truncate">{sub.title}</span>
            {isLocked && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
          </button>
        </li>
      );
    });
  };

  if (!toc) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Course 1</p>
                <p className="text-sm font-bold text-gray-900">Automotive Electrical Foundations</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/course1")}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Back to Overview
            </button>
          </div>
        </nav>
        <main className="px-6 pb-16 max-w-7xl mx-auto pt-12">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Course 1</p>
              <p className="text-sm font-bold text-gray-900">Automotive Electrical Foundations</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/course1")}
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
          Course 1 – Curriculum Explorer
        </h1>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed">
          Theory is listed first, then Practical, as per the course curriculum.
          Expand a topic to see subtopics and click any subtopic to open its
          content.
        </p>
      </header>

      <main className="px-6 pb-16 max-w-7xl mx-auto">
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 mb-2">
            <BookOpen className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Theory</h2>
          </div>
          <div className="space-y-4">
            {toc.theoryTopics.map((topic) => {
              const open = openTheoryTopics[topic.id];
              return (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-xl bg-gray-50/80 overflow-hidden transition-shadow duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => toggleTheoryTopic(topic.id)}
                    className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                        {topic.id}
                      </span>
                      <span className="text-sm md:text-base font-semibold text-gray-900">
                        {topic.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {topic.subtopics.length} subtopics
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <ul className="px-3 pb-2 md:px-4 md:pb-3 space-y-1.5 pt-1 bg-gray-50 border-t border-gray-100">
                      {renderSubtopics(topic, "theory")}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6 mt-8">
          <div className="flex items-center gap-2.5 mb-2">
            <BookOpen className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Practical</h2>
          </div>
          <div className="space-y-4">
            {toc.practicalTopics.map((topic) => {
              const open = openPracticalTopics[topic.id];
              return (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-xl bg-gray-50/80 overflow-hidden transition-shadow duration-300 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => togglePracticalTopic(topic.id)}
                    className="w-full flex items-center justify-between px-4 py-3 md:px-5 md:py-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                        {topic.id}
                      </span>
                      <span className="text-sm md:text-base font-semibold text-gray-900">
                        {topic.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {topic.subtopics.length} subtopics
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <ul className="px-3 pb-2 md:px-4 md:pb-3 space-y-1.5 pt-1 bg-gray-50 border-t border-gray-100">
                      {renderSubtopics(topic, "practical")}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
