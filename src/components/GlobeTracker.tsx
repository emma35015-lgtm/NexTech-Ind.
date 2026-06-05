"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

const VEHICLES = [
  { name: "NX-12 · EXPLORER", hudName: "NX-12 / EXPLORER", cls: "Crew · Tier I",     payload: "Atmospheric survey",    window: "T+ 04:12 / 96.4 min",     alt: 420,   vel: 27880, period: 92.6,  inc: 51.6 },
  { name: "NX-09 · ARC",      hudName: "NX-09 / ARC",      cls: "Cargo · Tier II",   payload: "Orbital relay nodes",  window: "T+ 11:48 / 296 min",      alt: 8240,  vel: 18760, period: 296.0, inc: 28.0 },
  { name: "NX-04 · SENTINEL", hudName: "NX-04 / SENTINEL", cls: "Observation · Geo", payload: "Earth-watch payload",  window: "T+ 23:56 / station-keep", alt: 35786, vel: 11070, period: 1436,  inc: 0.1  },
];

const ORBITS = [
  { a: 1.55, ecc: 0.02, tilt:  0.35, phase: 0,   speed:  0.55 },
  { a: 2.40, ecc: 0.10, tilt: -0.42, phase: 1.7, speed: -0.30 },
  { a: 3.55, ecc: 0.04, tilt:  0.12, phase: 3.3, speed:  0.16 },
];

const ORBIT_LABELS = ["LEO · 420 km", "MEO · 8 240 km", "GEO · 35 786 km"];

function fmtMissionTime(ms: number) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return `T+ ${d}D ${p(h)}:${p(m)}:${p(ss)}`;
}

