"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ─── SVG paths ─────────────────────────────────────────────────── */
const PATH_A = "M 100 620 C 105 480, 130 360, 280 240";
const PATH_B = "M 280 240 C 240 220, 200 215, 215 270 C 230 320, 380 380, 540 460 C 640 510, 700 580, 720 600";
const PATH_C = "M 280 240 C 420 175, 600 130, 780 130 C 1000 130, 1180 200, 1270 360 C 1300 440, 1290 540, 1280 600";

/* ─── Phase labels rendered in SVG ─────────────────────────────── */
const SVG_PHASES = [
  { cx: 100,  cy: 600, lx: 186,  ly: 603, anchor: "start"  as const, text: "LAUNCH · T-00:00",                minPh: 0 },
  { cx: 130,  cy: 430, lx:  44,  ly: 433, anchor: "end"    as const, text: "ASCENSO",                         minPh: 1 },
  { cx: 280,  cy: 240, lx: 386,  ly: 183, anchor: "start"  as const, text: "HOT STAGING",                     minPh: 2 },
  { cx: 215,  cy: 270, lx:  96,  ly: 293, anchor: "end"    as const, text: "BOOSTBACK BURN",                  minPh: 3 },
  { cx: 540,  cy: 460, lx: 646,  ly: 513, anchor: "start"  as const, text: "SH DESCENT",                     minPh: 4 },
  { cx: 720,  cy: 605, lx: 720,  ly: 665, anchor: "middle" as const, text: "AMERIZAJE · ZONA ALFA",           minPh: 5 },
  { cx: 600,  cy: 138, lx: 600,  ly:  80, anchor: "middle" as const, text: "STARSHIP · CORTE DE MOTOR",       minPh: 6 },
  { cx: 1270, cy: 360, lx: 1346, ly: 363, anchor: "start"  as const, text: "REENTRADA ATMOSFÉRICA",           minPh: 6 },
  { cx: 1280, cy: 600, lx: 1346, ly: 643, anchor: "start"  as const, text: "AMERIZAJE FINAL",                 minPh: 7 },
];

/* ─── Phase bar labels ───────────────────────────────────────────── */
const PHASES = [
  "Lanzamiento", "Ascenso", "Hot Staging", "Boostback",
  "SH Descenso", "Amerizaje SH", "Costa / Entrada", "Aterrizaje",
];

/* ─── Helpers ───────────────────────────────────────────────────── */
function phaseFromT(tt: number) {
  if (tt < 0.04)  return 0;
  if (tt < 0.20)  return 1;
  if (tt < 0.225) return 2;
  if (tt < 0.30)  return 3;
  if (tt < 0.55)  return 4;
  if (tt < 0.62)  return 5;
  if (tt < 0.85)  return 6;
  return 7;
}

