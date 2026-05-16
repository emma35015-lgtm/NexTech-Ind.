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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
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

function PixelRobot() {
  return (
    <svg
      width="88"
      height="72"
      viewBox="0 0 88 72"
      className="pixel-robot"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Antenna */}
      <rect x="40" y="0" width="8" height="8" fill="#C4522A" />
      {/* Head */}
      <rect x="24" y="8" width="40" height="28" fill="#C4522A" />
      {/* Eyes */}
      <rect x="32" y="16" width="10" height="10" fill="#0A0300" />
      <rect x="46" y="16" width="10" height="10" fill="#0A0300" />
      {/* Mouth */}
      <rect x="32" y="30" width="4" height="4" fill="#0A0300" />
      <rect x="40" y="30" width="4" height="4" fill="#0A0300" />
      <rect x="52" y="30" width="4" height="4" fill="#0A0300" />
      {/* Neck */}
      <rect x="36" y="36" width="16" height="4" fill="#A03D1A" />
      {/* Body */}
      <rect x="16" y="40" width="56" height="20" fill="#C4522A" />
      {/* Chest detail */}
      <rect x="32" y="44" width="24" height="10" fill="#A03D1A" />
      <rect x="34" y="46" width="6" height="6" fill="#FFD4A8" />
      <rect x="48" y="46" width="6" height="6" fill="#FFD4A8" />
      {/* Arms */}
      <rect x="4" y="40" width="12" height="14" fill="#C4522A" />
      <rect x="72" y="40" width="12" height="14" fill="#C4522A" />
      {/* Legs */}
      <rect x="22" y="60" width="14" height="10" fill="#A03D1A" />
      <rect x="52" y="60" width="14" height="10" fill="#A03D1A" />
    </svg>
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
      setErrorMsg(`ERR: ${err instanceof Error ? err.message : "Error de conexión"}`);
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
            Motor EOQ + Claude AI
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

        {/* API Key Gate */}
        <AnimatePresence mode="wait">
          {!keyConnected ? (
            <motion.div
              key="gate"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="terminal-panel p-5 md:p-6 rounded-sm"
            >
              <div className="tva-label mb-4">&gt;_ AUTENTICACIÓN REQUERIDA</div>
              <p className="text-xs md:text-sm mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
                Ingresa tu clave de API de Google Gemini (gratis en{" "}
                <span style={{ color: "#FFD4A8" }}>aistudio.google.com</span>
                {" → "}<span style={{ color: "#FFD4A8" }}>Get API key</span>).
                La clave se guarda solo en esta sesión del navegador.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
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
                  className="text-[11px] tracking-[0.2em] uppercase px-5 py-2 rounded-sm font-bold transition-all whitespace-nowrap"
                  style={{ background: "#C4522A", color: "#0A0300", border: "1px solid #C4522A" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFD4A8"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C4522A"; }}
                >
                  &gt;&gt; CONECTAR
                </button>
              </div>
              {errorMsg && (
                <div className="mt-3 text-xs" style={{ color: "#FF7050", fontFamily: "'Space Mono', monospace" }}>
                  {errorMsg}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-3 text-xs"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
              />
              <span className="tva-label" style={{ color: "#4ADE80" }}>
                CONECTADO — GEMINI 2.0 FLASH ✓
              </span>
              <button
                onClick={() => { setKeyConnected(false); setApiKey(""); sessionStorage.removeItem("nt_api_key"); }}
                className="tva-label underline"
                style={{ color: "rgba(255,255,255,0.35)", cursor: "pointer", background: "none", border: "none" }}
              >
                desconectar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How-to guide */}
        <AnimatePresence>
          {keyConnected && (
            <motion.div
              key="howto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="terminal-panel p-4 md:p-5 rounded-sm"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="tva-label">&gt;_ GUÍA DE USO</div>
                <button
                  onClick={loadExample}
                  className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-sm transition-all"
                  style={{
                    border: "1px solid rgba(196,82,42,0.6)",
                    color: "#FFD4A8",
                    background: "rgba(196,82,42,0.15)",
                    fontFamily: "'Space Mono', monospace",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,82,42,0.35)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,82,42,0.15)"; }}
                >
                  [ CARGAR EJEMPLO ]
                </button>
              </div>
              <div className="space-y-2">
                {[
                  "SELECCIONA el modelo: SIN o CON DÉFICIT",
                  "INGRESA los parámetros de tu producto/insumo",
                  'PRESIONA "EJECUTAR ANÁLISIS"',
                  "OBSERVA el cálculo EOQ paso a paso en la terminal",
                  "RECIBE el análisis ejecutivo de NexTech AI (Claude)",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <span
                      className="flex-shrink-0 font-bold"
                      style={{ color: "#C4522A", fontFamily: "'Space Mono', monospace" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <AnimatePresence>
          {keyConnected && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="terminal-panel p-5 md:p-6 rounded-sm space-y-5"
            >
              <div className="tva-label">&gt;_ PARÁMETROS DE ENTRADA</div>

              {/* Model toggle */}
              <div className="flex gap-2 flex-wrap">
                {(["sin-deficit", "con-deficit"] as ModelType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className="text-[11px] tracking-[0.12em] uppercase px-4 py-2 rounded-sm transition-all font-bold"
                    style={{
                      background: model === m ? "#C4522A" : "rgba(0,0,0,0.3)",
                      color: model === m ? "#0A0300" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${model === m ? "#C4522A" : "rgba(255,255,255,0.12)"}`,
                      cursor: "pointer",
                    }}
                  >
                    {m === "sin-deficit" ? "Sin Déficit" : "Con Déficit"}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <label className="tva-label block mb-1.5">Nombre del Producto / Insumo</label>
                  <input
                    className="terminal-input"
                    placeholder="ej. Aleaciones de Titanio"
                    value={form.nombre}
                    onChange={(e) => setField("nombre", e.target.value)}
                  />
                </div>
                <div>
                  <label className="tva-label block mb-1.5">D — Demanda Anual (uds/año)</label>
                  <input
                    type="number"
                    className="terminal-input"
                    placeholder="ej. 2400"
                    value={form.D}
                    onChange={(e) => setField("D", e.target.value)}
                  />
                </div>
                <div>
                  <label className="tva-label block mb-1.5">C₁ — Costo Unitario ($/ud)</label>
                  <input
                    type="number"
                    className="terminal-input"
                    placeholder="ej. 850"
                    value={form.C1}
                    onChange={(e) => setField("C1", e.target.value)}
                  />
                </div>
                <div>
                  <label className="tva-label block mb-1.5">C₂ — Costo de Ordenar ($/pedido)</label>
                  <input
                    type="number"
                    className="terminal-input"
                    placeholder="ej. 1500"
                    value={form.C2}
                    onChange={(e) => setField("C2", e.target.value)}
                  />
                </div>
                <div>
                  <label className="tva-label block mb-1.5">C₃ — Costo de Almacenar ($/ud·año)</label>
                  <input
                    type="number"
                    className="terminal-input"
                    placeholder="ej. 48"
                    value={form.C3}
                    onChange={(e) => setField("C3", e.target.value)}
                  />
                </div>
                <AnimatePresence>
                  {model === "con-deficit" && (
                    <motion.div
                      key="c4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <label className="tva-label block mb-1.5">C₄ — Costo de Déficit ($/ud·año)</label>
                      <input
                        type="number"
                        className="terminal-input"
                        placeholder="ej. 80"
                        value={form.C4}
                        onChange={(e) => setField("C4", e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {errorMsg && phase !== "streaming" && phase !== "calculating" && (
                <div className="text-xs" style={{ color: "#FF7050", fontFamily: "'Space Mono', monospace" }}>
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={!canRun}
                className="w-full py-3 text-sm tracking-[0.2em] uppercase font-bold rounded-sm transition-all"
                style={{
                  background: canRun ? "#C4522A" : "rgba(196,82,42,0.2)",
                  color: canRun ? "#0A0300" : "rgba(255,255,255,0.3)",
                  border: `1px solid ${canRun ? "#C4522A" : "rgba(196,82,42,0.2)"}`,
                  fontFamily: "'Space Mono', monospace",
                  cursor: canRun ? "pointer" : "not-allowed",
                }}
              >
                {phase === "calculating" || phase === "streaming" ? "[ ANALIZANDO... ]" : ">> EJECUTAR ANÁLISIS"}
              </button>
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
                      <PixelRobot />
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
                    [MODELO: gemini-2.0-flash]
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
