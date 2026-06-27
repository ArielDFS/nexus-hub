export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

/**
 * Busca web via Tavily (free tier). Retorna os principais resultados.
 * Usado pela ARIA (agente com ferramenta de busca).
 */
export async function tavilySearch(
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 5,
    }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Tavily HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    results?: { title?: string; url?: string; content?: string }[];
  };

  return (data.results ?? []).map((r) => ({
    title: r.title ?? "(sem título)",
    url: r.url ?? "",
    content: r.content ?? "",
  }));
}

/**
 * Monta a mensagem do usuário enriquecida com os resultados de busca,
 * para o agente responder fundamentado e citar as fontes.
 */
export function buildSearchContext(
  question: string,
  results: SearchResult[],
): string {
  if (results.length === 0) {
    return `Pergunta: ${question}\n\n(Nenhum resultado de busca disponível. Responda com cautela e avise que não houve fontes.)`;
  }

  const sources = results
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n${r.content}\nFonte: ${r.url}`,
    )
    .join("\n\n");

  return `Pergunta do usuário: ${question}\n\nResultados de busca web (baseie-se neles e cite as fontes ao final, numeradas):\n\n${sources}`;
}
