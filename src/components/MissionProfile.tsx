"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

// Main ascent path (upper stage)
const MAIN_PATH =
  "M 80,415 C 120,320 200,230 280,170 C 370,105 490,70 640,60 C 780,52 900,70 960,95";

// Booster return (branches off at ~separation point)
const BOOSTER_PATH =
  "M 285,168 C 268,220 245,280 205,330 C 172,368 142,393 112,415";

// Rocket body shape
const ROCKET_SHAPE = "M 0,-8 C -2,-4 -3,1 -3,6 L 0,9 L 3,6 C 3,1 2,-4 0,-8 Z";

// Static rocket silhouettes on main ascent path
const MAIN_ROCKETS = [
  { x: 80,  y: 415, angle: -82 },
  { x: 190, y: 265, angle: -58 },
  { x: 290, y: 168, angle: -28 },
  { x: 645, y: 60,  angle: 2   },
  { x: 960, y: 95,  angle: 8   },
];

// Static silhouettes on booster return path
const BOOSTER_ROCKETS = [
  { x: 228, y: 290, angle: 148 },
  { x: 113, y: 415, angle: 172 },
];

// Phase labels: path anchor point, label position, connector end, text
const PHASES = [
  {
    cx: 80,  cy: 415, lx: 60,  ly: 445, anchor: "middle" as const,
    text: "LANZAMIENTO",
  },
  {
    cx: 178, cy: 272, lx: 118, ly: 258, anchor: "end" as const,
    text: "ASCENSO",
  },
  {
    cx: 288, cy: 168, lx: 310, ly: 142, anchor: "start" as const,
    text: "SEP. ETAPAS",
  },
  {
    cx: 644, cy: 60,  lx: 665, ly: 34,  anchor: "start" as const,
    text: "INSERCIÓN ORBITAL",
  },
  {
    cx: 960, cy: 95,  lx: 968, ly: 65,  anchor: "start" as const,
    text: "CARGA ÚTIL",
  },
  {
    cx: 208, cy: 328, lx: 250, ly: 322, anchor: "start" as const,
    text: "RETORNO",
  },
  {
    cx: 113, cy: 415, lx: 72,  ly: 445, anchor: "end" as const,
    text: "ATERRIZAJE",
  },
];

