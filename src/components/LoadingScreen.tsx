"use client";

import { useEffect, useRef, useState } from "react";
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

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLen(pathRef.current.getTotalLength());
    }
  }, []);

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

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
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
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,200,120,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,120,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* SVG Rocket trajectory */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 800 500"
              className="w-full h-full max-w-3xl opacity-90"
              style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
            >
              {/* Trail path */}
              <motion.path
                ref={pathRef as React.RefObject<SVGPathElement>}
                d="M 80 440 C 120 380 160 300 220 240 C 280 180 350 140 420 100 C 490 60 560 40 680 20"
                fill="none"
                stroke="rgba(255,200,120,0.35)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
              />
              {/* Main trajectory line */}
              <motion.path
                d="M 80 440 C 120 380 160 300 220 240 C 280 180 350 140 420 100 C 490 60 560 40 680 20"
                fill="none"
                stroke="#C4522A"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
              />
              {/* Glow */}
              <motion.path
                d="M 80 440 C 120 380 160 300 220 240 C 280 180 350 140 420 100 C 490 60 560 40 680 20"
                fill="none"
                stroke="rgba(255,200,120,0.15)"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.3 }}
              />

              {/* Rocket — follows key points along the trajectory */}
              <motion.g
                initial={{ opacity: 0, x: 80, y: 440 }}
                animate={{
                  opacity: [0, 1, 1, 1, 0.8],
                  x: [80, 180, 280, 420, 620],
                  y: [440, 330, 220, 110, 30],
                }}
                transition={{ duration: 3, ease: "easeOut", delay: 0.35, times: [0, 0.2, 0.5, 0.75, 1] }}
              >
                <text fontSize="20" textAnchor="middle" dominantBaseline="middle"
                  style={{ transform: "rotate(-40deg)", display: "block" }}>
                  🚀
                </text>
              </motion.g>

              {/* Stars / particles */}
              {[
                { cx: 600, cy: 80, r: 2 },
                { cx: 650, cy: 150, r: 1.5 },
                { cx: 700, cy: 60, r: 1 },
                { cx: 720, cy: 120, r: 2 },
                { cx: 580, cy: 40, r: 1.5 },
              ].map((s, i) => (
                <motion.circle
                  key={i}
                  cx={s.cx}
                  cy={s.cy}
                  r={s.r}
                  fill="#FFF0DC"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ delay: 1.5 + i * 0.2, duration: 1, repeat: Infinity, repeatType: "mirror" }}
                />
              ))}

              {/* Launch pad */}
              <motion.rect
                x={60}
                y={445}
                width={40}
                height={8}
                fill="#C4522A"
                rx={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              />
            </svg>
          </div>

          {/* Text content */}
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="text-xs tracking-[0.25em] uppercase mb-1"
                style={{ color: "rgba(255,200,120,0.6)" }}
              >
                Universidad La Salle Bajío — Ingeniería Industrial
              </div>
              <div
                className="text-4xl md:text-6xl font-bold tracking-[0.15em] uppercase"
                style={{ color: "#FFF0DC", textShadow: "0 0 40px rgba(196,82,42,0.8)" }}
              >
                NexTech
              </div>
              <div
                className="text-base md:text-lg tracking-[0.3em] uppercase"
                style={{ color: "#C4522A" }}
              >
                Industries
              </div>
            </motion.div>

            {/* Status text */}
            <motion.div
              className="h-6 text-xs tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,200,120,0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {STEPS[step] ?? STEPS[STEPS.length - 1]}
              {step < 4 && <span className="blink ml-1">_</span>}
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-64 md:w-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div
                className="h-px w-full mb-2"
                style={{ background: "rgba(255,200,120,0.2)" }}
              />
              <div className="relative h-[2px] w-full" style={{ background: "rgba(255,200,120,0.1)" }}>
                <motion.div
                  className="absolute left-0 top-0 h-full"
                  style={{ background: "#C4522A", boxShadow: "0 0 8px #C4522A" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(255,200,120,0.4)" }}>
                  MCU — MÉTODOS CUANTITATIVOS
                </span>
                <span className="text-[10px]" style={{ color: "#C4522A" }}>
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
