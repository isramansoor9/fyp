"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
  "Always disconnect the negative battery terminal first before working on any electrical circuit.",
  "A multimeter is your most essential tool — master it and you can diagnose almost any fault.",
  "Most electrical failures are caused by poor ground connections, not faulty components.",
  "Voltage drop testing reveals hidden resistance invisible to a simple continuity check.",
  "Color-coded wiring follows ISO standards — learn them once, use them on every vehicle.",
  "Never replace a fuse with a higher-rated one; fuses protect the wiring, not the component.",
  "Alternator output should read 13.5–14.5V at idle — anything outside needs investigation.",
  "A parasitic draw test identifies battery drain that occurs while the vehicle is switched off.",
  "Soldered connections outperform crimps in high-vibration automotive environments.",
  "Always refer to the vehicle wiring diagram before replacing any electrical component.",
  "Heat-shrink tubing gives longer-lasting protection than electrical tape on wire repairs.",
  "Check battery specific gravity with a hydrometer — voltage alone does not tell the full story.",
  "Spark plug gap directly affects combustion efficiency and ignition timing performance.",
  "The ECU communicates over CAN bus — modern auto electricians must understand network protocols.",
  "EFI sensors like MAF and O2 are critical for accurate engine performance diagnosis.",
  "Relay testing with a multimeter can save hours of tracing complex wiring faults.",
  "A charged capacitor holds dangerous voltage even after power is disconnected — always discharge safely.",
  "Inspect starter motor brushes and commutator before condemning the entire unit.",
  "Water in battery cells is a common cause of premature battery failure — check and top up regularly.",
  "After any repair, always verify the fix with a road test and a final voltage check.",
];

const STAGES = [
  "Retrieving your lesson content…",
  "Analysing your learning level…",
  "Building personalised content…",
  "Gathering supporting resources…",
  "Almost ready — finalising your lesson…",
];

// ── SVG icons ──────────────────────────────────────────────────────────────

function WrenchIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden="true">
      <path
        d="M34 6a8 8 0 0 0-7.6 10.4L8.8 34A4 4 0 1 0 14 39.2l17.6-17.6A8 8 0 1 0 34 6z"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="11" cy="37" r="2" fill="currentColor" />
      <circle cx="34" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden="true">
      <rect x="4" y="14" width="36" height="20" rx="3" stroke="currentColor" strokeWidth="2.5" />
      <rect x="40" y="19" width="4" height="10" rx="1.5" fill="currentColor" />
      <path d="M16 24h6M16 24l3-4M16 24l3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 24h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MultimeterIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden="true">
      <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
      <rect x="15" y="11" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="32" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M24 29v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="11" r="1.5" fill="currentColor" />
      <circle cx="32" cy="11" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CircuitIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" aria-hidden="true">
      <path d="M8 24h8M32 24h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="16" y="18" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M24 6v6M24 36v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 64 32" fill="none" className="w-full h-full" aria-hidden="true">
      <path
        d="M4 20 L10 10 C11 8 13 7 15 7 L49 7 C51 7 53 8 54 10 L60 20"
        stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
      <rect x="4" y="20" width="56" height="8" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="14" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M20 7v-4M44 7v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

// ── Spark particles ─────────────────────────────────────────────────────────

const SPARKS = Array.from({ length: 8 }, (_, i) => ({
  angle: (i / 8) * 360,
  delay: i * 0.18,
  radius: 52 + (i % 3) * 10,
  size: i % 2 === 0 ? 3 : 2,
}));

// ── Main component ──────────────────────────────────────────────────────────

