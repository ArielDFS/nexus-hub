"use client";

import { AGENTS, getAgent } from "@/agents";
import { useMission } from "@/hooks/useMission";
import { useShipStore } from "@/store/shipStore";
import { AgentModule } from "./AgentModule";
import { ModuleConsole } from "./ModuleConsole";

// === CALIBRAÇÃO DO CONVÉS ===
// Posição da grade de módulos sobre o convés interno do PNG (hull-exterior.png).
// Ajuste estes valores (% da imagem) até os módulos encaixarem no retângulo claro.
const BAY = { left: "16.1%", top: "35.2%", width: "52.6%", height: "28.6%" };

// 8 células (4×2): 5 agentes + 3 vagas reservadas (VEGA, ORACLE, expansão).
const GRID: (string | "EMPTY")[] = [
  "nexus",
  "aria",
  "echo",
  "forge",
  "phantom",
  "EMPTY",
  "EMPTY",
  "EMPTY",
];

export function ShipView() {
  const focusedSlug = useShipStore((s) => s.focusedSlug);
  const setFocus = useShipStore((s) => s.setFocus);
  const mission = useMission();

  const focusedAgent = getAgent(focusedSlug) ?? AGENTS[0];

  const isWorking = (slug: string) =>
    mission.agentSlug === slug &&
    (mission.status === "PROCESSING" || mission.status === "STREAMING");

  return (
    <main className="bg-grid relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan/10 blur-[120px]" />

      {/* cabeçalho */}
      <header className="relative z-10 flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 animate-pulse-cyan rounded-full bg-cyan" />
          <h1 className="font-display text-lg font-bold tracking-[0.2em]">
            NEXUS<span className="text-cyan"> HUB</span>
          </h1>
        </div>
        <p className="font-mono text-[10px] text-text-muted">
          NAVE-MÃE // tripulação: {AGENTS.length} agentes
        </p>
      </header>

      {/* convés — a nave (PNG) com os módulos encaixados no casco */}
      <section className="relative z-10 flex flex-1 items-center justify-center p-4">
        <div className="relative w-full max-w-6xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ship/hull-exterior.png"
            alt="Nave-mãe NEXUS HUB"
            className="pointer-events-none w-full select-none"
            draggable={false}
          />

          {/* grade de módulos sobre o convés interno */}
          <div
            className="absolute grid grid-cols-4 grid-rows-2 gap-1"
            style={BAY}
          >
            {GRID.map((cell, i) => {
              if (cell === "EMPTY") {
                return (
                  <div
                    key={`empty-${i}`}
                    title="Módulo vago — agente futuro"
                    className="flex flex-col items-center justify-center rounded border border-dashed border-border/70 bg-void/40"
                  >
                    <span className="font-mono text-[7px] tracking-widest text-text-dim">
                      VAGO
                    </span>
                  </div>
                );
              }
              const agent = getAgent(cell)!;
              return (
                <AgentModule
                  key={agent.slug}
                  agent={agent}
                  isFocused={focusedSlug === agent.slug}
                  isWorking={isWorking(agent.slug)}
                  onSelect={setFocus}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* console docado + prompt pequeno */}
      <div className="relative z-10">
        <ModuleConsole
          agent={focusedAgent}
          status={mission.status}
          output={mission.output}
          steps={mission.steps}
          error={mission.error}
          durationMs={mission.durationMs}
          isThisAgent={mission.agentSlug === focusedAgent.slug}
          onLaunch={(input) => mission.run(focusedAgent.slug, input)}
        />
      </div>
    </main>
  );
}
