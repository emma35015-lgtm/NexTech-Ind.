"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Problem data ─────────────────────────────────────────────────────────────
const ORIGINS = ["León", "Cabo Cañaveral", "Kourou"];
const DESTS   = ["Vandenberg", "Mar Pacífico", "Wallops", "Mahia"];
const SUPPLY  = [50, 70, 80];
const DEMAND  = [60, 50, 40, 50];
const COSTS   = [
  [12, 10, 16, 14],
  [ 8, 14, 12, 16],
  [10, 16, 14, 10],
];

interface Step {
  cell: [number, number];
  amount: number;
  supplyLeft: number[];
  demandLeft: number[];
  runningTotal: number;
  description: string;
}

const METHODS = {
  eno: {
    name: "Esquina Noroeste",
    shortName: "ENO",
    total: 2420,
    steps: [
      { cell: [0,0] as [number,number], amount: 50, supplyLeft:[0,70,80],  demandLeft:[10,50,40,50], runningTotal:600,  description:"Paso 1/6 — León → Vandenberg · 50 mot · $12k c/u · Subtotal $600k" },
      { cell: [1,0] as [number,number], amount: 10, supplyLeft:[0,60,80],  demandLeft:[0,50,40,50],  runningTotal:680,  description:"Paso 2/6 — Cabo Cañaveral → Vandenberg · 10 mot · $8k c/u · Subtotal $80k" },
      { cell: [1,1] as [number,number], amount: 50, supplyLeft:[0,10,80],  demandLeft:[0,0,40,50],   runningTotal:1380, description:"Paso 3/6 — Cabo Cañaveral → Mar Pacífico · 50 mot · $14k c/u · Subtotal $700k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,80],   demandLeft:[0,0,30,50],   runningTotal:1500, description:"Paso 4/6 — Cabo Cañaveral → Wallops · 10 mot · $12k c/u · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,50],   demandLeft:[0,0,0,50],    runningTotal:1920, description:"Paso 5/6 — Kourou → Wallops · 30 mot · $14k c/u · Subtotal $420k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,0,0],    demandLeft:[0,0,0,0],     runningTotal:2420, description:"Paso 6/6 — Kourou → Mahia · 50 mot · $10k c/u · Subtotal $500k" },
    ] as Step[],
    procedure: [
      "ESQUINA NOROESTE — Se asigna siempre a la celda superior-izquierda disponible.",
      "",
      "Paso 1: [León, Vandenberg] → min(50,60) = 50 mot · $12k → $600k",
      "         León agotado. Demanda Vandenberg = 10 restantes.",
      "Paso 2: [Cabo C., Vandenberg] → min(70,10) = 10 mot · $8k → $80k",
      "         Vandenberg agotado. Oferta Cabo C. = 60 restantes.",
      "Paso 3: [Cabo C., Mar Pacífico] → min(60,50) = 50 mot · $14k → $700k",
      "         Mar Pacífico agotado. Oferta Cabo C. = 10 restantes.",
      "Paso 4: [Cabo C., Wallops] → min(10,40) = 10 mot · $12k → $120k",
      "         Cabo C. agotado. Demanda Wallops = 30 restantes.",
      "Paso 5: [Kourou, Wallops] → min(80,30) = 30 mot · $14k → $420k",
      "         Wallops agotado. Oferta Kourou = 50 restantes.",
      "Paso 6: [Kourou, Mahia] → min(50,50) = 50 mot · $10k → $500k",
      "         Problema resuelto.",
      "",
      "COSTO TOTAL: 600+80+700+120+420+500 = $2,420k",
    ],
  },
  costoMinimo: {
    name: "Costo Mínimo",
    shortName: "Costo Mínimo",
    total: 2020,
    steps: [
      { cell: [1,0] as [number,number], amount: 60, supplyLeft:[50,10,80],  demandLeft:[0,50,40,50],  runningTotal:480,  description:"Paso 1/5 — Cabo C. → Vandenberg · 60 mot · $8k (mín. global) · Subtotal $480k" },
      { cell: [0,1] as [number,number], amount: 50, supplyLeft:[0,10,80],   demandLeft:[0,0,40,50],   runningTotal:980,  description:"Paso 2/5 — León → Mar Pacífico · 50 mot · $10k · Subtotal $500k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,10,30],   demandLeft:[0,0,40,0],    runningTotal:1480, description:"Paso 3/5 — Kourou → Mahia · 50 mot · $10k · Subtotal $500k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,30],    demandLeft:[0,0,30,0],    runningTotal:1600, description:"Paso 4/5 — Cabo C. → Wallops · 10 mot · $12k · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,0],     demandLeft:[0,0,0,0],     runningTotal:2020, description:"Paso 5/5 — Kourou → Wallops · 30 mot · $14k · Subtotal $420k" },
    ] as Step[],
    procedure: [
      "COSTO MÍNIMO — Se asigna primero a la celda con menor costo disponible.",
      "",
      "Paso 1: Menor costo global = $8k [Cabo C., Vandenberg]",
      "         min(70,60) = 60 mot → $480k. Vandenberg agotado. Cabo C.=10.",
      "Paso 2: Menor disponible = $10k [León, Mar Pacífico]",
      "         min(50,50) = 50 mot → $500k. León y Mar Pacífico agotados.",
      "Paso 3: Menor disponible = $10k [Kourou, Mahia]",
      "         min(80,50) = 50 mot → $500k. Mahia agotada. Kourou=30.",
      "Paso 4: Cabo C.=10 restantes → [Cabo C., Wallops]",
      "         min(10,40) = 10 mot → $120k. Cabo C. agotado. Wallops=30.",
      "Paso 5: [Kourou, Wallops] → min(30,30) = 30 mot → $420k.",
      "         Problema resuelto.",
      "",
      "COSTO TOTAL: 480+500+500+120+420 = $2,020k",
    ],
  },
  vogel: {
    name: "Aproximación de Vogel",
    shortName: "Vogel",
    total: 2020,
    steps: [
      { cell: [1,0] as [number,number], amount: 60, supplyLeft:[50,10,80],  demandLeft:[0,50,40,50],  runningTotal:480,  description:"Paso 1/5 — Cabo C. → Vandenberg · 60 mot · $8k (pen. fila=4) · Subtotal $480k" },
      { cell: [0,1] as [number,number], amount: 50, supplyLeft:[0,10,80],   demandLeft:[0,0,40,50],   runningTotal:980,  description:"Paso 2/5 — León → Mar Pacífico · 50 mot · $10k (pen. fila=6) · Subtotal $500k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,10,30],   demandLeft:[0,0,40,0],    runningTotal:1480, description:"Paso 3/5 — Kourou → Mahia · 50 mot · $10k (pen. col=6) · Subtotal $500k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,30],    demandLeft:[0,0,30,0],    runningTotal:1600, description:"Paso 4/5 — Cabo C. → Wallops · 10 mot · $12k · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,0],     demandLeft:[0,0,0,0],     runningTotal:2020, description:"Paso 5/5 — Kourou → Wallops · 30 mot · $14k · Subtotal $420k" },
    ] as Step[],
    procedure: [
      "VOGEL (VAM) — Penalización = diferencia entre 1er y 2do menor costo de cada fila/col.",
      "",
      "Iteración 1 — Penalizaciones:",
      "  Fila León:        10→12 pen=2   Fila Cabo C.: 8→12 pen=4 ← MAYOR",
      "  Fila Kourou:     10→10 pen=0",
      "  Col Vandenberg:   8→10 pen=2   Col Mar Pac.: 10→14 pen=4",
      "  Col Wallops:     12→14 pen=2   Col Mahia:    10→14 pen=4",
      "  → Mayor=4 (Cabo C. row) → asignar [Cabo C., Vandenberg] $8k",
      "  min(70,60)=60 mot → $480k. Vandenberg agotado.",
      "",
      "Iteración 2 (sin col Vandenberg):",
      "  Fila León: 10→16 pen=6 ← MAYOR",
      "  → [León, Mar Pacífico] $10k · 50 mot → $500k. León/Mar Pac. agotados.",
      "",
      "Iteración 3 (sin León, sin Mar Pacífico):",
      "  Col Mahia: Kourou=$10, Cabo C.=$16 → pen=6 ← MAYOR",
      "  → [Kourou, Mahia] $10k · 50 mot → $500k. Mahia agotada.",
      "",
      "Pasos 4-5: Asignar restantes → Wallops",
      "  [Cabo C., Wallops]: 10 mot · $12k → $120k",
      "  [Kourou, Wallops]: 30 mot · $14k → $420k",
      "",
      "COSTO TOTAL: 480+500+500+120+420 = $2,020k",
    ],
  },
} as const;