/* ─── Two-stage rocket silhouette ────────────────────────────────── */
type RocketProps = {
  x: number; y: number; angleDeg: number; scale?: number;
  showS1?: boolean; showS2?: boolean; exhaust?: boolean;
  fill?: string; stroke?: string; opacity?: number;
};
function Rocket2Stage({
  x, y, angleDeg, scale = 1,
  showS1 = true, showS2 = true, exhaust = false,
  fill = "rgba(255,240,220,0.82)", stroke = "rgba(196,82,42,0.6)", opacity = 1,
}: RocketProps) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angleDeg}) scale(${scale})`} opacity={opacity}>
      {exhaust && showS1 && (
        <>
          <ellipse cx="0" cy="14" rx="1.4" ry="2.8" fill="rgba(196,82,42,0.5)" />
          <ellipse cx="0" cy="12.5" rx="0.9" ry="1.6" fill="rgba(255,180,80,0.65)" />
        </>
      )}
      {showS2 && (
        <>
          <path d="M 0,-14 L -2,-9 L 2,-9 Z" fill={fill} stroke={stroke} strokeWidth="0.35" />
          <rect x="-2" y="-9" width="4" height="8.5" rx="0.4" fill={fill} stroke={stroke} strokeWidth="0.35" />
          <rect x="-2.5" y="-0.5" width="5" height="1" fill={fill} stroke={stroke} strokeWidth="0.35" />
        </>
      )}
      {showS1 && (
        <>
          <rect x="-2.5" y="0.5" width="5" height="7.5" rx="0.3" fill={fill} stroke={stroke} strokeWidth="0.35" />
          <path d="M -2.5,1 L -4.5,1.5 L -4.5,3.5 L -2.5,3.5 Z" fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M  2.5,1 L  4.5,1.5 L  4.5,3.5 L  2.5,3.5 Z" fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M -2.5,6.5 L -5,9.5 L -3.8,9.5 L -2.5,7.5 Z" fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M  2.5,6.5 L  5,9.5 L  3.8,9.5 L  2.5,7.5 Z" fill={fill} stroke={stroke} strokeWidth="0.3" />
          <path d="M -2,8 L -2.5,10.5 L 2.5,10.5 L 2,8 Z" fill={fill} stroke={stroke} strokeWidth="0.3" />
        </>
      )}
    </g>
  );
}

/* ─── Static rocket positions ────────────────────────────────────── */
const SILHOUETTES_PRE  = [{ x: 80,  y: 415, angle: -82 }, { x: 190, y: 265, angle: -58 }];
const SILHOUETTES_POST = [{ x: 645, y: 60,  angle: 2   }, { x: 960, y: 95,  angle: 8   }];
const SILHOUETTES_SH   = [{ x: 228, y: 290, angle: 148 }, { x: 113, y: 415, angle: 172 }];

/* ─── Main component ─────────────────────────────────────────────── */
export function MissionProfile() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const pathARef    = useRef<SVGPathElement>(null);
  const pathBRef    = useRef<SVGPathElement>(null);
  const pathCRef    = useRef<SVGPathElement>(null);
  const travelRef   = useRef<SVGPathElement>(null);
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [rocketPos, setRocketPos]   = useState({ x: 100, y: 620, angle: -82 });
  const [showRocket, setShowRocket] = useState(false);

  useEffect(() => {
    const TOTAL_MS = 18000, HOLD_MS = 1800, CYCLE_MS = TOTAL_MS + HOLD_MS;
    let rafId = 0, startT: number | null = null;

    const pA = pathARef.current, pB = pathBRef.current, pC = pathCRef.current;
    const pT = travelRef.current;
    if (!pA || !pB || !pC || !pT) return;

    const lenA = pA.getTotalLength();
    const lenB = pB.getTotalLength();
    const lenC = pC.getTotalLength();
    const lenT = pT.getTotalLength();

    pA.style.strokeDasharray = `${lenA} ${lenA}`;
    pB.style.strokeDasharray = `${lenB} ${lenB}`;
    pC.style.strokeDasharray = `${lenC} ${lenC}`;
    pA.style.strokeDashoffset = String(lenA);
    pB.style.strokeDashoffset = String(lenB);
    pC.style.strokeDashoffset = String(lenC);

    let travelProgress = 0;

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (startT === null) startT = now;
      const elapsed = (now - startT) % CYCLE_MS;
      const tt = elapsed < TOTAL_MS ? elapsed / TOTAL_MS : 1;

      const tA = Math.min(1, tt / 0.22);
      pA!.style.strokeDashoffset = String(lenA * (1 - tA));
      const tB = Math.max(0, Math.min(1, (tt - 0.22) / 0.40));
      pB!.style.strokeDashoffset = String(lenB * (1 - tB));
      const tC = Math.max(0, Math.min(1, (tt - 0.22) / 0.78));
      pC!.style.strokeDashoffset = String(lenC * (1 - tC));

      setPhaseIdx(phaseFromT(tt));

      // travelling rocket along full path
      travelProgress += lenT / (80 * 60);
      if (travelProgress > lenT) travelProgress = 0;
      const pt  = pT!.getPointAtLength(travelProgress);
      const pt2 = pT!.getPointAtLength(Math.min(travelProgress + 3, lenT));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI) - 90;
      setRocketPos({ x: pt.x, y: pt.y, angle });
      setShowRocket(true);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const MAIN_PATH_FOR_TRAVEL =
    "M 100 620 C 105 480, 130 360, 280 240 C 420 175, 600 130, 780 130 C 1000 130, 1180 200, 1270 360 C 1300 440, 1290 540, 1280 600";

  return (
    <div className="py-12 md:py-16 px-4 md:px-16" style={{ background: "rgba(0,0,0,0.12)" }}>
      <div className="max-w-6xl mx-auto space-y-6">

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="tva-label mb-2">&gt;_ PERFIL DE MISIÓN</div>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue',sans-serif" }}>
            Ascenso &amp; Recuperación
          </h2>
          <div className="tva-label mb-1" style={{ color: "rgba(255,212,168,0.6)" }}>
            Perfil de Vuelo — Recuperación de Dos Etapas · NX-Heavy
          </div>
          <div className="h-px w-16" style={{ background: "rgba(255,255,255,0.3)" }} />
        </motion.div>

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
            {/* CRT grid */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{
              backgroundImage: [
                "repeating-linear-gradient(rgba(196,82,42,0.04) 0px,rgba(196,82,42,0.04) 1px,transparent 1px,transparent 40px)",
                "repeating-linear-gradient(90deg,rgba(196,82,42,0.04) 0px,rgba(196,82,42,0.04) 1px,transparent 1px,transparent 40px)",
              ].join(","),
            }} />
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none z-20"
                style={{
                  color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace",
                  top: i < 2 ? 8 : undefined, bottom: i >= 2 ? 8 : undefined,
                  left: i % 2 === 0 ? 10 : undefined, right: i % 2 === 1 ? 10 : undefined,
                }}>{ch}</span>
            ))}
            {/* Header stripe */}
            <div className="relative z-10 flex items-center justify-between px-4 h-9"
              style={{ background: "#C4522A" }}>
              <span className="text-[10px] tracking-[0.15em] uppercase font-bold"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
                ████ NEXTECH — PERFIL DE MISIÓN NX-HEAVY // ULASB 2026 ████
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0A0300" }} />
                <span className="text-[9px] tracking-[0.12em] uppercase font-bold"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>LOOPING</span>
              </div>
            </div>

            {/* SVG trajectory */}
            <div className="relative z-10 overflow-x-auto">
              <svg viewBox="0 0 1400 700" className="w-full" style={{ display: "block", minWidth: 560 }}
                preserveAspectRatio="xMidYMid meet">
                <rect width="1400" height="700" fill="#050100" />

                {/* Subtle grid */}
                {[140, 280, 420, 560].map((y) => (
                  <line key={y} x1="0" y1={y} x2="1400" y2={y}
                    stroke="rgba(196,82,42,0.04)" strokeWidth="1" />
                ))}

                {/* Horizon */}
                <line x1="40" y1="620" x2="1360" y2="620"
                  stroke="rgba(255,240,220,0.1)" strokeWidth="1" />

                {/* Launch pad (simplified tower) */}
                <g transform="translate(60,530)">
                  <path d="M30 90 L30 12 L36 6 L36 90 M30 12 L36 6 M10 90 L70 90 M14 90 L14 80 L66 80 L66 90 M20 80 L20 70 L60 70 L60 80 M30 70 L30 60 L50 60 L50 70"
                    stroke="rgba(255,240,220,0.22)" strokeWidth="0.8" fill="none" />
                  <path d="M36 30 L52 30 L52 36 L36 36"
                    stroke="rgba(255,240,220,0.22)" strokeWidth="0.8" fill="none" />
                </g>

                {/* Splashdown ripples */}
                {([[1280, 595, 0.6], [720, 595, 0.8]] as [number, number, number][]).map(([tx, ty, sc], k) => (
                  <g key={k} transform={`translate(${tx},${ty}) scale(${sc})`}>
                    <path d="M-30 4 q5 -4 10 0 t10 0 t10 0 t10 0 t10 0"
                      stroke="rgba(196,82,42,0.4)" strokeWidth="0.6" fill="none" />
                    <path d="M-30 9 q5 -4 10 0 t10 0 t10 0 t10 0 t10 0"
                      stroke="rgba(196,82,42,0.25)" strokeWidth="0.5" fill="none" />
                  </g>
                ))}

                {/* Animated paths */}
                <path ref={pathARef} d={PATH_A} fill="none"
                  stroke="rgba(255,240,220,0.75)" strokeWidth="1.5" />
                <path ref={pathBRef} d={PATH_B} fill="none"
                  stroke="rgba(255,240,220,0.45)" strokeWidth="1.2" />
                <path ref={pathCRef} d={PATH_C} fill="none"
                  stroke="rgba(255,240,220,0.7)" strokeWidth="1.5" />

                {/* Hidden travel path (full arc) */}
                <path ref={travelRef} d={MAIN_PATH_FOR_TRAVEL}
                  fill="none" stroke="transparent" strokeWidth="0" />

                {/* Stage separation ring */}
                <circle cx="280" cy="240" r="8"
                  fill="none" stroke="rgba(196,82,42,0.75)" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Rocket silhouettes — pre-separation */}
                {SILHOUETTES_PRE.map((pos, i) => (
                  <Rocket2Stage key={`pre-${i}`} x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3}
                    fill="rgba(255,240,220,0.55)" stroke="rgba(196,82,42,0.45)" />
                ))}
                {/* Separation moment */}
                <Rocket2Stage x={268} y={155} angleDeg={-32} scale={2.3}
                  showS1={false} fill="rgba(255,240,220,0.7)" stroke="rgba(196,82,42,0.5)" />
                <Rocket2Stage x={308} y={186} angleDeg={138} scale={2.3}
                  showS2={false} fill="rgba(255,240,220,0.45)" stroke="rgba(196,82,42,0.4)" />
                {/* Post-separation S2 */}
                {SILHOUETTES_POST.map((pos, i) => (
                  <Rocket2Stage key={`post-${i}`} x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3}
                    showS1={false} fill="rgba(255,240,220,0.55)" stroke="rgba(196,82,42,0.4)" />
                ))}
                {/* Booster return S1 */}
                {SILHOUETTES_SH.map((pos, i) => (
                  <Rocket2Stage key={`sh-${i}`} x={pos.x} y={pos.y} angleDeg={pos.angle} scale={2.3}
                    showS2={false} fill="rgba(255,240,220,0.35)" stroke="rgba(196,82,42,0.35)" />
                ))}

                {/* Phase labels */}
                {SVG_PHASES.map((phase, i) => (
                  <g key={i} opacity={phaseIdx >= phase.minPh ? (phaseIdx === phase.minPh ? 1 : 0.38) : 0.12}>
                    <line x1={phase.cx} y1={phase.cy} x2={phase.lx} y2={phase.ly - 8}
                      stroke="rgba(255,240,220,0.18)" strokeWidth="0.8" strokeDasharray="4 3" />
                    <text x={phase.lx} y={phase.ly} textAnchor={phase.anchor}
                      fontFamily="'Space Mono',monospace" fontSize="9" letterSpacing="0.18em"
                      fill={phaseIdx === phase.minPh ? "rgba(196,82,42,0.95)" : "rgba(255,240,220,0.6)"}>
                      {phase.text}
                    </text>
                  </g>
                ))}

                {/* Altimeter */}
                <g transform="translate(1352,100)" fontFamily="'Space Mono',monospace"
                  fill="rgba(196,82,42,0.42)" fontSize="8" letterSpacing="1.5">
                  <line x1="0" y1="0" x2="0" y2="500"
                    stroke="rgba(196,82,42,0.28)" strokeWidth="0.5" />
                  {([["200 KM", 0], ["150 KM", 125], ["100 KM · KÁRMÁN", 250], ["50 KM", 375], ["0 · MAR", 500]] as [string, number][]).map(([label, yp]) => (
                    <g key={label}>
                      <line x1="-4" y1={yp} x2="4" y2={yp} stroke="rgba(196,82,42,0.38)" strokeWidth="0.5" />
                      <text x="10" y={yp + 3}>{label}</text>
                    </g>
                  ))}
                </g>

                {/* Travelling rocket sprite */}
                {showRocket && (
                  <Rocket2Stage x={rocketPos.x} y={rocketPos.y} angleDeg={rocketPos.angle}
                    scale={2.8} exhaust fill="#FFD4A8" stroke="#C4522A" />
                )}
              </svg>
            </div>

            {/* Phase bar */}
            <div className="relative z-10 border-t"
              style={{ borderTopColor: "rgba(196,82,42,0.2)", background: "#0A0300" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(8,1fr)",
                gap: 4,
                padding: "16px 20px 6px",
              }}>
                {PHASES.map((label, i) => (
                  <div key={i} style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 9,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    paddingTop: 8,
                    paddingBottom: 10,
                    color: i < phaseIdx ? "rgba(255,212,168,0.45)"
                      : i === phaseIdx ? "#C4522A"
                      : "rgba(255,212,168,0.18)",
                    borderTop: `1px solid ${i < phaseIdx ? "rgba(196,82,42,0.3)" : i === phaseIdx ? "#C4522A" : "rgba(255,212,168,0.07)"}`,
                    position: "relative" as const,
                    overflow: "hidden",
                  }}>
                    <span style={{ display: "block", fontSize: 8, letterSpacing: "0.22em", marginBottom: 3,
                      color: i === phaseIdx ? "#C4522A" : "rgba(196,82,42,0.38)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {label}
                    {i === phaseIdx && (
                      <span style={{
                        position: "absolute", top: -1, left: 0, height: 1, background: "#C4522A",
                        boxShadow: "0 0 8px #C4522A",
                        animation: "drawLine 1.4s linear infinite",
                        display: "block",
                      }} className="w-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="relative z-10 px-4 pb-3 pt-2 flex flex-wrap gap-6"
              style={{ fontFamily: "'Space Mono',monospace" }}>
              {[
                { el: <div className="w-7" style={{ height: "1.5px", background: "rgba(255,240,220,0.75)" }} />, label: "Segunda Etapa" },
                {
                  el: (
                    <svg width="28" height="4">
                      <line x1="0" y1="2" x2="28" y2="2" stroke="rgba(255,240,220,0.5)" strokeWidth="1.2" strokeDasharray="5 4" />
                    </svg>
                  ),
                  label: "Primera Etapa (Retorno)",
                },
                { el: <div className="w-3 h-3 rounded-full" style={{ border: "1.5px dashed rgba(196,82,42,0.8)" }} />, label: "Separación de Etapas" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  {item.el}
                  <span className="text-[10px] tracking-[0.1em] uppercase"
                    style={{ color: "rgba(255,240,220,0.45)" }}>{item.label}</span>
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
