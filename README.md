# 🛸 NEXUS HUB

> Uma plataforma web sci-fi onde **agentes de IA são tripulantes de uma nave**. Você recruta agentes, lança missões (tarefas de IA reais) e acompanha cada um trabalhando no seu módulo — em tempo real, com streaming.

**Gamified AI Agent Hub** · feito por Ariel Ferreira (AFS Intelligence) · `Next.js 15` + `TypeScript`

---

## ✨ O que é

NEXUS HUB apresenta agentes de IA como **personagens** dentro de uma nave-mãe (vista top-down, estilo _FTL_). Cada agente vive em um módulo e executa um tipo de missão com um LLM real. A resposta aparece em **streaming** num console, e — no caso da ARIA — você vê os **passos de busca na web acontecendo** antes da resposta.

É um projeto de portfólio focado em **AI Engineering + Full-Stack + UX**.

## 🤖 Agentes

| Agente | Classe | O que faz | Ferramenta |
|--------|--------|-----------|------------|
| **NEXUS** | SQL Analyst | Linguagem natural → queries SQL precisas e comentadas | — |
| **ARIA** | Research Scout | Pesquisa na web em tempo real e sintetiza com fontes citadas | 🔍 busca (Tavily) |
| **ECHO** | Report Writer | Relatórios, e-mails e documentos profissionais | — |
| **FORGE** | Code Builder | Gera código limpo e explicado (sem execução) | — |
| **PHANTOM** | Summarizer | Condensa textos longos em resumos com pontos-chave | — |

> 3 módulos da nave ficam **vagos**, reservados para agentes futuros (ex.: VEGA, ORACLE).

## 🛠️ Stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS** · **Framer Motion** · **Zustand**
- **LLMs:** Google Gemini (host, free tier) via API direta · Claude via **OpenRouter** (BYOK, opcional)
- **Busca:** Tavily (free tier)
- **Streaming:** `ReadableStream` + protocolo de **eventos NDJSON** (`step` / `token` / `done` / `error`)

## 🏗️ Arquitetura (resumo)

- **MVP 100% client-side** (estado em `localStorage`); o único backend é a API Route que faz **proxy dos LLMs** e da busca.
- **Host** usa Gemini direto (estável e grátis); **modelos premium** (Claude) só com a chave do próprio visitante (BYOK).
- A nave é montada por **código** sobre assets 2D (casco PNG + robôs); estados visuais (idle/working) são CSS.

Decisões de arquitetura documentadas em [CLAUDE.md](./CLAUDE.md) (seção ADRs).

## 🚀 Rodando localmente

```bash
git clone <repo>
cd nexus-hub
npm install
cp .env.local.example .env.local   # preencha as chaves
npm run dev                        # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Obrigatória? | Para quê |
|----------|--------------|----------|
| `GEMINI_API_KEY` | ✅ sim | Host dos agentes — crie grátis em [aistudio.google.com](https://aistudio.google.com/apikey) |
| `TAVILY_API_KEY` | recomendada | Busca web da ARIA — grátis em [tavily.com](https://app.tavily.com/) |
| `OPENROUTER_API_KEY` | opcional | Modelos premium (Claude) via BYOK |

## 📍 Status

🚧 **Em desenvolvimento.** Concluído: a nave, os 5 agentes em streaming, o protocolo de eventos e a busca real da ARIA. **Próximo:** camada de gamificação (XP, níveis, desbloqueios), proteção de custo e deploy.

## 📄 Licença

MIT.

---

<sub>Projeto: NEXUS HUB · AFS Intelligence</sub>
