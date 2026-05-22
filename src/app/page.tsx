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
            <RocketSeparator label="Compras Sin Déficit" />
            <section id="sin-deficit">
              <div className="px-4 md:px-16 pt-10 md:pt-12 pb-4 max-w-5xl mx-auto">
                <div className="tva-label mb-2">&gt;_ SECCIÓN 01</div>
                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF" }}>
                  Compras Sin Déficit
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
                title="Tornillos Aeroespaciales"
                planteamiento="NexTech requiere tornillería certificada AS9100 para el ensamblaje de sus cohetes NX-Lite y NX-Heavy. La demanda mensual es de 13,000 unidades. El costo de mantenimiento es de $0.15 por trimestre. El reemplazo es instantáneo y no se permite déficit."
                datos={[
                  { label: "D — Demanda anual",     value: "156,000 uds/año" },
                  { label: "C₁ — Costo unitario",   value: "$0.45 / tornillo" },
                  { label: "C₂ — Costo de ordenar", value: "$320 / pedido" },
                  { label: "C₃ — Costo almacenar",  value: "$0.60 / ud·año" },
                ]}
                formulas={[
                  "Q = √( 2·C₂·D / C₃ )",
                  "Q = √( 2 × 320 × 156,000 / 0.60 )",
                  "Q = √166,400,000 ≈ 12,900 tornillos",
                  "",
                  "CT = C₁·D + (C₂·D/Q) + (C₃·Q/2)",
                  "CT = 70,200 + 3,869.88 + 3,869.88",
                  "CT = $77,939.77 por año",
                  "",
                  "N = 156,000 / 12,899.61 ≈ 12 pedidos/año",
                  "t = (1/12.09) × 365 ≈ 30 días",
                ]}
                results={[
                  { label: "Cantidad Óptima Q",    value: "12,900 torn/pedido", count: 12900,  suffix: " torn" },
                  { label: "Costo Total Anual CT", value: "$77,939.77",         count: 77939,  prefix: "$",  suffix: ".77" },
                  { label: "Pedidos por Año N",    value: "12 pedidos",         count: 12,     suffix: " pedidos" },
                  { label: "Tiempo entre Pedidos", value: "30 días",            count: 30,     suffix: " días" },
                ]}
                interpretacion="NexTech debe ordenar 12,900 tornillos cada 30 días, realizando 12 pedidos al año, para abastecer las líneas de ensamblaje de ambos modelos de cohete con un costo anual total de $77,939.77."
                chartProps={{ Q: 12900, t: 30, N: 12, unit: "uds" }}
              />
            </section>

            {/* Con Déficit */}
            <RocketSeparator label="Compras Con Déficit" flip />
            <section id="con-deficit" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div className="px-4 md:px-16 pt-10 md:pt-12 pb-4 max-w-5xl mx-auto">
                <div className="tva-label mb-2">&gt;_ SECCIÓN 02</div>
                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.08em]" style={{ color: "#FFFFFF" }}>
                  Compras Con Déficit
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
                title="Paneles Solares Satelitales"
                planteamiento="NexTech integra paneles solares de arseniuro de galio en los satélites que lanza al espacio. La demanda bimestral es de 6,000 paneles. El costo de almacenamiento es de $2.80/mes (sala limpia clase 10,000) y el costo por déficit es de $95/panel por semestre."
                datos={[
                  { label: "D — Demanda anual",     value: "36,000 pan/año" },
                  { label: "C₁ — Costo unitario",   value: "$185 / panel" },
                  { label: "C₂ — Costo de ordenar", value: "$4,500 / pedido" },
                  { label: "C₃ — Costo almacenar",  value: "$33.60 / pan·año" },
                  { label: "C₄ — Costo déficit",    value: "$190 / pan·año" },
                ]}
                formulas={[
                  "Q = √(2·C₂·D/C₃) × √((C₃+C₄)/C₄)",
                  "Q = 3,105.30 × 1.0848 ≈ 3,369 paneles",
                  "",
                  "S = (C₃/(C₃+C₄)) × Q = (33.60/223.60) × 3,368.70",
                  "S = 506.21 ≈ 506 paneles agotados/ciclo",
                  "",
                  "IM = Q − S = 2,862 paneles",
                  "",
                  "CT = 6,660,000 + 48,083.55 + 40,847.95 + 7,248.13",
                  "CT = $6,756,179.62 por año",
                  "",
                  "N ≈ 11 pedidos/año  |  t ≈ 34 días",
                ]}
                results={[
                  { label: "Cantidad Óptima Q",    value: "3,369 pan/pedido", count: 3369,    suffix: " paneles" },
                  { label: "Unidades Agotadas S",  value: "506 paneles/ciclo",count: 506,     suffix: " paneles" },
                  { label: "Inventario Máximo IM", value: "2,862 paneles",    count: 2862,    suffix: " paneles" },
                  { label: "Costo Total Anual CT", value: "$6,756,179.62",    count: 6756179, prefix: "$", suffix: ".62" },
                  { label: "Pedidos por Año N",    value: "11 pedidos",       count: 11,      suffix: " pedidos" },
                  { label: "Tiempo entre Pedidos", value: "34 días",          count: 34,      suffix: " días" },
                ]}
                interpretacion="NexTech ordena 3,369 paneles solares cada 34 días, con un déficit controlado de 506 paneles por ciclo. El inventario máximo en sala limpia es de 2,862 paneles. El costo total anual es $6,756,179.62, optimizando el balance entre costos de almacén y penalizaciones."
                chartProps={{ Q: 3369, S: 506, t: 34, N: 11, unit: "pan" }}
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
