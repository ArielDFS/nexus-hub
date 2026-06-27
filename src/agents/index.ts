import type { AgentConfig } from "@/types/agent";
import { NEXUS } from "./nexus";
import { ARIA } from "./aria";
import { PHANTOM } from "./phantom";
import { ECHO } from "./echo";
import { FORGE } from "./forge";

/** Registry ordenado de todos os agentes do MVP. */
export const AGENTS: AgentConfig[] = [NEXUS, ARIA, PHANTOM, ECHO, FORGE];

const AGENTS_BY_SLUG = new Map(AGENTS.map((a) => [a.slug, a]));

export function getAgent(slug: string): AgentConfig | undefined {
  return AGENTS_BY_SLUG.get(slug);
}

export { NEXUS, ARIA, PHANTOM, ECHO, FORGE };
