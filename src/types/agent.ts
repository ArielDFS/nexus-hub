export type AgentClass =
  | "SQL_ANALYST"
  | "RESEARCH_SCOUT"
  | "REPORT_WRITER"
  | "CODE_BUILDER"
  | "SUMMARIZER";

export interface AgentConfig {
  slug: string;
  name: string;
  class: AgentClass;
  tagline: string;
  description: string;
  avatarUrl: string;
  accentColor: string;
  model: {
    /** Modelo Gemini usado no host do demo (Google AI Studio, free tier estável). */
    host: string;
    /** Modelo premium via OpenRouter, destravado por BYOK (opcional). */
    premium?: string;
  };
  systemPrompt: string;
  inputPlaceholder: string;
  /** true apenas para agentes com ferramenta de busca web (ARIA). */
  usesSearch?: boolean;
  /** XP base concedido por missão concluída. */
  xpReward: number;
  /** Nível mínimo para desbloquear (mínimo no demo — destrava em 1-2 missões). */
  unlockLevel: number;
}