type MethodKey = keyof typeof METHODS;

function buildGrid(steps: Step[], upTo: number): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: 3 }, () => Array(4).fill(null));
  for (let i = 0; i <= upTo && i < steps.length; i++) {
    const [r, c] = steps[i].cell;
    grid[r][c] = steps[i].amount;
  }
  return grid;
}

const BEST_TOTAL = Math.min(METHODS.eno.total, METHODS.costoMinimo.total, METHODS.vogel.total);
const MAX_TOTAL  = Math.max(METHODS.eno.total, METHODS.costoMinimo.total, METHODS.vogel.total);

export function TransporteSection() {
  const [activeMethod, setActiveMethod] = useState<MethodKey>("eno");
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProc, setShowProc] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const method = METHODS[activeMethod];
  const totalSteps = method.steps.length;
  const isDone = currentStep >= totalSteps - 1;
  const grid = buildGrid(method.steps as unknown as Step[], currentStep);
  const supplyLeft = currentStep >= 0 ? method.steps[currentStep].supplyLeft : SUPPLY;
  const demandLeft = currentStep >= 0 ? method.steps[currentStep].demandLeft : DEMAND;
  const runningTotal = currentStep >= 0 ? method.steps[currentStep].runningTotal : 0;
  const currentCell = currentStep >= 0 ? method.steps[currentStep].cell : null;

  const stopPlay = () => {
    if (playRef.current) clearInterval(playRef.current);
    playRef.current = null;
    setIsPlaying(false);
  };

  const startPlay = () => {
    setIsPlaying(true);
    playRef.current = setInterval(() => {
      setCurrentStep((s) => {
        const next = s + 1;
        if (next >= totalSteps - 1) { stopPlay(); return totalSteps - 1; }
        return next;
      });
    }, 1200);
  };

  useEffect(() => () => stopPlay(), []);

  const switchMethod = (m: MethodKey) => {
    stopPlay();
    setActiveMethod(m);
    setCurrentStep(-1);
    setShowProc(false);
  };

  const prev = () => { stopPlay(); setCurrentStep((s) => Math.max(-1, s - 1)); };
  const next = () => { stopPlay(); setCurrentStep((s) => Math.min(totalSteps - 1, s + 1)); };
  const togglePlay = () => { if (isPlaying) stopPlay(); else if (!isDone) startPlay(); };

  return (
    <div style={{ background: "rgba(0,0,0,0.22)" }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-14 md:py-20 px-4 md:px-16"
      >
        <div className="max-w-5xl mx-auto space-y-10">

          {/* ── Header ── */}
          <div className="space-y-3">
            <div className="tva-label">&gt;_ SECCIÓN 05</div>
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF", fontFamily: "'Bebas Neue', sans-serif" }}>
              Métodos de Transporte
            </h2>
            <p className="text-base md:text-lg" style={{ color: "rgba(255,240,220,0.85)" }}>
              Distribución de motores LRE-7 desde <strong style={{ color: "#FFD4A8" }}>3 plantas</strong> hacia <strong style={{ color: "#FFD4A8" }}>4 sitios de lanzamiento</strong>.
              Problema balanceado: oferta = demanda = 200 mot/mes.
            </p>
            <div className="h-px w-16" style={{ background: "rgba(255,240,220,0.35)" }} />
          </div>

          {/* ── Cost matrix ── */}
          <div
            className="relative rounded-sm overflow-hidden"
            style={{ background: "#0A0300", border: "2px solid rgba(196,82,42,0.7)", boxShadow: "0 0 14px rgba(196,82,42,0.3)" }}
          >
            <div className="px-4 h-10 flex items-center justify-between" style={{ background: "#C4522A" }}>
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}>
                ████ MATRIZ DE COSTOS (Miles USD / Motor) ████
              </span>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full border-collapse" style={{ minWidth: 440 }}>
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold" style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,240,220,0.5)", border: "1px solid rgba(255,240,220,0.12)", fontFamily: "'Space Mono', monospace" }}>
                      Origen \ Destino
                    </th>
                    {DESTS.map((d) => (
                      <th key={d} className="px-4 py-3 text-center text-sm font-bold" style={{ background: "rgba(0,0,0,0.4)", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.12)", fontFamily: "'Space Mono', monospace" }}>
                        {d}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-bold" style={{ background: "rgba(196,82,42,0.2)", color: "#C4522A", border: "1px solid rgba(196,82,42,0.4)", fontFamily: "'Space Mono', monospace" }}>
                      Oferta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ORIGINS.map((o, r) => (
                    <tr key={o}>
                      <td className="px-4 py-3 text-sm font-bold" style={{ background: "rgba(0,0,0,0.3)", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)", fontFamily: "'Space Mono', monospace" }}>
                        {o}
                      </td>
                      {COSTS[r].map((c, col) => (
                        <td key={col} className="px-4 py-3 text-center text-base" style={{ background: "rgba(0,0,0,0.18)", color: "#FFF0DC", border: "1px solid rgba(255,240,220,0.1)", fontFamily: "'Space Mono', monospace" }}>
                          <span className="font-bold">${c}</span><span style={{ color: "rgba(255,212,168,0.5)", fontSize: "0.8em" }}>k</span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-base font-bold" style={{ background: "rgba(196,82,42,0.15)", color: "#C4522A", border: "1px solid rgba(196,82,42,0.3)", fontFamily: "'Space Mono', monospace" }}>
                        {SUPPLY[r]}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold" style={{ background: "rgba(0,0,0,0.5)", color: "#C4522A", border: "1px solid rgba(196,82,42,0.3)", fontFamily: "'Space Mono', monospace" }}>Demanda</td>
                    {DEMAND.map((d, i) => (
                      <td key={i} className="px-4 py-3 text-center text-base font-bold" style={{ background: "rgba(196,82,42,0.15)", color: "#C4522A", border: "1px solid rgba(196,82,42,0.3)", fontFamily: "'Space Mono', monospace" }}>{d}</td>
                    ))}
                    <td className="px-4 py-3 text-center text-base font-bold" style={{ background: "rgba(0,0,0,0.5)", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.15)", fontFamily: "'Space Mono', monospace" }}>200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Method tabs ── */}
          <div className="space-y-3">
            <div className="tva-label">&gt; Seleccionar Método de Solución</div>
            <div className="flex flex-wrap gap-3">
              {(["eno", "costoMinimo", "vogel"] as MethodKey[]).map((m) => {
                const active = activeMethod === m;
                return (
                  <button
                    key={m}
                    onClick={() => switchMethod(m)}
                    className="flex-1 min-w-[130px] px-5 py-3 text-sm tracking-[0.1em] uppercase font-bold transition-all"
                    style={{
                      background: active ? "#C4522A" : "rgba(10,3,0,0.6)",
                      border: `2px solid ${active ? "#C4522A" : "rgba(255,240,220,0.2)"}`,
                      color: active ? "#0A0300" : "rgba(255,240,220,0.75)",
                      fontFamily: "'Space Mono', monospace",
                      boxShadow: active ? "0 0 12px rgba(196,82,42,0.5)" : "none",
                    }}
                  >
                    {active && "▶ "}{METHODS[m].shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Interactive TVA panel ── */}
          <div
            className="relative rounded-sm overflow-hidden"
            style={{
              background: "#0A0300",
              border: "2px solid #C4522A",
              boxShadow: "0 0 18px rgba(196,82,42,0.4), inset 0 0 30px rgba(196,82,42,0.05)",
            }}
          >
            {/* CRT grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: [
                  "repeating-linear-gradient(rgba(196,82,42,0.05) 0px,rgba(196,82,42,0.05) 1px,transparent 1px,transparent 40px)",
                  "repeating-linear-gradient(90deg,rgba(196,82,42,0.05) 0px,rgba(196,82,42,0.05) 1px,transparent 1px,transparent 40px)",
                ].join(","),
              }}
            />
            {/* Corner brackets */}
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none" style={{ color: "rgba(196,82,42,0.5)", top: i < 2 ? 6 : undefined, bottom: i >= 2 ? 6 : undefined, left: i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined }}>{ch}</span>
            ))}

            {/* Header stripe */}
            <div className="relative z-10 flex items-center justify-between px-4 h-10" style={{ background: "#C4522A" }}>
              <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}>
                ████ {METHODS[activeMethod].name.toUpperCase()} — ASIGNACIÓN INTERACTIVA ████
              </span>
              <span className="text-xs font-bold" style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}>
                {currentStep + 1}/{totalSteps} PASOS
              </span>
            </div>

            <div className="relative z-10 p-5 md:p-7 space-y-6">

              {/* Step description bar */}
              <div
                className="flex items-center justify-between gap-4 flex-wrap px-5 py-4 rounded-sm"
                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(196,82,42,0.35)", minHeight: 60 }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${activeMethod}-${currentStep}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm flex-1"
                    style={{ color: "#FFD4A8", fontFamily: "'Space Mono', monospace", lineHeight: 1.7 }}
                  >
                    {currentStep === -1
                      ? `>_ ${METHODS[activeMethod].name} — Presiona SIGUIENTE o AUTO para comenzar`
                      : method.steps[currentStep].description}
                  </motion.span>
                </AnimatePresence>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={prev} disabled={currentStep < 0} className="px-4 py-2 text-sm font-bold font-mono disabled:opacity-25 transition-opacity" style={{ background: "rgba(255,240,220,0.08)", border: "1px solid rgba(255,240,220,0.25)", color: "#FFF0DC" }}>←</button>
                  <button onClick={togglePlay} disabled={isDone} className="px-4 py-2 text-xs font-bold font-mono disabled:opacity-25 transition-all tracking-[0.12em]" style={{ background: isPlaying ? "rgba(196,82,42,0.4)" : "rgba(196,82,42,0.18)", border: "1px solid rgba(196,82,42,0.6)", color: "#FFD4A8" }}>
                    {isPlaying ? "⏸ PAUSA" : "▶ AUTO"}
                  </button>
                  <button onClick={next} disabled={isDone} className="px-4 py-2 text-sm font-bold font-mono disabled:opacity-25 transition-opacity" style={{ background: "rgba(196,82,42,0.25)", border: "1px solid rgba(196,82,42,0.6)", color: "#FFD4A8" }}>→</button>
                </div>
              </div>

              {/* Matrix + trackers */}
              <div className="grid md:grid-cols-[1fr_160px] gap-5">
                {/* Assignment matrix */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ minWidth: 380 }}>
                    <thead>
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-mono" style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,240,220,0.4)", border: "1px solid rgba(255,240,220,0.12)" }}>
                          Origen / Dest.
                        </th>
                        {DESTS.map((d, i) => (
                          <th key={d} className="px-3 py-3 text-center text-xs font-mono font-bold" style={{ background: "rgba(0,0,0,0.5)", color: demandLeft[i] === 0 && currentStep >= 0 ? "rgba(255,212,168,0.25)" : "#FFD4A8", border: "1px solid rgba(255,240,220,0.12)", transition: "color 0.3s" }}>
                            {d.replace("Mar Pacífico", "Mar Pac.").replace("Vandenberg", "Vdbg.")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORIGINS.map((o, r) => (
                        <tr key={o}>
                          <td className="px-3 py-3 text-sm font-bold font-mono" style={{ background: "rgba(0,0,0,0.4)", color: supplyLeft[r] === 0 && currentStep >= 0 ? "rgba(255,212,168,0.25)" : "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)", transition: "color 0.3s" }}>
                            {o.replace("Cabo Cañaveral", "Cabo C.")}
                          </td>
                          {COSTS[r].map((cost, c) => {
                            const assigned = grid[r][c];
                            const isActive = currentCell && currentCell[0] === r && currentCell[1] === c;
                            return (
                              <td
                                key={c}
                                className="text-center"
                                style={{
                                  border: isActive ? "2px solid #C4522A" : "1px solid rgba(255,240,220,0.1)",
                                  background: assigned !== null
                                    ? isActive ? "rgba(196,82,42,0.45)" : "rgba(196,82,42,0.22)"
                                    : "rgba(0,0,0,0.2)",
                                  boxShadow: isActive ? "0 0 16px rgba(196,82,42,0.7)" : "none",
                                  padding: "10px 6px",
                                  minWidth: 80,
                                  transition: "all 0.3s",
                                }}
                              >
                                {assigned !== null ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-lg font-bold font-mono" style={{ color: isActive ? "#FFFFFF" : "#FFD4A8" }}>{assigned}</span>
                                    <span className="text-xs font-mono" style={{ color: "rgba(255,212,168,0.5)" }}>${cost}k</span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>${cost}k</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Supply/Demand trackers */}
                <div className="flex md:flex-col gap-3 flex-wrap md:flex-nowrap">
                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,240,220,0.14)", padding: "12px 16px", flex: 1 }}>
                    <div className="tva-label mb-3">Oferta</div>
                    {ORIGINS.map((o, i) => {
                      const left = currentStep >= 0 ? supplyLeft[i] : SUPPLY[i];
                      const done = left === 0 && currentStep >= 0;
                      return (
                        <div key={o} className="flex items-center justify-between gap-2 py-1">
                          <span className="text-xs font-mono" style={{ color: done ? "rgba(255,212,168,0.25)" : "rgba(255,240,220,0.8)", textDecoration: done ? "line-through" : "none", transition: "all 0.3s" }}>
                            {o.replace("Cabo Cañaveral", "Cabo C.")}
                          </span>
                          <span className="text-sm font-bold font-mono" style={{ color: done ? "rgba(255,212,168,0.25)" : "#FFD4A8", transition: "all 0.3s" }}>{left}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,240,220,0.14)", padding: "12px 16px", flex: 1 }}>
                    <div className="tva-label mb-3">Demanda</div>
                    {DESTS.map((d, i) => {
                      const left = currentStep >= 0 ? demandLeft[i] : DEMAND[i];
                      const done = left === 0 && currentStep >= 0;
                      return (
                        <div key={d} className="flex items-center justify-between gap-2 py-1">
                          <span className="text-xs font-mono" style={{ color: done ? "rgba(255,212,168,0.25)" : "rgba(255,240,220,0.8)", textDecoration: done ? "line-through" : "none", transition: "all 0.3s" }}>
                            {d.replace("Vandenberg", "Vdbg.").replace("Mar Pacífico", "Mar Pac.")}
                          </span>
                          <span className="text-sm font-bold font-mono" style={{ color: done ? "rgba(255,212,168,0.25)" : "#FFD4A8", transition: "all 0.3s" }}>{left}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Running cost */}
              <div className="flex items-center justify-between px-5 py-4 rounded-sm" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,240,220,0.14)" }}>
                <span className="text-sm font-mono" style={{ color: "rgba(255,240,220,0.55)" }}>Costo acumulado:</span>
                <AnimatePresence mode="wait">
                  <motion.div key={`cost-${activeMethod}-${currentStep}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold font-mono" style={{ color: isDone ? "#C4522A" : "#FFD4A8" }}>
                      ${runningTotal.toLocaleString("es-MX")}k
                    </span>
                    {isDone && (
                      <span className="text-xs font-mono px-2 py-0.5" style={{ background: "rgba(196,82,42,0.25)", border: "1px solid rgba(196,82,42,0.5)", color: "#C4522A" }}>
                        TOTAL FINAL
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Collapsible procedure */}
              <div>
                <button
                  onClick={() => setShowProc((v) => !v)}
                  className="flex items-center gap-2 text-sm font-mono transition-colors"
                  style={{ color: "rgba(255,240,220,0.55)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <span style={{ color: "#C4522A", fontSize: "1rem" }}>{showProc ? "▾" : "▸"}</span>
                  Ver procedimiento paso a paso
                </button>
                <AnimatePresence>
                  {showProc && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="formula-block">
                        {method.procedure.map((line, i) => (
                          <div key={i} className={line === "" ? "mt-2" : ""}>{line || <>&nbsp;</>}</div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-5 py-2" style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.4)" }}>
              <span className="text-xs font-mono" style={{ color: "rgba(196,82,42,0.6)" }}>NEXTECH INDUSTRIES — SISTEMA DE TRANSPORTE // ULASB 2026</span>
              <span className="text-xs font-mono" style={{ color: isDone ? "#C4522A" : "rgba(255,212,168,0.4)" }}>
                {isDone ? "[SOLUCIÓN COMPLETA]" : `[PASO ${Math.max(0, currentStep + 1)}/${totalSteps}]`}
              </span>
            </div>
          </div>

          {/* ── Comparison bars ── */}
          <div className="space-y-5">
            <div className="tva-label">&gt; Comparativo de Métodos</div>
            <div className="space-y-4">
              {(["eno", "costoMinimo", "vogel"] as MethodKey[]).map((m) => {
                const t = METHODS[m].total;
                const pct = ((t - BEST_TOTAL) / (MAX_TOTAL - BEST_TOTAL + 1)) * 35 + 65;
                const isBest = t === BEST_TOTAL;
                const isActive = activeMethod === m;
                return (
                  <div key={m}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-mono font-bold" style={{ color: isActive ? "#FFF0DC" : "rgba(255,240,220,0.65)" }}>
                        {METHODS[m].name}
                      </span>
                      <span className="text-base font-bold font-mono" style={{ color: isBest ? "#C4522A" : "#FFD4A8" }}>
                        ${t.toLocaleString("es-MX")}k {isBest && "✓ ÓPTIMO"}
                      </span>
                    </div>
                    <div className="h-8 relative rounded-sm overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${isActive ? "rgba(196,82,42,0.5)" : "rgba(255,240,220,0.1)"}` }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 }}
                        className="h-full"
                        style={{ background: isBest ? "linear-gradient(90deg,#C4522A,#d4622a)" : "rgba(255,212,168,0.2)" }}
                      />
                      {isBest && (
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-mono font-bold" style={{ color: "#0A0300" }}>AHORRO $400k vs. ENO</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.6)" }}>
              Costo Mínimo y Vogel obtienen la misma solución óptima de $2,020k — un ahorro de $400,000 USD/mes frente al método ENO.
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
