"use client";

import { useState } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MissionTicker } from "@/components/MissionTicker";
import { AnimatedNav } from "@/components/AnimatedNav";
import { RocketSeparator } from "@/components/RocketSeparator";
import { HeroSection } from "@/components/HeroSection";
import { MarcoTeorico } from "@/components/MarcoTeorico";
import { ProblemaSection } from "@/components/ProblemaSection";
import { AIAdvisor } from "@/components/AIAdvisor";
import { GlobeTracker } from "@/components/GlobeTracker";
import { MissionProfile } from "@/components/MissionProfile";
import { TablaComparativa } from "@/components/TablaComparativa";
import { Conclusiones } from "@/components/Conclusiones";
import { TeamSection } from "@/components/TeamSection";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />

      {loaded && (
        <>
          <MissionTicker />
          <AnimatedNav />

          <main className="relative" style={{ paddingTop: "46px" }}>
            <HeroSection />

            <RocketSeparator label="Misiones" />
            <section id="misiones">
              <GlobeTracker />
              <MissionProfile />
            </section>

            <RocketSeparator label="Marco Teórico" />
            <MarcoTeorico />

            {/* Sin Déficit */}
            <RocketSeparator label="Sin Déficit" />
            <section id="sin-deficit">
              <div className="px-4 md:px-16 pt-10 md:pt-12 pb-4 max-w-5xl mx-auto">
                <div className="tva-label mb-2">&gt;_ SECCIÓN 01</div>
                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF" }}>
                  Modelos Sin Déficit
                </h2>
                <div className="h-px w-16 mt-3" style={{ background: "rgba(255,255,255,0.3)" }} />
              </div>

              <ProblemaSection
                number="1"
                type="sin-deficit"
                title="Aleaciones de Titanio"
                planteamiento="NexTech Industries utiliza aleaciones de titanio aeroespacial para la fabricación de los fuselajes de sus cohetes NX-Heavy. La demanda anual estimada es de 2,400 toneladas. El reemplazo es instantáneo y no se permite déficit por razones de continuidad operativa."
                datos={[
                  { label: "D — Demanda anual",     value: "2,400 ton/año" },
                  { label: "C₁ — Costo unitario",   value: "$850 / ton" },
                  { label: "C₂ — Costo de ordenar", value: "$1,500 / pedido" },
                  { label: "C₃ — Costo almacenar",  value: "$48 / ton·año" },
                ]}
                formulas={[
                  "Q = √( 2·C₂·D / C₃ )",
                  "Q = √( 2 × 1,500 × 2,400 / 48 )",
                  "Q = √150,000  =  387.30 ≈ 387 ton/pedido",
                  "",
                  "CT = C₁·D + (C₂·D/Q) + (C₃·Q/2)",
                  "CT = 2,040,000 + 9,295.16 + 9,295.16",
                  "CT = $2,058,590.32 por año",
                  "",
                  "N = D / Q = 2,400 / 387.30 ≈ 6 pedidos/año",
                  "t = (1/6.20) × 365 ≈ 59 días",
                ]}
                results={[
                  { label: "Cantidad Óptima Q",    value: "387 ton/pedido",  count: 387,        suffix: " ton/pedido" },
                  { label: "Costo Total Anual CT", value: "$2,058,590.32",   count: 2058590,    prefix: "$",  suffix: ".32" },
                  { label: "Pedidos por Año N",    value: "6 pedidos",       count: 6,          suffix: " pedidos" },
                  { label: "Tiempo entre Pedidos", value: "59 días",         count: 59,         suffix: " días" },
                ]}
                interpretacion="NexTech debe comprar 387 toneladas de titanio cada 59 días, realizando 6 órdenes al año, con un costo total operativo anual de $2,058,590.32 que incluye compra, ordenamiento y almacenamiento."
                chartProps={{ Q: 387, t: 59, N: 6, unit: "ton" }}
              />

              <ProblemaSection
                number="2"
                type="sin-deficit"
                title="Cohetes NX-Lite"
                planteamiento="NexTech Industries fabrica sus cohetes reutilizables NX-Lite en sus propias instalaciones de manufactura aeroespacial. La demanda anual es de 4,800 cohetes, con una tasa de producción de 7,200 cohetes/año. El reemplazo es progresivo y no se permite déficit por la exigencia de continuidad operativa."
                datos={[
                  { label: "D — Demanda anual",         value: "4,800 cohetes/año" },
                  { label: "R — Tasa de producción",    value: "7,200 cohetes/año" },
                  { label: "C₁ — Costo unitario",       value: "$45,000 / cohete" },
                  { label: "C₂ — Costo de producción",  value: "$8,500 / corrida" },
                  { label: "C₃ — Costo de almacenar",   value: "$1,200 / cohete·año" },
                ]}
                formulas={[
                  "Q = √( 2·C₂·D / (C₃·(1 − D/R)) )",
                  "Q = √( 2 × 8,500 × 4,800 / (1,200 × (1/3)) )",
                  "Q = √( 81,600,000 / 400 )  =  √204,000",
                  "Q ≈ 452 cohetes / corrida",
                  "",
                  "IM = Q × (1 − D/R) = 452 × 1/3 ≈ 151 cohetes",
                  "",
                  "CT = C₁·D + (C₂·D/Q) + C₃·Q·(1 − D/R)/2",
                  "CT = 216,000,000 + 90,335 + 90,330",
                  "CT ≈ $216,180,665 por año",
                  "",
                  "N = D / Q = 4,800 / 452 ≈ 11 corridas/año",
                  "t = 365 / 10.63 ≈ 34 días entre corridas",
                ]}
                results={[
                  { label: "Cantidad de Producción Q", value: "452 cohetes/corrida",  count: 452,       suffix: " cohetes" },
                  { label: "Inventario Máximo IM",     value: "151 cohetes",          count: 151,       suffix: " cohetes" },
                  { label: "Costo Total Anual CT",     value: "$216,180,665",         count: 216180665, prefix: "$" },
                  { label: "Corridas por Año N",       value: "11 corridas",          count: 11,        suffix: " corridas" },
                  { label: "Tiempo entre Corridas",    value: "34 días",              count: 34,        suffix: " días" },
                ]}
                interpretacion="NexTech debe arrancar 11 corridas de producción al año de 452 cohetes NX-Lite cada una, con un ciclo de 34 días entre corridas. El inventario máximo de 151 cohetes en planta optimiza los costos de almacenamiento, con un costo total anual de $216,180,665."
                chartProps={{ Q: 452, t: 34, N: 11, unit: "cohetes" }}
              />
            </section>

            {/* Con Déficit */}
            <RocketSeparator label="Con Déficit" flip />
            <section id="con-deficit" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div className="px-4 md:px-16 pt-10 md:pt-12 pb-4 max-w-5xl mx-auto">
                <div className="tva-label mb-2">&gt;_ SECCIÓN 02</div>
                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF" }}>
                  Modelos Con Déficit
                </h2>
                <div className="h-px w-16 mt-3" style={{ background: "rgba(255,255,255,0.3)" }} />
              </div>

              <ProblemaSection
                number="3"
                type="con-deficit"
                title="Combustible Criogénico LH₂"
                planteamiento="NexTech almacena tanques de hidrógeno líquido (LH₂) para abastecer sus misiones. La demanda anual es de 18,000 tanques. El costo por déficit es de $80/tanque·año (penalización por retrasar un lanzamiento). Se permite déficit moderado."
                datos={[
                  { label: "D — Demanda anual",     value: "18,000 tanq/año" },
                  { label: "C₁ — Costo unitario",   value: "$120 / tanque" },
                  { label: "C₂ — Costo de ordenar", value: "$2,200 / pedido" },
                  { label: "C₃ — Costo almacenar",  value: "$25 / tanq·año" },
                  { label: "C₄ — Costo déficit",    value: "$80 / tanq·año" },
                ]}
                formulas={[
                  "Q = √(2·C₂·D/C₃) × √((C₃+C₄)/C₄)",
                  "Q = 1,779.89 × 1.1456 ≈ 2,039 tanques",
                  "",
                  "S = (C₃/(C₃+C₄)) × Q = (25/105) × 2,039.12",
                  "S = 485.50 ≈ 486 tanques agotados/ciclo",
                  "",
                  "IM = Q − S = 1,554 tanques",
                  "",
                  "CT = 2,160,000 + 19,420.45 + 14,795.40 + 4,624.48",
                  "CT = $2,198,840.33 por año",
                  "",
                  "N ≈ 9 pedidos/año  |  t ≈ 41 días",
                ]}
                results={[
                  { label: "Cantidad Óptima Q",    value: "2,039 tanq/pedido", count: 2039, suffix: " tanques" },
                  { label: "Unidades Agotadas S",  value: "486 tanques/ciclo", count: 486,  suffix: " tanques" },
                  { label: "Inventario Máximo IM", value: "1,554 tanques",     count: 1554, suffix: " tanques" },
                  { label: "Costo Total Anual CT", value: "$2,198,840.33",     count: 2198840, prefix: "$", suffix: ".33" },
                  { label: "Pedidos por Año N",    value: "9 pedidos",         count: 9,    suffix: " pedidos" },
                  { label: "Tiempo entre Pedidos", value: "41 días",           count: 41,   suffix: " días" },
                ]}
                interpretacion="NexTech ordena 2,039 tanques de LH₂ cada 41 días, permitiendo un déficit controlado de 486 tanques por ciclo. El inventario máximo es de 1,554 tanques. El déficit controlado optimiza el costo total frente a mantener inventario completo."
                chartProps={{ Q: 2039, S: 486, t: 41, N: 9, unit: "tanq" }}
              />

              <ProblemaSection
                number="4"
                type="con-deficit"
                title="Motores LRE-7"
                planteamiento="NexTech Industries fabrica sus motores de propulsión líquida LRE-7 para las etapas inferiores del cohete NX-Heavy. La demanda anual es de 1,200 motores, con tasa de producción de 1,440 motores/año. Se permite déficit moderado con penalización de $1,900/motor·año para optimizar los ciclos de manufactura."
                datos={[
                  { label: "D — Demanda anual",         value: "1,200 motores/año" },
                  { label: "R — Tasa de producción",    value: "1,440 motores/año" },
                  { label: "C₁ — Costo unitario",       value: "$28,000 / motor" },
                  { label: "C₂ — Costo de producción",  value: "$6,200 / corrida" },
                  { label: "C₃ — Costo de almacenar",   value: "$850 / motor·año" },
                  { label: "C₄ — Costo de déficit",     value: "$1,900 / motor·año" },
                ]}
                formulas={[
                  "C₃' = C₃ × (1 − D/R) = 850 × (1/6) = 141.67",
                  "",
                  "Q = √(2·C₂·D / C₃') × √((C₃+C₄)/C₄)",
                  "Q = √(2×6,200×1,200/141.67) × √(2,750/1,900)",
                  "Q = 324.09 × 1.2031  ≈  390 motores / corrida",
                  "",
                  "IM_max = Q×(1−D/R) = 390×(1/6) = 65 mot",
                  "S = (C₃/(C₃+C₄))×IM_max = (850/2,750)×65 ≈ 20 mot",
                  "IM = IM_max − S = 65 − 20 = 45 motores",
                  "",
                  "CT = C₁·D + C₂·D/Q + (C₃·IM² + C₄·S²)/(2·IM_max)",
                  "CT = 33,600,000 + 19,076.92 + 19,086.54",
                  "CT = $33,638,163.29 por año",
                  "",
                  "N ≈ 3 corridas/año  |  t ≈ 119 días",
                ]}
                results={[
                  { label: "Cantidad de Producción Q", value: "390 mot/corrida",    count: 390,      suffix: " motores" },
                  { label: "Unidades Agotadas S",      value: "20 motores/ciclo",   count: 20,       suffix: " motores" },
                  { label: "Inventario Máximo IM",     value: "45 motores",         count: 45,       suffix: " motores" },
                  { label: "Costo Total Anual CT",     value: "$33,638,163.29",     count: 33638163, prefix: "$", suffix: ".29" },
                  { label: "Corridas por Año N",       value: "3 corridas",         count: 3,        suffix: " corridas" },
                  { label: "Tiempo entre Corridas",    value: "119 días",           count: 119,      suffix: " días" },
                ]}
                interpretacion="NexTech fabrica 390 motores LRE-7 por corrida cada 119 días, con 3 arranques de producción al año. El déficit controlado de 20 motores por ciclo optimiza el balance entre producción y almacenamiento, con inventario máximo de 45 motores. El costo total anual es $33,638,163.29."
                chartProps={{ Q: 65, S: 20, t: 119, N: 3, unit: "LRE-7" }}
              />
            </section>

            <RocketSeparator label="IA Demo" />
            <AIAdvisor />

            <RocketSeparator label="Comparativo" />
            <TablaComparativa />

            <RocketSeparator label="Conclusiones" flip />
            <Conclusiones />

            <RocketSeparator label="Equipo" />
            <TeamSection />

            {/* Footer */}
            <footer
              className="py-8 px-6 text-center"
              style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="text-[10px] tracking-[0.2em] uppercase space-y-2">
                <div style={{ color: "#C4522A" }}>NexTech Industries</div>
                <div style={{ color: "rgba(255,255,255,0.4)" }}>
                  Modelos de Inventario · Métodos Cuantitativos · Universidad La Salle Bajío · 2026
                </div>
              </div>
            </footer>
          </main>
        </>
      )}
    </>
  );
}
