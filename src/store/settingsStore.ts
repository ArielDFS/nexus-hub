"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Ajustes do ator persistidos no navegador. Hoje só a chave BYOK (ADR-0002):
 * a chave OpenRouter do visitante que destrava o modelo premium (Claude).
 * Fica só no localStorage e é enviada apenas na missão dele.
 */
interface SettingsState {
  byokKey: string;
  setByokKey: (k: string) => void;
  clearByokKey: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      byokKey: "",
      setByokKey: (k) => set({ byokKey: k.trim() }),
      clearByokKey: () => set({ byokKey: "" }),
    }),
    { name: "nexus-settings", version: 1 },
  ),
);
