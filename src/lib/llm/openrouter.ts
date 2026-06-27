const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChatParams {
  model: string;
  messages: ChatMessage[];
  /** Key do host por padrão; pode ser sobrescrita por BYOK. */
  apiKey: string;
  signal?: AbortSignal;
}

/**
 * Dispara uma chamada de chat completion em streaming no OpenRouter.
 * Retorna a Response crua (corpo SSE) — o parsing fica em `stream.ts`.
 */
export async function streamChatCompletion({
  model,
  messages,
  apiKey,
  signal,
}: StreamChatParams): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Atribuição recomendada pelo OpenRouter (opcional).
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": process.env.NEXT_PUBLIC_APP_NAME ?? "NEXUS HUB",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
    signal,
  });
}
