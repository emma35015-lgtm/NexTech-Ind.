"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/* ─── Path definitions ──────────────────────────────────────────── */
const MAIN_PATH =
  "M 80,415 C 120,320 200,230 280,170 C 370,105 490,70 640,60 C 780,52 900,70 960,95";

const BOOSTER_PATH =
  "M 285,168 C 268,220 245,280 205,330 C 172,368 142,393 112,415";

/* ─── Two-stage rocket shape ────────────────────────────────────── */
/*  Reference origin: stage-separation interface (y=0).
    S2 upper stage: y = -24 to  0  (engine bell tip).
    S1 booster:     y =  2  to 22  (engine nozzle exits).
    angleDeg rotates the whole group; -90 = pointing straight up.   */
type RocketProps = {
  x: number; y: number; angleDeg: number; scale?: number;
  showS1?: boolean; showS2?: boolean;
  fill?: string; stroke?: string; opacity?: number; lit?: boolean;
};

function Rocket2Stage({
  x, y, angleDeg, scale = 1,
  showS1 = true, showS2 = true,
  fill = "rgba(255,240,220,0.82)",
  stroke = "rgba(196,82,42,0.65)",
  opacity = 1,
  lit = false,
}: RocketProps) {
  const sw = 0.38;
  /* When only S1 shown, shift it up so its top sits at y=0. */
  const s1y = showS2 ? 4.5 : 0;
  return (
    <g transform={`translate(${x},${y}) rotate(${angleDeg}) scale(${scale})`} opacity={opacity}>

      {/* Engine exhaust */}
      {lit && (
        <>
          <ellipse cx="0" cy={s1y + 27} rx="3"   ry="6.5" fill="rgba(196,82,42,0.45)" />
          <ellipse cx="0" cy={s1y + 25} rx="1.8" ry="3.8" fill="rgba(255,160,60,0.6)" />
          <ellipse cx="0" cy={s1y + 24} rx="1"   ry="2"   fill="rgba(255,230,180,0.85)" />
        </>
      )}

      {/* ── S2 upper stage ── */}
      {showS2 && (
        <>
          {/* Nosecone */}
          <path d="M 0,-24 L -1.8,-15 L 1.8,-15 Z"
            fill={fill} stroke={stroke} strokeWidth={sw} />
          {/* S2 upper cylindrical body */}
          <rect x="-1.8" y="-15" width="3.6" height="10"
            fill={fill} stroke={stroke} strokeWidth={sw} />
          {/* S2 payload section (slightly wider) */}
          <rect x="-2.2" y="-5" width="4.4" height="5"
            fill={fill} stroke={stroke} strokeWidth={sw} />
          {/* S2 engine bell */}
          <path d="M -1.6,0 L -2.4,3.5 L 2.4,3.5 L 1.6,0 Z"
            fill={fill} stroke={stroke} strokeWidth={sw} />
        </>
      )}

      {/* ── Interstage collar ── */}
      {showS1 && showS2 && (
        <rect x="-3.1" y="3.5" width="6.2" height="1.8" rx="0.2"
          fill={fill} stroke={stroke} strokeWidth={sw} />
      )}

      {/* ── S1 booster ── */}
      {showS1 && (
        <>
          {/* S1 main body */}
          <rect x="-3" y={s1y} width="6" height="15"
            fill={fill} stroke={stroke} strokeWidth={sw} />

          {/* Grid fin — left (hollow bracket with crosshatch) */}
          <rect x="-5.5" y={s1y + 0.6} width="2.5" height="3.4"
            fill="none" stroke={stroke} strokeWidth={sw} />
          <line
            x1="-4.25" y1={s1y + 0.6} x2="-4.25" y2={s1y + 4}
            stroke={stroke} strokeWidth={sw * 0.65} />
          <line
            x1="-5.5" y1={s1y + 2} x2="-3" y2={s1y + 2}
            stroke={stroke} strokeWidth={sw * 0.65} />

          {/* Grid fin — right */}
          <rect x="3" y={s1y + 0.6} width="2.5" height="3.4"
            fill="none" stroke={stroke} strokeWidth={sw} />
          <line
            x1="4.25" y1={s1y + 0.6} x2="4.25" y2={s1y + 4}
            stroke={stroke} strokeWidth={sw * 0.65} />
          <line
            x1="3" y1={s1y + 2} x2="5.5" y2={s1y + 2}
            stroke={stroke} strokeWidth={sw * 0.65} />

          {/* Landing leg — left */}
          <path d={`M -3,${s1y + 12} L -6,${s1y + 18} L -4.6,${s1y + 18} L -3,${s1y + 13.4} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw * 0.85} />
          <line
            x1="-3" y1={s1y + 15} x2="-6" y2={s1y + 18}
            stroke={stroke} strokeWidth={sw * 0.65} />

          {/* Landing leg — right */}
          <path d={`M 3,${s1y + 12} L 6,${s1y + 18} L 4.6,${s1y + 18} L 3,${s1y + 13.4} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw * 0.85} />
          <line
            x1="3" y1={s1y + 15} x2="6" y2={s1y + 18}
            stroke={stroke} strokeWidth={sw * 0.65} />

          {/* Engine nozzle cluster — 3 bells */}
          <path d={`M -2.8,${s1y + 15} L -3.5,${s1y + 20} L -1.6,${s1y + 20} L -1,${s1y + 15} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw * 0.8} />
          <path d={`M -0.8,${s1y + 15} L -1.1,${s1y + 20} L 1.1,${s1y + 20} L 0.8,${s1y + 15} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw * 0.8} />
          <path d={`M 1,${s1y + 15} L 1.6,${s1y + 20} L 3.5,${s1y + 20} L 2.8,${s1y + 15} Z`}
            fill={fill} stroke={stroke} strokeWidth={sw * 0.8} />
        </>
      )}
    </g>
  );
}

