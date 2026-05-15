"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ITEMS = [
  "NEXTECH INDUSTRIES",
  "MISIÓN NX-HEAVY-07 — EN CURSO",
  "ALTITUD ORBITAL: 420 KM — LEO ESTABLE",
  "PROPELENTE LH₂ — NOMINAL",
  "PANELES SOLARES — DESPLEGADOS",
  "TITANIO AEROESPACIAL: 387 TON/PEDIDO",
  "TORNILLOS AS9100: 12,900 PZS — OPTIMIZADO",
  "CONTROL DE INVENTARIO — ACTIVO",
  "MÉTODOS CUANTITATIVOS // ULASB 2026",
  "INGENIERÍA INDUSTRIAL // MAYO 2026",
];

const tickerText = ITEMS.join("  ·  ") + "  ·  ";

export function MissionTicker() {
  const [time, setTime] = useState("");
  const [missionTime, setMissionTime] = useState(0);

  useEffect(() => {
    const start = Date.now() - 4823000; // fake mission start ~80min ago
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setMissionTime(elapsed);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = String(Math.floor(missionTime / 3600)).padStart(2, "0");
  const m = String(Math.floor((missionTime % 3600) / 60)).padStart(2, "0");
  const s = String(missionTime % 60).padStart(2, "0");

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex items-center overflow-hidden"
      style={{
        height: "46px",
        background: "#0F0500",
        borderBottom: "2px solid rgba(196,82,42,0.55)",
      }}
    >
      {/* Live indicator */}
      <div
        className="flex-shrink-0 flex items-center gap-2.5 px-4 border-r"
        style={{ borderColor: "rgba(196,82,42,0.4)", height: "100%" }}
      >
        <motion.div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#C4522A", boxShadow: "0 0 6px #C4522A" }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span className="text-sm tracking-[0.25em] font-bold" style={{ color: "#C4522A" }}>
          LIVE
        </span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex items-center whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          style={{ height: "46px" }}
        >
          {[0, 1].map((n) => (
            <span
              key={n}
              className="text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(255,220,180,0.85)", paddingRight: "0.5rem" }}
            >
              {tickerText}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Mission clock */}
      <div
        className="flex-shrink-0 flex items-center gap-4 px-4 border-l"
        style={{ borderColor: "rgba(196,82,42,0.4)", height: "100%" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,200,120,0.55)" }}>
            T+
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: "#FFD4A8" }}>
            {h}:{m}:{s}
          </span>
        </div>
        <div
          className="hidden sm:block w-px h-4"
          style={{ background: "rgba(196,82,42,0.4)" }}
        />
        <span className="hidden sm:block text-sm font-bold tabular-nums" style={{ color: "rgba(255,200,120,0.65)" }}>
          {time}
        </span>
      </div>
    </div>
  );
}
