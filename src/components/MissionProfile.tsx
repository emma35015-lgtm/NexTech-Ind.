"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/* ─── SVG path definitions ──────────────────────────────────────── */
const MAIN_PATH =
  "M 80,415 C 120,320 200,230 280,170 C 370,105 490,70 640,60 C 780,52 900,70 960,95";

const BOOSTER_PATH =
  "M 285,168 C 268,220 245,280 205,330 C 172,368 142,393 112,415";

/* ─── Two-stage rocket component ────────────────────────────────── */
type RocketProps = {
  x: number; y: number; angleDeg: number; scale?: number;
  showS1?: boolean; showS2?: boolean; exhaust?: boolean;
  fill?: string; stroke?: string; opacity?: number;
};

function Rocket2Stage({
  x, y, angleDeg, scale = 1,
  showS1 = true, showS2 = true, exhaust = false,
  fill = "rgba(255,240,220,0.82)",
  stroke = "rgba(196,82,42,0.6)",
  opacity = 1,
}: RocketProps) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angleDeg}) scale(${scale})`} opacity={opacity}>
      {/* Engine exhaust (rendered behind body) */}
      {exhaust && showS1 && (
        <>
          <ellipse cx="0" cy="14" rx="1.4" ry="2.8" fill="rgba(196,82,42,0.5)" />
          <ellipse cx="0" cy="12.5" rx="0.9" ry="1.6" fill="rgba(255,180,80,0.65)" />
        </>
      )}
      {/* Stage 2: nosecone + body + interstage collar */}
      {showS2 && (
        <>
          <path d="M 0,-14 L -2,-9 L 2,-9 Z"
            fill={fill} stroke={stroke} strokeWidth="0.35" />
          <rect x="-2" y="-9" width="4" height="8.5" rx="0.4"
            fill={fill} stroke={stroke} strokeWidth="0.35" />
          <rect x="-2.5" y="-0.5" width="5" height="1"
            fill={fill} stroke={stroke} strokeWidth="0.35" />
        </>
      )}
      {/* Stage 1: body + grid fins + landing legs + engine nozzle */}
      {showS1 && (
        <>
          <rect x="-2.5" y="0.5" width="5" height="7.5" rx="0.3"
            fill={fill} stroke={stroke} strokeWidth="0.35" />
          {/* Grid fins */}
          <path d="M -2.5,1 L -4.5,1.5 L -4.5,3.5 L -2.5,3.5 Z"
            fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M 2.5,1 L 4.5,1.5 L 4.5,3.5 L 2.5,3.5 Z"
            fill={fill} stroke={stroke} strokeWidth="0.3" />
          {/* Landing legs */}
          <path d="M -2.5,6.5 L -5,9.5 L -3.8,9.5 L -2.5,7.5 Z"
            fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M 2.5,6.5 L 5,9.5 L 3.8,9.5 L 2.5,7.5 Z"
            fill={fill} stroke={stroke} strokeWidth="0.3" />
          {/* Engine nozzle */}
          <path d="M -2,8 L -2.5,10.5 L 2.5,10.5 L 2,8 Z"
            fill={fill} stroke={stroke} strokeWidth="0.3" />
        </>
      )}
    </g>
  );
}

/* ─── Static silhouette positions ───────────────────────────────── */
const MAIN_BEFORE_SEP = [
  { x: 80,  y: 415, angle: -82 },
  { x: 190, y: 265, angle: -58 },
];
const MAIN_AFTER_SEP = [
  { x: 645, y: 60,  angle: 2 },
  { x: 960, y: 95,  angle: 8 },
];
const BOOSTER_ROCKETS = [
  { x: 228, y: 290, angle: 148 },
  { x: 113, y: 415, angle: 172 },
];

/* ─── Phase labels ──────────────────────────────────────────────── */
const PHASES: { cx: number; cy: number; lx: number; ly: number; anchor: "middle"|"start"|"end"; text: string }[] = [
  { cx: 80,  cy: 415, lx: 60,  ly: 445, anchor: "middle", text: "LANZAMIENTO" },
  { cx: 178, cy: 272, lx: 118, ly: 258, anchor: "end",    text: "ASCENSO" },
  { cx: 288, cy: 168, lx: 310, ly: 142, anchor: "start",  text: "SEP. ETAPAS" },
  { cx: 644, cy: 60,  lx: 665, ly: 34,  anchor: "start",  text: "INSERCIÓN ORBITAL" },
  { cx: 960, cy: 95,  lx: 968, ly: 65,  anchor: "start",  text: "CARGA ÚTIL" },
  { cx: 208, cy: 328, lx: 250, ly: 322, anchor: "start",  text: "RETORNO" },
  { cx: 113, cy: 415, lx: 72,  ly: 445, anchor: "end",    text: "ATERRIZAJE" },
];

/* ─── Main component ────────────────────────────────────────────── */
export function MissionProfile() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef    = useRef<SVGPathElement>(null);
  const inView     = useInView(sectionRef, { once: true, margin: "-80px" });
  const [rocketPos, setRocketPos] = useState({ x: 80, y: 415, angle: -82 });
  const travelRef  = useRef(0);

  useEffect(() => {
    if (!inView) return;
    let rafId: number;
    const timeout = setTimeout(() => {
      const path = pathRef.current;
      if (!path) return;
      const totalLen = path.getTotalLength();
      const tick = () => {
        travelRef.current += totalLen / (80 * 60);
        if (travelRef.current > totalLen) travelRef.current = 0;
        const p   = travelRef.current;
        const pt  = path.getPointAtLength(p);
        const pt2 = path.getPointAtLength(Math.min(p + 3, totalLen));
        const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI) - 90;
        setRocketPos({ x: pt.x, y: pt.y, angle });
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, 4200);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId); };
  }, [inView]);

  return (
    <div className="py-12 md:py-16 px-4 md:px-16" style={{ background: "rgba(0,0,0,0.12)" }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
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

        {/* TVA terminal panel */}
        <div ref={sectionRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden scanlines"
            style={{
              background: "#050100",
              border: "2px solid #C4522A",
              boxShadow: "0 0 22px rgba(196,82,42,0.4), inset 0 0 40px rgba(196,82,42,0.05)",
            }}
          >
            {/* CRT inner grid */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
              backgroundImage: [
                "repeating-linear-gradient(rgba(196,82,42,0.04) 0px,rgba(196,82,42,0.04) 1px,transparent 1px,transparent 40px)",
                "repeating-linear-gradient(90deg,rgba(196,82,42,0.04) 0px,rgba(196,82,42,0.04) 1px,transparent 1px,transparent 40px)",
              ].join(","),
            }} />

            {/* Corner brackets */}
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none z-20"
                style={{
                  color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace",
                  top: i < 2 ? 8 : undefined, bottom: i >= 2 ? 8 : undefined,
                  left: i % 2 === 0 ? 10 : undefined, right: i % 2 === 1 ? 10 : undefined,
                }}>
                {ch}
              </span>
            ))}

            {/* Header stripe */}
            <div className="relative z-10 flex items-center justify-between px-4 h-9 flex-shrink-0"
              style={{ background: "#C4522A" }}>
              <span className="text-[10px] tracking-[0.15em] uppercase font-bold"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
                ████ NEXTECH — PERFIL DE MISIÓN NX-HEAVY ████
              </span>
              <span className="text-[9px] tracking-[0.1em]"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
                [FLIGHT 01]
              </span>
            </div>

            {/* SVG trajectory */}
            <div className="relative z-10 overflow-x-auto">
              <svg
                viewBox="0 0 1000 470"
                className="w-full"
                style={{ display: "block", minWidth: 560 }}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect width="1000" height="470" fill="#050100" />

                {/* Subtle grid lines */}
                {[80, 160, 240, 320, 400].map((y) => (
                  <line key={y} x1="0" y1={y} x2="1000" y2={y}
                    stroke="rgba(255,240,220,0.025)" strokeWidth="1" />
                ))}

                {/* Ground line */}
                <line x1="0" y1="415" x2="1000" y2="415"
                  stroke="rgba(255,240,220,0.12)" strokeWidth="1" />

                {/* Launch platform */}
                <rect x="60" y="400" width="40" height="15"
                  fill="none" stroke="rgba(255,240,220,0.3)" strokeWidth="1" />
                <line x1="80" y1="390" x2="80" y2="400"
                  stroke="rgba(255,240,220,0.3)" strokeWidth="1.5" />

                {/* Landing zone */}
                <rect x="95" y="405" width="35" height="10"
                  fill="none" stroke="rgba(196,82,42,0.4)" strokeWidth="1" strokeDasharray="3 2" />

                {/* Booster return glow */}
                <motion.path d={BOOSTER_PATH} fill="none"
                  stroke="rgba(255,240,220,0.05)" strokeWidth="6" strokeDasharray="8 5"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }}
                />
                {/* Booster return line */}
                <motion.path d={BOOSTER_PATH} fill="none"
                  stroke="rgba(255,240,220,0.5)" strokeWidth="1.2" strokeDasharray="8 5"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }}
                />

                {/* Main ascent glow */}
                <motion.path d={MAIN_PATH} fill="none"
                  stroke="rgba(255,240,220,0.07)" strokeWidth="9"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
                />
                {/* Main ascent line (ref for getPointAtLength) */}
                <motion.path
                  ref={pathRef}
                  d={MAIN_PATH} fill="none"
                  stroke="rgba(255,240,220,0.85)" strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
                />

                {/* Stage separation ring */}
                <motion.circle cx="285" cy="168" r="7"
                  fill="none" stroke="rgba(196,82,42,0.9)" strokeWidth="1.5" strokeDasharray="3 2"
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.3, duration: 0.4 }}
                />

                {/* Full rocket silhouettes before separation */}
                {MAIN_BEFORE_SEP.map((pos, i) => (
                  <motion.g key={`pre-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.0 + i * 0.12, duration: 0.4 }}>
                    <Rocket2Stage x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3} />
                  </motion.g>
                ))}

                {/* Stage separation: S2 forward + S1 beginning return */}
                <motion.g
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.36, duration: 0.4 }}>
                  <Rocket2Stage x={268} y={155} angleDeg={-32} scale={2.3}
                    showS1={false} fill="rgba(255,240,220,0.9)" />
                  <Rocket2Stage x={308} y={186} angleDeg={138} scale={2.3}
                    showS2={false} fill="rgba(255,240,220,0.65)" stroke="rgba(196,82,42,0.5)" />
                </motion.g>

                {/* Stage 2 only silhouettes after separation */}
                {MAIN_AFTER_SEP.map((pos, i) => (
                  <motion.g key={`post-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.5 + i * 0.12, duration: 0.4 }}>
                    <Rocket2Stage x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3}
                      showS1={false} fill="rgba(255,240,220,0.82)" />
                  </motion.g>
                ))}

                {/* Stage 1 only silhouettes on booster return */}
                {BOOSTER_ROCKETS.map((pos, i) => (
                  <motion.g key={`br-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.6 + i * 0.12, duration: 0.4 }}>
                    <Rocket2Stage x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3}
                      showS2={false} fill="rgba(255,240,220,0.45)" stroke="rgba(196,82,42,0.45)" />
                  </motion.g>
                ))}

                {/* Phase labels + connectors */}
                {PHASES.map((phase, i) => (
                  <motion.g key={`ph-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 3.0 + i * 0.14, duration: 0.45 }}>
                    <line
                      x1={phase.cx} y1={phase.cy} x2={phase.lx} y2={phase.ly - 6}
                      stroke="rgba(255,240,220,0.2)" strokeWidth="0.8" strokeDasharray="4 3"
                    />
                    <text
                      x={phase.lx} y={phase.ly}
                      textAnchor={phase.anchor}
                      fontFamily="'Space Mono', monospace"
                      fontSize="8" fill="rgba(255,240,220,0.72)" letterSpacing="0.12em"
                    >
                      {phase.text}
                    </text>
                  </motion.g>
                ))}

                {/* Travelling rocket sprite */}
                <Rocket2Stage
                  x={rocketPos.x} y={rocketPos.y} angleDeg={rocketPos.angle}
                  scale={2.8} exhaust
                  fill="#FFD4A8" stroke="#C4522A"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="relative z-10 px-4 pb-3 pt-2 flex flex-wrap gap-6"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {[
                {
                  el: <div className="w-7" style={{ height: "1.5px", background: "rgba(255,240,220,0.75)" }} />,
                  label: "Segunda Etapa",
                },
                {
                  el: (
                    <svg width="28" height="4">
                      <line x1="0" y1="2" x2="28" y2="2"
                        stroke="rgba(255,240,220,0.5)" strokeWidth="1.2" strokeDasharray="5 4" />
                    </svg>
                  ),
                  label: "Primera Etapa (Retorno)",
                },
                {
                  el: (
                    <div className="w-3 h-3 rounded-full"
                      style={{ border: "1.5px dashed rgba(196,82,42,0.9)" }} />
                  ),
                  label: "Separación de Etapas",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.el}
                  <span className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(255,240,220,0.45)" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-1.5"
              style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.5)" }}>
              <span className="text-[8px] tracking-[0.1em] uppercase"
                style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>
                NEXTECH INDUSTRIES — TRAYECTORIA NX-HEAVY // ULASB 2026
              </span>
              <span className="text-[8px] tracking-[0.1em]"
                style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>
                [STATUS: FLIGHT]
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
