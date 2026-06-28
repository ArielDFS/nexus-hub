"use client";

import { create } from "zustand";

interface ShipState {
  /** Slug do agente atualmente focado (mira do prompt). */
  focusedSlug: string;
  /** Card-inspetor (só-leitura) aberto? (§10.2 — clique foca E abre.) */
  cardOpen: boolean;
  /** Foca o agente E abre o card-inspetor (só-leitura). */
  setFocus: (slug: string) => void;
  /** Foca o agente SEM abrir o card (Manifesto: ADR-0011 — só re-mira o console). */
  focusOnly: (slug: string) => void;
  /** Fecha o card sem perder o foco. */
  closeCard: () => void;
  /** Modo de customização da nave ligado? (props/decoração — ADR-0010.) */
  buildMode: boolean;
  /** Liga/desliga o modo de customização (fecha card, Manifesto e editor). */
  toggleBuild: () => void;
  /** Manifesto (drawer de gerência) aberto? (ADR-0011.) */
  manifestoOpen: boolean;
  /** Abre/fecha/alterna o Manifesto (fechar limpa o editor). */
  openManifesto: () => void;
  closeManifesto: () => void;
  toggleManifesto: () => void;
  /**
   * Agente em edição dentro do Manifesto (null = lista). A edição vive no
   * Manifesto (ADR-0011 atualizada); o card é só-leitura.
   */
  editingSlug: string | null;
  /** Abre o Manifesto na view de edição desse agente (foca, fecha o card). */
  editAgent: (slug: string) => void;
  /** Volta da edição pra lista (mantém o Manifesto aberto). */
  closeEditor: () => void;
}

export const useShipStore = create<ShipState>((set) => ({
  focusedSlug: "nexus",
  cardOpen: false,
  setFocus: (slug) => set({ focusedSlug: slug, cardOpen: true }),
  focusOnly: (slug) => set({ focusedSlug: slug }),
  closeCard: () => set({ cardOpen: false }),
  buildMode: false,
  toggleBuild: () =>
    set((s) => ({
      buildMode: !s.buildMode,
      cardOpen: false,
      manifestoOpen: false,
      editingSlug: null,
    })),
  manifestoOpen: false,
  openManifesto: () => set({ manifestoOpen: true }),
  closeManifesto: () => set({ manifestoOpen: false, editingSlug: null }),
  toggleManifesto: () =>
    set((s) =>
      s.manifestoOpen
        ? { manifestoOpen: false, editingSlug: null }
        : { manifestoOpen: true },
    ),
  editingSlug: null,
  editAgent: (slug) =>
    set({
      focusedSlug: slug,
      manifestoOpen: true,
      editingSlug: slug,
      cardOpen: false,
    }),
  closeEditor: () => set({ editingSlug: null }),
}));
