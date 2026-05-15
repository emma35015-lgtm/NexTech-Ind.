"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SinDeficitChartProps {
  Q: number;
  t: number;
  N: number;
  unit: string;
  label: string;
}

export function SinDeficitChart({ Q, t, N, unit, label }: SinDeficitChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const W = 520;
  const H = 220;
  const PAD_L = 60;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const cycles = Math.min(N, 4);
  const cycleW = chartW / cycles;

  // Build path
  const points: [number, number][] = [];
  for (let c = 0; c < cycles; c++) {
    const x0 = PAD_L + c * cycleW;
    const x1 = PAD_L + (c + 1) * cycleW;
    points.push([x0, PAD_T]); // top
    points.push([x1, PAD_T + chartH]); // bottom
    if (c < cycles - 1) {
      points.push([x1, PAD_T]); // jump back
    }
  }

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  return (
    <div className="w-full dark-panel rounded-sm p-3 relative overflow-hidden">
      <div className="tva-label mb-2 px-1">{label}</div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 220 }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line
            key={v}
            x1={PAD_L}
            y1={PAD_T + chartH * (1 - v)}
            x2={W - PAD_R}
            y2={PAD_T + chartH * (1 - v)}
            stroke="rgba(255,240,220,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Q reference line */}
        <motion.line
          x1={PAD_L} y1={PAD_T}
          x2={W - PAD_R} y2={PAD_T}
          stroke="rgba(255,212,168,0.5)"
          strokeWidth={1}
          strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <text x={PAD_L - 4} y={PAD_T + 4} fontSize={9} fill="rgba(255,212,168,0.7)" textAnchor="end">
          Q={Q.toLocaleString()}
        </text>

        {/* Y-axis label */}
        <text
          x={10}
          y={PAD_T + chartH / 2}
          fontSize={8}
          fill="rgba(255,240,220,0.4)"
          transform={`rotate(-90, 10, ${PAD_T + chartH / 2})`}
          textAnchor="middle"
        >
          Inventario ({unit})
        </text>

        {/* X-axis */}
        <line
          x1={PAD_L} y1={PAD_T + chartH}
          x2={W - PAD_R} y2={PAD_T + chartH}
          stroke="rgba(255,240,220,0.2)"
          strokeWidth={1}
        />
        <text x={W / 2} y={H - 5} fontSize={8} fill="rgba(255,240,220,0.4)" textAnchor="middle">
          Tiempo (días)
        </text>

        {/* Cycle time labels */}
        {Array.from({ length: cycles + 1 }).map((_, i) => {
          const x = PAD_L + i * cycleW;
          return (
            <text key={i} x={x} y={H - 22} fontSize={8} fill="rgba(255,240,220,0.35)" textAnchor="middle">
              {i * t}d
            </text>
          );
        })}

        {/* Area fill */}
        <motion.path
          d={`${d} L ${PAD_L + (cycles - 1) * cycleW + cycleW} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`}
          fill="rgba(196,82,42,0.15)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        />

        {/* Main line */}
        <motion.path
          d={d}
          fill="none"
          stroke="#C4522A"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
        />

        {/* Glow */}
        <motion.path
          d={d}
          fill="none"
          stroke="rgba(255,180,100,0.25)"
          strokeWidth={5}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
        />

        {/* Left axis */}
        <line
          x1={PAD_L} y1={PAD_T}
          x2={PAD_L} y2={PAD_T + chartH}
          stroke="rgba(255,240,220,0.2)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

interface ConDeficitChartProps {
  Q: number;
  S: number;
  t: number;
  N: number;
  unit: string;
  label: string;
}

export function ConDeficitChart({ Q, S, t, N, unit, label }: ConDeficitChartProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const W = 520;
  const H = 240;
  const PAD_L = 65;
  const PAD_R = 20;
  const PAD_T = 20;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const IM = Q - S;
  const totalRange = IM + S;
  const yZero = PAD_T + chartH * (IM / totalRange);
  const cycles = Math.min(N, 4);
  const cycleW = chartW / cycles;

  // For each cycle: start at IM, drop to -S over full cycle width, jump back
  const points: [number, number][] = [];
  for (let c = 0; c < cycles; c++) {
    const x0 = PAD_L + c * cycleW;
    const x1 = PAD_L + (c + 1) * cycleW;
    points.push([x0, PAD_T]); // IM top
    points.push([x1, PAD_T + chartH]); // -S bottom
    if (c < cycles - 1) {
      points.push([x1, PAD_T]); // jump back
    }
  }

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  return (
    <div className="w-full dark-panel rounded-sm p-3 relative overflow-hidden">
      <div className="tva-label mb-2 px-1">{label}</div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 240 }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={PAD_L} y1={PAD_T + chartH * v} x2={W - PAD_R} y2={PAD_T + chartH * v}
            stroke="rgba(255,240,220,0.06)" strokeWidth={1} />
        ))}

        {/* Zero line */}
        <line x1={PAD_L} y1={yZero} x2={W - PAD_R} y2={yZero}
          stroke="rgba(255,240,220,0.25)" strokeWidth={1} strokeDasharray="4 3" />

        {/* IM reference */}
        <motion.line x1={PAD_L} y1={PAD_T} x2={W - PAD_R} y2={PAD_T}
          stroke="rgba(255,212,168,0.5)" strokeWidth={1} strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <text x={PAD_L - 4} y={PAD_T + 4} fontSize={9} fill="rgba(255,212,168,0.7)" textAnchor="end">
          IM={IM.toLocaleString()}
        </text>

        {/* -S reference */}
        <motion.line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH}
          stroke="rgba(220,100,100,0.5)" strokeWidth={1} strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <text x={PAD_L - 4} y={PAD_T + chartH + 4} fontSize={9} fill="rgba(220,100,100,0.7)" textAnchor="end">
          -S={S}
        </text>

        {/* Y axis label */}
        <text x={10} y={PAD_T + chartH / 2} fontSize={8} fill="rgba(255,240,220,0.4)"
          transform={`rotate(-90, 10, ${PAD_T + chartH / 2})`} textAnchor="middle">
          Inventario ({unit})
        </text>

        {/* X-axis */}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={W - PAD_R} y2={PAD_T + chartH}
          stroke="rgba(255,240,220,0.1)" strokeWidth={1} />
        <text x={W / 2} y={H - 5} fontSize={8} fill="rgba(255,240,220,0.4)" textAnchor="middle">
          Tiempo (días)
        </text>

        {/* Cycle labels */}
        {Array.from({ length: cycles + 1 }).map((_, i) => (
          <text key={i} x={PAD_L + i * cycleW} y={yZero + 14} fontSize={8}
            fill="rgba(255,240,220,0.35)" textAnchor="middle">
            {i * t}d
          </text>
        ))}

        {/* Deficit area (below zero) */}
        <motion.path
          d={`M ${PAD_L} ${yZero} L ${PAD_L + cycleW} ${PAD_T + chartH} L ${PAD_L + cycleW} ${yZero} Z`}
          fill="rgba(200,60,60,0.12)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.5 }}
        />

        {/* Positive area */}
        <motion.path
          d={`M ${PAD_L} ${PAD_T} L ${PAD_L + cycleW} ${yZero} L ${PAD_L + cycleW} ${PAD_T} Z`}
          fill="rgba(196,82,42,0.15)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 1.5 }}
        />

        {/* Main line */}
        <motion.path
          d={d}
          fill="none"
          stroke="#C4522A"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Glow */}
        <motion.path
          d={d}
          fill="none"
          stroke="rgba(255,180,100,0.2)"
          strokeWidth={5}
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Left axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + chartH}
          stroke="rgba(255,240,220,0.2)" strokeWidth={1} />

        {/* Labels */}
        <text x={PAD_L + cycleW * 0.4} y={yZero - 15} fontSize={8}
          fill="rgba(255,200,140,0.6)" textAnchor="middle">INVENTARIO DISPONIBLE</text>
        <text x={PAD_L + cycleW * 0.75} y={yZero + 25} fontSize={8}
          fill="rgba(220,100,100,0.6)" textAnchor="middle">DÉFICIT</text>
      </svg>
    </div>
  );
}
