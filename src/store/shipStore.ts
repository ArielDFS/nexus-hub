"use client";

import { create } from "zustand";

interface ShipState {
  /** Slug do agente atualmente focado (mira do prompt). */
  focusedSlug: string;
  setFocus: (slug: string) => void;
}

export const useShipStore = create<ShipState>((set) => ({
  focusedSlug: "nexus",
  setFocus: (slug) => set({ focusedSlug: slug }),
}));
