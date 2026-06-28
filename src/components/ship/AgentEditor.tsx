"use client";

import type { AgentInstance } from "@/types/agent";
import { useRosterStore } from "@/store/rosterStore";

interface AgentEditorProps {
  agent: AgentInstance;
  /** Chamado após apagar o agente (o host fecha a view de edição). */
  onDeleted: () => void;
}

/**
 * Corpo de edição de um Agente (ADR-0011): nome, role, system prompt,
 * capacidade de busca, modelo, cor da sala e ações (restaurar/apagar).
 * Vive dentro do Manifesto. Edita a instância no `localStorage` (copy-on-write);
 * a nave lê o mesmo Roster, então nome/cor refletem ao vivo atrás do drawer.
 */
export function AgentEditor({ agent, onDeleted }: AgentEditorProps) {
  const updateAgent = useRosterStore((s) => s.updateAgent);
  const resetAgent = useRosterStore((s) => s.resetAgent);
  const deleteAgent = useRosterStore((s) => s.deleteAgent);

  const accent = agent.accentColor;
  const hasSearch = agent.capabilities.includes("web_search");

  return (
    <div className="space-y-3">
      <Field label="Nome">
        <input
          value={agent.name}
          onChange={(e) => updateAgent(agent.slug, { name: e.target.value })}
          maxLength={18}
          className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 font-display text-sm font-bold tracking-[0.1em] outline-none focus:border-cyan"
          style={{ color: accent }}
        />
      </Field>

      <Field label="Função (role)">
        <input
          value={agent.role}
          onChange={(e) => updateAgent(agent.slug, { role: e.target.value })}
          maxLength={28}
          placeholder="função do agente"
          className="w-full rounded border border-border bg-surface-2 px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted outline-none placeholder:text-text-dim focus:border-cyan"
        />
      </Field>

      <Field label="System prompt">
        <textarea
          value={agent.systemPrompt}
          onChange={(e) =>
            updateAgent(agent.slug, { systemPrompt: e.target.value })
          }
          rows={6}
          placeholder="Como esse agente pensa e responde..."
          className="w-full resize-none rounded border border-border bg-surface-2 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-text outline-none focus:border-cyan"
        />
      </Field>

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-text-muted">Busca web</span>
        <button
          type="button"
          onClick={() =>
            updateAgent(agent.slug, {
              capabilities: hasSearch ? [] : ["web_search"],
            })
          }
          className="rounded border px-2 py-0.5 font-mono text-[9px] tracking-wide transition"
          style={{
            borderColor: hasSearch ? accent : "#1E3A5F",
            color: hasSearch ? accent : "#5A7A94",
          }}
        >
          {hasSearch ? "LIGADA" : "desligada"}
        </button>
      </div>

      {agent.model.premium && (
        <Field label="Modelo">
          <select
            value={agent.model.prefer ?? "host"}
            onChange={(e) =>
              updateAgent(agent.slug, {
                model: {
                  ...agent.model,
                  prefer: e.target.value as "host" | "premium",
                },
              })
            }
            className="w-full rounded border border-border bg-surface-2 px-2 py-1 font-mono text-[10px] text-text outline-none focus:border-cyan"
          >
            <option value="host">Gemini (host)</option>
            <option value="premium">Claude (premium / BYOK)</option>
          </select>
        </Field>
      )}

      <Field label="Cor da sala">
        <input
          type="color"
          value={accent}
          onChange={(e) =>
            updateAgent(agent.slug, { accentColor: e.target.value })
          }
          className="h-7 w-full cursor-pointer rounded border border-border bg-surface-2"
        />
      </Field>

      <div className="flex gap-1.5 pt-1">
        {agent.blueprintSlug && (
          <EditorButton accent="#5A7A94" onClick={() => resetAgent(agent.slug)}>
            Restaurar padrão
          </EditorButton>
        )}
        <EditorButton
          accent="#FF4C4C"
          onClick={() => {
            deleteAgent(agent.slug);
            onDeleted();
          }}
        >
          Apagar
        </EditorButton>
      </div>
    </div>
  );
}

function EditorButton({
  accent,
  onClick,
  children,
}: {
  accent: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded border px-2 py-1.5 font-display text-[9px] tracking-[0.1em] transition hover:brightness-125"
      style={{ borderColor: `${accent}99`, color: accent }}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-dim">
        {label}
      </span>
      {children}
    </label>
  );
}
