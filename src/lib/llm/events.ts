import type { MissionEvent } from "@/types/mission";
import type { DeltaExtractor } from "./stream";

const encoder = new TextEncoder();

/** Serializa um evento como uma linha NDJSON e enfileira no stream. */
export function emit(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: MissionEvent,
) {
  controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
}

/**
 * Lê o corpo SSE de um provedor (OpenRouter/Gemini) e chama `onDelta`
 * para cada delta de texto, usando o extractor do provedor.
 */
export async function readSSEDeltas(
  body: ReadableStream<Uint8Array>,
  extractDelta: DeltaExtractor,
  onDelta: (text: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = extractDelta(json);
        if (delta) onDelta(delta);
      } catch {
        // keep-alive/comentário ou JSON parcial — ignora.
      }
    }
  }
}
