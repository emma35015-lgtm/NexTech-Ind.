"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SinDeficitChart, ConDeficitChart } from "./InventoryChart";
import { CountUp } from "./AnimatedCounter";

type ModelType = "sin-deficit" | "con-deficit";
type PhaseType = "idle" | "calculating" | "streaming" | "done" | "error";

interface FormValues {
  nombre: string;
  D: string;
  C1: string;
  C2: string;
  C3: string;
  C4: string;
}

interface EOQResultSin {
  type: "sin-deficit";
  Q: number;
  N: number;
  t: number;
  CT: number;
}

interface EOQResultCon {
  type: "con-deficit";
  Q: number;
  S: number;
  IM: number;
  N: number;
  t: number;
  CT: number;
}

type EOQResult = EOQResultSin | EOQResultCon;

function r2(n: number) { return Math.round(n * 100) / 100; }

function calcSinDeficit(D: number, C1: number, C2: number, C3: number): EOQResultSin {
  const Q = Math.sqrt((2 * C2 * D) / C3);
  const N = D / Q;
  const t = 365 / N;
  const CT = C1 * D + (C2 * D) / Q + (C3 * Q) / 2;
  return { type: "sin-deficit", Q: r2(Q), N: r2(N), t: r2(t), CT: r2(CT) };
}

function calcConDeficit(D: number, C1: number, C2: number, C3: number, C4: number): EOQResultCon {
  const Qbase = Math.sqrt((2 * C2 * D) / C3);
  const Q = Qbase * Math.sqrt((C3 + C4) / C4);
  const S = (C3 / (C3 + C4)) * Q;
  const IM = Q - S;
  const N = D / Q;
  const t = 365 / N;
  const CT = C1 * D + (C2 * D) / Q + (C3 * (Q - S) ** 2) / (2 * Q) + (C4 * S ** 2) / (2 * Q);
  return { type: "con-deficit", Q: r2(Q), S: r2(S), IM: r2(IM), N: r2(N), t: r2(t), CT: r2(CT) };
}

