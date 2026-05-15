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

// Static starfield — deterministic so no hydration mismatch
const STARS = [
  // Top band
  { cx:  42, cy:  18, r: 1.2, peak: 0.85, delay: 0.3, dur: 2.1, bright: false },
  { cx: 130, cy:  35, r: 0.9, peak: 0.60, delay: 1.1, dur: 3.0, bright: false },
  { cx: 215, cy:  12, r: 1.5, peak: 0.90, delay: 0.7, dur: 2.4, bright: true  },
  { cx: 310, cy:  28, r: 0.8, peak: 0.55, delay: 1.8, dur: 2.8, bright: false },
  { cx: 390, cy:   8, r: 1.1, peak: 0.75, delay: 0.5, dur: 1.9, bright: false },
  { cx: 480, cy:  22, r: 1.8, peak: 0.95, delay: 2.1, dur: 3.2, bright: true  },
  { cx: 560, cy:  14, r: 0.9, peak: 0.65, delay: 0.9, dur: 2.6, bright: false },
  { cx: 645, cy:  32, r: 1.3, peak: 0.80, delay: 1.5, dur: 2.2, bright: false },
  { cx: 730, cy:   6, r: 1.0, peak: 0.70, delay: 0.2, dur: 3.5, bright: false },
  { cx: 820, cy:  25, r: 2.0, peak: 1.00, delay: 1.2, dur: 2.0, bright: true  },
  { cx: 900, cy:  11, r: 0.8, peak: 0.50, delay: 0.6, dur: 2.9, bright: false },
  { cx: 950, cy:  38, r: 1.2, peak: 0.75, delay: 1.9, dur: 2.3, bright: false },
  // Second band
  { cx:  18, cy:  75, r: 1.0, peak: 0.70, delay: 0.4, dur: 2.7, bright: false },
  { cx:  88, cy:  90, r: 1.6, peak: 0.88, delay: 1.3, dur: 1.8, bright: true  },
  { cx: 175, cy:  68, r: 0.9, peak: 0.60, delay: 2.2, dur: 3.1, bright: false },
  { cx: 260, cy:  82, r: 1.1, peak: 0.72, delay: 0.8, dur: 2.5, bright: false },
  { cx: 355, cy:  55, r: 0.8, peak: 0.55, delay: 1.6, dur: 2.0, bright: false },
  { cx: 440, cy:  95, r: 1.4, peak: 0.82, delay: 0.1, dur: 3.4, bright: false },
  { cx: 530, cy:  72, r: 2.2, peak: 1.00, delay: 1.0, dur: 2.1, bright: true  },
  { cx: 615, cy:  88, r: 0.9, peak: 0.65, delay: 2.4, dur: 2.8, bright: false },
  { cx: 700, cy:  58, r: 1.3, peak: 0.78, delay: 0.3, dur: 3.0, bright: false },
  { cx: 790, cy:  80, r: 1.0, peak: 0.68, delay: 1.7, dur: 1.9, bright: false },
  { cx: 870, cy:  62, r: 1.8, peak: 0.92, delay: 0.9, dur: 2.6, bright: true  },
  { cx: 940, cy:  85, r: 0.8, peak: 0.52, delay: 2.0, dur: 3.3, bright: false },
  // Left edge
  { cx:  28, cy: 155, r: 1.1, peak: 0.74, delay: 1.4, dur: 2.2, bright: false },
  { cx:  55, cy: 230, r: 0.9, peak: 0.62, delay: 0.5, dur: 3.0, bright: false },
  { cx:  15, cy: 305, r: 1.5, peak: 0.85, delay: 1.8, dur: 2.4, bright: true  },
  { cx:  70, cy: 380, r: 0.8, peak: 0.55, delay: 0.2, dur: 2.8, bright: false },
  { cx:  35, cy: 450, r: 1.2, peak: 0.78, delay: 2.3, dur: 1.7, bright: false },
  // Right edge
  { cx: 930, cy: 145, r: 1.0, peak: 0.68, delay: 0.7, dur: 2.9, bright: false },
  { cx: 950, cy: 220, r: 1.8, peak: 0.90, delay: 1.1, dur: 2.2, bright: true  },
  { cx: 915, cy: 295, r: 0.9, peak: 0.60, delay: 2.5, dur: 3.1, bright: false },
  { cx: 945, cy: 365, r: 1.3, peak: 0.80, delay: 0.4, dur: 2.0, bright: false },
  { cx: 920, cy: 430, r: 1.1, peak: 0.72, delay: 1.6, dur: 2.7, bright: false },
  // Third band (above text area)
  { cx: 110, cy: 140, r: 1.2, peak: 0.76, delay: 0.6, dur: 2.3, bright: false },
  { cx: 200, cy: 160, r: 2.0, peak: 0.98, delay: 1.9, dur: 1.8, bright: true  },
  { cx: 290, cy: 125, r: 0.9, peak: 0.58, delay: 0.3, dur: 3.2, bright: false },
  { cx: 680, cy: 135, r: 1.0, peak: 0.70, delay: 1.2, dur: 2.6, bright: false },
  { cx: 760, cy: 150, r: 1.6, peak: 0.86, delay: 0.8, dur: 2.1, bright: true  },
  { cx: 850, cy: 118, r: 0.8, peak: 0.54, delay: 2.1, dur: 3.0, bright: false },
  // Fourth band
  { cx: 145, cy: 205, r: 1.3, peak: 0.80, delay: 1.5, dur: 2.4, bright: false },
  { cx: 230, cy: 225, r: 0.9, peak: 0.62, delay: 0.1, dur: 2.9, bright: false },
  { cx: 320, cy: 195, r: 1.1, peak: 0.74, delay: 2.2, dur: 2.0, bright: false },
  { cx: 660, cy: 210, r: 1.8, peak: 0.93, delay: 0.9, dur: 1.9, bright: true  },
  { cx: 750, cy: 200, r: 0.9, peak: 0.63, delay: 1.7, dur: 2.7, bright: false },
  { cx: 840, cy: 220, r: 1.4, peak: 0.82, delay: 0.4, dur: 3.1, bright: false },
  // Sides near center (not overlapping text block ~x:280-680, y:250-470)
  { cx:  95, cy: 275, r: 1.0, peak: 0.68, delay: 1.0, dur: 2.5, bright: false },
  { cx: 165, cy: 310, r: 1.5, peak: 0.87, delay: 0.5, dur: 2.2, bright: true  },
  { cx: 110, cy: 360, r: 0.8, peak: 0.56, delay: 2.0, dur: 3.0, bright: false },
  { cx: 190, cy: 400, r: 1.2, peak: 0.76, delay: 0.7, dur: 2.1, bright: false },
  { cx: 130, cy: 445, r: 1.0, peak: 0.70, delay: 1.4, dur: 2.8, bright: false },
  { cx: 800, cy: 265, r: 1.3, peak: 0.79, delay: 0.2, dur: 2.4, bright: false },
  { cx: 870, cy: 305, r: 1.9, peak: 0.96, delay: 1.8, dur: 1.8, bright: true  },
  { cx: 810, cy: 350, r: 0.9, peak: 0.61, delay: 0.6, dur: 3.2, bright: false },
  { cx: 875, cy: 395, r: 1.1, peak: 0.73, delay: 2.3, dur: 2.3, bright: false },
  { cx: 830, cy: 440, r: 0.8, peak: 0.54, delay: 1.1, dur: 2.9, bright: false },
  // Below text / near trajectory
  { cx:  80, cy: 510, r: 1.0, peak: 0.66, delay: 0.8, dur: 2.6, bright: false },
  { cx: 170, cy: 540, r: 1.3, peak: 0.80, delay: 1.6, dur: 2.0, bright: false },
  { cx: 270, cy: 575, r: 0.9, peak: 0.60, delay: 0.3, dur: 3.1, bright: false },
  { cx: 380, cy: 560, r: 1.6, peak: 0.88, delay: 2.0, dur: 1.9, bright: true  },
  { cx: 460, cy: 590, r: 0.8, peak: 0.52, delay: 1.2, dur: 2.7, bright: false },
  { cx: 545, cy: 555, r: 1.1, peak: 0.71, delay: 0.4, dur: 2.3, bright: false },
  { cx: 640, cy: 580, r: 2.0, peak: 0.97, delay: 1.9, dur: 2.1, bright: true  },
  { cx: 720, cy: 545, r: 0.9, peak: 0.63, delay: 0.9, dur: 2.8, bright: false },
  { cx: 800, cy: 570, r: 1.2, peak: 0.77, delay: 1.5, dur: 2.4, bright: false },
  { cx: 880, cy: 530, r: 1.0, peak: 0.69, delay: 0.1, dur: 3.0, bright: false },
  // Bottom band
  { cx:  50, cy: 645, r: 1.1, peak: 0.73, delay: 2.2, dur: 2.2, bright: false },
  { cx: 150, cy: 665, r: 0.8, peak: 0.55, delay: 0.6, dur: 2.9, bright: false },
  { cx: 250, cy: 640, r: 1.5, peak: 0.86, delay: 1.3, dur: 1.8, bright: true  },
  { cx: 355, cy: 670, r: 0.9, peak: 0.60, delay: 0.8, dur: 3.3, bright: false },
  { cx: 455, cy: 648, r: 1.0, peak: 0.68, delay: 2.0, dur: 2.5, bright: false },
  { cx: 550, cy: 675, r: 1.3, peak: 0.81, delay: 0.2, dur: 2.1, bright: false },
  { cx: 650, cy: 655, r: 0.8, peak: 0.54, delay: 1.7, dur: 2.7, bright: false },
  { cx: 745, cy: 668, r: 1.8, peak: 0.92, delay: 0.5, dur: 2.0, bright: true  },
  { cx: 845, cy: 642, r: 1.0, peak: 0.67, delay: 1.1, dur: 3.1, bright: false },
  { cx: 930, cy: 660, r: 1.2, peak: 0.74, delay: 2.4, dur: 2.3, bright: false },
  // Scattered extras for density
  { cx: 340, cy: 170, r: 1.0, peak: 0.70, delay: 0.7, dur: 2.4, bright: false },
  { cx: 580, cy: 180, r: 1.4, peak: 0.84, delay: 1.4, dur: 2.1, bright: true  },
  { cx: 420, cy: 108, r: 0.9, peak: 0.62, delay: 2.1, dur: 2.9, bright: false },
  { cx: 695, cy:  48, r: 1.1, peak: 0.72, delay: 0.9, dur: 2.6, bright: false },
  { cx: 185, cy: 490, r: 1.3, peak: 0.79, delay: 1.6, dur: 2.2, bright: false },
  { cx: 835, cy: 480, r: 1.0, peak: 0.65, delay: 0.3, dur: 3.0, bright: false },
];

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

            {/* Starfield */}
            {STARS.map((s, i) => (
              <motion.circle
                key={i}
                cx={s.cx} cy={s.cy} r={s.r}
                fill={s.bright ? "#FFD4A8" : "#FFF0DC"}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, s.peak, s.peak * 0.3, s.peak] }}
                transition={{
                  delay: s.delay,
                  duration: s.dur,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
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
