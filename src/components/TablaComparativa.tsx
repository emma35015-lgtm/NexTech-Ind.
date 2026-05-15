"use client";

import { motion } from "framer-motion";

const rows = [
  { label: "Demanda Anual",        p1: "2,400 ton",    p2: "156,000 pzs",   p3: "18,000 tanq",  p4: "36,000 pan"  },
  { label: "Cantidad Óptima Q",    p1: "387",          p2: "12,900",        p3: "2,039",        p4: "3,369"       },
  { label: "Unidades Agotadas S",  p1: "— (N/A)",      p2: "— (N/A)",       p3: "486",          p4: "506"         },
  { label: "Inventario Máximo IM", p1: "387",          p2: "12,900",        p3: "1,554",        p4: "2,862"       },
  { label: "Costo Total CT",       p1: "$2,058,590",   p2: "$77,940",       p3: "$2,198,840",   p4: "$6,756,180"  },
  { label: "Pedidos por Año N",    p1: "6",            p2: "12",            p3: "9",            p4: "11"          },
  { label: "Tiempo entre Pedidos", p1: "59 días",      p2: "30 días",       p3: "41 días",      p4: "34 días"     },
];

const cols = [
  { key: "p1", label: "P1: Titanio",  sub: "Sin Déficit", deficit: false },
  { key: "p2", label: "P2: Tornillos",sub: "Sin Déficit",  deficit: false },
  { key: "p3", label: "P3: LH₂",      sub: "Con Déficit",  deficit: true  },
  { key: "p4", label: "P4: Paneles",  sub: "Con Déficit",  deficit: true  },
];

export function TablaComparativa() {
  return (
    <section
      id="comparativo"
      className="py-24 px-6 md:px-16 grid-bg"
      style={{ background: "rgba(0,0,0,0.12)" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="tva-label mb-3"
        >
          — Resumen
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-2"
          style={{ color: "#FFF0DC" }}
        >
          Tabla Comparativa
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="h-px w-16 mb-10 origin-left"
          style={{ background: "rgba(255,240,220,0.4)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto rounded-sm"
          style={{ border: "1px solid rgba(255,240,220,0.15)" }}
        >
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,240,220,0.15)" }}>
                <th className="px-4 py-3 text-left text-[10px] tracking-[0.12em] uppercase"
                  style={{ color: "rgba(255,255,255,0.7)", width: "28%" }}>
                  Indicador
                </th>
                {cols.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-center" style={{ color: "#FFF0DC" }}>
                    <div className="font-bold tracking-[0.06em]">{c.label}</div>
                    <div
                      className="text-[10px] font-normal tracking-[0.1em] mt-0.5"
                      style={{ color: c.deficit ? "rgba(255,180,130,0.7)" : "rgba(255,240,220,0.4)" }}
                    >
                      {c.sub}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + ri * 0.08 }}
                  style={{
                    background: ri % 2 === 0 ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.07)",
                    borderBottom: "1px solid rgba(255,240,220,0.06)",
                  }}
                >
                  <td className="px-4 py-3" style={{ color: "rgba(255,255,255,0.88)" }}>
                    {row.label}
                  </td>
                  {cols.map((c) => {
                    const val = row[c.key as keyof typeof row];
                    const isNA = val === "— (N/A)";
                    return (
                      <td
                        key={c.key}
                        className="px-4 py-3 text-center font-bold"
                        style={{ color: isNA ? "rgba(255,240,220,0.25)" : "#FFD4A8" }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="flex gap-6 mt-5"
        >
          {[
            { label: "Sin Déficit — Insumos críticos, reposición inmediata", color: "rgba(255,240,220,0.3)" },
            { label: "Con Déficit — Agotamiento controlado permitido", color: "rgba(255,150,100,0.5)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
              <span className="text-[10px] tracking-[0.08em]" style={{ color: "rgba(255,255,255,0.65)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
