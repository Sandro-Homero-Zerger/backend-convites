# Convite do Meu Jeito — gerador de vídeo (casamento)

Backend que personaliza o vídeo `casamento.mp4` com até **3 fotos** do cliente e textos (nomes, data, local).

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `modelos/casamento.mp4` | Vídeo base (1080×1920, ~1:48) |
| `config/casamento-sync.json` | Tempos e posições (fotos + textos) |
| `lib/gerarConvite.js` | Montagem FFmpeg |
| `webhook.js` | API HTTP |
| `fonts/` | Dancing Script + Montserrat |

## Sincronização das fotos

| Espaço | Intervalo | Comportamento |
|--------|-----------|---------------|
| 1º | 13 s → 18 s | Tela cheia (foto cobre o frame) |
| 2º | 57 s → 1:02 | Tela cheia |
| 3º | 1:23 → 1:28 | Tela cheia |

Textos aparecem entre **1:42,5** e **1:48,1** (ajuste em `config/casamento-sync.json`).

## Site (páginas)

| URL | Função |
|-----|--------|
| `/` | Vitrine (igual ao site publicado) + destaque casamento |
| `/criar.html` | Gerador com código Hotmart |
| `/hotmart.html` | Página de oferta para link externo na Hotmart |

Textos para página de obrigado: `docs/HOTMART.md`

## Comandos

```bash
npm install
npm start              # Site + API na porta 3000
npm run build:pages    # regenera index.html a partir do template
npm run probe          # informações do vídeo
npm run frames         # extrai frames dos 3 slots (debug/frames)
npm run test:gerar     # gera vídeo de teste com Namorados*.jpg
node scripts/admin-gerar-codigo.js   # gera código de acesso
```

## API

`POST /gerar-convite` — `multipart/form-data`

- `fotos` — até 3 imagens (ordem = slot 1, 2, 3)
- `nomes`, `data`, `local1`, `endereco1`, `endereco2` — campos de texto

Resposta: arquivo MP4.

`GET /health` — verifica vídeo e fontes.

## Deploy (backend-convites no GitHub)

Repositório espelhado em `Documents/GitHub/backend-convites`. O vídeo está no **Git LFS** (`modelos/casamento.mp4`). No servidor:

1. `git lfs pull`
2. `npm install` (FFmpeg vem via `@ffmpeg-installer/ffmpeg`)
3. `npm start`

Variáveis opcionais: `PORT`, `CORS_ORIGIN`, `FFMPEG_PATH`, `FONTS_DIR`.

## Ajuste fino

Edite `config/casamento-sync.json` (tempos, `x`/`y`, fontes). Depois rode `npm run test:gerar` e confira em `outputs/`.
