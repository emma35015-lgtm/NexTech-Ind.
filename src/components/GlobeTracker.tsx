"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type * as THREE from "three";

/* ─── Mission data ─────────────────────────────────────────────── */
const MISSIONS = [
  { id: "NX-HEAVY 01",   vehicle: "NX-HEAVY",  payload: "NEXTECH-01",   orbit: "LEO  402 KM",   status: "ORBITAL" },
  { id: "NX-LITE 07",    vehicle: "NX-LITE",   payload: "NEXSAT-07",    orbit: "SSO  550 KM",   status: "NOMINAL" },
  { id: "SAT-DEPLOY 12", vehicle: "NX-HEAVY",  payload: "CLUSTER-12",   orbit: "GTO  35,786 KM", status: "DESPLIEGUE" },
];

/* incl° measured from equatorial plane; speed in rad/s; radius in Three.js units */
const ORBITS = [
  { incl: 28,  radius: 2.55, speed: 0.28 }, // LEO
  { incl: 97,  radius: 2.65, speed: 0.24 }, // SSO
  { incl: 0,   radius: 2.78, speed: 0.14 }, // GTO / equatorial
];

/* ─── Helpers ───────────────────────────────────────────────────── */
function fmtMissionTime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `T+ ${d}D ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ─── TVA Panel wrapper ─────────────────────────────────────────── */
function TVAPanel({
  children, headerLeft, headerRight, statusLeft, statusRight,
}: {
  children: React.ReactNode;
  headerLeft: React.ReactNode;
  headerRight?: React.ReactNode;
  statusLeft?: React.ReactNode;
  statusRight?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden scanlines flex flex-col h-full"
      style={{
        background: "#0A0300",
        border: "2px solid #C4522A",
        boxShadow: "0 0 22px rgba(196,82,42,0.45), inset 0 0 40px rgba(196,82,42,0.06)",
      }}
    >
      {/* CRT inner grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: [
          "repeating-linear-gradient(rgba(196,82,42,0.06) 0px,rgba(196,82,42,0.06) 1px,transparent 1px,transparent 40px)",
          "repeating-linear-gradient(90deg,rgba(196,82,42,0.06) 0px,rgba(196,82,42,0.06) 1px,transparent 1px,transparent 40px)",
        ].join(","),
      }} />
      {/* Corner brackets */}
      {(["┌","┐","└","┘"] as const).map((ch, i) => (
        <span key={i} className="absolute text-sm pointer-events-none select-none z-20"
          style={{
            color: "rgba(196,82,42,0.5)", fontFamily: "'Space Mono',monospace",
            top: i < 2 ? 6 : undefined, bottom: i >= 2 ? 6 : undefined,
            left: i % 2 === 0 ? 8 : undefined, right: i % 2 === 1 ? 8 : undefined,
          }}>{ch}</span>
      ))}
      {/* Header stripe */}
      <div className="relative z-10 flex items-center justify-between px-4 h-9 flex-shrink-0"
        style={{ background: "#C4522A" }}>
        <span className="text-[10px] tracking-[0.15em] uppercase font-bold"
          style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>{headerLeft}</span>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>
      {/* Body */}
      <div className="relative z-10 flex-1 overflow-hidden">{children}</div>
      {/* Status bar */}
      {(statusLeft || statusRight) && (
        <div className="relative z-10 flex items-center justify-between px-4 py-1.5 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.5)" }}>
          <span className="text-[8px] tracking-[0.1em] uppercase"
            style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>{statusLeft}</span>
          <span className="text-[8px] tracking-[0.1em]"
            style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono',monospace" }}>{statusRight}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export function GlobeTracker() {
  const mountRef     = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const cleanupRef   = useRef<(() => void) | null>(null);

  // refs updated from Two.js setup → updated on tab change
  const orbitRingsRef  = useRef<any[]>([]);  // THREE.Mesh[]
  const markersRef     = useRef<any[]>([]);  // { marker, halo }[]
  const activeTabRef   = useRef(0);

  const [activeTab, setActiveTab] = useState(0);
  const [telemetry, setTelemetry] = useState({ missionTime: 4_823, altitude: 401, speed: 27_600 });

  /* Telemetry simulation */
  useEffect(() => {
    const startMs = Date.now() - 4_823_000;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setTelemetry({
        missionTime: elapsed,
        altitude: Math.round(380 + 40 * Math.abs(Math.sin(elapsed * 0.012))),
        speed: 27_600 + Math.round(Math.sin(elapsed * 0.07) * 120),
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* Sync activeTab → refs → orbit materials */
  useEffect(() => {
    activeTabRef.current = activeTab;
    orbitRingsRef.current.forEach((ring, i) => {
      if (!ring?.material) return;
      ring.material.opacity = i === activeTab ? 0.6 : 0.1;
      ring.material.color.setHex(i === activeTab ? 0xFFD4A8 : 0xC4522A);
      ring.material.needsUpdate = true;
    });
    markersRef.current.forEach((g, i) => {
      if (!g) return;
      g.marker.visible = (i === activeTab);
      g.halo.visible   = (i === activeTab);
    });
  }, [activeTab]);

  /* Three.js scene */
  useEffect(() => {
    cancelledRef.current = false;
    let animFrame = 0;

    import("three").then((THREE) => {
      if (cancelledRef.current || !mountRef.current) return;
      const mount = mountRef.current;

      /* Renderer */
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      /* Scene + Camera */
      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
      camera.position.set(0, 0.5, 7);
      camera.lookAt(0, 0, 0);

      /* ── Globe group (rotates on Y) ─────────────────────── */
      const sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      const sphereGeo = new THREE.SphereGeometry(2, 28, 18);
      const wireGeo   = new THREE.WireframeGeometry(sphereGeo);
      const wireMat   = new THREE.LineBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.2 });
      sphereGroup.add(new THREE.LineSegments(wireGeo, wireMat));

      /* Prominent equator */
      const eqGeo  = new THREE.TorusGeometry(2, 0.009, 4, 80);
      const eqMat  = new THREE.MeshBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.72 });
      const eqMesh = new THREE.Mesh(eqGeo, eqMat);
      eqMesh.rotation.x = Math.PI / 2;
      sphereGroup.add(eqMesh);

      /* 4 meridians */
      const meriGeos: any[] = [], meriMats: any[] = [];
      for (let i = 0; i < 4; i++) {
        const g = new THREE.TorusGeometry(2, 0.006, 4, 64);
        const m = new THREE.MeshBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.42 });
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.y = (i * 45 * Math.PI) / 180;
        sphereGroup.add(mesh);
        meriGeos.push(g); meriMats.push(m);
      }

      /* ── 3 Orbit rings (fixed in scene) ─────────────────── */
      const orbitGeos: any[] = [], orbitMats: any[] = [];
      const orbitMeshes: any[] = [];
      ORBITS.forEach((orb, i) => {
        const g = new THREE.TorusGeometry(orb.radius, 0.007, 4, 128);
        const m = new THREE.MeshBasicMaterial({
          color: i === 0 ? 0xFFD4A8 : 0xC4522A,
          transparent: true,
          opacity: i === 0 ? 0.6 : 0.1,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z = (orb.incl * Math.PI) / 180;
        scene.add(mesh);
        orbitGeos.push(g); orbitMats.push(m); orbitMeshes.push(mesh);
      });
      orbitRingsRef.current = orbitMeshes;

      /* ── 3 Markers ───────────────────────────────────────── */
      const markerData: { marker: any; halo: any; markerGeo: any; markerMat: any; haloGeo: any; haloMat: any }[] = [];
      ORBITS.forEach((_, i) => {
        const markerGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xFFD4A8 });
        const marker    = new THREE.Mesh(markerGeo, markerMat);
        marker.visible  = (i === 0);
        scene.add(marker);

        const haloGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xFFD4A8, transparent: true, opacity: 0.22 });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.visible  = (i === 0);
        scene.add(halo);

        markerData.push({ marker, halo, markerGeo, markerMat, haloGeo, haloMat });
      });
      markersRef.current = markerData;

      /* ── Animation loop ──────────────────────────────────── */
      const clock = new THREE.Clock();
      const animate = () => {
        animFrame = requestAnimationFrame(animate);
        sphereGroup.rotation.y += 0.0012;
        const t = clock.getElapsedTime();
        ORBITS.forEach((orb, i) => {
          const { marker, halo } = markerData[i];
          const incl = (orb.incl * Math.PI) / 180;
          const R    = orb.radius;
          const ang  = t * orb.speed;
          const x    = R * Math.cos(ang) * Math.cos(incl);
          const y    = R * Math.cos(ang) * Math.sin(incl);
          const z    = R * Math.sin(ang);
          marker.position.set(x, y, z);
          halo.position.set(x, y, z);
        });
        renderer.render(scene, camera);
      };
      animate();

      /* ── Resize ──────────────────────────────────────────── */
      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      /* ── Cleanup ─────────────────────────────────────────── */
      cleanupRef.current = () => {
        cancelAnimationFrame(animFrame);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        [sphereGeo, wireGeo, wireMat, eqGeo, eqMat,
          ...meriGeos, ...meriMats,
          ...orbitGeos, ...orbitMats,
        ].forEach((o: any) => o?.dispose?.());
        markerData.forEach(({ markerGeo, markerMat, haloGeo, haloMat }) => {
          markerGeo.dispose(); markerMat.dispose(); haloGeo.dispose(); haloMat.dispose();
        });
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelledRef.current = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const mission = MISSIONS[activeTab];

  return (
    <div className="py-12 md:py-16 px-4 md:px-16">
      <div className="max-w-5xl mx-auto space-y-6">

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

        {/* Globe + Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.15 }}
          className="flex flex-col md:grid md:grid-cols-[290px_1fr] gap-4"
          style={{ minHeight: 400 }}
        >
          {/* ── Telemetry panel ── */}
          <TVAPanel
            headerLeft="NEXTECH TRACKING"
            headerRight={
              <>
                <span className="w-2 h-2 rounded-full orbit-pulse"
                  style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
                <span className="text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono',monospace" }}>LIVE</span>
              </>
            }
            statusLeft="NEXTECH FLEET"
            statusRight="[ULASB 2026]"
          >
            {/* Mission tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(196,82,42,0.3)" }}>
              {MISSIONS.map((m, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="flex-1 text-[8px] tracking-[0.06em] uppercase py-2 transition-all"
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    background: activeTab === i ? "rgba(196,82,42,0.2)" : "transparent",
                    color: activeTab === i ? "#FFD4A8" : "rgba(255,212,168,0.3)",
                    borderBottom: activeTab === i ? "2px solid #C4522A" : "2px solid transparent",
                    cursor: "pointer",
                  }}>
                  {m.id}
                </button>
              ))}
            </div>

            {/* Orbit legend */}
            <div className="px-4 pt-3 pb-1 flex flex-col gap-1.5">
              {MISSIONS.map((m, i) => (
                <button key={i} onClick={() => setActiveTab(i)}
                  className="flex items-center gap-2 transition-all"
                  style={{ cursor: "pointer", background: "none", border: "none" }}>
                  <svg width="28" height="10">
                    <ellipse cx="14" cy="5" rx="12" ry="3.5"
                      fill="none"
                      stroke={i === activeTab ? "#FFD4A8" : "rgba(196,82,42,0.35)"}
                      strokeWidth={i === activeTab ? "1.5" : "0.8"} />
                    {i === activeTab && (
                      <circle cx="24" cy="5" r="2" fill="#FFD4A8" />
                    )}
                  </svg>
                  <span className="text-[9px] tracking-[0.1em] uppercase"
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      color: i === activeTab ? "#FFD4A8" : "rgba(255,212,168,0.3)",
                    }}>
                    {m.id}
                  </span>
                </button>
              ))}
            </div>

            <div className="h-px mx-4 mt-2" style={{ background: "rgba(196,82,42,0.25)" }} />

            {/* Telemetry rows */}
            <div className="p-4 space-y-2.5" style={{ fontFamily: "'Space Mono',monospace" }}>
              {[
                { label: "MISIÓN TIME", value: fmtMissionTime(telemetry.missionTime) },
                { label: "ALTITUD",     value: `${telemetry.altitude.toLocaleString()} KM` },
                { label: "VELOCIDAD",   value: `${telemetry.speed.toLocaleString()} KM/H` },
                { label: "VEHÍCULO",    value: mission.vehicle },
                { label: "CARGA ÚTIL",  value: mission.payload },
                { label: "ÓRBITA",      value: mission.orbit },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-[9px] tracking-[0.1em] uppercase flex-shrink-0"
                    style={{ color: "rgba(196,82,42,0.7)" }}>{row.label}</span>
                  <span className="text-[10px] font-bold text-right" style={{ color: "#FFD4A8" }}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="h-px" style={{ background: "rgba(196,82,42,0.25)" }} />
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-[0.1em] uppercase"
                  style={{ color: "rgba(196,82,42,0.7)" }}>ESTADO</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full orbit-pulse"
                    style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
                  <span className="text-[10px] font-bold" style={{ color: "#4ADE80" }}>
                    {mission.status}
                  </span>
                </div>
              </div>
            </div>
          </TVAPanel>

          {/* ── Globe canvas ── */}
          <div
            ref={mountRef}
            className="rounded-2xl overflow-hidden"
            style={{
              height: 420,
              minHeight: 260,
              background:
                "radial-gradient(ellipse at 52% 48%, rgba(196,82,42,0.1) 0%, rgba(10,3,0,0.92) 60%, #0A0300 100%)",
              border: "2px solid rgba(196,82,42,0.3)",
              boxShadow: "0 0 22px rgba(196,82,42,0.2), inset 0 0 40px rgba(196,82,42,0.04)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
