"use client";

import { motion } from "framer-motion";
import { TerminalText, TerminalParagraph } from "./TerminalReveal";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function MarcoTeorico() {
  return (
    <section
      id="teoria"
      className="relative py-16 md:py-24 px-4 md:px-16 grid-bg"
      style={{ background: "rgba(0,0,0,0.12)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="tva-label mb-3"
        >
          &gt;_ MARCO TEÓRICO
        </motion.div>

        <TerminalText
          tag="h2"
          className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-3"
          style={{ color: "#FFF0DC" }}
        >
          Modelos de Inventario
        </TerminalText>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="h-px w-20 mb-8"
          style={{ background: "rgba(255,240,220,0.4)" }}
        />

        <TerminalParagraph
          chunkSize={5}
          interval={38}
          delay={400}
          className="text-sm md:text-base leading-relaxed max-w-3xl mb-12"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          El inventario representa el mayor de los activos circulantes en NexTech Industries y comprende todos los insumos críticos para la fabricación de cohetes y la ejecución de misiones espaciales. Un modelo determinístico es una representación matemática donde todas las variables de entrada son conocidas con certeza, lo cual permite calcular la política óptima de pedidos y almacenamiento.
        </TerminalParagraph>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Model 1: Sin Déficit */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="terminal-panel rounded-sm overflow-hidden"
          >
            <div
              className="px-4 md:px-5 py-3 flex items-center justify-between"
              style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,240,220,0.15)" }}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
                Modelo 01
              </span>
              <span className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "#FFF0DC" }}>
                Sin Déficit
              </span>
            </div>

            <div className="px-4 md:px-5 py-5 space-y-4">
              <div>
                <div className="tva-label mb-2">&gt; Supuestos</div>
                <div className="space-y-1.5">
                  {[
                    "La demanda se efectúa a tasa constante",
                    "El reemplazo es instantáneo",
                    "Todos los coeficientes de costo son constantes",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                      <span style={{ color: "#C4A07A", flexShrink: 0 }}>0{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="tva-label mb-2">&gt; Fórmulas</div>
                <div className="formula-block text-[0.72rem] space-y-1">
                  <div>Q  = √( 2·C₂·D / C₃ )</div>
                  <div>CT = C₁·D + (C₂·D/Q) + (C₃·Q/2)</div>
                  <div>N  = D / Q</div>
                  <div>t  = (1/N) × 365  [días]</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Model 2: Con Déficit */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay: 0.15 } } }}
            className="terminal-panel rounded-sm overflow-hidden"
          >
            <div
              className="px-4 md:px-5 py-3 flex items-center justify-between"
              style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,240,220,0.15)" }}
            >
              <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
                Modelo 02
              </span>
              <span className="text-sm font-bold tracking-[0.1em] uppercase" style={{ color: "#FFF0DC" }}>
                Con Déficit
              </span>
            </div>

            <div className="px-4 md:px-5 py-5 space-y-4">
              <div>
                <div className="tva-label mb-2">&gt; Variable adicional</div>
                <div className="space-y-1.5">
                  {[
                    "C₄ = Costo por déficit (faltante/año)",
                    "S = Número de unidades agotadas",
                    "IM = Inventario Máximo = Q − S",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                      <span style={{ color: "#C4A07A", flexShrink: 0 }}>0{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="tva-label mb-2">&gt; Fórmulas</div>
                <div className="formula-block text-[0.72rem] space-y-1">
                  <div>Q  = √(2·C₂·D/C₃) × √((C₃+C₄)/C₄)</div>
                  <div>S  = (C₃/(C₃+C₄)) × Q</div>
                  <div>IM = Q − S</div>
                  <div>CT = C₁·D + (C₂·D/Q)</div>
                  <div>   + C₃·(Q−S)²/(2Q) + C₄·S²/(2Q)</div>
                  <div>t  = ((Q−S)/D + S/D) × 365</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Variables reference */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={fadeUp}
          className="mt-6 p-4 md:p-5 rounded-sm"
          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,240,220,0.1)" }}
        >
          <div className="tva-label mb-3">&gt; Variables</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>
            {[
              ["Q", "Cantidad Óptima"],
              ["C₁", "Costo Unitario"],
              ["C₂", "Costo de Ordenar"],
              ["C₃", "Costo de Almacenar/año"],
              ["N", "Pedidos al año"],
              ["t", "Tiempo entre pedidos"],
              ["D", "Demanda Anual"],
              ["C₄", "Costo por Déficit/año"],
            ].map(([sym, def]) => (
              <div key={sym} className="flex items-baseline gap-2">
                <span className="font-bold" style={{ color: "#FFD4A8", minWidth: "1.5rem" }}>{sym}</span>
                <span>{def}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
