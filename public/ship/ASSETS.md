# NEXUS HUB — Manifesto de Assets da Nave (2D / FTL)

Guia para **gerar por IA** (Leonardo.ai) os assets 2D da nave. A grade de salas e a coloração dos personagens são feitas por **código** — IA gera peças atômicas (consistentes), o código tila, alinha e tinge. Drop dos PNGs finais em `public/ship/`.

## Decisões travadas (grelha)

- **Arquitetura:** híbrida em camadas (casco + tiles + equipamento + personagem).
- **Estilo:** 2D ilustrado chapado, estilo FTL (NÃO pixel-art).
- **Layout:** nave top-down; **8 módulos** (5 agentes + 3 vagos) em grade 4×2 + **Ponte/Reator**.
- **Personagens:** **robô uniforme** (mesmo chassi) representa cada agente; fica no seu módulo com **micro-animações CSS** (idle flutua; trabalhando se inclina ao console). Cor por agente via **CSS `hue-rotate`** — gera-se 1 só robô (accent ciano) e o código tinge os outros.
- **Cômodos:** personagem **+ equipamento temático** por agente.
- **Estados** (idle/focused/working): **glows CSS**, não assets.

## Direção de arte (style bible — colar em TODO prompt)

> `top-down 3/4 view, flat 2D game art, clean dark outlines, soft cel shading, no perspective, sci-fi, FTL-inspired (original, not copyrighted), transparent background, centered, game asset sprite`
>
> **Paleta:** fundo `#050A14`, cascos/painéis `#0D1B2A`/`#112233`, linhas `#1E3A5F`, **accent ciano `#00F5FF`**, detalhe rust `#C2603A`.
>
> **Regras fixas:** luz de cima, fundo 100% transparente (PNG), peça centralizada/aparada (trim), sem texto. Mesma seed entre peças irmãs.

## Sistema de personagem (o truque de crédito)

Gere **2 sprites** do MESMO robô (corpo metal neutro/cinza + **um** accent emissivo **ciano** — visor/núcleo). O código tinge por agente via `hue-rotate`/`saturate` (corpo cinza quase não muda; só o accent gira de cor):

| Agente | Cor alvo | Filtro CSS aprox. (a afinar) |
|---|---|---|
| NEXUS | ciano `#00F5FF` | nenhum (base) |
| ARIA | violeta `#7B2FBE` | `hue-rotate(70deg) saturate(1.1)` |
| ECHO | gold `#FFD700` | `hue-rotate(150deg) saturate(1.3)` |
| FORGE | vermelho `#FF4C4C` | `hue-rotate(200deg)` |
| PHANTOM | aço `#5A7A94` | `saturate(0.2) brightness(1.05)` |

> Fallback: se o tingimento por CSS ficar ruim, gerar 1 recolor por agente (mais crédito).

## Tamanhos

- Sala (tile): **512×512** (lógico 256 @2x). Equipamento ocupa ~70% central.
- Personagem: **512×512**, corpo ocupa ~60% central.
- Casco externo: **2048×1280**, transparente, centro vazio para a grade.

## Manifesto — gerar nesta ordem (lotes p/ limite diário)

### 🟢 Lote P0 — núcleo jogável (5 peças) — gere primeiro
| Arquivo | Tam. | Prompt (após style bible) |
|---|---|---|
| `hull-exterior.png` | 2048×1280 | `spaceship hull exterior frame only, twin top and bottom engine nacelles with rust-orange stripes, rear thrusters glowing cyan, pointed cockpit nose with cyan window, hollow empty center` |
| `room-floor.png` | 512×512 | `metal deck floor tile, subtle panel lines, dark teal, faintly seamless` |
| `room-frame.png` | 512×512 | `square room walls frame with 4 door slots, rust-orange door connectors, hollow center` |
| `bot-idle.png` | 512×512 | `small sci-fi utility robot, uniform chassis, neutral brushed-metal body, single glowing cyan visor and core, standing idle pose` |
| `bot-working.png` | 512×512 | `same robot leaning forward operating a console, arms active, glowing cyan core, working pose` |

### 🟡 Lote P1 — riqueza temática (7 peças)
| Arquivo | Tam. | Prompt |
|---|---|---|
| `equip-nexus.png` | 512×512 | `server racks and glowing database cores, cyan` |
| `equip-aria.png` | 512×512 | `rotating radar dish and scanner array, violet` |
| `equip-echo.png` | 512×512 | `holographic writing desk and document printer, gold` |
| `equip-forge.png` | 512×512 | `robotic fabricator arm and 3d-printer forge, red` |
| `equip-phantom.png` | 512×512 | `data compactor and archive console, steel grey` |
| `bridge-core.png` | 512×512 | `central reactor core, glowing pulsing cyan energy` |
| `room-empty.png` | 512×512 | `sealed empty room hatch, under-construction warning stripes, dim` |

