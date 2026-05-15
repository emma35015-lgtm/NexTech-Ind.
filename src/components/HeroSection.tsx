"use client";

import { motion } from "framer-motion";
import { ParticleBackground } from "./ParticleBackground";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg"
    >
      <ParticleBackground />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-8">
        {/* Course label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tva-label"
        >
          Universidad La Salle Bajío &nbsp;·&nbsp; Ingeniería Industrial &nbsp;·&nbsp; Mayo 2026
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", damping: 18 }}
          className="flex flex-col items-center gap-2"
        >
          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-[0.06em] uppercase leading-none"
            style={{ color: "#FFF0DC", textShadow: "0 2px 40px rgba(0,0,0,0.3)" }}
          >
            NexTech
          </h1>
          <div
            className="text-xl md:text-3xl tracking-[0.35em] uppercase font-normal"
            style={{ color: "rgba(255,240,220,0.65)" }}
          >
            Industries
          </div>
        </motion.div>

        {/* Horizontal rule with dots */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-64 md:w-96 flex items-center gap-3"
        >
          <div className="flex-1 h-px" style={{ background: "rgba(255,240,220,0.35)" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,240,220,0.5)" }} />
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255,240,220,0.3)" }} />
          <div className="flex-1 h-px" style={{ background: "rgba(255,240,220,0.35)" }} />
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col items-center gap-3"
        >
          <p
            className="text-lg md:text-2xl tracking-[0.12em] uppercase font-bold"
            style={{ color: "#FFF0DC" }}
          >
            Modelos de Inventario
          </p>
          <p
            className="text-sm md:text-base tracking-[0.1em]"
            style={{ color: "rgba(255,240,220,0.6)" }}
          >
            Compras Sin Déficit &nbsp;/&nbsp; Compras Con Déficit
          </p>
        </motion.div>

        {/* Info tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {[
            "Métodos Cuantitativos",
            "Dra. Elsa Villagran Escamilla",
            "Fabricación y Lanzamiento de Cohetes",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full"
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,240,220,0.2)",
                color: "rgba(255,240,220,0.7)",
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1"
        >
          {["Emmanuel", "Jessica Juárez", "Regina González", "Regina Elorza"].map((name) => (
            <span
              key={name}
              className="text-xs tracking-[0.08em]"
              style={{ color: "rgba(255,240,220,0.5)" }}
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => document.getElementById("teoria")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="tva-label text-[9px]">Desplazar</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} style={{ color: "rgba(255,240,220,0.4)" }} />
        </motion.div>
      </motion.div>

      {/* Bottom border */}
      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
