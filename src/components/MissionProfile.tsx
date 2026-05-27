"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ─── SVG paths ─────────────────────────────────────────────────── */
const PATH_A = "M 100 620 C 105 480, 130 360, 280 240";
const PATH_B = "M 280 240 C 240 220, 200 215, 215 270 C 230 320, 380 380, 540 460 C 640 510, 700 580, 720 600";
const PATH_C = "M 280 240 C 420 175, 600 130, 780 130 C 1000 130, 1180 200, 1270 360 C 1300 440, 1290 540, 1280 600";

/* ─── Phase labels rendered in SVG ─────────────────────────────── */
const SVG_PHASES = [
  { cx: 100,  cy: 600, lx: 186,  ly: 603, anchor: "start"  as const, text: "LAUNCH · T-00:00",          minPh: 0 },
  { cx: 130,  cy: 430, lx:  44,  ly: 433, anchor: "end"    as const, text: "ASCENSO",                    minPh: 1 },
  { cx: 280,  cy: 240, lx: 386,  ly: 183, anchor: "start"  as const, text: "HOT STAGING",                minPh: 2 },
  { cx: 215,  cy: 270, lx:  96,  ly: 293, anchor: "end"    as const, text: "BOOSTBACK BURN",             minPh: 3 },
  { cx: 540,  cy: 460, lx: 646,  ly: 513, anchor: "start"  as const, text: "SH DESCENT",                minPh: 4 },
  { cx: 720,  cy: 605, lx: 720,  ly: 665, anchor: "middle" as const, text: "AMERIZAJE · ZONA ALFA",      minPh: 5 },
  { cx: 600,  cy: 138, lx: 600,  ly:  80, anchor: "middle" as const, text: "STARSHIP · CORTE DE MOTOR",  minPh: 6 },
  { cx: 1270, cy: 360, lx: 1346, ly: 363, anchor: "start"  as const, text: "REENTRADA ATMOSFÉRICA",      minPh: 6 },
  { cx: 1280, cy: 600, lx: 1346, ly: 643, anchor: "start"  as const, text: "AMERIZAJE FINAL",            minPh: 7 },
];

/* ─── Phase bar labels ───────────────────────────────────────────── */
const PHASES = [
  "Lanzamiento", "Ascenso", "Hot Staging", "Boostback",
  "SH Descenso", "Amerizaje SH", "Costa / Entrada", "Aterrizaje",
];

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

/* ─── Main component ─────────────────────────────────────────────── */
export function MissionProfile() {
  const pathARef = useRef<SVGPathElement>(null);
  const pathBRef = useRef<SVGPathElement>(null);
  const pathCRef = useRef<SVGPathElement>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    const TOTAL_MS = 18000, HOLD_MS = 1800, CYCLE_MS = TOTAL_MS + HOLD_MS;
    let rafId = 0, startT: number | null = null;

    const pA = pathARef.current, pB = pathBRef.current, pC = pathCRef.current;
    if (!pA || !pB || !pC) return;

    const lenA = pA.getTotalLength();
    const lenB = pB.getTotalLength();
    const lenC = pC.getTotalLength();

    pA.style.strokeDasharray = `${lenA} ${lenA}`;
    pB.style.strokeDasharray = `${lenB} ${lenB}`;
    pC.style.strokeDasharray = `${lenC} ${lenC}`;
    pA.style.strokeDashoffset = String(lenA);
    pB.style.strokeDashoffset = String(lenB);
    pC.style.strokeDashoffset = String(lenC);

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (startT === null) startT = now;
      const elapsed = (now - startT) % CYCLE_MS;
      const tt = elapsed < TOTAL_MS ? elapsed / TOTAL_MS : 1;

      pA!.style.strokeDashoffset = String(lenA * (1 - Math.min(1, tt / 0.22)));
      pB!.style.strokeDashoffset = String(lenB * (1 - Math.max(0, Math.min(1, (tt - 0.22) / 0.40))));
      pC!.style.strokeDashoffset = String(lenC * (1 - Math.max(0, Math.min(1, (tt - 0.22) / 0.78))));
      setPhaseIdx(phaseFromT(tt));
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
            <span className="text-[10px] tracking-[0.15em] uppercase font-bold hidden md:block"
              style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
              ████ NEXTECH — PERFIL DE MISIÓN NX-HEAVY // ULASB 2026 ████
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase font-bold md:hidden"
              style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
              PERFIL DE MISIÓN
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

              {/* Launch pad */}
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

              {/* Stage separation ring */}
              <circle cx="280" cy="240" r="8"
                fill="none" stroke="rgba(196,82,42,0.75)" strokeWidth="1.5" strokeDasharray="3 2" />

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
                <line x1="0" y1="0" x2="0" y2="500" stroke="rgba(196,82,42,0.28)" strokeWidth="0.5" />
                {([["200 KM", 0], ["150 KM", 125], ["100 KM · KÁRMÁN", 250], ["50 KM", 375], ["0 · MAR", 500]] as [string, number][]).map(([label, yp]) => (
                  <g key={label}>
                    <line x1="-4" y1={yp} x2="4" y2={yp} stroke="rgba(196,82,42,0.38)" strokeWidth="0.5" />
                    <text x="10" y={yp + 3}>{label}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Phase bar */}
          <div className="relative z-10 border-t"
            style={{ borderTopColor: "rgba(196,82,42,0.2)", background: "#0A0300" }}>
            <div className="grid grid-cols-4 md:grid-cols-8" style={{ gap: 4, padding: "16px 20px 6px" }}>
              {PHASES.map((label, i) => (
                <div key={i} style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  paddingTop: 8,
                  paddingBottom: 10,
                  color: i < phaseIdx ? "rgba(255,212,168,0.45)" : i === phaseIdx ? "#C4522A" : "rgba(255,212,168,0.18)",
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
  );
}
