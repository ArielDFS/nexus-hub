"use client";

import { useState } from "react";
import type { AgentConfig } from "@/types/agent";
import type { MissionStatus, MissionStep } from "@/types/mission";

const STATUS_LABEL: Record<MissionStatus, string> = {
  STANDBY: "STANDBY",
  PROCESSING: "PROCESSANDO",
  STREAMING: "TRANSMITINDO",
  COMPLETED: "CONCLUÍDO",
  ERROR: "ERRO",
};

interface ModuleConsoleProps {
  agent: AgentConfig;
  status: MissionStatus;
  output: string;
  steps: MissionStep[];
  error: string | null;
  durationMs: number | null;
  isThisAgent: boolean;
  onLaunch: (input: string) => void;
}

/**
 * Console docado embaixo da nave: mostra a resposta em streaming do agente
 * focado e o prompt pequeno. A nave permanece sempre em cena acima.
 */
export function ModuleConsole({
  agent,
  status,
  output,
  steps,
  error,
  durationMs,
  isThisAgent,
  onLaunch,
}: ModuleConsoleProps) {
  const [input, setInput] = useState("");
  const accent = agent.accentColor;

  // Só reflete status de missão se ela for deste agente focado.
  const effStatus: MissionStatus = isThisAgent ? status : "STANDBY";
  const busy = effStatus === "PROCESSING" || effStatus === "STREAMING";
  const effOutput = isThisAgent ? output : "";
  const effError = isThisAgent ? error : null;
  const effSteps = isThisAgent ? steps : [];

  function launch() {
    if (busy || !input.trim()) return;
    onLaunch(input);
    setInput("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      launch();
    }
  }

  return (
    <div className="border-t border-border bg-void/95">
      {/* faixa de console (saída) */}
      <div className="flex items-center justify-between px-4 pt-2">
        <span
          className="font-display text-[11px] tracking-[0.14em]"
          style={{ color: accent }}
        >
          CONSOLE // {agent.name}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: busy ? accent : "#5A7A94" }}
          aria-live="polite"
        >
          ● {STATUS_LABEL[effStatus]}
          {effStatus === "COMPLETED" && durationMs !== null && (
            <span className="text-text-muted">
              {" "}
              · {durationMs}ms · +{agent.xpReward} XP
            </span>
          )}
        </span>
      </div>

      <div className="mx-4 mb-2 mt-1 h-28 overflow-auto rounded border border-border bg-void p-2.5 font-mono text-xs leading-relaxed">
        {effSteps.length > 0 && (
          <ul className="mb-2 space-y-0.5 border-b border-border/60 pb-2">
            {effSteps.map((step) => (
              <li key={step.id} className="flex items-center gap-2 text-[11px]">
                <span style={{ color: accent }}>
                  {step.status === "done" ? "✓" : "▸"}
                </span>
                <span className="text-text-muted">{step.label}</span>
                {step.detail && (
                  <span className="text-text-dim">— {step.detail}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {effOutput ? (
          <pre className="whitespace-pre-wrap break-words text-text">
            {effOutput}
            {effStatus === "STREAMING" && (
              <span className="animate-blink" style={{ color: accent }}>
                ▋
              </span>
            )}
          </pre>
        ) : effError ? (
          <p className="text-red-alert">⚠ {effError}</p>
        ) : (
          <p className="text-text-dim">
            {agent.name} &gt; {agent.inputPlaceholder}{" "}
            <span className="animate-blink">_</span>
          </p>
        )}
      </div>

      {/* prompt pequeno */}
      <div className="flex items-end gap-2 px-4 pb-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`comandar ${agent.name}…`}
          rows={1}
          disabled={busy}
          className="max-h-20 min-h-[38px] flex-1 resize-none rounded border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text outline-none transition placeholder:text-text-dim focus:border-cyan focus:shadow-glow-cyan disabled:opacity-50"
        />
        <button
          onClick={launch}
          disabled={busy || !input.trim()}
          className="shrink-0 rounded border px-3 py-2 font-display text-[10px] tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            borderColor: accent,
            color: accent,
            backgroundColor: `${accent}14`,
          }}
        >
          {busy ? "EXECUTANDO…" : "LANÇAR ▸"}
        </button>
      </div>
    </div>
  );
}
