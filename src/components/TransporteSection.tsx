"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CountUp } from "./AnimatedCounter";

// ─── Problem data ────────────────────────────────────────────────────────────
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
      { cell: [0,0] as [number,number], amount: 50, supplyLeft:[0,70,80], demandLeft:[10,50,40,50], runningTotal:600,  description:"Paso 1/6 — León → Vandenberg · 50 mot · $12k c/u · Subtotal $600k" },
      { cell: [1,0] as [number,number], amount: 10, supplyLeft:[0,60,80], demandLeft:[0,50,40,50],  runningTotal:680,  description:"Paso 2/6 — Cabo Cañaveral → Vandenberg · 10 mot · $8k c/u · Subtotal $80k" },
      { cell: [1,1] as [number,number], amount: 50, supplyLeft:[0,10,80], demandLeft:[0,0,40,50],   runningTotal:1380, description:"Paso 3/6 — Cabo Cañaveral → Mar Pacífico · 50 mot · $14k c/u · Subtotal $700k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,80],  demandLeft:[0,0,30,50],   runningTotal:1500, description:"Paso 4/6 — Cabo Cañaveral → Wallops · 10 mot · $12k c/u · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,50],  demandLeft:[0,0,0,50],    runningTotal:1920, description:"Paso 5/6 — Kourou → Wallops · 30 mot · $14k c/u · Subtotal $420k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,0,0],   demandLeft:[0,0,0,0],     runningTotal:2420, description:"Paso 6/6 — Kourou → Mahia · 50 mot · $10k c/u · Subtotal $500k" },
    ] as Step[],
    procedure: [
      "ESQUINA NOROESTE — Se asigna siempre en la celda superior-izquierda disponible.",
      "",
      "Paso 1: Celda [León, Vandenberg] → min(50, 60) = 50 mot · $12k → $600k",
      "         León agotado. Demanda Vandenberg = 10 restantes.",
      "",
      "Paso 2: Celda [Cabo C., Vandenberg] → min(70, 10) = 10 mot · $8k → $80k",
      "         Vandenberg agotado. Oferta Cabo C. = 60 restantes.",
      "",
      "Paso 3: Celda [Cabo C., Mar Pacífico] → min(60, 50) = 50 mot · $14k → $700k",
      "         Mar Pacífico agotado. Oferta Cabo C. = 10 restantes.",
      "",
      "Paso 4: Celda [Cabo C., Wallops] → min(10, 40) = 10 mot · $12k → $120k",
      "         Cabo C. agotado. Demanda Wallops = 30 restantes.",
      "",
      "Paso 5: Celda [Kourou, Wallops] → min(80, 30) = 30 mot · $14k → $420k",
      "         Wallops agotado. Oferta Kourou = 50 restantes.",
      "",
      "Paso 6: Celda [Kourou, Mahia] → min(50, 50) = 50 mot · $10k → $500k",
      "         Kourou agotado. Problema resuelto.",
      "",
      "COSTO TOTAL: 600 + 80 + 700 + 120 + 420 + 500 = $2,420k",
    ],
  },
  costoMinimo: {
    name: "Costo Mínimo",
    shortName: "Costo Mín.",
    total: 2020,
    steps: [
      { cell: [1,0] as [number,number], amount: 60, supplyLeft:[50,10,80], demandLeft:[0,50,40,50],  runningTotal:480,  description:"Paso 1/5 — Cabo C. → Vandenberg · 60 mot · $8k (mín. global) · Subtotal $480k" },
      { cell: [0,1] as [number,number], amount: 50, supplyLeft:[0,10,80],  demandLeft:[0,0,40,50],   runningTotal:980,  description:"Paso 2/5 — León → Mar Pacífico · 50 mot · $10k · Subtotal $500k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,10,30],  demandLeft:[0,0,40,0],    runningTotal:1480, description:"Paso 3/5 — Kourou → Mahia · 50 mot · $10k · Subtotal $500k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,30],   demandLeft:[0,0,30,0],    runningTotal:1600, description:"Paso 4/5 — Cabo C. → Wallops · 10 mot · $12k · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,0],    demandLeft:[0,0,0,0],     runningTotal:2020, description:"Paso 5/5 — Kourou → Wallops · 30 mot · $14k · Subtotal $420k" },
    ] as Step[],
    procedure: [
      "COSTO MÍNIMO — Se asigna primero la celda con menor costo unitario.",
      "",
      "Paso 1: Menor costo global = $8k [Cabo C., Vandenberg]",
      "         min(70, 60) = 60 mot · $8k → $480k",
      "         Vandenberg agotado. Oferta Cabo C. = 10 restantes.",
      "",
      "Paso 2: Menor costo disponible = $10k [León, Mar Pacífico]",
      "         min(50, 50) = 50 mot · $10k → $500k",
      "         León y Mar Pacífico agotados.",
      "",
      "Paso 3: Menor costo disponible = $10k [Kourou, Mahia]",
      "         min(80, 50) = 50 mot · $10k → $500k",
      "         Mahia agotada. Oferta Kourou = 30 restantes.",
      "",
      "Paso 4: Oferta Cabo C. = 10 restantes → [Cabo C., Wallops]",
      "         min(10, 40) = 10 mot · $12k → $120k",
      "         Cabo C. agotado. Demanda Wallops = 30 restantes.",
      "",
      "Paso 5: [Kourou, Wallops] → min(30, 30) = 30 mot · $14k → $420k",
      "         Problema resuelto.",
      "",
      "COSTO TOTAL: 480 + 500 + 500 + 120 + 420 = $2,020k",
    ],
  },
  vogel: {
    name: "Aproximación de Vogel",
    shortName: "Vogel",
    total: 2020,
    steps: [
      { cell: [1,0] as [number,number], amount: 60, supplyLeft:[50,10,80], demandLeft:[0,50,40,50],  runningTotal:480,  description:"Paso 1/5 — Cabo C. → Vandenberg · 60 mot · $8k (pen. fila=4) · Subtotal $480k" },
      { cell: [0,1] as [number,number], amount: 50, supplyLeft:[0,10,80],  demandLeft:[0,0,40,50],   runningTotal:980,  description:"Paso 2/5 — León → Mar Pacífico · 50 mot · $10k (pen. fila=6) · Subtotal $500k" },
      { cell: [2,3] as [number,number], amount: 50, supplyLeft:[0,10,30],  demandLeft:[0,0,40,0],    runningTotal:1480, description:"Paso 3/5 — Kourou → Mahia · 50 mot · $10k (pen. col=6) · Subtotal $500k" },
      { cell: [1,2] as [number,number], amount: 10, supplyLeft:[0,0,30],   demandLeft:[0,0,30,0],    runningTotal:1600, description:"Paso 4/5 — Cabo C. → Wallops · 10 mot · $12k · Subtotal $120k" },
      { cell: [2,2] as [number,number], amount: 30, supplyLeft:[0,0,0],    demandLeft:[0,0,0,0],     runningTotal:2020, description:"Paso 5/5 — Kourou → Wallops · 30 mot · $14k · Subtotal $420k" },
    ] as Step[],
    procedure: [
      "VOGEL (VAM) — Se calculan penalizaciones por fila y columna.",
      "La penalización = diferencia entre el 1er y 2do menor costo de cada fila/col.",
      "",
      "Iteración 1 — Penalizaciones:",
      "  Fila León:       10→12 = pen. 2",
      "  Fila Cabo C.:     8→12 = pen. 4  ← MAYOR",
      "  Fila Kourou:    10→10 = pen. 0",
      "  Col Vandenberg:  8→10 = pen. 2",
      "  Col Mar Pacífico:10→14 = pen. 4",
      "  Col Wallops:    12→14 = pen. 2",
      "  Col Mahia:      10→14 = pen. 4",
      "",
      "  Mayor penalización: fila Cabo C. (pen=4) → celda mín = [Cabo C., Vandenberg] $8k",
      "  Asignar min(70,60) = 60 mot → $480k. Vandenberg agotado.",
      "",
      "Iteración 2 (sin col Vandenberg):",
      "  Fila León:       10→16 = pen. 6  ← MAYOR",
      "  Fila Cabo C.:   12→16 = pen. 4",
      "  Fila Kourou:   10→14 = pen. 4",
      "",
      "  Mayor: fila León (pen=6) → celda mín = [León, Mar Pacífico] $10k",
      "  Asignar min(50,50) = 50 mot → $500k. León y Mar Pacífico agotados.",
      "",
      "Iteración 3 (sin León, sin Mar Pacífico):",
      "  Col Mahia: [Kourou=$10, Cabo C.=$16] → pen. 6  ← MAYOR",
      "",
      "  Mayor: col Mahia (pen=6) → celda mín = [Kourou, Mahia] $10k",
      "  Asignar min(80,50) = 50 mot → $500k. Mahia agotada.",
      "",
      "Pasos 4-5: Asignar restantes (Cabo C.=10, Kourou=30) → Wallops",
      "  [Cabo C., Wallops]: 10 mot · $12k → $120k",
      "  [Kourou, Wallops]: 30 mot · $14k → $420k",
      "",
      "COSTO TOTAL: 480 + 500 + 500 + 120 + 420 = $2,020k",
    ],
  },
} as const;

