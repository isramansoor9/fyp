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
  practicalTopics: TopicGroup[];
  theoryTopics: TopicGroup[];
}

function normalizeProgressKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Course 2 TOC per course2.pdf: Theory first, then Practical.
 * Subtopics match PDF wording for content lookup.
 */
const COURSE2_TOC: TocData = {
  theoryTopics: [
    {
      id: "1",
      title: "Introduction to Auto electrician basics",
      subtopics: [
        { id: "1.1", title: "Safety Precautions general and auto electrician shop Firefighting, First aid, Environmental protection, Reasons for workshop accidents Possible causes of accidents in workshop and their safety precautions" },
        { id: "1.2", title: "Introduction to hand tools & equipment used in auto electrician" },
        { id: "1.3", title: "Measuring tools (vernier caliper, feeler gauge)" },
        { id: "1.4", title: "Introduction to Auto motive four stroke engine" },
        { id: "1.5", title: "Basic electricity. (Atomic structure of matter and electricity)" },
        { id: "1.6", title: "Conductor, insulator, semi conductor" },
        { id: "1.7", title: "Current, voltage and resistance" },
        { id: "1.8", title: "Ohm's law" },
        { id: "1.9", title: "Symbols used in electrical wiring" },
        { id: "1.10", title: "Series and parallel circuits" },
        { id: "1.11", title: "Electric circuit problems" },
        { id: "1.12", title: "Magnet, magnetism and electromagnet" },
        { id: "1.13", title: "Relays, solenoid, printed, circuits, circuit breaker, fuse, types of bulb, terminals and switches." },
        { id: "1.14", title: "Diodes and transistors" },
        { id: "1.15", title: "PNP & NPN type semiconductor's" },
        { id: "1.16", title: "Thermistor" },
        { id: "1.17", title: "Logic Gates" },
        { id: "1.18", title: "Sensors and actuators" },
        { id: "1.19", title: "Purpose, Construction and types of battery" },
        { id: "1.20", title: "Charging and discharging of battery" },
        { id: "1.21", title: "Battery rating" },
      ],
    },
    {
      id: "2",
      title: "Starting System of Vehicle",
      subtopics: [
        { id: "2.1", title: "Describe the Purpose, Principle and Construction of starter motor" },
        { id: "2.2", title: "Operation of solenoid switch and motor" },
        { id: "2.3", title: "Neutral safety switch" },
      ],
    },
    {
      id: "3",
      title: "Charging system of Vehicle",
      subtopics: [
        { id: "3.1", title: "Purpose, circuit diagram and Function of Charging Systems" },
        { id: "3.2", title: "Function, construction and operation of alternator" },
        { id: "3.3", title: "Construction and operation of double point voltage regulator" },
        { id: "3.4", title: "Electronic regulators" },
      ],
    },
    {
      id: "4",
      title: "Ignition system of Vehicle",
      subtopics: [
        { id: "4.1", title: "Purpose & types of ignition system" },
        { id: "4.2", title: "Construction of conventional ignition system" },
        { id: "4.3", title: "Ignition switch, Ignition coil, Distributor, Spark plug and its types" },
        { id: "4.4", title: "Capacitor discharge ignition" },
        { id: "4.5", title: "Pickup coil type ignition" },
        { id: "4.6", title: "Multiple coil and distribute less ignition" },
        { id: "4.7", title: "Firing order" },
        { id: "4.8", title: "Ignition timing" },
      ],
    },
    {
      id: "5",
      title: "Wiring Circuits and Accessories",
      subtopics: [
        { id: "5.1", title: "Purpose and construction of Horn circuit, Head lamps circuit, other lights" },
        { id: "5.2", title: "Wind shield wipers/washers circuit" },
        { id: "5.3", title: "Power windows" },
        { id: "5.4", title: "Electric power steering" },
        { id: "5.5", title: "Instrument panel gauges, meters, indicators" },
        { id: "5.6", title: "Introduction to EFI system components (Sensors, ECM & Actuators)" },
        { id: "5.7", title: "Introduction to electronic engine controls" },
      ],
    },
    {
      id: "6",
      title: "Vehicle air conditioning and heating system",
      subtopics: [
        { id: "6.1", title: "Ventilating, Heating, Dehumidifying and Defrosting function of vehicle" },
        { id: "6.2", title: "Components & the working principle of Air conditioner(AC)" },
        { id: "6.3", title: "Working of thermostats switch & Compressor clutch of AC" },
        { id: "6.4", title: "Gas charging of compressor" },
        { id: "6.5", title: "Automatic temperature control" },
        { id: "6.6", title: "Trouble shooting its possible causes and their remedies of Heating system" },
        { id: "6.7", title: "Trouble shooting its possible causes and their remedies of Air conditioner" },
      ],
    },
    {
      id: "7",
      title: "Hybrid & Electric Vehicles",
      subtopics: [
        { id: "7.1", title: "Introduction to hybrid and electric vehicles" },
        { id: "7.2", title: "Types of Hybrid systems" },
        { id: "7.3", title: "Degree of hybridization" },
        { id: "7.4", title: "Charging system & Hybrid vehicle drive train" },
        { id: "7.5", title: "Plug in hybrid and electric vehicles" },
        { id: "7.6", title: "EURO emission standards" },
      ],
    },
  ],
  practicalTopics: [
    {
      id: "1",
      title: "Introduction to Auto electrician basics",
      subtopics: [
        { id: "P1.1", title: "Use of fire extinguisher" },
        { id: "P1.2", title: "Measurement with vernier caliper" },
        { id: "P1.3", title: "Measurement with wire gauge" },
        { id: "P1.4", title: "Soldering (eye joint, lap joint, T Joint)" },
        { id: "P1.5", title: "Use of Multimeter" },
        { id: "P1.6", title: "Crimp connecting" },
        { id: "P1.7", title: "Making test lamp" },
        { id: "P1.8", title: "Studying characteristics of magnets" },
        { id: "P1.9", title: "Interpret wiring diagram and color coding" },
        { id: "P1.10", title: "Making Series and parallel circuits" },
        { id: "P1.11", title: "Check fuse, switch, diode, and transistor" },
        { id: "P1.12", title: "Prepare full wave rectifier" },
        { id: "P1.13", title: "Make Different Logic gate circuits" },
        { id: "P1.14", title: "Checking different ICs" },
        { id: "P1.15", title: "Identify parts of four stroke engine Identification of battery parts" },
        { id: "P1.16", title: "Cleaning and topping up" },
        { id: "P1.17", title: "Checking specific gravity" },
        { id: "P1.18", title: "Battery charging" },
        { id: "P1.19", title: "Preparation of electrolyte" },
        { id: "P1.20", title: "Light load test" },
        { id: "P1.21", title: "Trouble shooting (under charging & overcharging)" },
      ],
    },
    {
      id: "2",
      title: "Starting System of Vehicle",
      subtopics: [
        { id: "P2.1", title: "Wiring up starting circuit" },
        { id: "P2.2", title: "Dismantling, checking of starter motor" },
        { id: "P2.3", title: "Starter motor components, assembling, performance checking" },
        { id: "P2.4", title: "Trouble shooting their possible causes and remedies of starting system" },
      ],
    },
    {
      id: "3",
      title: "Charging system of Vehicle",
      subtopics: [
        { id: "P3.1", title: "Wiring up Charging circuit on wiring board" },
        { id: "P3.2", title: "Charging system inspection & diagnosing" },
        { id: "P3.3", title: "Adjusting alternator belt tension" },
        { id: "P3.4", title: "dismantling, checking and inspection, assembling, of Alternator" },
        { id: "P3.5", title: "Checking output of alternator" },
        { id: "P3.6", title: "Replacing carbon brush" },
        { id: "P3.7", title: "Trouble shooting their possible causes and remedies of charging system" },
      ],
    },
    {
      id: "4",
      title: "Ignition system of Vehicle",
      subtopics: [
        { id: "P4.1", title: "Wiring of conventional ignition system" },
        { id: "P4.2", title: "Replacing C.B points" },
        { id: "P4.3", title: "Setting ignition timing" },
        { id: "P4.4", title: "Use of timing light" },
        { id: "P4.5", title: "Checking of ignition system" },
        { id: "P4.6", title: "Components as ignition coil" },
        { id: "P4.7", title: "Condenser advance mechanism" },
        { id: "P4.8", title: "Servicing of spark plug" },
        { id: "P4.9", title: "Checking & wiring up CDI system components" },
        { id: "P4.10", title: "Trouble shooting their possible causes and remedies of ignition system" },
      ],
    },
    {
      id: "5",
      title: "Wiring Circuits and Accessories",
      subtopics: [
        { id: "P5.1", title: "Wiring up Head lamp circuit" },
        { id: "P5.2", title: "Replacing fuses, switches and blubs" },
        { id: "P5.3", title: "Head lamp aiming" },
        { id: "P5.4", title: "Wiring up Parking light circuit" },
        { id: "P5.5", title: "Wiring up Indicator circuit & Hazard warning circuit" },
        { id: "P5.6", title: "Wiring up Brake & backup light circuit" },
        { id: "P5.7", title: "Wiring up Door and roof light circuit" },
        { id: "P5.8", title: "Wiring up Horn circuit" },
        { id: "P5.9", title: "Wiring up wind shield wiper and washer circuit" },
        { id: "P5.10", title: "Glow plug circuit and checking" },
        { id: "P5.11", title: "Wiring up gauge circuits (Fuel, Temperature, oil pressure)" },
        { id: "P5.12", title: "Parts identification and finding resistance of EFI components" },
        { id: "P5.13", title: "Removing & refitting of different sensors & vales used in EFI system" },
        { id: "P5.14", title: "Dismantling, Servicing & Reassembling different sensors & valves of EFI System" },
        { id: "P5.15", title: "Removing, Servicing & refitting EFI fuel feed pump" },
        { id: "P5.16", title: "Fault diagnosing in EFI System of different vehicles" },
      ],
    },
    {
      id: "6",
      title: "Vehicle air conditioning and heating system",
      subtopics: [
        { id: "P6.1", title: "Removing inspecting & installation of AC compressor" },
        { id: "P6.2", title: "Servicing of Air conditioner" },
        { id: "P6.3", title: "Gas charging of Air conditioner" },
        { id: "P6.4", title: "Servicing of Vehicle Heater" },
      ],
    },
    {
      id: "7",
      title: "Hybrid & Electric Vehicles",
      subtopics: [
        { id: "P7.1", title: "Parts identification of hybrid vehicle" },
        { id: "P7.2", title: "Identification of hybrid vehicle electronic controls" },
        { id: "P7.3", title: "Parts identification of electric vehicle" },
      ],
    },
  ],
};

