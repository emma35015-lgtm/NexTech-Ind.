"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface RocketSeparatorProps {
  label?: string;
  flip?: boolean;
}

export function RocketSeparator({ label, flip = false }: RocketSeparatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className="relative flex items-center px-6 md:px-16 overflow-hidden"
      style={{ height: "56px" }}
    >
      {/* Full-width line */}
      <motion.div
        className="absolute left-0 right-0 top-1/2"
        style={{ height: "1px", background: "rgba(255,255,255,0.12)", transform: "translateY(-50%)" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Rocket moving across */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
        initial={{ left: flip ? "105%" : "-5%", opacity: 0 }}
        animate={
          inView
            ? { left: flip ? "-5%" : "105%", opacity: [0, 1, 1, 0] }
            : {}
        }
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.5 }}
        style={{ transform: flip ? "translateY(-50%) scaleX(-1)" : "translateY(-50%)" }}
      >
        {/* Exhaust trail */}
        <motion.div
          className="h-px w-12 rounded"
          style={{ background: "linear-gradient(to left, rgba(196,82,42,0.8), transparent)" }}
          animate={{ scaleX: [0, 1, 0.6, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "mirror" }}
        />
        {/* Rocket body */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 16 5 16 10V18L12 22L8 18V10C8 5 12 2 12 2Z"
            fill="#C4522A"
            stroke="rgba(255,212,168,0.8)"
            strokeWidth="1"
          />
          <circle cx="12" cy="9" r="2" fill="rgba(255,240,220,0.9)" />
          <path d="M8 16L4 18L8 14" fill="rgba(196,82,42,0.6)" />
          <path d="M16 16L20 18L16 14" fill="rgba(196,82,42,0.6)" />
        </svg>
        {/* Glow dot */}
        <div
          className="w-1 h-1 rounded-full"
          style={{ background: "#FFD4A8", boxShadow: "0 0 6px #FFD4A8" }}
        />
      </motion.div>

      {/* Optional label */}
      {label && (
        <motion.span
          className="relative z-10 mx-auto text-[10px] tracking-[0.2em] uppercase px-4 py-1 rounded-sm"
          style={{
            background: "#C4522A",
            color: "#FFF0DC",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