type MethodKey = keyof typeof METHODS;

// Build allocation grid from steps up to currentStep
function buildGrid(steps: Step[], upTo: number): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: 3 }, () => Array(4).fill(null));
  for (let i = 0; i <= upTo && i < steps.length; i++) {
    const [r, c] = steps[i].cell;
    grid[r][c] = steps[i].amount;
  }
  return grid;
}

export function TransporteSection() {
  const [activeMethod, setActiveMethod] = useState<MethodKey>("eno");
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showProc, setShowProc] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const method = METHODS[activeMethod];
  const totalSteps = method.steps.length;
  const isDone = currentStep >= totalSteps - 1;

  // Build display state
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
        if (next >= totalSteps - 1) {
          stopPlay();
          return totalSteps - 1;
        }
        return next;
      });
    }, 1200);
  };

  useEffect(() => () => stopPlay(), []);

  // Reset when switching methods
  const switchMethod = (m: MethodKey) => {
    stopPlay();
    setActiveMethod(m);
    setCurrentStep(-1);
    setShowProc(false);
  };

  const prev = () => { stopPlay(); setCurrentStep((s) => Math.max(-1, s - 1)); };
  const next = () => { stopPlay(); setCurrentStep((s) => Math.min(totalSteps - 1, s + 1)); };
  const togglePlay = () => { if (isPlaying) stopPlay(); else if (!isDone) startPlay(); };

  const bestTotal = Math.min(METHODS.eno.total, METHODS.costoMinimo.total, METHODS.vogel.total);
  const maxTotal  = Math.max(METHODS.eno.total, METHODS.costoMinimo.total, METHODS.vogel.total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className="py-12 md:py-16 px-4 md:px-16"
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="tva-label">&gt;_ SECCIÓN 05</div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF" }}>
            Métodos de Transporte
          </h2>
          <p className="text-sm md:text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
            Distribución de motores LRE-7 desde 3 plantas hacia 4 sitios de lanzamiento.
            Problema balanceado: oferta = demanda = 200 mot/mes.
          </p>
          <div className="h-px w-16 mt-2" style={{ background: "rgba(255,255,255,0.3)" }} />
        </div>

        {/* Cost matrix — always visible */}
        <div>
          <div className="tva-label mb-3">&gt; Matriz de Costos (miles USD/motor)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse" style={{ minWidth: 420 }}>
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left" style={{ background: "#0A0300", color: "rgba(255,240,220,0.55)", border: "1px solid rgba(255,240,220,0.1)" }}>Origen \ Destino</th>
                  {DESTS.map((d) => (
                    <th key={d} className="px-3 py-2 text-center" style={{ background: "#0A0300", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)" }}>{d}</th>
                  ))}
                  <th className="px-3 py-2 text-center" style={{ background: "#0A0300", color: "#C4522A", border: "1px solid rgba(255,240,220,0.1)" }}>Oferta</th>
                </tr>
              </thead>
              <tbody>
                {ORIGINS.map((o, r) => (
                  <tr key={o}>
                    <td className="px-3 py-2 font-bold" style={{ background: "rgba(0,0,0,0.3)", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)" }}>{o}</td>
                    {COSTS[r].map((c, col) => (
                      <td key={col} className="px-3 py-2 text-center" style={{ background: "rgba(0,0,0,0.15)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,240,220,0.1)" }}>
                        ${c}k
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center font-bold" style={{ background: "rgba(196,82,42,0.12)", color: "#C4522A", border: "1px solid rgba(255,240,220,0.1)" }}>{SUPPLY[r]}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-2 font-bold" style={{ background: "#0A0300", color: "#C4522A", border: "1px solid rgba(255,240,220,0.1)" }}>Demanda</td>
                  {DEMAND.map((d, i) => (
                    <td key={i} className="px-3 py-2 text-center font-bold" style={{ background: "rgba(196,82,42,0.12)", color: "#C4522A", border: "1px solid rgba(255,240,220,0.1)" }}>{d}</td>
                  ))}
                  <td className="px-3 py-2 text-center font-bold" style={{ background: "#0A0300", color: "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)" }}>200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Method tabs */}
        <div>
          <div className="tva-label mb-3">&gt; Seleccionar Método</div>
          <div className="flex flex-wrap gap-2">
            {(["eno", "costoMinimo", "vogel"] as MethodKey[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMethod(m)}
                className="px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all"
                style={{
                  background: activeMethod === m ? "#C4522A" : "rgba(0,0,0,0.3)",
                  border: `1px solid ${activeMethod === m ? "#C4522A" : "rgba(255,240,220,0.25)"}`,
                  color: activeMethod === m ? "#0A0300" : "rgba(255,240,220,0.8)",
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: activeMethod === m ? 700 : 400,
                }}
              >
                {METHODS[m].shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive area */}
        <div className="space-y-4">
          {/* Step description bar */}
          <div
            className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap"
            style={{ background: "#0A0300", border: "1px solid rgba(196,82,42,0.4)", minHeight: 52 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={`${activeMethod}-${currentStep}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-mono flex-1"
                style={{ color: "#FFD4A8" }}
              >
                {currentStep === -1
                  ? `>_ ${METHODS[activeMethod].name} — Presiona SIGUIENTE para comenzar`
                  : method.steps[currentStep].description}
              </motion.span>
            </AnimatePresence>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={prev}
                disabled={currentStep < 0}
                className="px-3 py-1 text-xs font-mono disabled:opacity-30 transition-opacity"
                style={{ background: "rgba(255,240,220,0.08)", border: "1px solid rgba(255,240,220,0.2)", color: "#FFF0DC" }}
              >
                ←
              </button>
              <button
                onClick={togglePlay}
                disabled={isDone}
                className="px-3 py-1 text-xs font-mono disabled:opacity-30 transition-opacity"
                style={{ background: isPlaying ? "rgba(196,82,42,0.3)" : "rgba(255,240,220,0.08)", border: "1px solid rgba(196,82,42,0.5)", color: "#FFD4A8" }}
              >
                {isPlaying ? "⏸ PAUSA" : "▶ AUTO"}
              </button>
              <button
                onClick={next}
                disabled={isDone}
                className="px-3 py-1 text-xs font-mono disabled:opacity-30 transition-opacity"
                style={{ background: "rgba(196,82,42,0.2)", border: "1px solid rgba(196,82,42,0.5)", color: "#FFD4A8" }}
              >
                →
              </button>
            </div>
          </div>

          {/* Matrix + trackers */}
          <div className="grid md:grid-cols-[1fr_auto] gap-4">
            {/* Assignment matrix */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 380 }}>
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-[10px] font-mono" style={{ background: "#0A0300", color: "rgba(255,240,220,0.45)", border: "1px solid rgba(255,240,220,0.1)" }}>
                      Origen / Dest.
                    </th>
                    {DESTS.map((d, i) => (
                      <th key={d} className="px-2 py-2 text-center text-[10px] font-mono" style={{ background: "#0A0300", color: demandLeft[i] === 0 && currentStep >= 0 ? "rgba(255,212,168,0.3)" : "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)" }}>
                        {d.replace("Mar Pacífico", "Mar Pac.").replace("Vandenberg", "Vdbg.")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORIGINS.map((o, r) => (
                    <tr key={o}>
                      <td className="px-2 py-2 text-[10px] font-mono font-bold" style={{ background: "rgba(0,0,0,0.3)", color: supplyLeft[r] === 0 && currentStep >= 0 ? "rgba(255,212,168,0.3)" : "#FFD4A8", border: "1px solid rgba(255,240,220,0.1)" }}>
                        {o}
                      </td>
                      {COSTS[r].map((cost, c) => {
                        const assigned = grid[r][c];
                        const isActive = currentCell && currentCell[0] === r && currentCell[1] === c;
                        return (
                          <td
                            key={c}
                            className="text-center relative"
                            style={{
                              border: isActive
                                ? "2px solid #C4522A"
                                : "1px solid rgba(255,240,220,0.1)",
                              background: assigned !== null
                                ? isActive ? "rgba(196,82,42,0.35)" : "rgba(196,82,42,0.18)"
                                : "rgba(0,0,0,0.15)",
                              boxShadow: isActive ? "0 0 12px rgba(196,82,42,0.6)" : "none",
                              padding: "6px 4px",
                              minWidth: 72,
                              transition: "all 0.3s",
                            }}
                          >
                            {assigned !== null ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-bold font-mono" style={{ color: isActive ? "#FFF0DC" : "#FFD4A8" }}>{assigned}</span>
                                <span className="text-[9px] font-mono" style={{ color: "rgba(255,212,168,0.6)" }}>${cost}k</span>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>${cost}k</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supply / Demand tracker */}
            <div className="flex md:flex-col gap-3 flex-wrap md:flex-nowrap">
              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,240,220,0.12)", padding: "10px 14px", minWidth: 130 }}>
                <div className="tva-label mb-2">Oferta</div>
                {ORIGINS.map((o, i) => {
                  const left = currentStep >= 0 ? supplyLeft[i] : SUPPLY[i];
                  const exhausted = left === 0 && currentStep >= 0;
                  return (
                    <div key={o} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="text-[10px] font-mono" style={{ color: exhausted ? "rgba(255,212,168,0.3)" : "rgba(255,240,220,0.7)", textDecoration: exhausted ? "line-through" : "none" }}>
                        {o.replace("Cabo Cañaveral", "Cabo C.")}
                      </span>
                      <span className="text-[10px] font-bold font-mono" style={{ color: exhausted ? "rgba(255,212,168,0.3)" : "#FFD4A8" }}>{left}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,240,220,0.12)", padding: "10px 14px", minWidth: 130 }}>
                <div className="tva-label mb-2">Demanda</div>
                {DESTS.map((d, i) => {
                  const left = currentStep >= 0 ? demandLeft[i] : DEMAND[i];
                  const exhausted = left === 0 && currentStep >= 0;
                  return (
                    <div key={d} className="flex items-center justify-between gap-3 py-0.5">
                      <span className="text-[10px] font-mono" style={{ color: exhausted ? "rgba(255,212,168,0.3)" : "rgba(255,240,220,0.7)", textDecoration: exhausted ? "line-through" : "none" }}>
                        {d.replace("Vandenberg", "Vdbg.").replace("Mar Pacífico", "Mar Pac.")}
                      </span>
                      <span className="text-[10px] font-bold font-mono" style={{ color: exhausted ? "rgba(255,212,168,0.3)" : "#FFD4A8" }}>{left}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Running cost */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#0A0300", border: "1px solid rgba(255,240,220,0.12)" }}
          >
            <span className="text-xs font-mono" style={{ color: "rgba(255,240,220,0.6)" }}>Costo acumulado</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={`cost-${activeMethod}-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold font-mono"
                style={{ color: isDone ? "#C4522A" : "#FFD4A8" }}
              >
                ${runningTotal.toLocaleString("es-MX")}k
                {isDone && <span className="text-xs ml-2" style={{ color: "rgba(196,82,42,0.8)" }}>TOTAL FINAL</span>}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Collapsible procedure */}
          <div>
            <button
              onClick={() => setShowProc((v) => !v)}
              className="text-xs font-mono flex items-center gap-2 transition-colors"
              style={{ color: "rgba(255,240,220,0.6)", background: "none", border: "none", cursor: "pointer" }}
            >
              <span style={{ color: "#C4522A" }}>{showProc ? "▾" : "▸"}</span>
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

        {/* Comparison bars */}
        <div>
          <div className="tva-label mb-4">&gt; Comparativo de Métodos</div>
          <div className="space-y-3">
            {(["eno", "costoMinimo", "vogel"] as MethodKey[]).map((m) => {
              const t = METHODS[m].total;
              const pct = ((t - bestTotal) / (maxTotal - bestTotal + 1)) * 40 + 60;
              const isBest = t === bestTotal;
              return (
                <div key={m} className="flex items-center gap-4">
                  <span className="text-[10px] font-mono w-20 flex-shrink-0" style={{ color: "rgba(255,240,220,0.7)" }}>
                    {METHODS[m].shortName}
                  </span>
                  <div className="flex-1 h-6 relative" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,240,220,0.1)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full"
                      style={{ background: isBest ? "#C4522A" : "rgba(255,212,168,0.25)" }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono w-20 text-right flex-shrink-0" style={{ color: isBest ? "#C4522A" : "#FFD4A8" }}>
                    ${t.toLocaleString("es-MX")}k
                    {isBest && <span className="ml-1 text-[9px]">✓</span>}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3 italic" style={{ color: "rgba(255,255,255,0.6)" }}>
            Costo Mínimo y Vogel logran la solución óptima de $2,020k — un ahorro de $400k vs. ENO.
          </p>
        </div>

      </div>
    </motion.div>
  );
}
