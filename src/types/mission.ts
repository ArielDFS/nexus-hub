export type MissionStatus =
  | "STANDBY"
  | "PROCESSING"
  | "STREAMING"
  | "COMPLETED"
  | "ERROR";

export interface MissionResult {
  agentSlug: string;
  input: string;
  output: string;
  durationMs: number;
  xpEarned: number;
  createdAt: string;
}

/** Passo de função/ferramenta visível durante a missão (ex.: busca da ARIA). */
export interface MissionStep {
  id: string;
  label: string;
  status: "running" | "done";
  detail?: string;
}

/**
 * Protocolo de stream da rota (NDJSON — um evento por linha).
 * `step` = evento de função/ferramenta; `token` = delta de texto;
 * `done` = fim; `error` = falha.
 */
export type MissionEvent =
  | { type: "step"; id: string; label: string; status: "running" | "done"; detail?: string }
  | { type: "token"; text: string }
  | { type: "done"; modelUsed?: string }
  | { type: "error"; message: string };
