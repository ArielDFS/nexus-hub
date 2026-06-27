const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export interface GeminiStreamParams {
  /** ID do modelo Gemini, ex.: "gemini-2.5-flash". */
  model: string;
  systemPrompt: string;
  userMessage: string;
  apiKey: string;
  signal?: AbortSignal;
}

/**
 * Dispara um generateContent em streaming na API do Google AI Studio (Gemini).
 * Usado no host do demo (free tier estável). Retorna a Response crua (SSE).
 */
export async function streamGemini({
  model,
  systemPrompt,
  userMessage,
  apiKey,
  signal,
}: GeminiStreamParams): Promise<Response> {
  const url = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse`;

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
    }),
    signal,
  });
}