export function MissionProfile() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [rocketPos, setRocketPos] = useState({ x: 80, y: 415, angle: -82 });
  const travelRef = useRef(0);

  useEffect(() => {
    if (!inView) return;
    let rafId: number;
    const timeout = setTimeout(() => {
      const path = pathRef.current;
      if (!path) return;
      const totalLen = path.getTotalLength();

      const tick = () => {
        travelRef.current += totalLen / (80 * 60); // ~80s per loop at 60fps
        if (travelRef.current > totalLen) travelRef.current = 0;
        const p = travelRef.current;
        const pt = path.getPointAtLength(p);
        const pt2 = path.getPointAtLength(Math.min(p + 3, totalLen));
        const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI) - 90;
        setRocketPos({ x: pt.x, y: pt.y, angle });
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, 4200);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [inView]);

  return (
    <div className="py-12 md:py-16 px-4 md:px-16" style={{ background: "rgba(0,0,0,0.12)" }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="tva-label mb-2">&gt;_ PERFIL DE MISIÓN</div>
          <h2
            className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue', sans-serif" }}
          >
            NX-Heavy Mission Profile
          </h2>
          <div className="tva-label mb-1" style={{ color: "rgba(255,212,168,0.6)" }}>
            Trayectoria de Vuelo — Lanzamiento &amp; Recuperación de Primera Etapa
          </div>
          <div className="h-px w-16" style={{ background: "rgba(255,255,255,0.3)" }} />
        </motion.div>

        {/* SVG trajectory diagram */}
        <div ref={sectionRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="overflow-x-auto rounded-sm"
            style={{ border: "1px solid rgba(196,82,42,0.2)" }}
          >
            <svg
              viewBox="0 0 1000 470"
              className="w-full"
              style={{ display: "block", minWidth: 560 }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background */}
              <rect width="1000" height="470" fill="#050100" />

              {/* Subtle grid */}
              {[80, 160, 240, 320, 400].map((y) => (
                <line
                  key={y}
                  x1="0" y1={y} x2="1000" y2={y}
                  stroke="rgba(255,240,220,0.025)"
                  strokeWidth="1"
                />
              ))}

              {/* Ground line */}
              <line
                x1="0" y1="415" x2="1000" y2="415"
                stroke="rgba(255,240,220,0.12)"
                strokeWidth="1"
              />

              {/* Launch platform */}
              <rect
                x="60" y="400" width="40" height="15"
                fill="none"
                stroke="rgba(255,240,220,0.3)"
                strokeWidth="1"
              />
              <line
                x1="80" y1="390" x2="80" y2="400"
                stroke="rgba(255,240,220,0.3)"
                strokeWidth="1.5"
              />

              {/* Landing zone */}
              <rect
                x="95" y="405" width="35" height="10"
                fill="none"
                stroke="rgba(196,82,42,0.4)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />

              {/* Booster return glow */}
              <motion.path
                d={BOOSTER_PATH}
                fill="none"
                stroke="rgba(255,240,220,0.05)"
                strokeWidth="6"
                strokeDasharray="8 5"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }}
              />
              {/* Booster return main */}
              <motion.path
                d={BOOSTER_PATH}
                fill="none"
                stroke="rgba(255,240,220,0.5)"
                strokeWidth="1.2"
                strokeDasharray="8 5"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }}
              />

              {/* Main ascent glow */}
              <motion.path
                d={MAIN_PATH}
                fill="none"
                stroke="rgba(255,240,220,0.07)"
                strokeWidth="9"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
              />
              {/* Main ascent line — ref attached for getPointAtLength */}
              <motion.path
                ref={pathRef}
                d={MAIN_PATH}
                fill="none"
                stroke="rgba(255,240,220,0.85)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
              />

              {/* Stage separation circle */}
              <motion.circle
                cx="285" cy="168" r="6"
                fill="none"
                stroke="rgba(196,82,42,0.9)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 2.3, duration: 0.4 }}
              />

              {/* Main path static rocket silhouettes */}
              {MAIN_ROCKETS.map((pos, i) => (
                <motion.g
                  key={`mr-${i}`}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.0 + i * 0.12, duration: 0.4 }}
                >
                  <path
                    d={ROCKET_SHAPE}
                    transform={`translate(${pos.x},${pos.y}) rotate(${pos.angle}) scale(2.3)`}
                    fill="rgba(255,240,220,0.82)"
                    stroke="rgba(196,82,42,0.7)"
                    strokeWidth="0.4"
                  />
                </motion.g>
              ))}

              {/* Booster static rocket silhouettes */}
              {BOOSTER_ROCKETS.map((pos, i) => (
                <motion.g
                  key={`br-${i}`}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.6 + i * 0.12, duration: 0.4 }}
                >
                  <path
                    d={ROCKET_SHAPE}
                    transform={`translate(${pos.x},${pos.y}) rotate(${pos.angle}) scale(2.3)`}
                    fill="rgba(255,240,220,0.45)"
                    stroke="rgba(196,82,42,0.45)"
                    strokeWidth="0.4"
                  />
                </motion.g>
              ))}

              {/* Phase labels + connectors */}
              {PHASES.map((phase, i) => (
                <motion.g
                  key={`ph-${i}`}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 3.0 + i * 0.14, duration: 0.45 }}
                >
                  <line
                    x1={phase.cx} y1={phase.cy}
                    x2={phase.lx} y2={phase.ly - 6}
                    stroke="rgba(255,240,220,0.2)"
                    strokeWidth="0.8"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={phase.lx}
                    y={phase.ly}
                    textAnchor={phase.anchor}
                    fontFamily="'Space Mono', monospace"
                    fontSize="8"
                    fill="rgba(255,240,220,0.72)"
                    letterSpacing="0.12em"
                  >
                    {phase.text}
                  </text>
                </motion.g>
              ))}

              {/* Travelling rocket sprite */}
              <g transform={`translate(${rocketPos.x},${rocketPos.y}) rotate(${rocketPos.angle})`}>
                {/* Engine exhaust glow */}
                <ellipse
                  cx="0" cy="22"
                  rx="4" ry="7"
                  fill="rgba(196,82,42,0.5)"
                />
                <ellipse
                  cx="0" cy="18"
                  rx="2.5" ry="4"
                  fill="rgba(255,180,80,0.6)"
                />
                <path
                  d={ROCKET_SHAPE}
                  transform="scale(2.8)"
                  fill="#FFD4A8"
                  stroke="#C4522A"
                  strokeWidth="0.4"
                />
              </g>
            </svg>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-6"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {[
            {
              el: <div className="w-7 h-px" style={{ background: "rgba(255,240,220,0.75)", height: "1.5px" }} />,
              label: "Segunda Etapa",
            },
            {
              el: (
                <svg width="28" height="4">
                  <line
                    x1="0" y1="2" x2="28" y2="2"
                    stroke="rgba(255,240,220,0.5)"
                    strokeWidth="1.2"
                    strokeDasharray="5 4"
                  />
                </svg>
              ),
              label: "Primera Etapa (Retorno)",
            },
            {
              el: (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ border: "1.5px dashed rgba(196,82,42,0.9)" }}
                />
              ),
              label: "Separación de Etapas",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.el}
              <span
                className="text-[10px] tracking-[0.1em] uppercase"
                style={{ color: "rgba(255,240,220,0.45)" }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
