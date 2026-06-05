"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";

const W = 520, H = 230;
const PAD_L = 62, PAD_R = 20, PAD_T = 22, PAD_B = 40;
const chartW = W - PAD_L - PAD_R;
const chartH = H - PAD_T - PAD_B;

/* ──────────────────── SIN DÉFICIT ──────────────────── */
interface SinDeficitChartProps {
  Q: number; t: number; N: number; unit: string; label: string;
}

export function SinDeficitChart({ Q, t, N, unit, label }: SinDeficitChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });
  const [tooltip, setTooltip] = useState<{ x: number; day: number; inv: number } | null>(null);

  const cycles = Math.min(N, 4);
  const cycleW = chartW / cycles;
  const totalDays = cycles * t;

  // Build sawtooth path
  const pts: [number, number][] = [];
  for (let c = 0; c < cycles; c++) {
    pts.push([PAD_L + c * cycleW, PAD_T]);
    pts.push([PAD_L + (c + 1) * cycleW, PAD_T + chartH]);
    if (c < cycles - 1) pts.push([PAD_L + (c + 1) * cycleW, PAD_T]);
  }
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const cx = Math.max(PAD_L, Math.min(W - PAD_R, svgX));
    const frac = (cx - PAD_L) / chartW;
    const day = Math.round(frac * totalDays);
    const cyclePos = (frac * cycles) % 1;
    const inv = Math.round(Q * (1 - cyclePos));
    setTooltip({ x: cx, day, inv });
  }, [totalDays, cycles, Q]);

  return (
    <div ref={wrapRef} className="w-full dark-panel rounded-sm p-3">
      <div className="tva-label mb-2 px-1">{label}</div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair"
        style={{ maxHeight: 230 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={PAD_L} y1={PAD_T + chartH * (1 - v)} x2={W - PAD_R} y2={PAD_T + chartH * (1 - v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        ))}
        {/* Q reference */}
        <motion.line x1={PAD_L} y1={PAD_T} x2={W - PAD_R} y2={PAD_T}
          stroke="rgba(255,212,168,0.5)" strokeWidth={1} strokeDasharray="5 4"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }} />
        <text x={PAD_L - 4} y={PAD_T + 4} fontSize={9} fill="rgba(255,212,168,0.8)" textAnchor="end">
          Q={Q.toLocaleString()}
        </text>
        <text x={10} y={PAD_T + chartH / 2} fontSize={8} fill="rgba(255,255,255,0.4)"
          transform={`rotate(-90,10,${PAD_T + chartH / 2})`} textAnchor="middle">
          Inv. ({unit})
        </text>
        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <text x={W / 2} y={H - 5} fontSize={8} fill="rgba(255,255,255,0.4)" textAnchor="middle">Tiempo (días)</text>
        {Array.from({ length: cycles + 1 }).map((_, i) => (
          <text key={i} x={PAD_L + i * cycleW} y={H - 22} fontSize={8} fill="rgba(255,255,255,0.35)" textAnchor="middle">
            {i * t}d
          </text>
        ))}
        {/* Area */}
        <motion.path
          d={`${d} L ${PAD_L + chartW} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`}
          fill="rgba(196,82,42,0.12)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.2 }} />
        {/* Glow */}
        <motion.path d={d} fill="none" stroke="rgba(255,180,100,0.2)" strokeWidth={6}
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }} />
        {/* Main line */}
        <motion.path d={d} fill="none" stroke="#C4522A" strokeWidth={2}
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }} />

        {/* Tooltip crosshair */}
        {tooltip && (
          <>
            <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + chartH}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={tooltip.x} cy={PAD_T + chartH * (1 - tooltip.inv / Q)} r={4}
              fill="#FFD4A8" stroke="#1A0800" strokeWidth={1.5} />
            <rect
              x={Math.min(tooltip.x + 6, W - 120)}
              y={PAD_T + 6}
              width={110} height={34} rx={3}
              fill="rgba(15,5,0,0.92)" stroke="rgba(196,82,42,0.5)" strokeWidth={1}
            />
            <text x={Math.min(tooltip.x + 12, W - 114)} y={PAD_T + 20} fontSize={9} fill="#FFD4A8">
              Día {tooltip.day}
            </text>
            <text x={Math.min(tooltip.x + 12, W - 114)} y={PAD_T + 32} fontSize={9} fill="#FFFFFF">
              Inv: {Math.max(0, tooltip.inv).toLocaleString()} {unit}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ──────────────────── CON DÉFICIT ──────────────────── */
interface ConDeficitChartProps {
  Q: number; S: number; t: number; N: number; unit: string; label: string;
}

export function ConDeficitChart({ Q, S, t, N, unit, label }: ConDeficitChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-80px" });
  const [tooltip, setTooltip] = useState<{ x: number; day: number; inv: number } | null>(null);

  const IM = Q - S;
  const totalRange = IM + S;
  const yZero = PAD_T + chartH * (IM / totalRange);
  const cycles = Math.min(N, 4);
  const cycleW = chartW / cycles;
  const totalDays = cycles * t;

  const pts: [number, number][] = [];
  for (let c = 0; c < cycles; c++) {
    pts.push([PAD_L + c * cycleW, PAD_T]);
    pts.push([PAD_L + (c + 1) * cycleW, PAD_T + chartH]);
    if (c < cycles - 1) pts.push([PAD_L + (c + 1) * cycleW, PAD_T]);
  }
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const cx = Math.max(PAD_L, Math.min(W - PAD_R, svgX));
    const frac = (cx - PAD_L) / chartW;
    const day = Math.round(frac * totalDays);
    const cyclePos = (frac * cycles) % 1;
    const inv = Math.round(IM - totalRange * cyclePos);
    setTooltip({ x: cx, day, inv });
  }, [totalDays, cycles, IM, totalRange]);

  return (
    <div ref={wrapRef} className="w-full dark-panel rounded-sm p-3">
      <div className="tva-label mb-2 px-1">{label}</div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H + 10}`}
        className="w-full cursor-crosshair"
        style={{ maxHeight: 240 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={PAD_L} y1={PAD_T + chartH * v} x2={W - PAD_R} y2={PAD_T + chartH * v}
            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        ))}
        {/* Zero line */}
        <line x1={PAD_L} y1={yZero} x2={W - PAD_R} y2={yZero}
          stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="4 3" />
        {/* IM ref */}
        <motion.line x1={PAD_L} y1={PAD_T} x2={W - PAD_R} y2={PAD_T}
          stroke="rgba(255,212,168,0.5)" strokeWidth={1} strokeDasharray="5 4"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }} />
        <text x={PAD_L - 4} y={PAD_T + 4} fontSize={9} fill="rgba(255,212,168,0.8)" textAnchor="end">IM={IM.toLocaleString()}</text>
        {/* -S ref */}
        <motion.line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH}
          stroke="rgba(220,100,100,0.5)" strokeWidth={1} strokeDasharray="5 4"
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 0.8, delay: 0.4 }} />
        <text x={PAD_L - 4} y={PAD_T + chartH + 4} fontSize={9} fill="rgba(220,100,100,0.8)" textAnchor="end">-S={S}</text>
        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <text x={W / 2} y={H + 5} fontSize={8} fill="rgba(255,255,255,0.4)" textAnchor="middle">Tiempo (días)</text>
        <text x={10} y={PAD_T + chartH / 2} fontSize={8} fill="rgba(255,255,255,0.4)"
          transform={`rotate(-90,10,${PAD_T + chartH / 2})`} textAnchor="middle">Inv. ({unit})</text>
        {Array.from({ length: cycles + 1 }).map((_, i) => (
          <text key={i} x={PAD_L + i * cycleW} y={yZero + 14} fontSize={8} fill="rgba(255,255,255,0.35)" textAnchor="middle">
            {i * t}d
          </text>
        ))}
        {/* Deficit area */}
        <motion.path
          d={`M ${PAD_L} ${yZero} L ${PAD_L + cycleW} ${PAD_T + chartH} L ${PAD_L + cycleW} ${yZero} Z`}
          fill="rgba(200,60,60,0.1)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }} />
        <motion.path
          d={`M ${PAD_L} ${PAD_T} L ${PAD_L + cycleW} ${yZero} L ${PAD_L + cycleW} ${PAD_T} Z`}
          fill="rgba(196,82,42,0.12)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.5 }} />
        {/* Labels */}
        <text x={PAD_L + cycleW * 0.38} y={yZero - 12} fontSize={8} fill="rgba(255,200,140,0.6)" textAnchor="middle">INVENTARIO</text>
        <text x={PAD_L + cycleW * 0.72} y={yZero + 28} fontSize={8} fill="rgba(220,100,100,0.6)" textAnchor="middle">DÉFICIT</text>
        {/* Glow + main line */}
        <motion.path d={d} fill="none" stroke="rgba(255,180,100,0.18)" strokeWidth={6}
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }} />
        <motion.path d={d} fill="none" stroke="#C4522A" strokeWidth={2}
          initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }} />

        {/* Tooltip crosshair */}
        {tooltip && (() => {
          const dotY = PAD_T + chartH * ((IM - tooltip.inv) / totalRange);
          const tipX = Math.min(tooltip.x + 6, W - 130);
          return (
            <>
              <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T + chartH}
                stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={tooltip.x} cy={Math.max(PAD_T, Math.min(PAD_T + chartH, dotY))} r={4}
                fill={tooltip.inv < 0 ? "rgba(220,100,100,0.9)" : "#FFD4A8"}
                stroke="#1A0800" strokeWidth={1.5} />
              <rect x={tipX} y={PAD_T + 6} width={118} height={36} rx={3}
                fill="rgba(15,5,0,0.92)" stroke="rgba(196,82,42,0.5)" strokeWidth={1} />
              <text x={tipX + 6} y={PAD_T + 20} fontSize={9} fill="#FFD4A8">Día {tooltip.day}</text>
              <text x={tipX + 6} y={PAD_T + 34} fontSize={9} fill={tooltip.inv < 0 ? "rgba(220,100,100,0.9)" : "#FFFFFF"}>
                Inv: {tooltip.inv.toLocaleString()} {unit}
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}