/* ─── Static rocket positions ───────────────────────────────────── */
const BEFORE_SEP = [
  { x: 80,  y: 415, angle: -82 }, // liftoff  (full vehicle)
  { x: 185, y: 268, angle: -58 }, // ascent   (full vehicle)
];
const AFTER_SEP_S2 = [
  { x: 645, y: 60,  angle:  2  }, // orbital insertion (S2)
  { x: 960, y: 95,  angle:  8  }, // payload deploy    (S2)
];
const BOOSTER_RETURN = [
  { x: 225, y: 292, angle: 150 }, // retro-burn (S1 flipped)
  { x: 112, y: 415, angle: 172 }, // landing    (S1 near-vertical)
];

/* ─── Phase labels ──────────────────────────────────────────────── */
const PHASES = [
  { cx: 80,  cy: 415, lx: 58,  ly: 445, anchor: "middle" as const, text: "LANZAMIENTO" },
  { cx: 178, cy: 272, lx: 116, ly: 258, anchor: "end"    as const, text: "ASCENSO" },
  { cx: 288, cy: 168, lx: 312, ly: 142, anchor: "start"  as const, text: "SEP. ETAPAS" },
  { cx: 644, cy: 60,  lx: 666, ly: 34,  anchor: "start"  as const, text: "INSERCIÓN ORBITAL" },
  { cx: 960, cy: 95,  lx: 968, ly: 65,  anchor: "start"  as const, text: "CARGA ÚTIL" },
  { cx: 210, cy: 326, lx: 252, ly: 320, anchor: "start"  as const, text: "RETORNO" },
  { cx: 112, cy: 415, lx: 70,  ly: 445, anchor: "end"    as const, text: "ATERRIZAJE" },
];

