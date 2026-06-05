"use client";

import { useEffect, useRef } from "react";

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const SEPARATION = 130;
    const AMOUNT_X = 30;
    const AMOUNT_Y = 40;

    let count = 0;
    let animId: number;

    // Use canvas 2D — lighter than Three.js, same visual effect
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    containerRef.current.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const offsetX = canvas.width / 2 - (AMOUNT_X * SEPARATION) / 2;
      const baseY = canvas.height * 0.72;

      for (let ix = 0; ix < AMOUNT_X; ix++) {
        for (let iy = 0; iy < AMOUNT_Y; iy++) {
          const x = offsetX + ix * SEPARATION;
          const waveY =
            Math.sin((ix + count) * 0.28) * 38 +
            Math.sin((iy + count) * 0.45) * 28;
          const y = baseY - iy * 16 + waveY;

          if (y < -10 || y > canvas.height + 10) continue;

          const sizeFactor = 1 - iy / AMOUNT_Y;
          const r = Math.max(0.5, sizeFactor * 2.8);

          const alpha = 0.12 + sizeFactor * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 240, 220, ${alpha})`;
          ctx.fill();
        }
      }

      count += 0.08;
      animId = requestAnimationFrame(draw);
    };

    draw();
    rafRef.current = animId!;

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