const toc = COURSE2_TOC;

function buildFlatList(data: TocData) {
  const list: { id: string; title: string; topicId: string; topicTitle: string; globalIndex: number; section: "practical" | "theory" }[] = [];
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

export default function Course2LearnPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [completedContentSet, setCompletedContentSet] = useState<Set<string>>(new Set());
  const [progressLoading, setProgressLoading] = useState(true);
  const flatSubtopics = useMemo(() => buildFlatList(toc), []);
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

  useEffect(() => {
    const u = user as { userId?: string; email?: string } | null;
    if (!u?.userId && !u?.email) return;
    const allSubtopics = [
      ...toc.theoryTopics.flatMap((t) => t.subtopics.map((s) => s.title)),
      ...toc.practicalTopics.flatMap((t) => t.subtopics.map((s) => s.title)),
    ];
    fetch("http://localhost:5000/api/user/course-progress/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: u?.userId,
        email: u?.email,
        course: "Course 2",
        subtopics: allSubtopics,
      }),
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    const u = user as { userId?: string; email?: string } | null;
    if (!u?.userId && !u?.email) return;
    const refreshProgress = (silent = false) => {
      if (!silent) setProgressLoading(true);
      fetch("http://localhost:5000/api/user/course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: u?.userId,
          email: u?.email,
          course: "Course 2",
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

  const [openPracticalTopics, setOpenPracticalTopics] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    toc.practicalTopics.forEach((t, i) => {
      o[t.id] = i === 0;
    });
    return o;
  });
  const [openTheoryTopics, setOpenTheoryTopics] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    toc.theoryTopics.forEach((t, i) => {
      o[t.id] = i === 0;
    });
    return o;
  });

  const togglePractical = (id: string) => {
    setOpenPracticalTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const toggleTheory = (id: string) => {
    setOpenTheoryTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderSubtopicSkeleton = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <li key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md">
        <div className="w-14 h-3 rounded bg-gray-200 animate-pulse shrink-0" />
        <div className="flex-1 h-3 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + (i % 4) * 10}%` }} />
      </li>
    ));

  const renderSubtopics = (topic: TopicGroup, section: "practical" | "theory") => {
    if (progressLoading) return renderSubtopicSkeleton(topic.subtopics.length);
    return topic.subtopics.map((sub, index) => {
      const flat = flatSubtopics.find(
        (f) => f.id === sub.id && f.topicId === topic.id && f.section === section
      );
      if (!flat) return null;
      const label = section === "practical" ? `P${topic.id}.${index + 1}` : `${topic.id}.${index + 1}`;
      const isStudied = completedContentSet.has(normalizeProgressKey(sub.title));
      const isLocked = !isStudied && flat.globalIndex > maxUnlockedIndex;
      return (
        <li key={sub.id}>
          <button
            type="button"
            onClick={() => {
              if (isLocked) return;
              router.push(`/course2/content?title=${encodeURIComponent(sub.title)}&topic=${encodeURIComponent(topic.title)}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Course 2</p>
              <p className="text-sm font-bold text-gray-900">Auto Electrician Curriculum</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/course2")}
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
          Course 2 – Curriculum Explorer
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
                    onClick={() => toggleTheory(topic.id)}
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
                    onClick={() => togglePractical(topic.id)}
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
