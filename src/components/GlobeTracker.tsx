"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type * as THREE from "three";

const MISSIONS = [
  { id: "NX-HEAVY 01",   vehicle: "NX-HEAVY",  payload: "NEXTECH-01",   orbit: "LEO 402 KM",  status: "ORBITAL" },
  { id: "NX-LITE 07",    vehicle: "NX-LITE",   payload: "NEXSAT-07",    orbit: "SSO 550 KM",  status: "NOMINAL" },
  { id: "SAT-DEPLOY 12", vehicle: "NX-HEAVY",  payload: "CLUSTER-12",   orbit: "GTO 35,786 KM", status: "DESPLIEGUE" },
];

function fmtMissionTime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `T+ ${d}D ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function TVAPanel({
  children,
  headerLeft,
  headerRight,
  statusLeft,
  statusRight,
}: {
  children: React.ReactNode;
  headerLeft: React.ReactNode;
  headerRight?: React.ReactNode;
  statusLeft?: React.ReactNode;
  statusRight?: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-sm overflow-hidden scanlines flex flex-col"
      style={{
        background: "#0A0300",
        border: "2px solid #C4522A",
        boxShadow: "0 0 18px rgba(196,82,42,0.4), inset 0 0 30px rgba(196,82,42,0.05)",
      }}
    >
      {/* CRT inner grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(rgba(196,82,42,0.06) 0px, rgba(196,82,42,0.06) 1px, transparent 1px, transparent 40px)",
            "repeating-linear-gradient(90deg, rgba(196,82,42,0.06) 0px, rgba(196,82,42,0.06) 1px, transparent 1px, transparent 40px)",
          ].join(", "),
        }}
      />
      {/* Corner brackets */}
      {(["┌", "┐", "└", "┘"] as const).map((ch, i) => (
        <span
          key={i}
          className="absolute text-sm pointer-events-none select-none z-20"
          style={{
            color: "rgba(196,82,42,0.5)",
            fontFamily: "'Space Mono', monospace",
            top: i < 2 ? 6 : undefined,
            bottom: i >= 2 ? 6 : undefined,
            left: i % 2 === 0 ? 8 : undefined,
            right: i % 2 === 1 ? 8 : undefined,
          }}
        >
          {ch}
        </span>
      ))}
      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-4 h-9 flex-shrink-0"
        style={{ background: "#C4522A" }}
      >
        <span className="text-[10px] tracking-[0.15em] uppercase font-bold" style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}>
          {headerLeft}
        </span>
        {headerRight && (
          <div className="flex items-center gap-2">{headerRight}</div>
        )}
      </div>
      {/* Content */}
      <div className="relative z-10 flex-1">{children}</div>
      {/* Status bar */}
      {(statusLeft || statusRight) && (
        <div
          className="relative z-10 flex items-center justify-between px-4 py-2 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.4)" }}
        >
          <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}>
            {statusLeft}
          </span>
          <span className="text-[8px] tracking-[0.1em]" style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}>
            {statusRight}
          </span>
        </div>
      )}
    </div>
  );
}

export function GlobeTracker() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cancelledRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [telemetry, setTelemetry] = useState({ missionTime: 4_823, altitude: 401, speed: 27_600 });

  // Telemetry simulation
  useEffect(() => {
    const startMs = Date.now() - 4_823_000;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const altitude = Math.round(380 + 40 * Math.abs(Math.sin(elapsed * 0.012)));
      const speed = 27_600 + Math.round(Math.sin(elapsed * 0.07) * 120);
      setTelemetry({ missionTime: elapsed, altitude, speed });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Three.js scene
  useEffect(() => {
    cancelledRef.current = false;
    let animFrame = 0;

    import("three").then((THREE) => {
      if (cancelledRef.current || !mountRef.current) return;
      const mount = mountRef.current;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // Scene + Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
      camera.position.set(0, 0.8, 6.5);

      // Wireframe globe group (this rotates)
      const sphereGroup = new THREE.Group();
      scene.add(sphereGroup);

      const sphereGeo = new THREE.SphereGeometry(2, 24, 16);
      const wireGeo = new THREE.WireframeGeometry(sphereGeo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.22 });
      const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
      sphereGroup.add(wireMesh);

      // Prominent equator
      const equatorGeo = new THREE.TorusGeometry(2, 0.008, 4, 64);
      const equatorMat = new THREE.MeshBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.7 });
      const equator = new THREE.Mesh(equatorGeo, equatorMat);
      equator.rotation.x = Math.PI / 2;
      sphereGroup.add(equator);

      // 4 meridians
      const meridianGeos: THREE.BufferGeometry[] = [];
      const meridianMats: THREE.Material[] = [];
      for (let i = 0; i < 4; i++) {
        const mGeo = new THREE.TorusGeometry(2, 0.006, 4, 64);
        const mMat = new THREE.MeshBasicMaterial({ color: 0xC4522A, transparent: true, opacity: 0.45 });
        const m = new THREE.Mesh(mGeo, mMat);
        m.rotation.y = (i * 45 * Math.PI) / 180;
        sphereGroup.add(m);
        meridianGeos.push(mGeo);
        meridianMats.push(mMat);
      }

      // Orbit ring (fixed — NOT in sphereGroup)
      const orbitGeo = new THREE.TorusGeometry(2.6, 0.006, 4, 128);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0xFFD4A8, transparent: true, opacity: 0.45 });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      orbitRing.rotation.z = (28 * Math.PI) / 180;
      scene.add(orbitRing);

      // Rocket marker
      const markerGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xFFD4A8 });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      scene.add(marker);

      // Glow halo
      const haloGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xFFD4A8, transparent: true, opacity: 0.22 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      scene.add(halo);

      // Animation loop
      const clock = new THREE.Clock();
      const incl = (28 * Math.PI) / 180;
      const R = 2.6;

      const animate = () => {
        animFrame = requestAnimationFrame(animate);
        sphereGroup.rotation.y += 0.0015;
        const t = clock.getElapsedTime() * 0.18;
        const x = R * Math.cos(t);
        const y = R * Math.sin(t) * Math.sin(incl);
        const z = R * Math.sin(t) * Math.cos(incl);
        marker.position.set(x, y, z);
        halo.position.set(x, y, z);
        renderer.render(scene, camera);
      };
      animate();

      // Resize handler
      const handleResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      cleanupRef.current = () => {
        cancelAnimationFrame(animFrame);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        sphereGeo.dispose();
        wireGeo.dispose();
        wireMat.dispose();
        equatorGeo.dispose();
        equatorMat.dispose();
        meridianGeos.forEach((g) => g.dispose());
        meridianMats.forEach((m) => m.dispose());
        orbitGeo.dispose();
        orbitMat.dispose();
        markerGeo.dispose();
        markerMat.dispose();
        haloGeo.dispose();
        haloMat.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    });

    return () => {
      cancelledRef.current = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  const mission = MISSIONS[activeTab];

  return (
    <div className="py-12 md:py-16 px-4 md:px-16">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="tva-label mb-2">&gt;_ NEXTECH INDUSTRIES</div>
          <h2
            className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Control de Misión
          </h2>
          <div className="tva-label mb-1" style={{ color: "rgba(255,212,168,0.6)" }}>
            Seguimiento en Tiempo Real — NexTech Fleet
          </div>
          <div className="h-px w-16" style={{ background: "rgba(255,255,255,0.3)" }} />
        </motion.div>

        {/* Two-column layout: panel + globe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="flex flex-col md:grid md:grid-cols-[290px_1fr] gap-4"
        >
          {/* Telemetry panel */}
          <TVAPanel
            headerLeft="NEXTECH TRACKING"
            headerRight={
              <>
                <span
                  className="w-2 h-2 rounded-full orbit-pulse"
                  style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
                />
                <span
                  className="text-[9px] tracking-[0.12em] uppercase"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  LIVE
                </span>
              </>
            }
            statusLeft="NEXTECH FLEET"
            statusRight="[ULASB 2026]"
          >
            {/* Mission tabs */}
            <div
              className="flex border-b"
              style={{ borderColor: "rgba(196,82,42,0.3)" }}
            >
              {MISSIONS.map((m, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="flex-1 text-[8px] tracking-[0.08em] uppercase py-2 transition-all"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    background: activeTab === i ? "rgba(196,82,42,0.2)" : "transparent",
                    color: activeTab === i ? "#FFD4A8" : "rgba(255,212,168,0.35)",
                    borderBottom: activeTab === i ? "2px solid #C4522A" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {m.id}
                </button>
              ))}
            </div>

            {/* Telemetry rows */}
            <div className="p-4 space-y-3" style={{ fontFamily: "'Space Mono', monospace" }}>
              {[
                { label: "MISIÓN TIME", value: fmtMissionTime(telemetry.missionTime) },
                { label: "ALTITUD",     value: `${telemetry.altitude.toLocaleString()} KM` },
                { label: "VELOCIDAD",   value: `${telemetry.speed.toLocaleString()} KM/H` },
                { label: "VEHÍCULO",    value: mission.vehicle },
                { label: "CARGA ÚTIL",  value: mission.payload },
                { label: "ÓRBITA",      value: mission.orbit },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] tracking-[0.1em] uppercase flex-shrink-0"
                    style={{ color: "rgba(196,82,42,0.7)" }}
                  >
                    {row.label}
                  </span>
                  <span className="text-[10px] font-bold text-right" style={{ color: "#FFD4A8" }}>
                    {row.value}
                  </span>
                </div>
              ))}

              <div className="h-px" style={{ background: "rgba(196,82,42,0.25)" }} />

              {/* Status */}
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] tracking-[0.1em] uppercase"
                  style={{ color: "rgba(196,82,42,0.7)" }}
                >
                  ESTADO
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full orbit-pulse"
                    style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
                  />
                  <span className="text-[10px] font-bold" style={{ color: "#4ADE80" }}>
                    {mission.status}
                  </span>
                </div>
              </div>
            </div>
          </TVAPanel>

          {/* Globe canvas */}
          <div
            ref={mountRef}
            className="rounded-sm overflow-hidden"
            style={{
              height: 380,
              minHeight: 260,
              background:
                "radial-gradient(ellipse at 55% 45%, rgba(196,82,42,0.08) 0%, rgba(10,3,0,0.9) 65%, #0A0300 100%)",
              border: "1px solid rgba(196,82,42,0.2)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
