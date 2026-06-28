"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AgentConfig } from "@/types/agent";
import { computeXp } from "@/lib/gamification/xp";
import { levelForXp } from "@/lib/gamification/levels";

interface AgentStat {
  /** Missões concluídas com este agente. */
  missions: number;
  /** Timestamp (ms) do último uso. */
  lastUsedAt: number | null;
}

/** Resultado de registrar uma missão — alimenta o XPRewardToast e o level-up. */
export interface MissionReward {
  gained: number;
  totalXp: number;
  leveledUp: boolean;
  newLevel: number;
}

interface ProfileState {
  /** XP acumulado do ator. */
  xp: number;
  /** Estatísticas por slug de agente. */
  agentStats: Record<string, AgentStat>;

  /** Registra uma missão concluída, concede XP e retorna o resultado. */
  recordMission: (agent: AgentConfig, durationMs: number) => MissionReward;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      xp: 0,
      agentStats: {},

      recordMission: (agent, durationMs) => {
        const { xp, agentStats } = get();
        const prev = agentStats[agent.slug];
        const isFirstUse = !prev || prev.missions === 0;

        const gained = computeXp(agent, durationMs, isFirstUse);
        const totalXp = xp + gained;

        const leveledUp = levelForXp(totalXp).level > levelForXp(xp).level;
        const newLevel = levelForXp(totalXp).level;

        set({
          xp: totalXp,
          agentStats: {
            ...agentStats,
            [agent.slug]: {
              missions: (prev?.missions ?? 0) + 1,
              lastUsedAt: Date.now(),
            },
          },
        });

        return { gained, totalXp, leveledUp, newLevel };
      },
    }),
    {
      name: "nexus-profile",
      version: 1,
    },
  ),
);