export function GlobeTracker() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const stageRef       = useRef<HTMLDivElement>(null);
  const activeOrbitRef = useRef(0);
  const [activeOrbit, setActiveOrbit] = useState(0);
  const [missionStartMs]              = useState(() => Date.now());
  const [telemetry, setTelemetry]     = useState({ time: 0, vel: 27880, alt: 420, inc: 51.6, period: 92.6 });

  useEffect(() => { activeOrbitRef.current = activeOrbit; }, [activeOrbit]);

  useEffect(() => {
    const v = VEHICLES[activeOrbit];
    setTelemetry(prev => ({ ...prev, alt: v.alt, inc: v.inc, period: v.period, vel: v.vel }));
  }, [activeOrbit]);

  useEffect(() => {
    const id = setInterval(() => {
      const v = VEHICLES[activeOrbitRef.current];
      setTelemetry({
        time:   Date.now() - missionStartMs,
        vel:    v.vel + Math.round((Math.random() - 0.5) * 30),
        alt:    v.alt, inc: v.inc, period: v.period,
      });
    }, 250);
    return () => clearInterval(id);
  }, [missionStartMs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage  = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0, t = 0, earthRot = 0, W = 0, H = 0, cx = 0, cy = 0, R = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random(), y: Math.random(),
      s: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.5 + 0.1,
      ph: Math.random() * Math.PI * 2,
    }));

    function resize() {
      const r = stage!.getBoundingClientRect();
      W = Math.floor(r.width); H = Math.floor(r.height);
      canvas!.width  = W * DPR; canvas!.height = H * DPR;
      canvas!.style.width = W + "px"; canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      cx = W * 0.5; cy = H * 0.5;
      R  = Math.min(W, H) * 0.14;
    }
    resize();

    const AXIAL = 0.38, SEG = 80;
    function project(lon: number, lat: number) {
      const cl = Math.cos(lat), sl = Math.sin(lat);
      const x = cl * Math.cos(lon);
      const y0 = -sl, z0 = cl * Math.sin(lon);
      const ct = Math.cos(AXIAL), st = Math.sin(AXIAL);
      return { x: cx + x * R, y: cy + (y0 * ct - z0 * st) * R, z: y0 * st + z0 * ct };
    }

    function renderStars() {
      for (const s of stars) {
        ctx!.fillStyle = `rgba(255,240,220,${s.a * (0.7 + 0.3 * Math.sin(t * 1.5 + s.ph))})`;
        ctx!.fillRect(s.x * W, s.y * H, s.s, s.s);
      }
    }

    function drawMeridians(count: number, color: string, lw: number) {
      ctx!.strokeStyle = color; ctx!.lineWidth = lw;
      for (let m = 0; m < count; m++) {
        const lon0 = (m * Math.PI * 2 / count) + earthRot;
        ctx!.beginPath(); let ok = false;
        for (let i = 0; i <= SEG; i++) {
          const p = project(lon0, -Math.PI / 2 + (i / SEG) * Math.PI);
          if (p.z >= 0) { ok ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y); ok = true; }
          else { ok = false; }
        }
        ctx!.stroke();
      }
    }

    function renderEarth() {
      const g = ctx!.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, "rgba(50,18,8,0.4)"); g.addColorStop(1, "rgba(10,3,0,0.9)");
      ctx!.fillStyle = g;
      ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2); ctx!.fill();
      drawMeridians(12, "rgba(196,82,42,0.2)", 0.6);
      drawMeridians(4,  "rgba(196,82,42,0.4)", 0.8);
      ctx!.strokeStyle = "rgba(196,82,42,0.17)"; ctx!.lineWidth = 0.5;
      for (let lat = -Math.PI / 2 + Math.PI / 12; lat < Math.PI / 2 - 0.01; lat += Math.PI / 12) {
        ctx!.beginPath(); let ok = false;
        for (let i = 0; i <= SEG; i++) {
          const p = project((i / SEG) * Math.PI * 2, lat);
          if (p.z >= 0) { ok ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y); ok = true; }
          else { ok = false; }
        }
        ctx!.stroke();
      }
      ctx!.strokeStyle = "rgba(196,82,42,0.65)"; ctx!.lineWidth = 0.9;
      ctx!.beginPath(); let eqOk = false;
      for (let i = 0; i <= SEG * 2; i++) {
        const p = project((i / (SEG * 2)) * Math.PI * 2, 0);
        if (p.z >= 0) { eqOk ? ctx!.lineTo(p.x, p.y) : ctx!.moveTo(p.x, p.y); eqOk = true; }
        else { eqOk = false; }
      }
      ctx!.stroke();
      ctx!.strokeStyle = "rgba(255,240,220,0.7)"; ctx!.lineWidth = 1.0;
      ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2); ctx!.stroke();
      ctx!.save();
      const halo = ctx!.createRadialGradient(cx, cy, R * 0.99, cx, cy, R * 1.18);
      halo.addColorStop(0, "rgba(196,82,42,0)");
      halo.addColorStop(0.45, "rgba(196,82,42,0.18)");
      halo.addColorStop(1, "rgba(196,82,42,0)");
      ctx!.fillStyle = halo;
      ctx!.beginPath(); ctx!.arc(cx, cy, R * 1.22, 0, Math.PI * 2); ctx!.fill();
      ctx!.restore();
    }

    function drawOrbit(o: typeof ORBITS[0], i: number) {
      const a = R * o.a, b = a * Math.sqrt(1 - o.ecc * o.ecc);
      const isActive = i === activeOrbitRef.current;
      ctx!.save(); ctx!.translate(cx, cy); ctx!.rotate(o.tilt);
      ctx!.beginPath(); ctx!.ellipse(0, 0, a, b, 0, 0, Math.PI * 2);
      if (isActive) {
        ctx!.strokeStyle = "rgba(196,82,42,0.9)"; ctx!.lineWidth = 1.0;
        ctx!.shadowColor = "rgba(196,82,42,0.5)"; ctx!.shadowBlur = 10;
      } else {
        ctx!.strokeStyle = "rgba(255,240,220,0.16)"; ctx!.lineWidth = 0.6;
        ctx!.setLineDash([3, 5]);
      }
      ctx!.stroke(); ctx!.setLineDash([]); ctx!.shadowBlur = 0;
      const ang = o.phase + t * o.speed;
      const px = Math.cos(ang) * a, py = Math.sin(ang) * b;
      const sgn = Math.sign(o.speed);
      const tAng = Math.atan2(Math.cos(ang) * b * sgn, -Math.sin(ang) * a * sgn);
      ctx!.save(); ctx!.translate(px, py);
      if (isActive) {
        ctx!.beginPath(); ctx!.arc(0, 0, 12, 0, Math.PI * 2);
        ctx!.strokeStyle = "rgba(255,212,168,0.55)"; ctx!.lineWidth = 0.8;
        ctx!.shadowColor = "rgba(255,212,168,0.45)"; ctx!.shadowBlur = 10;
        ctx!.stroke(); ctx!.shadowBlur = 0;
      }
      ctx!.rotate(tAng + Math.PI / 2);
      const col = isActive ? "#FFD4A8" : "rgba(255,212,168,0.45)";
      ctx!.strokeStyle = col; ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, -6); ctx!.lineTo(2.6, -2); ctx!.lineTo(2.6, 4);
      ctx!.lineTo(-2.6, 4); ctx!.lineTo(-2.6, -2); ctx!.closePath();
      ctx!.stroke();
      if (isActive) {
        ctx!.fillStyle = "#C4522A";
        ctx!.beginPath(); ctx!.moveTo(-1.8, 4); ctx!.lineTo(0, 8); ctx!.lineTo(1.8, 4); ctx!.closePath(); ctx!.fill();
      }
      ctx!.strokeStyle = col;
      ctx!.beginPath();
      ctx!.moveTo(-2.6, 1); ctx!.lineTo(-4.2, 4); ctx!.lineTo(-2.6, 4);
      ctx!.moveTo( 2.6, 1); ctx!.lineTo( 4.2, 4); ctx!.lineTo( 2.6, 4);
      ctx!.stroke();
      ctx!.restore(); ctx!.restore();
    }

    let last = performance.now();
    function loop(now: number) {
      rafId = requestAnimationFrame(loop);
      const dt = (now - last) / 1000; last = now;
      t += dt; earthRot += dt * 0.10;
      ctx!.fillStyle = "#0A0300"; ctx!.fillRect(0, 0, W, H);
      renderStars(); renderEarth();
      ORBITS.forEach((o, i) => { if (i !== activeOrbitRef.current) drawOrbit(o, i); });
      drawOrbit(ORBITS[activeOrbitRef.current], activeOrbitRef.current);
    }
    rafId = requestAnimationFrame(loop);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, []);

  const vehicle = VEHICLES[activeOrbit];

  return (
    <div className="py-10 md:py-16 px-4 md:px-16">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="tva-label mb-2">&gt;_ NEXTECH INDUSTRIES</div>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue',sans-serif" }}>
            Control de Misión
          </h2>
          <div className="tva-label mb-1" style={{ color: "rgba(255,212,168,0.6)" }}>
            Seguimiento en Tiempo Real — NexTech Fleet
          </div>
          <div className="h-px w-16" style={{ background: "rgba(255,255,255,0.3)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-[310px_1fr] gap-4 items-start"
        >
          {/* ── Globe canvas — order-1 on mobile so it appears first ── */}
          <div ref={stageRef} className="relative overflow-hidden rounded-2xl order-1 md:order-2 h-[260px] md:h-[520px]"
            style={{
              border: "2px solid rgba(196,82,42,0.3)",
              background: "radial-gradient(ellipse at center,rgba(196,82,42,0.06) 0%,transparent 70%)",
              boxShadow: "0 0 22px rgba(196,82,42,0.15), inset 0 0 40px rgba(196,82,42,0.04)",
            }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />

            {/* HUD corners — hidden on mobile to avoid clutter */}
            <div className="absolute top-2 left-2 pointer-events-none hidden md:block"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,82,42,0.5)" }}>
              Reference · Geocentric
              <div className="mt-0.5" style={{ fontSize: 11, color: "rgba(255,212,168,0.55)", letterSpacing: "0.12em" }}>EQUATORIAL · J2000</div>
            </div>
            <div className="absolute top-2 right-2 text-right pointer-events-none"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,82,42,0.5)" }}>
              <span className="hidden md:inline">Feed · </span>
              <span style={{ fontSize: 10, color: "rgba(255,212,168,0.6)" }}>{vehicle.hudName}</span>
            </div>
            <div className="absolute bottom-8 left-2 pointer-events-none hidden md:block"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,82,42,0.5)" }}>
              Frame Lock
              <div className="mt-0.5" style={{ fontSize: 11, color: "rgba(255,212,168,0.55)", letterSpacing: "0.12em" }}>STABLE · 0.04 σ</div>
            </div>
            <div className="absolute bottom-8 right-2 text-right pointer-events-none hidden md:block"
              style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(196,82,42,0.5)" }}>
              Status
              <div className="mt-0.5" style={{ fontSize: 11, color: "#4ADE80", letterSpacing: "0.12em" }}>ORBITAL · LIVE</div>
            </div>

            {/* Corner brackets */}
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none"
                style={{
                  color: "rgba(196,82,42,0.3)", fontFamily: "'Space Mono',monospace",
                  top: i < 2 ? 6 : undefined, bottom: i >= 2 ? 6 : undefined,
                  left: i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined,
                }}>{ch}</span>
            ))}

            {/* Orbit legend — bottom of canvas */}
            <div className="absolute bottom-2 left-4 flex flex-col gap-1 pointer-events-none">
              {ORBIT_LABELS.map((label, o) => (
                <button key={o} onClick={() => setActiveOrbit(o)}
                  className="flex items-center gap-1.5 transition-all pointer-events-auto"
                  style={{ background: "none", border: "none", cursor: "pointer",
                    color: o === activeOrbit ? "#C4522A" : "rgba(196,82,42,0.3)",
                    opacity: o === activeOrbit ? 1 : 0.5 }}>
                  <div style={{ width: 14, height: 1, background: "currentColor",
                    boxShadow: o === activeOrbit ? "0 0 6px currentColor" : "none", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8,
                    letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Telemetry panel — order-2 on mobile so it appears below globe ── */}
          <div className="relative rounded-2xl overflow-hidden scanlines flex flex-col order-2 md:order-1"
            style={{
              background: "#0A0300",
              border: "2px solid #C4522A",
              boxShadow: "0 0 22px rgba(196,82,42,0.4), inset 0 0 40px rgba(196,82,42,0.06)",
            }}>
            <div className="absolute inset-0 pointer-events-none z-0" style={{
              backgroundImage: [
                "repeating-linear-gradient(rgba(196,82,42,0.05) 0px,rgba(196,82,42,0.05) 1px,transparent 1px,transparent 40px)",
                "repeating-linear-gradient(90deg,rgba(196,82,42,0.05) 0px,rgba(196,82,42,0.05) 1px,transparent 1px,transparent 40px)",
              ].join(","),
            }} />
            {(["┌","┐","└","┘"] as const).map((ch, i) => (
              <span key={i} className="absolute text-sm pointer-events-none select-none z-20"
                style={{
                  color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace",
                  top: i < 2 ? 6 : undefined, bottom: i >= 2 ? 6 : undefined,
                  left: i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined,
                }}>{ch}</span>
            ))}

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-4 h-9 flex-shrink-0"
              style={{ background: "#C4522A" }}>
              <span className="text-[10px] tracking-[0.15em] uppercase font-bold"
                style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>
                NEXTECH TRACKING
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full orbit-pulse"
                  style={{ background: "#0A0300" }} />
                <span className="text-[9px] tracking-[0.12em] uppercase font-bold"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>LIVE</span>
              </div>
            </div>

            {/* Status pill */}
            <div className="relative z-10 px-3 pt-3 pb-0">
              <div className="flex items-center gap-2 py-1.5 px-2 rounded mb-2"
                style={{ border: "1px solid rgba(196,82,42,0.25)", background: "rgba(196,82,42,0.05)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#4ADE80", boxShadow: "0 0 8px #4ADE80", animation: "orbitPulse 2s ease-in-out infinite" }} />
                <span className="text-[9px] tracking-[0.14em] uppercase"
                  style={{ color: "#FFD4A8", fontFamily: "'Space Mono',monospace" }}>
                  Acquiring telemetry
                </span>
              </div>

              {/* Vehicle tabs — horizontal row on mobile, vertical on desktop */}
              <div className="grid grid-cols-3 md:grid-cols-1 gap-1.5">
                {VEHICLES.map((v, i) => (
                  <button key={i} onClick={() => setActiveOrbit(i)}
                    className="text-left px-2 md:px-3 py-2 rounded transition-all"
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      lineHeight: 1.3,
                      background:   activeOrbit === i ? "rgba(196,82,42,0.12)" : "transparent",
                      color:        activeOrbit === i ? "#C4522A" : "rgba(255,212,168,0.3)",
                      border:       `1px solid ${activeOrbit === i ? "#C4522A" : "rgba(255,212,168,0.1)"}`,
                      boxShadow:    activeOrbit === i ? "0 0 18px -6px rgba(196,82,42,0.6)" : "none",
                      cursor: "pointer",
                    }}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Telemetry rows — 2-col grid on mobile to save space */}
            <div className="relative z-10 px-3 pt-3 pb-2 mt-2"
              style={{ borderTop: "1px solid rgba(196,82,42,0.18)", fontFamily: "'Space Mono',monospace" }}>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-x-3">
                {[
                  { label: "MISSION TIME",  value: fmtMissionTime(telemetry.time) },
                  { label: "ORB. VELOCITY", value: `${telemetry.vel.toLocaleString("en-US")} km/h` },
                  { label: "ALTITUDE",      value: `${telemetry.alt.toLocaleString("en-US")} km` },
                  { label: "INCLINATION",   value: `${telemetry.inc.toFixed(1)}° eq` },
                  { label: "ORBIT PERIOD",  value: `${telemetry.period} min` },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col py-1.5 md:py-0"
                    style={{ borderBottom: "1px solid rgba(196,82,42,0.1)", paddingBottom: 6, marginBottom: 2 }}>
                    <span className="text-[8px] tracking-[0.16em] uppercase mb-0.5"
                      style={{ color: "rgba(196,82,42,0.65)" }}>{row.label}</span>
                    <span className="text-[10px] md:text-[11px] font-bold" style={{ color: "#FFD4A8" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meta stamp — hidden on mobile to save space */}
            <div className="hidden md:block relative z-10 mx-3 mb-3 mt-2 p-3"
              style={{
                border: "1px solid rgba(196,82,42,0.2)",
                background: "repeating-linear-gradient(45deg,transparent 0 8px,rgba(196,82,42,0.02) 8px 9px)",
                fontFamily: "'Space Mono',monospace",
              }}>
              {[
                { label: "VEHICLE CLASS", value: vehicle.cls },
                { label: "PAYLOAD",       value: vehicle.payload },
                { label: "WINDOW",        value: vehicle.window },
              ].map((r) => (
                <div key={r.label} className="flex justify-between gap-2 py-0.5" style={{ fontSize: 9 }}>
                  <span style={{ color: "rgba(196,82,42,0.6)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{r.label}</span>
                  <span style={{ color: "#E0C4A0" }}>{r.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <svg viewBox="0 0 60 60" fill="none" width="26" height="26" style={{ opacity: 0.65, color: "#C4522A", flexShrink: 0 }}>
                  <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="0.8"/>
                  <circle cx="30" cy="30" r="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 3"/>
                  <path d="M30 8 L34 30 L30 52 L26 30 Z" stroke="currentColor" strokeWidth="0.8"/>
                  <circle cx="30" cy="30" r="3" stroke="currentColor" strokeWidth="0.5"/>
                </svg>
                <span style={{ color: "rgba(196,82,42,0.7)", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.08em", fontStyle: "italic" }}>
                  Authorized · Nx flight ops, 2026
                </span>
              </div>
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-1.5 flex-shrink-0 mt-auto"
              style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.5)" }}>
              <span className="text-[8px] tracking-[0.1em] uppercase"
                style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>NEXTECH FLEET</span>
              <span className="text-[8px] tracking-[0.1em]"
                style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>[ULASB 2026]</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
