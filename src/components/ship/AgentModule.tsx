"use client";

import type { AgentConfig } from "@/types/agent";

interface AgentModuleProps {
  agent: AgentConfig;
  isFocused: boolean;
  isWorking: boolean;
  onSelect: (slug: string) => void;
  className?: string;
}

/**
 * Filtro CSS por agente — tinge o accent ciano do robô uniforme.
 * Valores aproximados, ajustáveis. NEXUS é a base (ciano, sem filtro).
 */
const TINT: Record<string, string> = {
  nexus: "",
  aria: "hue-rotate(90deg) saturate(1.15)",
  echo: "hue-rotate(225deg) saturate(1.4)",
  forge: "hue-rotate(175deg) saturate(1.3)",
  phantom: "saturate(0.3) brightness(1.05)",
};

/**
 * Um cômodo da nave: o robô do agente (tingido) vive aqui, com micro-animação
 * de idle (flutua) e pose "working" quando a missão roda. Clicar foca o agente.
 */
export function AgentModule({
  agent,
  isFocused,
  isWorking,
  onSelect,
  className = "",
}: AgentModuleProps) {
  const accent = agent.accentColor;
  const active = isFocused || isWorking;
  const tint = TINT[agent.slug] ?? "";
  const sprite = isWorking ? "/ship/bot-working.png" : "/ship/bot-idle.png";

  return (
    <button
      type="button"
      onClick={() => onSelect(agent.slug)}
      aria-pressed={isFocused}
      title={`${agent.name} — ${agent.tagline}`}
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-md border bg-void/55 transition focus:outline-none ${isWorking ? "am-work" : ""} ${className}`}
      style={{
        borderColor: active ? accent : "#1E3A5F",
        boxShadow: active ? `0 0 16px ${accent}45` : undefined,
      }}
    >
      {isWorking && <span className="am-scan" />}

      {/* nome do agente */}
      <span className="relative z-10 flex items-center gap-1.5 px-1.5 pt-1">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: active ? accent : "#5A7A94",
            boxShadow: isWorking ? `0 0 6px ${accent}` : undefined,
          }}
        />
        <span
          className="font-display text-[9px] tracking-[0.1em]"
          style={{ color: active ? accent : "#C9D6DF" }}
        >
          {agent.name}
        </span>
      </span>

      {/* o robô (centralizado embaixo) */}
      <span className="relative flex flex-1 items-end justify-center overflow-hidden">
        {/* halo de chão */}
        <span
          className="pointer-events-none absolute bottom-1 h-2.5 w-2/3 rounded-[50%] blur-md"
          style={{
            backgroundColor: active ? accent : "#1E3A5F",
            opacity: active ? 0.5 : 0.25,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sprite}
          alt={agent.name}
          draggable={false}
          className={`pointer-events-none relative h-[94%] object-contain ${isWorking ? "bot-work-anim" : "bot-idle-anim"}`}
          style={{
            filter: `${tint} drop-shadow(0 0 5px ${accent}66)`.trim(),
          }}
        />
      </span>
    </button>
  );
}
