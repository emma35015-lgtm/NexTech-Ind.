"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { ParticleBackground } from "./ParticleBackground";
import { ChevronDown, X, ExternalLink } from "lucide-react";

/* ─── External tools ─────────────────────────────────────────── */
const TOOLS = [
  {
    id: "vogel",
    category: "Calculadora",
    name: "Vogel",
    subtitle: "Método de Transporte",
    url: "https://emma35015-lgtm.github.io/Vogel-Calculadora-/",
  },
  {
    id: "game",
    category: "Arcade",
    name: "NexTech Game",
    subtitle: "Versión 2.0",
    url: "https://emma35015-lgtm.github.io/Game-2.0/",
  },
];

/* ─── Stars ──────────────────────────────────────────────────── */
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: 0.8 + Math.random() * 1.4,
  delay: Math.random() * 4,
  dur: 2 + Math.random() * 3,
}));

/* ─── Glitch logo ────────────────────────────────────────────── */
const GCHARS = "!@#$%^&*<>[]{}|/\\?~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOGO = "NexTech";

function GlitchLogo() {
  const [chars, setChars] = useState<string[]>(() =>
    LOGO.split("").map(() => GCHARS[Math.floor(Math.random() * GCHARS.length)])
  );
  const [isGlitching, setIsGlitching] = useState(false);

  // Initial decode: letters resolve left-to-right over ~1.6 s
  useEffect(() => {
    const FRAMES = 40;
    let f = 0;
    const id = setInterval(() => {
      f++;
      setChars(
        LOGO.split("").map((ch, i) =>
          f > (i / LOGO.length) * FRAMES * 0.75
            ? ch
            : GCHARS[Math.floor(Math.random() * GCHARS.length)]
        )
      );
      if (f >= FRAMES) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, []);

  // Periodic micro-glitch every 5-10 s
  useEffect(() => {
    let outer: ReturnType<typeof setTimeout>;
    function schedule() {
      outer = setTimeout(() => {
        setIsGlitching(true);
        let g = 0;
        const id = setInterval(() => {
          g++;
          if (g <= 5) {
            setChars(
              LOGO.split("").map((ch) =>
                Math.random() > 0.55
                  ? GCHARS[Math.floor(Math.random() * GCHARS.length)]
                  : ch
              )
            );
          } else {
            clearInterval(id);
            setChars(LOGO.split(""));
            setIsGlitching(false);
            schedule();
          }
        }, 50);
      }, 5000 + Math.random() * 5000);
    }
    schedule();
    return () => clearTimeout(outer);
  }, []);

  return (
    <h1
      className="text-7xl md:text-9xl lg:text-[11rem] uppercase leading-none select-none"
      style={{
        fontFamily: "'Bebas Neue', sans-serif",
        letterSpacing: "0.08em",
        color: "#FFFFFF",
        textShadow: isGlitching
          ? "4px 0 rgba(196,82,42,0.9), -4px 0 rgba(80,180,255,0.75), 0 0 80px rgba(255,212,168,0.35)"
          : "0 0 60px rgba(255,212,168,0.12), 0 2px 50px rgba(0,0,0,0.35)",
        transition: isGlitching ? "none" : "text-shadow 0.5s ease",
      }}
    >
      {chars.join("")}
    </h1>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */
export function HeroSection() {
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 80, damping: 18 });
  const springY = useSpring(rotY, { stiffness: 80, damping: 18 });
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const activeToolData = TOOLS.find((t) => t.id === activeTool);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      rotX.set(-dy * 10);
      rotY.set(dx * 12);
    },
    [rotX, rotY]
  );

  const handleMouseLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
  }, [rotX, rotY]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg"
      style={{ paddingTop: "46px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <ParticleBackground />

      {/* Twinkling stars */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {STARS.map((s) => (
          <motion.circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#FFF0DC"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.2, 0.8, 0] }}
            transition={{
              delay: s.delay,
              duration: s.dur,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}
      </svg>

      {/* Content */}
      <div
        className="relative flex flex-col items-center text-center px-6 gap-8"
        style={{ zIndex: 2 }}
      >
        {/* Course label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tva-label"
        >
          Universidad La Salle Bajío &nbsp;·&nbsp; Ingeniería Industrial &nbsp;·&nbsp; Mayo 2026
        </motion.div>

        {/* Logo block — 3D parallax wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", damping: 18 }}
          className="relative flex flex-col items-center gap-2"
          style={{
            rotateX: springX,
            rotateY: springY,
            transformPerspective: 900,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Orbit ellipse */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="relative"
              style={{ width: "340px", height: "120px" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <svg
                viewBox="0 0 340 120"
                className="absolute inset-0 w-full h-full"
                style={{ overflow: "visible" }}
              >
                <ellipse
                  cx="170"
                  cy="60"
                  rx="168"
                  ry="58"
                  fill="none"
                  stroke="rgba(255,240,220,0.08)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              </svg>
              <div
                className="absolute"
                style={{
                  top: "1px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#FFD4A8",
                  boxShadow: "0 0 12px #FFD4A8, 0 0 4px #FFD4A8",
                }}
              />
            </motion.div>
          </div>

          <GlitchLogo />

          <div
            className="text-xl md:text-3xl tracking-[0.35em] uppercase font-normal"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Industries
          </div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="w-64 md:w-96 flex items-center gap-3"
        >
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.45)" }} />
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
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
            style={{ color: "#FFFFFF" }}
          >
            Modelos de Inventario
          </p>
          <p
            className="text-sm md:text-base tracking-[0.1em]"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Compra · Producción · Sin Déficit · Con Déficit
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
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* External tools */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-wrap justify-center gap-3 w-full max-w-lg"
        >
          {TOOLS.map((tool, idx) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className="relative flex-1 min-w-[140px] flex flex-col items-start gap-1 px-4 py-3 text-left transition-all group"
              style={{
                background: "rgba(10,3,0,0.7)",
                border: "1px solid rgba(196,82,42,0.55)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#C4522A";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(196,82,42,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,82,42,0.55)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {/* corner bracket */}
              <span className="absolute top-1.5 right-2 text-xs pointer-events-none select-none"
                style={{ color: "rgba(196,82,42,0.45)", fontFamily: "'Space Mono',monospace" }}>┐</span>
              <span className="text-[9px] tracking-[0.2em] uppercase"
                style={{ color: "#C4522A", fontFamily: "'Space Mono',monospace" }}>
                &gt;_ {tool.category}
              </span>
              <span className="text-base font-bold uppercase tracking-[0.1em]"
                style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.12em" }}>
                {tool.name}
              </span>
              <span className="text-[10px] tracking-[0.08em]"
                style={{ color: "rgba(255,212,168,0.5)", fontFamily: "'Space Mono',monospace" }}>
                {tool.subtitle}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] tracking-[0.18em] uppercase font-bold"
                  style={{ color: "#C4522A", fontFamily: "'Space Mono',monospace" }}>
                  ABRIR
                </span>
                <ExternalLink size={9} style={{ color: "#C4522A" }} />
              </div>
            </button>
          ))}
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-1"
        >
          {["Emmanuel", "Jessica Juárez", "Regina González", "Regina Elorza", "Andrea Piña"].map(
            (name) => (
              <span
                key={name}
                className="text-xs tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {name}
              </span>
            )
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        style={{ zIndex: 2 }}
        onClick={() => document.getElementById("teoria")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="tva-label text-[9px]">Desplazar</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        </motion.div>
      </motion.div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />

      {/* Tool modal overlay */}
      {activeTool && activeToolData && (
        <div className="fixed inset-0 flex flex-col" style={{ zIndex: 300, background: "rgba(5,1,0,0.97)" }}>
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 h-11 flex-shrink-0"
            style={{ background: "#C4522A" }}>
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
                ████ NEXTECH — {activeToolData.category.toUpperCase()} · {activeToolData.name.toUpperCase()} ████
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={activeToolData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase font-bold px-2 py-1"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace",
                  border: "1px solid rgba(10,3,0,0.3)", background: "rgba(10,3,0,0.15)" }}
              >
                <ExternalLink size={10} />
                <span>Nueva pestaña</span>
              </a>
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center justify-center w-7 h-7 transition-all"
                style={{ background: "rgba(10,3,0,0.25)", border: "1px solid rgba(10,3,0,0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,3,0,0.5)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(10,3,0,0.25)"; }}
              >
                <X size={14} style={{ color: "#0A0300" }} />
              </button>
            </div>
          </div>
          {/* iframe */}
          <iframe
            src={activeToolData.url}
            className="flex-1 w-full border-none"
            title={activeToolData.name}
            allow="fullscreen"
          />
          {/* Status bar */}
          <div className="flex items-center px-4 h-7 flex-shrink-0"
            style={{ background: "#0A0300", borderTop: "1px solid rgba(196,82,42,0.3)" }}>
            <span className="text-[8px] tracking-[0.15em] uppercase"
              style={{ color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace" }}>
              NEXTECH INDUSTRIES — {activeToolData.url} — [STATUS: ACTIVE]
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
