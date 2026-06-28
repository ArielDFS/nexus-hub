"use client";

import { useState } from "react";
import type { AgentConfig } from "@/types/agent";
import type { MissionStatus, MissionStep } from "@/types/mission";
import { BotSprite } from "./BotSprite";

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
 * Terminal docado embaixo da nave (ADR-0011): avatar do agente, chips de status
 * (modelo/busca/Atividade), contador de tokens ao vivo, scanlines e borda no
 * accent. Mostra a resposta em streaming do agente focado + o prompt pequeno.
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

  // chips derivados
  const usesPremium =
    agent.model.prefer === "premium" && Boolean(agent.model.premium);
  const modelChip = usesPremium ? "CLAUDE" : "GEMINI";
  const hasSearch = agent.capabilities.includes("web_search");
  // contador de tokens ao vivo (≈ chars/4 — mesma heurística do guard de orçamento)
  const tokenEst = Math.round(effOutput.length / 4);

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
    <div
      className="overflow-hidden rounded-t-lg border-t-2 bg-void/95 backdrop-blur-sm"
      style={{ borderColor: accent, boxShadow: `0 -6px 24px -12px ${accent}99` }}
    >
      {/* barra do terminal: avatar + identidade + chips + status + tokens */}
      <div
        className="flex items-center gap-3 px-3 py-2"
        style={{ borderBottom: `1px solid ${accent}33` }}
      >
        {/* avatar (zoom do sprite, tingido por código) */}
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded border"
          style={{
            borderColor: `${accent}66`,
            background: `radial-gradient(circle at 50% 38%, ${accent}33, transparent 70%)`,
          }}
        >
          <BotSprite
            pose={busy ? "working" : "idle"}
            accent={accent}
            className="pointer-events-none absolute left-1/2 h-16 w-16 -translate-x-1/2"
            style={{ top: "-10%" }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="font-display text-[12px] tracking-[0.14em]"
              style={{ color: accent }}
            >
              {agent.name}
            </span>
            <span
              className="rounded-sm border px-1 py-px font-mono text-[8px] tracking-wide"
              style={{
                borderColor: usesPremium ? "#7B2FBE66" : "#1E3A5F",
                color: usesPremium ? "#A56BD6" : "#5A7A94",
              }}
            >
              {modelChip}
            </span>
            {hasSearch && (
              <span
                className="rounded-sm border px-1 py-px font-mono text-[8px] tracking-wide"
                style={{ borderColor: `${accent}66`, color: accent }}
              >
                BUSCA
              </span>
            )}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-dim">
            {agent.role}
          </span>
        </div>

        {/* status + tokens */}
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span
            className="flex items-center gap-1.5 font-mono text-[10px]"
            style={{ color: busy ? accent : "#5A7A94" }}
            aria-live="polite"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse" : ""}`}
              style={{
                backgroundColor: busy ? accent : "#5A7A94",
                boxShadow: busy ? `0 0 6px ${accent}` : undefined,
              }}
            />
            {STATUS_LABEL[effStatus]}
          </span>
          <span className="font-mono text-[9px] tabular-nums text-text-dim">
            {effOutput
              ? `${tokenEst} tok${
                  effStatus === "COMPLETED" && durationMs !== null
                    ? ` · ${durationMs}ms`
                    : ""
                }`
              : `+${agent.xpReward} XP`}
          </span>
        </div>
      </div>

      {/* saída (scanlines + scroll) */}
      <div className="relative mx-3 mt-2 h-36 overflow-auto rounded border border-border bg-void p-2.5 font-mono text-xs leading-relaxed">
        <div className="terminal-scan" />
        {effSteps.length > 0 && (
          <ul className="relative mb-2 space-y-0.5 border-b border-border/60 pb-2">
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
          <pre className="relative whitespace-pre-wrap break-words text-text">
            {effOutput}
            {effStatus === "STREAMING" && (
              <span className="animate-blink" style={{ color: accent }}>
                ▋
              </span>
            )}
          </pre>
        ) : effError ? (
          <p className="relative text-red-alert">⚠ {effError}</p>
        ) : (
          <p className="relative text-text-dim">
            {agent.name} &gt; {agent.inputPlaceholder}{" "}
            <span className="animate-blink">_</span>
          </p>
        )}
      </div>

      {/* prompt pequeno */}
      <div className="flex items-end gap-2 px-3 pb-3 pt-2">
        <span
          className="pb-2 font-mono text-sm"
          style={{ color: accent }}
          aria-hidden
        >
          &gt;
        </span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={`comandar ${agent.name}…  (Ctrl+Enter)`}
          rows={1}
          disabled={busy}
          className="max-h-20 min-h-[38px] flex-1 resize-none rounded border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text outline-none transition placeholder:text-text-dim focus:border-cyan focus:shadow-glow-cyan disabled:opacity-50"
          style={{ caretColor: accent }}
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