### ⚪ Lote P2 — opcional / futuro (backlog)
- Poses extras do robô (`bot-alert`, `bot-celebrate`).
- `equip-vega.png`, `equip-oracle.png` (futuros agentes; robô reusa o mesmo chassi tingido).
- Avatares distintos por agente (se um dia trocar robô-uniforme por entidades).

**Total essencial: 12 PNGs** (P0: 5 + P1: 7). Personagens custam só **2 gerações** graças ao tingimento por código.

## Dicas (fugir das 3 armadilhas)

1. **Consistência:** gere peças irmãs (os 5 equipamentos; os 2 bots) na MESMA sessão, style bible idêntico, seed fixa.
2. **Transparência:** peça `transparent background`; se vier fundo, remova e apare (trim).
3. **Tileabilidade:** só `room-floor` precisa ser quase-seamless; o resto é peça avulsa centralizada.

## Integração (código)

`ShipView` empilha: `hull-exterior` (fundo) → grade 4×2 de `room-floor`+`room-frame` (8 células) → nas 5 ocupadas: `equip-*` + robô (`bot-idle`/`bot-working`, tingido por agente) / nas 3 vagas: `room-empty` → `bridge-core` → glows CSS por estado → hotspots clicáveis por célula. A nave SVG atual é placeholder até os PNGs chegarem.

---

# Guia de configuração — Leonardo.ai

Objetivo: máxima **consistência** entre as 12 peças + economia de **crédito diário**.

## Modelo & presets
- **Modelo:** um finetune de ilustração/flat. Tente **"Leonardo Phoenix"** ou **"Leonardo Diffusion XL"** / **"AlbedoBase XL"**. Na galeria de modelos, busque por *"flat illustration"* / *"2D game asset"* se houver community model.
- **Preset Style:** `Illustration` ou `Concept Art` (NÃO `Photography`/`Cinematic`).
- **Alchemy / PhotoReal:** **DESLIGADO** ao iterar (consome muito mais crédito). Ligue só na geração final se quiser nitidez extra.
- **Prompt Magic:** opcional; se ligar, mantenha leve.

## Settings por geração
- **Transparency / PNG (alpha):** **LIGADO** para personagem, equipamento, ponte, sala-vaga (objeto único centralizado). Para `hull-exterior` também (centro vazio). Se o modelo não suportar alpha, gere em fundo chapado e use **Remove Background** (Canvas) depois.
- **Tiling:** **LIGADO** só para `room-floor` (chão seamless). Desligado no resto.
- **Dimensões:** quadrado **512×512** para sprites/equipamento/robô; **wide ~1360×768** para `hull-exterior` (depois upscale).
- **Guidance (CFG):** ~7.
- **Imagens por geração:** **1–2** enquanto afina o prompt; só suba pra 4 quando o prompt estiver redondo (cada imagem = crédito).
- **Seed fixa:** ligue **Fixed Seed** e reuse a MESMA seed nas peças irmãs (os 5 equipamentos; as 2 poses do robô).

## A chave da consistência — Image Guidance
1. Gere primeiro **1 peça-âncora** que você ame (sugestão: `bot-idle`). Anote a **seed**.
2. Em todas as peças seguintes, use **Image Guidance → Style Reference**: suba a peça-âncora como referência de estilo (peso médio ~0.4–0.6). Isso "cola" o render de todas as peças no mesmo estilo.
3. Para `bot-working` (mesmo robô, outra pose): use a `bot-idle` como **Character Reference** (se disponível) ou **Image-to-Image** com força baixa (~0.3) + Style Reference. Mantém o MESMO chassi.
4. Equipamentos: mesma Style Reference da âncora → todos combinam entre si e com o robô.

## Negative prompt (colar sempre)
> `photo, realistic, 3d render, perspective, cast shadow on floor, background scenery, text, watermark, multiple objects, blurry, jpeg artifacts`

## Fluxo recomendado p/ o limite diário
- **Dia 1 (Lote P0):** trava o estilo. Gere `bot-idle` (âncora) → `bot-working` → `room-floor` (tiling) → `room-frame` → `hull-exterior`. Com isso a nave já fecha.
- **Dia 2+ (Lote P1):** os 5 `equip-*` + `bridge-core` + `room-empty`, todos com a Style Reference do dia 1.
- Iterar barato: use um modelo **Lightning/Turbo** pra achar a composição, depois refaça a final no modelo bom.

## Pós-processo
- Confirme **fundo transparente** real (sem halo). Se houver, Remove Background.
- **Trim** (aparar) e centralizar cada sprite.
- Exporte PNG. Nomeie EXATAMENTE como na tabela do manifesto e jogue em `public/ship/`.
