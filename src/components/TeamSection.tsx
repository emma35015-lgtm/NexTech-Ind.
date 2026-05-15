"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

const members = [
  { num: "01", name: "Emmanuel",         role: "Líder de Proyecto" },
  { num: "02", name: "Jessica Juárez",   role: "Modelos Sin Déficit" },
  { num: "03", name: "Regina González",  role: "Modelos Con Déficit" },
  { num: "04", name: "Regina Elorza",    role: "Análisis Comparativo" },
  { num: "05", name: "Andrea Piña",      role: "Tabla Comparativa" },
];

export function TeamSection() {
  return (
    <section
      id="equipo"
      className="py-24 px-6 md:px-16 grid-bg"
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="tva-label mb-3"
        >
          — Equipo
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-2"
          style={{ color: "#FFF0DC" }}
        >
          NexTech Team
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-px w-16 mb-12 origin-left"
          style={{ background: "rgba(255,240,220,0.4)" }}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {members.map((m, i) => (
            <motion.div
              key={m.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring", damping: 18 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-sm text-center relative overflow-hidden"
              style={{
                background: "rgba(0,0,0,0.22)",
                border: "1px solid rgba(255,240,220,0.15)",
              }}
            >
              {/* Number watermark */}
              <div
                className="absolute top-1 right-2 text-4xl font-bold select-none"
                style={{ color: "rgba(255,240,220,0.05)" }}
              >
                {m.num}
              </div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Avatar placeholder */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(196,82,42,0.35)",
                    border: "1px solid rgba(255,240,220,0.2)",
                  }}
                >
                  <Rocket size={16} style={{ color: "#FFD4A8" }} />
                </div>

                <div>
                  <div className="text-sm font-bold mb-1" style={{ color: "#FFF0DC" }}>
                    {m.name}
                  </div>
                  <div className="text-[10px] tracking-[0.1em] uppercase" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {m.role}
                  </div>
                </div>

                <div
                  className="text-[10px] tracking-[0.2em]"
                  style={{ color: "rgba(255,212,168,0.4)" }}
                >
                  {m.num}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-12 p-6 rounded-sm text-center"
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,240,220,0.1)",
          }}
        >
          <div className="space-y-2">
            {[
              ["Materia", "Métodos Cuantitativos"],
              ["Docente", "Dra. Elsa Villagran Escamilla"],
              ["Universidad", "Universidad La Salle Bajío"],
              ["Carrera", "Ingeniería Industrial"],
              ["Fecha", "Mayo 2026"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-center items-center gap-4 text-xs">
                <span className="tva-label">{k}</span>
                <span className="text-[11px]" style={{ color: "rgba(255,240,220,0.7)" }}>{v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
