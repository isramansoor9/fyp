"use client";

import { motion } from "framer-motion";

const sparks = Array.from({ length: 6 });

export default function ContentLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.08) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Animated sparks */}
      {sparks.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-500"
          initial={{
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 300],
            y: [0, -80 - Math.random() * 120, -160 - Math.random() * 100],
            opacity: [0, 1, 0],
            scale: [0, 1.5 + Math.random(), 0],
          }}
          transition={{
            duration: 1.8 + Math.random() * 0.8,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut",
          }}
          style={{ top: "58%", left: "50%" }}
        />
      ))}

      {/* Main icon area */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Outer glow ring */}
        <motion.div
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Lightning bolt icon */}
        <motion.div
          className="relative w-24 h-24 flex items-center justify-center"
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
            {/* Wire coil (left) */}
            <motion.path
              d="M10 32 C10 26 16 20 22 22"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
            />
            {/* Wire coil (right) */}
            <motion.path
              d="M54 32 C54 26 48 20 42 22"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
            />
            {/* Lightning bolt */}
            <motion.path
              d="M36 8 L28 28 L36 28 L28 56 L44 24 L36 24 Z"
              fill="url(#boltGradWhite)"
              stroke="#d97706"
              strokeWidth="1"
              animate={{ opacity: [0.85, 1, 0.85], filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <defs>
              <linearGradient id="boltGradWhite" x1="28" y1="8" x2="36" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Pulsing circuit ring */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-amber-500/30"
          animate={{
            scale: [1, 1.15, 1],
            borderColor: ["rgba(245,158,11,0.2)", "rgba(245,158,11,0.5)", "rgba(245,158,11,0.2)"],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Title */}
        <motion.h2
          className="mt-10 text-xl font-bold text-gray-900 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Preparing Your Lesson
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="mt-2 text-sm text-gray-500 text-center max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Personalizing content for your level...
        </motion.p>

        {/* Animated progress bar */}
        <motion.div
          className="mt-8 w-56 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #d97706, #f59e0b, #d97706)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Bottom chips */}
        <motion.div
          className="mt-6 flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {["Circuits", "Diagnostics", "Safety"].map((label, i) => (
            <motion.span
              key={label}
              className="text-[10px] font-semibold uppercase tracking-widest text-amber-700/70 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
