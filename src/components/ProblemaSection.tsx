"use client";

import { motion } from "framer-motion";
import { SinDeficitChart, ConDeficitChart } from "./InventoryChart";
import { CountUp } from "./AnimatedCounter";

interface ResultRow {
  label: string;
  value: string;
  count?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

interface ProblemaBaseProps {
  number: string;
  type: "sin-deficit" | "con-deficit";
  title: string;
  planteamiento: string;
  datos: { label: string; value: string }[];
  formulas: string[];
  results: ResultRow[];
  interpretacion: string;
  chartProps: {
    Q: number;
    t: number;
    N: number;
    unit: string;
    S?: number;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12 },
  }),
};

export function ProblemaSection({
  number,
  type,
  title,
  planteamiento,
  datos,
  formulas,
  results,
  interpretacion,
  chartProps,
}: ProblemaBaseProps) {
  const isDeficit = type === "con-deficit";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="py-16 px-6 md:px-16"
      style={{ borderBottom: "1px solid rgba(255,240,220,0.1)" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-4">
            <span
              className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded-sm"
              style={{
                background: isDeficit ? "rgba(180,60,30,0.3)" : "rgba(0,0,0,0.25)",
                border: `1px solid ${isDeficit ? "rgba(220,100,60,0.4)" : "rgba(255,240,220,0.2)"}`,
                color: isDeficit ? "#FFB490" : "rgba(255,255,255,0.85)",
              }}
            >
              {isDeficit ? "Con Déficit" : "Sin Déficit"}
            </span>
            <span className="tva-label">Problema {number}</span>
          </motion.div>

          <motion.h3
            custom={1}
            variants={fadeUp}
            className="text-2xl md:text-3xl font-bold uppercase tracking-[0.06em]"
            style={{ color: "#FFF0DC" }}
          >
            {title}
          </motion.h3>
        </div>

        {/* Content grid */}
        <div className="grid md:grid-cols-5 gap-6">
          {/* Left: Planteamiento + Datos */}
          <motion.div custom={2} variants={fadeUp} className="md:col-span-2 space-y-5">
            <div>
              <div className="tva-label mb-3">Planteamiento</div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
                {planteamiento}
              </p>
            </div>

            <div>
              <div className="tva-label mb-3">Datos</div>
              <div
                className="rounded-sm overflow-hidden"
                style={{ border: "1px solid rgba(255,240,220,0.12)" }}
              >
                {datos.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2 text-xs"
                    style={{
                      background: i % 2 === 0 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)",
                      borderBottom: i < datos.length - 1 ? "1px solid rgba(255,240,220,0.07)" : "none",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.75)" }}>{d.label}</span>
                    <span className="font-bold" style={{ color: "#FFD4A8" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Formulas */}
          <motion.div custom={3} variants={fadeUp} className="md:col-span-3 space-y-5">
            <div>
              <div className="tva-label mb-3">Desarrollo</div>
              <div className="formula-block">
                {formulas.map((line, i) => (
                  <div key={i} className={line === "" ? "mt-2" : ""}>
                    {line || <>&nbsp;</>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart + Results */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div custom={4} variants={fadeUp}>
            {isDeficit ? (
              <ConDeficitChart
                Q={chartProps.Q}
                S={chartProps.S!}
                t={chartProps.t}
                N={chartProps.N}
                unit={chartProps.unit}
                label={`Comportamiento del Inventario — Problema ${number}`}
              />
            ) : (
              <SinDeficitChart
                Q={chartProps.Q}
                t={chartProps.t}
                N={chartProps.N}
                unit={chartProps.unit}
                label={`Comportamiento del Inventario — Problema ${number}`}
              />
            )}
          </motion.div>

          <motion.div custom={5} variants={fadeUp} className="space-y-4">
            <div>
              <div className="tva-label mb-3">Resultados</div>
              <div
                className="rounded-sm overflow-hidden"
                style={{ border: "1px solid rgba(255,240,220,0.15)" }}
              >
                <div
                  className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase flex justify-between"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    borderBottom: "1px solid rgba(255,240,220,0.12)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  <span>Indicador</span>
                  <span>Valor Óptimo</span>
                </div>
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 text-xs"
                    style={{
                      background: i % 2 === 0 ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.08)",
                      borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.85)" }}>{r.label}</span>
                    <span className="font-bold" style={{ color: "#FFD4A8" }}>
                      {r.count !== undefined ? (
                        <CountUp
                          to={r.count}
                          prefix={r.prefix}
                          suffix={r.suffix}
                          decimals={r.decimals}
                          style={{ color: "#FFD4A8" }}
                        />
                      ) : r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="p-4 rounded-sm text-xs leading-relaxed italic"
              style={{
                background: "rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,240,220,0.1)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {interpretacion}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
