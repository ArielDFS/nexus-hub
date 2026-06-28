"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useHydrated } from "@/hooks/useHydrated";

interface ByokKeyProps {
  /** Direção em que o popover abre (no rodapé do Manifesto, abre p/ cima). */
  placement?: "down" | "up";
}

/**
 * Botão + popover para o visitante colar a própria chave OpenRouter (BYOK,
 * ADR-0002), destravando o modelo premium (Claude). A chave vive só no
 * navegador (settingsStore) e é enviada apenas na missão do ator.
 */
export function ByokKey({ placement = "down" }: ByokKeyProps) {
  const hydrated = useHydrated();
  const byokKey = useSettingsStore((s) => s.byokKey);
  const setByokKey = useSettingsStore((s) => s.setByokKey);
  const clearByokKey = useSettingsStore((s) => s.clearByokKey);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const active = hydrated && Boolean(byokKey);

  return (
    <div className="relative">
      <button
        type="button"
        title="Bring Your Own Key — sua chave OpenRouter destrava o modelo premium (Claude)"
        onClick={() => {
          setDraft(byokKey);
          setOpen((o) => !o);
        }}
        className="rounded border px-2.5 py-1 font-display text-[9px] tracking-[0.12em] transition"
        style={{
          borderColor: active ? "#FFD700" : "#1E3A5F",
          color: active ? "#FFD700" : "#5A7A94",
          boxShadow: active ? "0 0 10px #FFD70044" : undefined,
        }}
      >
        {active ? "✓ CHAVE BYOK" : "+ CHAVE BYOK"}
      </button>

      {open && (
        <div
          className={`absolute right-0 z-50 w-72 rounded border border-border bg-surface p-3 shadow-glow-cyan ${
            placement === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <p className="mb-2 font-mono text-[10px] leading-relaxed text-text-muted">
            Cole sua chave <span className="text-cyan">OpenRouter</span> para
            destravar o modelo premium (Claude). Fica só no seu navegador e é
            enviada apenas na sua missão.
          </p>
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-or-..."
            autoComplete="off"
            spellCheck={false}
            className="mb-2 w-full rounded border border-border bg-void px-2 py-1.5 font-mono text-[11px] text-text outline-none transition focus:border-cyan"
          />
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                clearByokKey();
                setDraft("");
                setOpen(false);
              }}
              className="font-mono text-[10px] text-text-dim transition hover:text-red-alert"
            >
              remover
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-border px-2 py-1 font-display text-[9px] tracking-wide text-text-muted transition hover:text-text"
              >
                fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setByokKey(draft);
                  setOpen(false);
                }}
                className="rounded border border-cyan px-2 py-1 font-display text-[9px] tracking-wide text-cyan transition"
                style={{ backgroundColor: "#00F5FF14" }}
              >
                salvar
              </button>
            </div>
          </div>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="mt-2 block font-mono text-[9px] text-text-dim underline transition hover:text-cyan"
          >
            obter uma chave →
          </a>
        </div>
      )}
    </div>
  );
}
