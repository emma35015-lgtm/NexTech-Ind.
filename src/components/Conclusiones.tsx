"use client";

import { motion } from "framer-motion";

const conclusiones = [
  {
    num: "01",
    title: "Modelos Sin Déficit",
    body: "Los modelos sin déficit son apropiados para insumos críticos donde la interrupción operativa es inadmisible: el titanio y los tornillos certificados son indispensables para el ensamblaje continuo; agotarlos detendría toda la producción de cohetes.",
  },
  {
    num: "02",
    title: "Modelos Con Déficit",
    body: "Los modelos con déficit son adecuados cuando el costo de almacenar es alto en relación al costo de faltante: tanto el LH₂ (refrigeración costosa) como los paneles solares (sala limpia) tienen costos de mantenimiento elevados que justifican permitir un agotamiento controlado.",
  },
  {
    num: "03",
    title: "Cociente C₃/C₄",
    body: "El cociente C₃/C₄ determina la fracción de déficit óptimo: en el Problema 3 (C₃/C₄ = 25/80 = 0.31) se agota el 24% de cada ciclo, mientras que en el Problema 4 (C₃/C₄ = 33.6/190 = 0.18) solo se agota el 15%, reflejando que cuanto más caro es el faltante respecto al almacén, menor déficit conviene.",
  },
  {
    num: "04",
    title: "Política Óptima Cuantitativa",
    body: "Los Modelos de Inventario permiten a NexTech Industries pasar de decisiones empíricas a una política óptima cuantitativa que minimiza el costo total operativo manteniendo la continuidad de las misiones espaciales contratadas.",
  },
];

export function Conclusiones() {
  return (
    <section
      id="conclusiones"
      className="py-24 px-6 md:px-16"
      style={{ background: "rgba(0,0,0,0.08)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="tva-label mb-3"
        >
          — Cierre
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-2"
          style={{ color: "#FFF0DC" }}
        >
          Conclusiones
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-px w-16 mb-12 origin-left"
          style={{ background: "rgba(255,240,220,0.4)" }}
        />

        <div className="grid md:grid-cols-2 gap-5">
          {conclusiones.map((c, i) => (
            <motion.div
              key={c.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.12 }}
              className="p-5 rounded-sm relative overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,240,220,0.15)",
              }}
            >
              {/* Big number background */}
              <div
                className="absolute top-2 right-4 text-6xl font-bold leading-none select-none pointer-events-none"
                style={{ color: "rgba(255,240,220,0.04)" }}
              >
                {c.num}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#FFD4A8" }}
                  >
                    {c.num}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: "#FFF0DC" }}>
                    {c.title}
                  </span>
                </div>
                <div
                  className="h-px mb-3"
                  style={{ background: "rgba(255,240,220,0.12)" }}
                />
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,240,220,0.68)" }}>
                  {c.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
