/**
 * Extrai o delta de texto de um objeto JSON de um evento SSE.
 * Cada provedor (OpenRouter, Gemini) tem um formato distinto.
 */
export type DeltaExtractor = (json: unknown) => string | undefined;

/** OpenRouter / OpenAI-compat: choices[0].delta.content */
export const openRouterDelta: DeltaExtractor = (json) => {
  const j = json as {
    choices?: { delta?: { content?: string } }[];
  };
  return j.choices?.[0]?.delta?.content;
};

/** Gemini: candidates[0].content.parts[].text (concatenado) */
export const geminiDelta: DeltaExtractor = (json) => {
  const j = json as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const parts = j.candidates?.[0]?.content?.parts;
  if (!parts) return undefined;
  const text = parts.map((p) => p.text ?? "").join("");
  return text || undefined;
};