/* ─── Component ─────────────────────────────────────────────────── */
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
    }, 4400);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId); };
  }, [inView]);

  return (
    <div className="py-12 md:py-16 px-4 md:px-16" style={{ background: "rgba(0,0,0,0.12)" }}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="tva-label mb-2">&gt;_ PERFIL DE MISIÓN</div>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue', sans-serif" }}>
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
            className="relative rounded-2xl overflow-hidden scanlines flex flex-col"
            style={{
              background: "#050100",
              border: "2px solid #C4522A",
              boxShadow: "0 0 24px rgba(196,82,42,0.42), inset 0 0 40px rgba(196,82,42,0.05)",
            }}
          >
            {/* CRT inner grid */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
              backgroundImage: [
                "repeating-linear-gradient(rgba(196,82,42,0.045) 0px,rgba(196,82,42,0.045) 1px,transparent 1px,transparent 40px)",
                "repeating-linear-gradient(90deg,rgba(196,82,42,0.045) 0px,rgba(196,82,42,0.045) 1px,transparent 1px,transparent 40px)",
              ].join(","),
            }} />

            {/* Corner brackets */}
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none z-20"
                style={{
                  color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace",
                  top: i < 2 ? 44 : undefined, bottom: i >= 2 ? 8 : undefined,
                  left: i % 2 === 0 ? 10 : undefined, right: i % 2 === 1 ? 10 : undefined,
                }}>{ch}</span>
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

            {/* SVG trajectory diagram */}
            <div className="relative z-10 overflow-x-auto">
              <svg
                viewBox="0 0 1000 470"
                className="w-full"
                style={{ display: "block", minWidth: 560 }}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect width="1000" height="470" fill="#050100" />

                {/* Altitude grid lines */}
                {[80, 160, 240, 320, 400].map((yv) => (
                  <line key={yv} x1="0" y1={yv} x2="1000" y2={yv}
                    stroke="rgba(255,240,220,0.025)" strokeWidth="1" />
                ))}

                {/* Ground */}
                <line x1="0" y1="415" x2="1000" y2="415"
                  stroke="rgba(255,240,220,0.12)" strokeWidth="1" />

                {/* Launch platform */}
                <rect x="60" y="400" width="40" height="15"
                  fill="none" stroke="rgba(255,240,220,0.3)" strokeWidth="1" />
                <line x1="80" y1="390" x2="80" y2="400"
                  stroke="rgba(255,240,220,0.3)" strokeWidth="1.5" />

                {/* Landing zone */}
                <rect x="95" y="405" width="35" height="10"
                  fill="none" stroke="rgba(196,82,42,0.4)"
                  strokeWidth="1" strokeDasharray="3 2" />

                {/* Booster return — glow then dashed */}
                <motion.path d={BOOSTER_PATH} fill="none"
                  stroke="rgba(255,240,220,0.05)" strokeWidth="6" strokeDasharray="8 5"
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }} />
                <motion.path d={BOOSTER_PATH} fill="none"
                  stroke="rgba(255,240,220,0.5)" strokeWidth="1.2" strokeDasharray="8 5"
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 1.4 }} />

                {/* Main ascent — glow then solid */}
                <motion.path d={MAIN_PATH} fill="none"
                  stroke="rgba(255,240,220,0.07)" strokeWidth="9"
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }} />
                <motion.path
                  ref={pathRef}
                  d={MAIN_PATH} fill="none"
                  stroke="rgba(255,240,220,0.85)" strokeWidth="1.5"
                  initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }} />

                {/* Stage separation ring */}
                <motion.circle cx="285" cy="168" r="7"
                  fill="none" stroke="rgba(196,82,42,0.9)"
                  strokeWidth="1.5" strokeDasharray="3 2"
                  initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.3, duration: 0.4 }} />

                {/* Static rockets BEFORE separation — full vehicle */}
                {BEFORE_SEP.map((pos, i) => (
                  <motion.g key={`bs-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.0 + i * 0.14, duration: 0.4 }}>
                    <Rocket2Stage x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.2} />
                  </motion.g>
                ))}

                {/* Stage separation — two stages diverging */}
                <motion.g initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 2.38, duration: 0.45 }}>
                  {/* S2 continuing forward-up */}
                  <Rocket2Stage
                    x={264} y={150} angleDeg={-32} scale={2.2}
                    showS1={false}
                    fill="rgba(255,240,220,0.9)" stroke="rgba(196,82,42,0.7)" />
                  {/* S1 booster beginning return — lit engine */}
                  <Rocket2Stage
                    x={312} y={188} angleDeg={142} scale={2.2}
                    showS2={false}
                    fill="rgba(255,240,220,0.65)" stroke="rgba(196,82,42,0.5)"
                    lit />
                </motion.g>

                {/* Static rockets AFTER separation — S2 only */}
                {AFTER_SEP_S2.map((pos, i) => (
                  <motion.g key={`as-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.55 + i * 0.14, duration: 0.4 }}>
                    <Rocket2Stage
                      x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.2}
                      showS1={false} fill="rgba(255,240,220,0.82)" />
                  </motion.g>
                ))}

                {/* Booster return — S1 only */}
                {BOOSTER_RETURN.map((pos, i) => (
                  <motion.g key={`br-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 2.68 + i * 0.14, duration: 0.4 }}>
                    <Rocket2Stage
                      x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.2}
                      showS2={false}
                      fill="rgba(255,240,220,0.45)" stroke="rgba(196,82,42,0.45)" />
                  </motion.g>
                ))}

                {/* Phase labels + connector lines */}
                {PHASES.map((phase, i) => (
                  <motion.g key={`ph-${i}`}
                    initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                    transition={{ delay: 3.1 + i * 0.14, duration: 0.45 }}>
                    <line
                      x1={phase.cx} y1={phase.cy}
                      x2={phase.lx} y2={phase.ly - 6}
                      stroke="rgba(255,240,220,0.2)" strokeWidth="0.8" strokeDasharray="4 3" />
                    <text
                      x={phase.lx} y={phase.ly}
                      textAnchor={phase.anchor}
                      fontFamily="'Space Mono', monospace"
                      fontSize="8" fill="rgba(255,240,220,0.72)" letterSpacing="0.12em">
                      {phase.text}
                    </text>
                  </motion.g>
                ))}

                {/* Travelling rocket sprite — full vehicle, lit */}
                <Rocket2Stage
                  x={rocketPos.x} y={rocketPos.y} angleDeg={rocketPos.angle}
                  scale={2.6} lit
                  fill="#FFD4A8" stroke="#C4522A" />
              </svg>
            </div>

            {/* Legend */}
            <div className="relative z-10 px-5 pb-4 pt-2 flex flex-wrap gap-6"
              style={{ fontFamily: "'Space Mono', monospace" }}>
              {[
                {
                  el: <div style={{ width: 28, height: "1.5px", background: "rgba(255,240,220,0.75)" }} />,
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
                    <div style={{ width: 12, height: 12, borderRadius: "50%",
                      border: "1.5px dashed rgba(196,82,42,0.9)" }} />
                  ),
                  label: "Separación de Etapas",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.el}
                  <span className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(255,240,220,0.45)" }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-5 py-1.5 flex-shrink-0"
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