export default function ContentLoader({ urdu = false }: { urdu?: boolean }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  // Rotate tips every 4 s
  useEffect(() => {
    const start = Math.floor(Math.random() * TIPS.length);
    setTipIndex(start);
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  // Advance stage every 12 s (max 5 stages)
  useEffect(() => {
    const id = setInterval(() => setStageIndex((i) => Math.min(i + 1, STAGES.length - 1)), 12000);
    return () => clearInterval(id);
  }, []);

  // Cycle icons every 3 s
  useEffect(() => {
    const id = setInterval(() => setIconIndex((i) => (i + 1) % 4), 3000);
    return () => clearInterval(id);
  }, []);

  const icons = [
    <WrenchIcon key="wrench" />,
    <BatteryIcon key="battery" />,
    <MultimeterIcon key="multi" />,
    <CircuitIcon key="circuit" />,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none bg-gradient-to-b from-[#f3f0ee] via-[#e9e5e3] to-[#ddd8d5] text-gray-600">

      {/* ── Subtle grid (same as site pages) ── */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.08) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Soft accent orb (uses site accent #c3bebb) ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 520, height: 520,
          background: "radial-gradient(circle, rgba(195,190,187,0.18) 0%, transparent 70%)",
          top: "50%", left: "50%", x: "-50%", y: "-50%",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Spark ring (black dots) ── */}
      <div className="absolute" style={{ top: "50%", left: "50%" }}>
        {SPARKS.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gray-800"
              style={{ width: s.size, height: s.size, top: -s.size / 2, left: -s.size / 2 }}
              animate={{
                x: [0, Math.cos(rad) * s.radius * 0.6, Math.cos(rad) * s.radius],
                y: [0, Math.sin(rad) * s.radius * 0.6, Math.sin(rad) * s.radius],
                opacity: [0, 0.5, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: s.delay, ease: "easeOut" }}
            />
          );
        })}
      </div>

      {/* ── Car silhouette (bottom decoration) ── */}
      <motion.div
        className="absolute bottom-12 text-gray-300"
        style={{ width: 240 }}
        animate={{ x: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <CarIcon />
      </motion.div>

      {/* ── Main card ── */}
      <div className="relative z-10 flex flex-col items-center px-6 max-w-lg w-full">

        {/* Stage badge — site accent colour */}
        <motion.div
          className="mb-7 px-4 py-1.5 rounded-full border border-gray-300 bg-white text-gray-600 text-[11px] font-semibold uppercase tracking-widest shadow-sm"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {urdu ? "ذاتی سبق تیار ہو رہا ہے" : "Personalising Your Lesson"}
        </motion.div>

        {/* Animated tool icon */}
        <div className="relative mb-6">
          {/* Outer pulsing ring — accent */}
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ margin: -16, borderColor: "#c3bebb" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner circle */}
          <div className="w-24 h-24 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={iconIndex}
                className="w-12 h-12 text-gray-900"
                initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {icons[iconIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Stage label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            className="text-gray-900 text-base font-semibold text-center mb-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Stage dots */}
        <div className="flex gap-1.5 mt-3 mb-7">
          {STAGES.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              style={{ width: i === stageIndex ? 20 : 6 }}
              animate={{ backgroundColor: i <= stageIndex ? "#111827" : "#e5e7eb" }}
            />
          ))}
        </div>

        {/* Progress bar — black shimmer */}
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mb-7">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #c3bebb, #111827, #c3bebb)" }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Tip card — white card with site border style */}
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border border-gray-200 bg-gray-50">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-gray-600">
                <path d="M6 1v5l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {urdu ? "آٹو الیکٹریشن ٹپ" : "Auto Electrician Tip"}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              className="text-sm text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-0.5 flex-1 rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-gray-800"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i === tipIndex % 5 ? 1 : 0 }}
                  transition={{ duration: 4, ease: "linear" }}
                  style={{ originX: 0 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Tag chips — site gray palette */}
        <motion.div
          className="mt-5 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {(urdu
            ? ["آٹو الیکٹریکل", "ذاتی مواد", "AI سبق", "وائرنگ", "ڈائیگنوسٹکس"]
            : ["Auto Electrical", "Personalised", "AI Lesson", "Wiring", "Diagnostics"]
          ).map((tag, i) => (
            <motion.span
              key={tag}
              className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-gray-200 text-gray-500 bg-white"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity }}
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
