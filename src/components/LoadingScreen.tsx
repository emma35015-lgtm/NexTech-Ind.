"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  "INICIALIZANDO SISTEMA...",
  "CARGANDO MODELOS DE INVENTARIO...",
  "CALIBRANDO TRAYECTORIA...",
  "SISTEMA LISTO",
];

// Trajectory path in the BOTTOM portion of screen — stays away from center text
const PATH = "M -20 620 C 80 590 200 570 340 555 C 480 540 620 520 780 480 C 880 460 940 410 980 340";

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStep(1), 600));
    timers.push(setTimeout(() => setStep(2), 1500));
    timers.push(setTimeout(() => setStep(3), 2600));
    timers.push(setTimeout(() => setStep(4), 3600));
    timers.push(setTimeout(() => { setVisible(false); }, 4200));
    timers.push(setTimeout(() => onComplete(), 4800));

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2.5;
      });
    }, 100);

    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          style={{ backgroundColor: "#0F0500" }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background grid */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,200,120,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,120,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Trajectory SVG — bottom quarter of screen only */}
          <svg
            viewBox="0 0 960 700"
            preserveAspectRatio="xMidYMax meet"
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            {/* Dashed trail */}
            <motion.path
              d={PATH}
              fill="none"
              stroke="rgba(255,200,120,0.2)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3.2, ease: "easeOut", delay: 0.4 }}
            />
            {/* Main line */}
            <motion.path
              d={PATH}
              fill="none"
              stroke="#C4522A"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3.2, ease: "easeOut", delay: 0.4 }}
            />
            {/* Glow */}
            <motion.path
              d={PATH}
              fill="none"
              stroke="rgba(196,82,42,0.25)"
              strokeWidth="10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3.2, ease: "easeOut", delay: 0.4 }}
            />

            {/* Moving dot along the path */}
            <motion.circle
              r="5"
              fill="#FFD4A8"
              style={{ filter: "drop-shadow(0 0 6px #FFD4A8)" }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 1, 1, 0],
                cx: [-20, 150, 340, 580, 820, 980],
                cy: [620, 595, 555, 530, 490, 340],
              }}
              transition={{ duration: 3.2, ease: "easeOut", delay: 0.4, times: [0, 0.15, 0.35, 0.6, 0.85, 1] }}
            />

            {/* Origin point */}
            <motion.circle cx={-20} cy={620} r={4} fill="rgba(196,82,42,0.6)"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
            <motion.circle cx={-20} cy={620} r={10} fill="none" stroke="rgba(196,82,42,0.3)" strokeWidth={1}
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 2, 3] }}
              transition={{ delay: 0.4, duration: 1.2 }} />

            {/* Decorative stars — top corners, away from text */}
            {[
              { cx: 60, cy: 40 }, { cx: 140, cy: 70 }, { cx: 30, cy: 100 },
              { cx: 880, cy: 50 }, { cx: 920, cy: 90 }, { cx: 840, cy: 30 },
            ].map((s, i) => (
              <motion.circle
                key={i} cx={s.cx} cy={s.cy} r={1.5} fill="#FFF0DC"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0.3, 0.8] }}
                transition={{ delay: 0.8 + i * 0.15, duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
              />
            ))}

            {/* Coordinate grid lines — bottom decorative only */}
            {[0.65, 0.75, 0.85, 0.95].map((y, i) => (
              <motion.line
                key={i}
                x1={0} y1={700 * y} x2={960} y2={700 * y}
                stroke="rgba(255,200,120,0.06)" strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              />
            ))}
          </svg>

          {/* Text content — centered, no SVG overlay */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-xs tracking-[0.25em] uppercase mb-1"
                style={{ color: "rgba(255,200,120,0.75)" }}>
                Universidad La Salle Bajío — Ingeniería Industrial
              </div>
              <div className="text-4xl md:text-6xl font-bold tracking-[0.15em] uppercase"
                style={{ color: "#FFFFFF", textShadow: "0 0 40px rgba(196,82,42,0.9)" }}>
                NexTech
              </div>
              <div className="text-base md:text-lg tracking-[0.3em] uppercase"
                style={{ color: "#FF8855" }}>
                Industries
              </div>
            </motion.div>

            <motion.div
              className="h-6 text-xs tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,220,180,0.9)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {STEPS[step] ?? STEPS[STEPS.length - 1]}
              {step < 4 && <span className="blink ml-1">_</span>}
            </motion.div>

            <motion.div
              className="w-64 md:w-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="h-px w-full mb-2" style={{ background: "rgba(255,200,120,0.2)" }} />
              <div className="relative h-[2px] w-full" style={{ background: "rgba(255,200,120,0.1)" }}>
                <motion.div
                  className="absolute left-0 top-0 h-full"
                  style={{ background: "#C4522A", boxShadow: "0 0 10px #C4522A" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] tracking-widest uppercase"
                  style={{ color: "rgba(255,200,120,0.5)" }}>
                  MCU — MÉTODOS CUANTITATIVOS
                </span>
                <span className="text-[10px] font-bold" style={{ color: "#FF8855" }}>
                  {Math.round(progress)}%
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