function buildSteps(form: FormValues, model: ModelType, result: EOQResult): string[] {
  const D = parseFloat(form.D);
  const C1 = parseFloat(form.C1);
  const C2 = parseFloat(form.C2);
  const C3 = parseFloat(form.C3);

  if (model === "sin-deficit") {
    const res = result as EOQResultSin;
    const inner = (2 * C2 * D) / C3;
    return [
      `> Producto: ${form.nombre}`,
      `> Modelo: SIN DÉFICIT (EOQ Clásico)`,
      ``,
      `> Datos ingresados:`,
      `  D  = ${D.toLocaleString()} uds/año`,
      `  C₁ = $${C1} / ud`,
      `  C₂ = $${C2} / pedido`,
      `  C₃ = $${C3} / ud·año`,
      ``,
      `> Cálculo Q óptimo:`,
      `  Q = √( 2 × C₂ × D / C₃ )`,
      `  Q = √( 2 × ${C2} × ${D.toLocaleString()} / ${C3} )`,
      `  Q = √${inner.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      `  Q = ${res.Q.toLocaleString()} uds/pedido  ✓`,
      ``,
      `> Número de pedidos:`,
      `  N = D / Q = ${D.toLocaleString()} / ${res.Q.toLocaleString()}`,
      `  N ≈ ${res.N.toFixed(2)} pedidos/año`,
      ``,
      `> Tiempo entre pedidos:`,
      `  t = 365 / N = 365 / ${res.N.toFixed(2)}`,
      `  t ≈ ${res.t.toFixed(1)} días`,
      ``,
      `> Costo Total Anual:`,
      `  CT = C₁·D + C₂·D/Q + C₃·Q/2`,
      `  CT = ${(C1 * D).toLocaleString()} + ${r2((C2 * D) / res.Q).toFixed(2)} + ${r2((C3 * res.Q) / 2).toFixed(2)}`,
      `  CT = $${res.CT.toLocaleString()}  ✓`,
      ``,
      `> ================================`,
      `> CÁLCULO COMPLETADO — INICIANDO IA`,
    ];
  } else {
    const C4 = parseFloat(form.C4);
    const res = result as EOQResultCon;
    const Qbase = Math.sqrt((2 * C2 * D) / C3);
    const factor = Math.sqrt((C3 + C4) / C4);
    return [
      `> Producto: ${form.nombre}`,
      `> Modelo: CON DÉFICIT (EOQ con Faltantes)`,
      ``,
      `> Datos ingresados:`,
      `  D  = ${D.toLocaleString()} uds/año`,
      `  C₁ = $${C1} / ud`,
      `  C₂ = $${C2} / pedido`,
      `  C₃ = $${C3} / ud·año`,
      `  C₄ = $${C4} / ud·año (déficit)`,
      ``,
      `> Q base (sin déficit):`,
      `  Qbase = √( 2 × ${C2} × ${D.toLocaleString()} / ${C3} )`,
      `  Qbase = ${Qbase.toFixed(2)}`,
      ``,
      `> Factor corrección por déficit:`,
      `  √((C₃+C₄)/C₄) = √(${C3 + C4}/${C4}) = ${factor.toFixed(4)}`,
      ``,
      `> Q óptimo con déficit:`,
      `  Q = ${Qbase.toFixed(2)} × ${factor.toFixed(4)}`,
      `  Q = ${res.Q.toLocaleString()} uds/pedido  ✓`,
      ``,
      `> Unidades agotadas por ciclo:`,
      `  S = (C₃/(C₃+C₄)) × Q`,
      `  S = (${C3}/${C3 + C4}) × ${res.Q.toLocaleString()}`,
      `  S = ${res.S.toLocaleString()} uds/ciclo`,
      ``,
      `> Inventario máximo:`,
      `  IM = Q − S = ${res.Q.toLocaleString()} − ${res.S.toLocaleString()}`,
      `  IM = ${res.IM.toLocaleString()} uds`,
      ``,
      `> Ciclos y tiempos:`,
      `  N ≈ ${res.N.toFixed(2)} pedidos/año`,
      `  t ≈ ${res.t.toFixed(1)} días entre pedidos`,
      ``,
      `> Costo Total Anual:`,
      `  CT = $${res.CT.toLocaleString()}  ✓`,
      ``,
      `> ================================`,
      `> CÁLCULO COMPLETADO — INICIANDO IA`,
    ];
  }
}

async function* streamGemini(apiKey: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: {
        parts: [{ text: "Eres el asesor de inventario de NexTech Industries. Interpreta los resultados EOQ en español. Máximo 120 palabras. Sin saludos. Incluye: Q óptimo, implicaciones de CT, y 1-2 recomendaciones ejecutivas." }],
      },
      generationConfig: { maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data);
        const text = ev.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
        if (text) yield text;
      } catch {
        // ignore malformed SSE chunks
      }
    }
  }
}

function MissMinutes({ small = false }: { small?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const C = {
      outline: "#3a1408",
      orange:  "#C4522A",
      lightO:  "#d4622a",
      highlight: "#e88050",
      marks:   "#3a1408",
      white:   "#FFF0DC",
      black:   "#0A0300",
      pink:    "#e06040",
      cheek:   "#d05028",
    };

    function fillCircle(cx: number, cy: number, r: number, color: string) {
      ctx!.fillStyle = color;
      const r2 = r * r, rc = Math.ceil(r);
      for (let y = -rc; y <= rc; y++)
        for (let x = -rc; x <= rc; x++)
          if (x * x + y * y <= r2) ctx!.fillRect((cx + x) | 0, (cy + y) | 0, 1, 1);
    }

    function ringCircle(cx: number, cy: number, rOut: number, rIn: number, color: string) {
      ctx!.fillStyle = color;
      const ro2 = rOut * rOut, ri2 = rIn * rIn, rc = Math.ceil(rOut);
      for (let y = -rc; y <= rc; y++)
        for (let x = -rc; x <= rc; x++) {
          const d2 = x * x + y * y;
          if (d2 <= ro2 && d2 > ri2) ctx!.fillRect((cx + x) | 0, (cy + y) | 0, 1, 1);
        }
    }

    function drawLine(x0: number, y0: number, x1: number, y1: number, color: string) {
      ctx!.fillStyle = color;
      x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        ctx!.fillRect(x0, y0, 1, 1);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    }

    const c = canvas;
    function draw() {
      ctx!.clearRect(0, 0, c.width, c.height);
      const frame = frameRef.current;

      const bounce    = Math.round(Math.sin(frame * 0.08) * 1.2);
      const handAngle = (frame * 0.045) % (Math.PI * 2);
      const hourAngle = (frame * 0.006) % (Math.PI * 2);
      const isBlinking = (frame % 140) < 5;
      const armWaveY  = Math.round(Math.sin(frame * 0.13) * 3);

      const cx = 32, cy = 26 + bounce, r = 18;

      // Shadow
      ctx!.fillStyle = "rgba(50,20,5,0.18)";
      for (let dx = -12; dx <= 12; dx++)
        for (let dy = -2; dy <= 2; dy++)
          if ((dx * dx) / 144 + (dy * dy) / 4 <= 1) ctx!.fillRect(cx + dx, 54 + dy, 1, 1);

      // Right arm
      drawLine(cx + r - 1, cy + 2, cx + r + 4, cy + 6, C.outline);
      fillCircle(cx + r + 4, cy + 6, 2, C.lightO);
      ringCircle(cx + r + 4, cy + 6, 2.5, 1.5, C.outline);

      // Left arm (waving)
      const lax = cx - r + 1, lay = cy + armWaveY;
      drawLine(lax, lay, lax - 5, lay - 7, C.outline);
      fillCircle(lax - 5, lay - 7, 2, C.lightO);
      ringCircle(lax - 5, lay - 7, 2.5, 1.5, C.outline);

      // Body
      fillCircle(cx, cy, r + 1, C.outline);
      fillCircle(cx, cy, r, C.orange);

      // Highlight rim
      for (let y = -r + 1; y < 2; y++)
        for (let x = -r + 1; x < 2; x++) {
          const d2 = x * x + y * y;
          if (d2 <= (r - 1) * (r - 1) && d2 > (r - 4) * (r - 4) && x < y + 2) {
            ctx!.fillStyle = C.lightO;
            ctx!.fillRect(cx + x, cy + y, 1, 1);
          }
        }
      for (let a = Math.PI * 1.15; a < Math.PI * 1.55; a += 0.08) {
        ctx!.fillStyle = C.highlight;
        ctx!.fillRect(cx + Math.round(Math.cos(a) * (r - 2)), cy + Math.round(Math.sin(a) * (r - 2)), 1, 1);
      }

      // Clock marks
      ctx!.fillStyle = C.marks;
      ctx!.fillRect(cx - 1, cy - r + 2, 2, 3);
      ctx!.fillRect(cx - 1, cy + r - 4, 2, 3);
      ctx!.fillRect(cx + r - 4, cy - 1, 3, 2);
      ctx!.fillRect(cx - r + 2, cy - 1, 3, 2);
      for (let i = 0; i < 12; i++) {
        if (i % 3 === 0) continue;
        const a = (i * Math.PI * 2) / 12 - Math.PI / 2;
        ctx!.fillRect(Math.round(cx + Math.cos(a) * (r - 3)), Math.round(cy + Math.sin(a) * (r - 3)), 1, 1);
      }

      // Hands
      drawLine(cx, cy, cx + Math.round(Math.cos(handAngle - Math.PI / 2) * 7), cy + Math.round(Math.sin(handAngle - Math.PI / 2) * 7), C.marks);
      drawLine(cx, cy, cx + Math.round(Math.cos(hourAngle - Math.PI / 2) * 4), cy + Math.round(Math.sin(hourAngle - Math.PI / 2) * 4), C.marks);

      // Eyes
      const eyeY = cy - 3, eyeXL = cx - 6, eyeXR = cx + 6;
      fillCircle(eyeXL, eyeY, 3, C.white);
      fillCircle(eyeXR, eyeY, 3, C.white);
      ringCircle(eyeXL, eyeY, 3.5, 2.5, C.outline);
      ringCircle(eyeXR, eyeY, 3.5, 2.5, C.outline);
      if (isBlinking) {
        ctx!.fillStyle = C.outline;
        ctx!.fillRect(eyeXL - 3, eyeY, 6, 1);
        ctx!.fillRect(eyeXR - 3, eyeY, 6, 1);
      } else {
        fillCircle(eyeXL, eyeY + 1, 1.4, C.black);
        fillCircle(eyeXR, eyeY + 1, 1.4, C.black);
        ctx!.fillStyle = C.white;
        ctx!.fillRect(eyeXL - 1, eyeY, 1, 1);
        ctx!.fillRect(eyeXR - 1, eyeY, 1, 1);
      }

      // Eyelashes
      ctx!.fillStyle = C.outline;
      ctx!.fillRect(eyeXL - 4, eyeY - 3, 1, 1);
      ctx!.fillRect(eyeXL - 3, eyeY - 4, 1, 1);
      ctx!.fillRect(eyeXR + 3, eyeY - 3, 1, 1);
      ctx!.fillRect(eyeXR + 2, eyeY - 4, 1, 1);

      // Cheeks
      ctx!.fillStyle = C.cheek;
      ctx!.fillRect(cx - 10, cy + 2, 2, 2);
      ctx!.fillRect(cx + 9,  cy + 2, 2, 2);

      // Mouth
      ctx!.fillStyle = C.outline;
      ctx!.fillRect(cx - 3, cy + 4, 1, 1);
      ctx!.fillRect(cx + 2, cy + 4, 1, 1);
      ctx!.fillRect(cx - 2, cy + 5, 5, 1);
      ctx!.fillStyle = C.pink;
      ctx!.fillRect(cx - 1, cy + 6, 3, 1);

      frameRef.current++;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const cssW = small ? 64 : 128;
  const cssH = small ? 80 : 160;

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={80}
      style={{ imageRendering: "pixelated", width: cssW, height: cssH, display: "block" }}
    />
  );
}

function WireframeCube() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <rect x="18" y="30" width="32" height="32" stroke="#C4522A" strokeOpacity="0.35" strokeWidth="1" />
      <polygon points="18,30 33,14 65,14 50,30" stroke="#C4522A" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      <polygon points="50,30 65,14 65,46 50,62" stroke="#C4522A" strokeOpacity="0.35" strokeWidth="1" fill="none" />
      <line x1="18" y1="30" x2="33" y2="14" stroke="#C4522A" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="50" y1="30" x2="65" y2="14" stroke="#C4522A" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="50" y1="62" x2="65" y2="46" stroke="#C4522A" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  );
}

function generateReport(form: FormValues, model: ModelType, result: EOQResult, aiText: string) {
  const date = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  const modelName = model === "sin-deficit" ? "Sin Déficit (EOQ Clásico)" : "Con Déficit (EOQ con Faltantes)";
  const div = "=".repeat(50);

  const params = model === "sin-deficit"
    ? [
        `D  — Demanda anual:     ${parseFloat(form.D).toLocaleString()} uds/año`,
        `C1 — Costo unitario:   $${form.C1} / ud`,
        `C2 — Costo de ordenar: $${form.C2} / pedido`,
        `C3 — Costo almacenar:  $${form.C3} / ud·año`,
      ].join("\n")
    : [
        `D  — Demanda anual:     ${parseFloat(form.D).toLocaleString()} uds/año`,
        `C1 — Costo unitario:   $${form.C1} / ud`,
        `C2 — Costo de ordenar: $${form.C2} / pedido`,
        `C3 — Costo almacenar:  $${form.C3} / ud·año`,
        `C4 — Costo déficit:    $${form.C4} / ud·año`,
      ].join("\n");

  const results = result.type === "sin-deficit"
    ? [
        `Cantidad optima Q:      ${Math.round(result.Q).toLocaleString()} uds/pedido`,
        `Pedidos por año N:      ${Math.round(result.N)} pedidos`,
        `Tiempo entre pedidos:   ${Math.round(result.t)} días`,
        `Costo Total Anual CT:   $${result.CT.toLocaleString()}`,
      ].join("\n")
    : [
        `Cantidad optima Q:      ${Math.round(result.Q).toLocaleString()} uds/pedido`,
        `Unidades agotadas S:    ${Math.round((result as EOQResultCon).S).toLocaleString()} uds/ciclo`,
        `Inventario maximo IM:   ${Math.round((result as EOQResultCon).IM).toLocaleString()} uds`,
        `Pedidos por año N:      ${Math.round(result.N)} pedidos`,
        `Tiempo entre pedidos:   ${Math.round(result.t)} días`,
        `Costo Total Anual CT:   $${result.CT.toLocaleString()}`,
      ].join("\n");

  const body = [
    div,
    "NEXTECH INDUSTRIES",
    "Sistema de Analisis de Inventario EOQ",
    "Motor EOQ v2.1 + Gemini 2.5 Flash",
    div,
    "",
    "Estimado/a,",
    "",
    "El equipo de NexTech Industries le hace llegar el reporte de",
    "optimizacion de inventario generado por nuestro sistema de",
    "analisis cuantitativo (Motor EOQ + Inteligencia Artificial).",
    "",
    div,
    "DATOS DEL ANALISIS",
    div,
    "",
    `Producto/Insumo:  ${form.nombre}`,
    `Modelo aplicado:  ${modelName}`,
    `Fecha:            ${date}`,
    "",
    "PARAMETROS DE ENTRADA:",
    params,
    "",
    "RESULTADOS OPTIMOS:",
    results,
    "",
    div,
    "ANALISIS NEXTECH AI (Gemini 2.5 Flash)",
    div,
    "",
    aiText,
    "",
    div,
    "Atentamente,",
    "Equipo NexTech Industries",
    "Ingenieria Industrial — Metodos Cuantitativos",
    "Universidad La Salle Bajio | 2026",
    "",
    "Este reporte fue generado automaticamente por NexTech AI Advisor.",
    "Los resultados se basan en el Modelo EOQ aplicado a los",
    "parametros ingresados. Verificar con el docente antes de tomar",
    "decisiones operativas basadas en este reporte.",
    div,
  ].join("\n");

  return {
    subject: `NexTech Industries — Reporte EOQ: ${form.nombre}`,
    body,
  };
}

const EXAMPLE: FormValues = {
  nombre: "Aleaciones de Titanio",
  D: "2400",
  C1: "850",
  C2: "1500",
  C3: "48",
  C4: "",
};

const EMPTY: FormValues = { nombre: "", D: "", C1: "", C2: "", C3: "", C4: "" };

function fmtTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `T+${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function AIAdvisor() {
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyConnected, setKeyConnected] = useState(false);
  const [model, setModel] = useState<ModelType>("sin-deficit");
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [phase, setPhase] = useState<PhaseType>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [stepsLines, setStepsLines] = useState<string[]>([]);
  const [visibleLines, setVisibleLines] = useState(0);
  const [result, setResult] = useState<EOQResult | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [emailRecipient, setEmailRecipient] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("nt_api_key");
    if (saved) { setApiKey(saved); setKeyInput(saved); setKeyConnected(true); }
  }, []);

  useEffect(() => {
    if (phase === "calculating" || phase === "streaming") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function connectKey() {
    const k = keyInput.trim();
    if (k.length < 10) {
      setErrorMsg("ERR: Clave inválida — debe comenzar con AIza...");
      return;
    }
    setApiKey(k);
    sessionStorage.setItem("nt_api_key", k);
    setKeyConnected(true);
    setErrorMsg("");
  }

  function loadExample() {
    setModel("sin-deficit");
    setForm({ ...EXAMPLE });
  }

  function setField(key: keyof FormValues, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleExecute() {
    setErrorMsg("");
    const D = parseFloat(form.D);
    const C1 = parseFloat(form.C1);
    const C2 = parseFloat(form.C2);
    const C3 = parseFloat(form.C3);
    const C4 = parseFloat(form.C4);

    if (!form.nombre || isNaN(D) || isNaN(C1) || isNaN(C2) || isNaN(C3)) {
      setErrorMsg("ERR: Completa todos los campos requeridos");
      return;
    }
    if (model === "con-deficit" && (isNaN(C4) || C4 <= 0)) {
      setErrorMsg("ERR: C₄ (costo déficit) es requerido y debe ser positivo");
      return;
    }
    if (D <= 0 || C1 <= 0 || C2 <= 0 || C3 <= 0) {
      setErrorMsg("ERR: Todos los valores deben ser positivos");
      return;
    }

    setPhase("calculating");
    setResult(null);
    setAiText("");
    setAiDone(false);
    setStepsLines([]);
    setVisibleLines(0);
    setElapsed(0);

    const res = model === "sin-deficit"
      ? calcSinDeficit(D, C1, C2, C3)
      : calcConDeficit(D, C1, C2, C3, C4);

    const steps = buildSteps(form, model, res);
    setStepsLines(steps);

    for (let i = 0; i <= steps.length; i++) {
      await new Promise((r) => setTimeout(r, 55));
      setVisibleLines(i);
    }

    setResult(res);
    setPhase("streaming");
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    const prompt = model === "sin-deficit"
      ? `Producto: ${form.nombre}. Modelo EOQ Sin Déficit. Q=${(res as EOQResultSin).Q}, N=${(res as EOQResultSin).N.toFixed(1)} pedidos/año, t=${(res as EOQResultSin).t.toFixed(1)} días, CT=$${(res as EOQResultSin).CT.toLocaleString()}. D=${D}, C₁=${C1}, C₂=${C2}, C₃=${C3}.`
      : `Producto: ${form.nombre}. Modelo EOQ Con Déficit. Q=${(res as EOQResultCon).Q}, S=${(res as EOQResultCon).S} uds agotadas/ciclo, IM=${(res as EOQResultCon).IM}, N=${(res as EOQResultCon).N.toFixed(1)} pedidos/año, t=${(res as EOQResultCon).t.toFixed(1)} días, CT=$${(res as EOQResultCon).CT.toLocaleString()}. D=${D}, C₁=${C1}, C₂=${C2}, C₃=${C3}, C₄=${C4}.`;

    try {
      for await (const chunk of streamGemini(apiKey, prompt)) {
        setAiText((t) => t + chunk);
      }
      setAiDone(true);
      setPhase("done");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Error de conexión";
      let msg = `ERR: ${raw}`;
      if (raw.includes("429")) {
        const delayMatch = raw.match(/"retryDelay":\s*"(\d+)s"/);
        const secs = delayMatch ? delayMatch[1] : "30";
        msg = `ERR 429: Límite de solicitudes excedido. Espera ${secs}s e intenta de nuevo.`;
      } else if (raw.includes("403")) msg = "ERR 403: Clave API inválida. Verifica tu clave en aistudio.google.com.";
      else if (raw.includes("404")) msg = "ERR 404: Modelo no disponible en tu proyecto. Intenta con otra clave.";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  const canRun = keyConnected && phase !== "calculating" && phase !== "streaming";
  const showOutput = phase === "calculating" || phase === "streaming" || phase === "done" || phase === "error";

  return (
    <section
      id="ai-demo"
      className="py-16 md:py-24 px-4 md:px-16"
      style={{ background: "rgba(0,0,0,0.15)" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="tva-label mb-3"
          >
            &gt;_ NEXTECH AI ADVISOR
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold uppercase tracking-[0.08em] mb-1"
            style={{ color: "#FFF0DC", fontFamily: "'Bebas Neue', sans-serif" }}
          >
            Análisis Inteligente de Inventario
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="tva-label mb-4"
            style={{ color: "rgba(255,212,168,0.6)" }}
          >
            Motor EOQ + Gemini AI
          </motion.div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="h-px w-16 origin-left"
            style={{ background: "rgba(255,240,220,0.4)" }}
          />
        </div>

        {/* TVA Auth + Guide Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="relative rounded-sm overflow-hidden scanlines"
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
              className="absolute text-sm pointer-events-none select-none"
              style={{
                color: "rgba(196,82,42,0.5)",
                top: i < 2 ? 6 : undefined,
                bottom: i >= 2 ? 6 : undefined,
                left: i % 2 === 0 ? 8 : undefined,
                right: i % 2 === 1 ? 8 : undefined,
              }}
            >
              {ch}
            </span>
          ))}

          {/* Header stripe */}
          <div
            className="relative z-10 flex items-center justify-between px-4 h-9"
            style={{ background: "#C4522A" }}
          >
            <span
              className="text-[10px] tracking-[0.18em] uppercase font-bold hidden md:block"
              style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
            >
              ████ NEXTECH AUTH TERMINAL ████
            </span>
            <span
              className="text-[10px] tracking-[0.18em] uppercase font-bold md:hidden"
              style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
            >
              NEXTECH AUTH
            </span>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: keyConnected ? "#4ADE80" : "rgba(0,0,0,0.35)",
                  boxShadow: keyConnected ? "0 0 6px #4ADE80" : "none",
                  border: keyConnected ? "none" : "1px solid rgba(0,0,0,0.5)",
                }}
              />
              <span
                className="text-[9px] tracking-[0.15em] uppercase"
                style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
              >
                {keyConnected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div
            className="relative z-10 p-4 md:p-6 space-y-5"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {/* Miss Minutes + System status */}
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <MissMinutes small />
                <div
                  className="text-[8px] tracking-[0.18em] blink"
                  style={{ color: "rgba(196,82,42,0.7)", fontFamily: "'Space Mono', monospace" }}
                >
                  MISS MINUTES
                </div>
              </div>
              <div className="space-y-1.5 text-xs flex-1 pt-1">
                <div style={{ color: "rgba(255,212,168,0.45)" }}>
                  &gt;_ SISTEMA &nbsp;&nbsp; NexTech AI Advisor v2.1
                </div>
                <div style={{ color: "rgba(255,212,168,0.45)" }}>
                  &gt;_ MOTOR &nbsp;&nbsp;&nbsp; EOQ + Gemini 2.5 Flash
                </div>
                <div style={{ color: keyConnected ? "#4ADE80" : "#FFD4A8" }}>
                  &gt;_ ESTADO &nbsp;&nbsp;{" "}
                  {keyConnected
                    ? "● AUTENTICADO ✓"
                    : <><span className="blink">○</span>{" ESPERANDO CLAVE..."}</>}
                </div>
              </div>
            </div>

            <div className="h-px" style={{ background: "rgba(196,82,42,0.3)" }} />

            {/* Auth section */}
            <AnimatePresence mode="wait">
              {!keyConnected ? (
                <motion.div
                  key="auth-input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-1 text-xs">
                    <div style={{ color: "#FFD4A8" }}>&gt;_ INGRESA CLAVE API GEMINI:</div>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#FFD4A8", fontSize: "0.7rem", textDecoration: "underline", textUnderlineOffset: "3px" }}
                    >
                      aistudio.google.com → Get API key ↗
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0" style={{ color: "#C4522A" }}>&gt;&gt;</span>
                    <input
                      type="password"
                      className="terminal-input flex-1"
                      placeholder="AIzaSy..."
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && connectKey()}
                    />
                    <button
                      onClick={connectKey}
                      className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 whitespace-nowrap font-bold transition-all"
                      style={{ background: "#C4522A", color: "#0A0300", border: "1px solid #C4522A", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFD4A8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C4522A"; }}
                    >
                      CONECTAR
                    </button>
                  </div>
                  {errorMsg && (
                    <div className="text-xs" style={{ color: "#FF7050" }}>{errorMsg}</div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="auth-ok"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 text-xs"
                >
                  <div style={{ color: "#4ADE80" }}>&gt;&gt; ACCESO CONCEDIDO — SESIÓN ACTIVA</div>
                  <button
                    onClick={() => { setKeyConnected(false); setApiKey(""); sessionStorage.removeItem("nt_api_key"); }}
                    style={{ color: "rgba(255,255,255,0.3)", cursor: "pointer", background: "none", border: "none", fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}
                  >
                    [CERRAR SESIÓN]
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-px" style={{ background: "rgba(196,82,42,0.3)" }} />

            {/* Guide */}
            <div className="space-y-3">
              <div className="text-xs" style={{ color: "#FFD4A8" }}>&gt;_ GUÍA DE OPERACIÓN:</div>
              <div className="space-y-2">
                {[
                  "SELECCIONA el modelo: SIN o CON DÉFICIT",
                  "INGRESA los parámetros de tu producto/insumo",
                  'PRESIONA "EJECUTAR ANÁLISIS"',
                  "OBSERVA el cálculo EOQ paso a paso en la terminal",
                  "RECIBE el análisis ejecutivo de NexTech AI",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span className="flex-shrink-0 font-bold" style={{ color: "#C4522A" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>{step}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={loadExample}
                className="w-full text-[10px] tracking-[0.18em] uppercase py-2.5 transition-all"
                style={{
                  border: "1px solid rgba(196,82,42,0.6)",
                  color: "#FFD4A8",
                  background: "rgba(196,82,42,0.12)",
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,82,42,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,82,42,0.12)"; }}
              >
                [ CARGAR EJEMPLO — TITANIO P1 ]
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div
            className="relative z-10 flex items-center justify-between px-4 py-2"
            style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.4)" }}
          >
            <span
              className="text-[9px] tracking-[0.12em] uppercase hidden md:block"
              style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}
            >
              NEXTECH INDUSTRIES — AUTH SYSTEM // ULASB 2026
            </span>
            <span
              className="text-[9px] tracking-[0.1em]"
              style={{
                color: keyConnected ? "rgba(74,222,128,0.7)" : "rgba(196,82,42,0.6)",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              [{keyConnected ? "SESIÓN ACTIVA" : "SIN AUTENTICAR"}]
            </span>
          </div>
        </motion.div>

        {/* Input Form — TVA Terminal */}
        <AnimatePresence>
          {keyConnected && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative rounded-sm overflow-hidden scanlines"
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
                  className="absolute text-sm pointer-events-none select-none"
                  style={{
                    color: "rgba(196,82,42,0.5)",
                    top: i < 2 ? 6 : undefined,
                    bottom: i >= 2 ? 6 : undefined,
                    left: i % 2 === 0 ? 8 : undefined,
                    right: i % 2 === 1 ? 8 : undefined,
                  }}
                >
                  {ch}
                </span>
              ))}

              {/* Header stripe */}
              <div
                className="relative z-10 flex items-center justify-between px-4 h-9"
                style={{ background: "#C4522A" }}
              >
                <span
                  className="text-[10px] tracking-[0.18em] uppercase font-bold hidden md:block"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  ████ NEXTECH — PARÁMETROS DE ENTRADA ████
                </span>
                <span
                  className="text-[10px] tracking-[0.18em] uppercase font-bold md:hidden"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  PARÁMETROS
                </span>
                <span
                  className="text-[9px] tracking-[0.15em] uppercase"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  [MOTOR EOQ v2.1]
                </span>
              </div>

              {/* Body */}
              <div
                className="relative z-10 p-4 md:p-6 space-y-6"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {/* Model selector */}
                <div className="space-y-2">
                  <div className="text-xs" style={{ color: "#FFD4A8" }}>&gt;_ MODELO DE INVENTARIO:</div>
                  <div className="flex gap-2 flex-wrap">
                    {(["sin-deficit", "con-deficit"] as ModelType[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setModel(m)}
                        className="text-[11px] tracking-[0.12em] uppercase px-4 py-2 font-bold transition-all"
                        style={{
                          background: model === m ? "#C4522A" : "rgba(196,82,42,0.1)",
                          color: model === m ? "#0A0300" : "rgba(255,212,168,0.5)",
                          border: `1px solid ${model === m ? "#C4522A" : "rgba(196,82,42,0.3)"}`,
                          cursor: "pointer",
                        }}
                      >
                        {model === m ? "▶ " : "  "}{m === "sin-deficit" ? "Sin Déficit" : "Con Déficit"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px" style={{ background: "rgba(196,82,42,0.25)" }} />

                {/* Nombre field — full width */}
                <div className="space-y-1">
                  <div className="text-xs" style={{ color: "#FFD4A8" }}>&gt;_ INSUMO / PRODUCTO:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0" style={{ color: "#C4522A" }}>&gt;&gt;</span>
                    <input
                      className="terminal-input flex-1"
                      placeholder="ej. Aleaciones de Titanio"
                      value={form.nombre}
                      onChange={(e) => setField("nombre", e.target.value)}
                    />
                  </div>
                </div>

                <div className="h-px" style={{ background: "rgba(196,82,42,0.25)" }} />

                {/* Numeric fields */}
                <div className="space-y-2">
                  <div className="text-xs" style={{ color: "#FFD4A8" }}>&gt;_ PARÁMETROS ECONÓMICOS:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      { key: "D",  label: "D  — Demanda Anual",        unit: "uds/año",    placeholder: "2400",  type: "number" },
                      { key: "C1", label: "C₁ — Costo Unitario",       unit: "$/ud",       placeholder: "850",   type: "number" },
                      { key: "C2", label: "C₂ — Costo de Ordenar",     unit: "$/pedido",   placeholder: "1500",  type: "number" },
                      { key: "C3", label: "C₃ — Costo de Almacenar",   unit: "$/ud·año",   placeholder: "48",    type: "number" },
                    ].map(({ key, label, unit, placeholder, type }) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] tracking-[0.1em]" style={{ color: "rgba(255,212,168,0.5)" }}>{label}</span>
                          <span className="text-[9px]" style={{ color: "rgba(196,82,42,0.6)" }}>{unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs flex-shrink-0" style={{ color: "#C4522A" }}>&gt;&gt;</span>
                          <input
                            type={type}
                            className="terminal-input flex-1"
                            placeholder={placeholder}
                            value={form[key as keyof FormValues]}
                            onChange={(e) => setField(key as keyof FormValues, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    <AnimatePresence>
                      {model === "con-deficit" && (
                        <motion.div
                          key="c4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}
                          className="space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] tracking-[0.1em]" style={{ color: "rgba(255,212,168,0.5)" }}>C₄ — Costo de Déficit</span>
                            <span className="text-[9px]" style={{ color: "rgba(196,82,42,0.6)" }}>$/ud·año</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs flex-shrink-0" style={{ color: "#C4522A" }}>&gt;&gt;</span>
                            <input
                              type="number"
                              className="terminal-input flex-1"
                              placeholder="80"
                              value={form.C4}
                              onChange={(e) => setField("C4", e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {errorMsg && phase !== "streaming" && phase !== "calculating" && (
                  <div className="text-xs" style={{ color: "#FF7050" }}>{errorMsg}</div>
                )}

                {/* Execute button */}
                <button
                  onClick={handleExecute}
                  disabled={!canRun}
                  className="w-full py-3 text-sm tracking-[0.2em] uppercase font-bold transition-all"
                  style={{
                    background: canRun ? "#C4522A" : "rgba(196,82,42,0.12)",
                    color: canRun ? "#0A0300" : "rgba(255,255,255,0.25)",
                    border: `1px solid ${canRun ? "#C4522A" : "rgba(196,82,42,0.2)"}`,
                    fontFamily: "'Space Mono', monospace",
                    cursor: canRun ? "pointer" : "not-allowed",
                  }}
                  onMouseEnter={(e) => { if (canRun) (e.currentTarget as HTMLButtonElement).style.background = "#FFD4A8"; }}
                  onMouseLeave={(e) => { if (canRun) (e.currentTarget as HTMLButtonElement).style.background = "#C4522A"; }}
                >
                  {phase === "calculating" || phase === "streaming" ? "[ ANALIZANDO... ]" : ">> EJECUTAR ANÁLISIS"}
                </button>
              </div>

              {/* Status bar */}
              <div
                className="relative z-10 flex items-center justify-between px-4 py-2"
                style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.4)" }}
              >
                <span
                  className="text-[9px] tracking-[0.12em] uppercase hidden md:block"
                  style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}
                >
                  NEXTECH INDUSTRIES — INPUT SYSTEM // ULASB 2026
                </span>
                <span
                  className="text-[9px] tracking-[0.1em]"
                  style={{ color: canRun ? "rgba(74,222,128,0.7)" : "rgba(196,82,42,0.5)", fontFamily: "'Space Mono', monospace" }}
                >
                  [{canRun ? "LISTO" : "PROCESANDO"}]
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TVA Output Panel */}
        <AnimatePresence>
          {showOutput && (
            <motion.div
              ref={outputRef}
              key="output"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative rounded-sm overflow-hidden scanlines"
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
                  className="absolute text-sm pointer-events-none select-none"
                  style={{
                    color: "rgba(196,82,42,0.5)",
                    top: i < 2 ? 6 : undefined,
                    bottom: i >= 2 ? 6 : undefined,
                    left: i % 2 === 0 ? 8 : undefined,
                    right: i % 2 === 1 ? 8 : undefined,
                  }}
                >
                  {ch}
                </span>
              ))}

              {/* Header stripe */}
              <div
                className="relative z-10 flex items-center justify-between px-4 h-9 flex-wrap gap-1"
                style={{ background: "#C4522A" }}
              >
                <span
                  className="text-[10px] tracking-[0.18em] uppercase font-bold hidden md:block"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  ████ NEXTECH — SISTEMA DE INVENTARIO ████
                </span>
                <span
                  className="text-[10px] tracking-[0.18em] uppercase font-bold md:hidden"
                  style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                >
                  NEXTECH — INVENTARIO
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] tracking-[0.12em]"
                    style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                  >
                    {fmtTime(elapsed)}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.12em] uppercase"
                    style={{ color: "#0A0300", fontFamily: "'Space Mono', monospace" }}
                  >
                    [{phase === "done" ? "COMPLETO" : phase === "error" ? "ERROR" : "EN CURSO"}]
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 p-4 md:p-6 space-y-6">

                {/* Steps + cube */}
                <div className="flex gap-5">
                  <div className="hidden md:block flex-shrink-0 mt-1 opacity-50">
                    <WireframeCube />
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div
                      className="text-xs leading-relaxed"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {stepsLines.slice(0, visibleLines).map((line, i) => (
                        <div
                          key={i}
                          style={{
                            color: line.startsWith(">") ? "#FFD4A8" : "rgba(255,212,168,0.65)",
                            background:
                              line.includes("COMPLETADO") || line.includes("====")
                                ? "rgba(196,82,42,0.12)"
                                : "transparent",
                            padding: "0 4px",
                            borderLeft: line.includes("COMPLETADO")
                              ? "2px solid rgba(196,82,42,0.6)"
                              : "2px solid transparent",
                          }}
                        >
                          {line || " "}
                        </div>
                      ))}
                      {visibleLines < stepsLines.length && (
                        <span className="terminal-cursor">▌</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pixel robot + "processing" */}
                <AnimatePresence>
                  {(phase === "calculating" || (phase === "streaming" && aiText.length === 0)) && (
                    <motion.div
                      key="robot"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                      className="flex flex-col items-center gap-3 py-4"
                    >
                      <MissMinutes />
                      <div
                        className="text-[10px] tracking-[0.2em] uppercase blink"
                        style={{ color: "#C4522A", fontFamily: "'Space Mono', monospace" }}
                      >
                        NEXTECH AI — PROCESANDO...
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* AI analysis text */}
                <AnimatePresence>
                  {aiText.length > 0 && (
                    <motion.div
                      key="ai-response"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="h-px" style={{ background: "rgba(196,82,42,0.35)" }} />
                      <div className="tva-label" style={{ color: "#C4522A" }}>
                        &gt;_ NEXTECH AI — ANÁLISIS:
                      </div>
                      <p
                        style={{
                          color: "rgba(255,220,180,0.95)",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.78rem",
                          lineHeight: 1.85,
                        }}
                      >
                        {aiText}
                        {!aiDone && <span className="terminal-cursor">▌</span>}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error message */}
                {phase === "error" && errorMsg && (
                  <div
                    className="text-xs p-3 rounded-sm"
                    style={{
                      color: "#FF7050",
                      fontFamily: "'Space Mono', monospace",
                      background: "rgba(255,80,50,0.08)",
                      border: "1px solid rgba(255,80,50,0.2)",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                {/* Chart + results table */}
                <AnimatePresence>
                  {result && phase === "done" && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      <div>
                        {result.type === "sin-deficit" ? (
                          <SinDeficitChart
                            Q={result.Q}
                            t={result.t}
                            N={result.N}
                            unit="uds"
                            label={`Inventario — ${form.nombre}`}
                          />
                        ) : (
                          <ConDeficitChart
                            Q={result.Q}
                            S={result.S}
                            t={result.t}
                            N={result.N}
                            unit="uds"
                            label={`Inventario — ${form.nombre}`}
                          />
                        )}
                      </div>

                      <div
                        className="rounded-sm overflow-hidden"
                        style={{ border: "1px solid rgba(196,82,42,0.3)" }}
                      >
                        <div
                          className="px-4 py-2 text-[10px] tracking-[0.15em] uppercase flex justify-between"
                          style={{
                            background: "rgba(196,82,42,0.2)",
                            borderBottom: "1px solid rgba(196,82,42,0.3)",
                            color: "rgba(255,212,168,0.8)",
                            fontFamily: "'Space Mono', monospace",
                          }}
                        >
                          <span>Indicador</span>
                          <span>Valor Óptimo</span>
                        </div>
                        {(result.type === "sin-deficit"
                          ? [
                              { label: "Q Óptimo",       val: Math.round(result.Q),  prefix: "",  suffix: " uds" },
                              { label: "N Pedidos/año",   val: Math.round(result.N),  prefix: "",  suffix: " ped" },
                              { label: "t entre pedidos", val: Math.round(result.t),  prefix: "",  suffix: " días" },
                              { label: "CT Anual",        val: Math.round(result.CT), prefix: "$", suffix: "" },
                            ]
                          : [
                              { label: "Q Óptimo",         val: Math.round(result.Q),   prefix: "",  suffix: " uds" },
                              { label: "S Agotadas/ciclo", val: Math.round(result.S),   prefix: "",  suffix: " uds" },
                              { label: "IM Máximo",        val: Math.round(result.IM),  prefix: "",  suffix: " uds" },
                              { label: "N Pedidos/año",    val: Math.round(result.N),   prefix: "",  suffix: " ped" },
                              { label: "t entre pedidos",  val: Math.round(result.t),   prefix: "",  suffix: " días" },
                              { label: "CT Anual",         val: Math.round(result.CT),  prefix: "$", suffix: "" },
                            ]
                        ).map((row, i, arr) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-2.5 text-xs"
                            style={{
                              background: i % 2 === 0 ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)",
                              borderBottom: i < arr.length - 1 ? "1px solid rgba(196,82,42,0.1)" : "none",
                            }}
                          >
                            <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Space Mono', monospace" }}>
                              {row.label}
                            </span>
                            <span className="font-bold" style={{ color: "#FFD4A8" }}>
                              <CountUp
                                to={row.val}
                                prefix={row.prefix}
                                suffix={row.suffix}
                                style={{ color: "#FFD4A8" }}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email report */}
              <AnimatePresence>
                {phase === "done" && aiDone && result && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="px-4 md:px-6 pb-5 space-y-3"
                  >
                    <div className="h-px" style={{ background: "rgba(196,82,42,0.35)" }} />
                    <div className="tva-label" style={{ color: "#C4522A" }}>
                      &gt;_ EXPORTAR REPORTE:
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(255,212,168,0.55)", fontFamily: "'Space Mono', monospace", fontSize: "0.7rem" }}
                    >
                      Se generará un reporte completo con parámetros, resultados y análisis AI,
                      con un mensaje del equipo NexTech Industries.
                    </p>
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm flex-shrink-0" style={{ color: "#C4522A" }}>&gt;&gt;</span>
                        <input
                          type="email"
                          className="terminal-input flex-1"
                          placeholder="destinatario@correo.com"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const { subject, body } = generateReport(form, model, result, aiText);
                          const mailto = `mailto:${emailRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          window.open(mailto, "_self");
                        }}
                        className="text-[10px] tracking-[0.18em] uppercase px-5 py-2.5 font-bold transition-all whitespace-nowrap"
                        style={{
                          background: "#C4522A",
                          color: "#0A0300",
                          border: "1px solid #C4522A",
                          cursor: "pointer",
                          fontFamily: "'Space Mono', monospace",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFD4A8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C4522A"; }}
                      >
                        [ ENVIAR REPORTE ]
                      </button>
                    </div>
                    <div
                      style={{ color: "rgba(255,212,168,0.35)", fontSize: "0.65rem", fontFamily: "'Space Mono', monospace" }}
                    >
                      Abre tu cliente de correo (Mail, Outlook, Gmail) con el reporte pre-llenado.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status bar */}
              <div
                className="relative z-10 flex flex-wrap items-center justify-between px-4 py-2 gap-2"
                style={{ borderTop: "1px solid rgba(196,82,42,0.3)", background: "rgba(0,0,0,0.4)" }}
              >
                <span
                  className="text-[9px] tracking-[0.12em] uppercase hidden md:block"
                  style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}
                >
                  NEXTECH INDUSTRIES — MOTOR DE INVENTARIO // ULASB 2026
                </span>
                <div className="flex items-center gap-4">
                  <span
                    className="text-[9px] tracking-[0.1em]"
                    style={{ color: "rgba(196,82,42,0.6)", fontFamily: "'Space Mono', monospace" }}
                  >
                    [MODELO: gemini-2.5-flash]
                  </span>
                  <span
                    className="text-[9px] tracking-[0.1em]"
                    style={{
                      color: phase === "error" ? "#FF7050" : "rgba(74,222,128,0.7)",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    [{phase === "error" ? "ERROR" : "OK"}]
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
