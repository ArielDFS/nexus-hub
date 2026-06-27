import { NextRequest } from "next/server";
import { getAgent } from "@/agents";
import { streamGemini } from "@/lib/llm/gemini";
import { streamChatCompletion, type ChatMessage } from "@/lib/llm/openrouter";
import { geminiDelta, openRouterDelta, type DeltaExtractor } from "@/lib/llm/stream";
import { emit, readSSEDeltas } from "@/lib/llm/events";
import { tavilySearch, buildSearchContext } from "@/lib/search/tavily";

// Streaming exige runtime Node (não Edge) para o pipe de ReadableStream.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RunBody {
  input?: string;
  /** Chave OpenRouter do visitante (BYOK) — destrava o modelo premium. */
  apiKey?: string;
  usePremium?: boolean;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const agent = getAgent(slug);

  if (!agent) {
    return Response.json({ error: "Agente não encontrado." }, { status: 404 });
  }

  let body: RunBody;
  try {
    body = (await req.json()) as RunBody;
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const input = body.input?.trim();
  if (!input) {
    return Response.json(
      { error: "Input da missão é obrigatório." },
      { status: 400 },
    );
  }

  const byokKey = body.apiKey?.trim();
  const wantsPremium = Boolean(
    body.usePremium && byokKey && agent.model.premium,
  );

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!wantsPremium && !geminiKey) {
    return Response.json(
      {
        error:
          "Nenhuma API key disponível. Configure GEMINI_API_KEY no servidor ou forneça a sua chave OpenRouter (BYOK) para o modelo premium.",
      },
      { status: 503 },
    );
  }

  // A partir daqui devolvemos um stream de eventos NDJSON (status 200).
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Ferramenta de busca da ARIA (e qualquer agente com usesSearch).
        let userMessage = input;
        if (agent.usesSearch) {
          const tavilyKey = process.env.TAVILY_API_KEY;
          if (tavilyKey) {
            emit(controller, {
              type: "step",
              id: "search",
              label: "Buscando na web",
              status: "running",
              detail: input,
            });
            try {
              const results = await tavilySearch(input, tavilyKey, req.signal);
              emit(controller, {
                type: "step",
                id: "search",
                label: "Busca concluída",
                status: "done",
                detail: `${results.length} fontes`,
              });
              userMessage = buildSearchContext(input, results);
            } catch {
              emit(controller, {
                type: "step",
                id: "search",
                label: "Busca indisponível (erro)",
                status: "done",
              });
            }
          } else {
            emit(controller, {
              type: "step",
              id: "search",
              label: "Busca indisponível (sem TAVILY_API_KEY)",
              status: "done",
            });
          }
        }

        let upstream: Response;
        let modelUsed: string;
        let extractor: DeltaExtractor;

        if (wantsPremium) {
          const messages: ChatMessage[] = [
            { role: "system", content: agent.systemPrompt },
            { role: "user", content: userMessage },
          ];
          modelUsed = agent.model.premium!;
          extractor = openRouterDelta;
          upstream = await streamChatCompletion({
            model: modelUsed,
            messages,
            apiKey: byokKey!,
            signal: req.signal,
          });
        } else {
          modelUsed = agent.model.host;
          extractor = geminiDelta;
          upstream = await streamGemini({
            model: modelUsed,
            systemPrompt: agent.systemPrompt,
            userMessage,
            apiKey: geminiKey!,
            signal: req.signal,
          });
        }

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          emit(controller, {
            type: "error",
            message: `Falha ao chamar o modelo (HTTP ${upstream.status}). ${detail.slice(0, 200)}`,
          });
          controller.close();
          return;
        }

        await readSSEDeltas(upstream.body, extractor, (text) => {
          emit(controller, { type: "token", text });
        });

        emit(controller, { type: "done", modelUsed });
        controller.close();
      } catch (err) {
        emit(controller, {
          type: "error",
          message: err instanceof Error ? err.message : "Erro inesperado.",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
