# Publicar o Convite do Meu Jeito — passo a passo

Guia do zero até o site no ar + Hotmart.

---

## Visão geral

| Peça | O quê | Onde fica |
|------|--------|-----------|
| Site + gerador | `public/` (index, criar, hotmart) | Mesmo servidor da API |
| API + vídeo | `webhook.js`, `lib/`, `modelos/casamento.mp4` | Railway |
| Códigos de compra | `data/codigos.json` | No servidor (ou gerados por script) |
| Pagamento | Hotmart | Link em `public/js/config.js` |

**URLs finais**

- Site: https://convitedomeujeito.shzergerdeveloper.com  
- Criar convite: https://convitedomeujeito.shzergerdeveloper.com/criar.html  
- Oferta Hotmart: https://convitedomeujeito.shzergerdeveloper.com/hotmart.html  
- API (se separada): https://backend-convites-production.up.railway.app  

---

## Parte 1 — Enviar código para o GitHub

No PowerShell, na pasta do projeto:

```powershell
cd C:\ConviteDoMeuJeito
git add .
git status
git commit -m "Site completo, gerador com código Hotmart e API FFmpeg"
git push origin main
```

Se pedir **Git LFS** para o vídeo:

```powershell
git lfs install
git lfs track "modelos/casamento.mp4"
git add .gitattributes modelos/casamento.mp4
git commit -m "Vídeo modelo via Git LFS"
git push origin main
```

Repositório: https://github.com/Sandro-Homero-Zerger/backend-convites

---

## Parte 2 — Railway (API + site juntos)

1. Acesse https://railway.app e entre com GitHub.  
2. **New Project** → **Deploy from GitHub repo** → `backend-convites`.  
3. Se já existir o projeto antigo, abra-o e faça **Redeploy** após o `git push`.

### Variáveis de ambiente (Settings → Variables)

| Variável | Valor |
|----------|--------|
| `PORT` | (Railway define automaticamente; pode deixar vazio) |
| `CORS_ORIGIN` | `https://convitedomeujeito.shzergerdeveloper.com` |
| `EXIGE_CODIGO` | `true` |
| `HOTMART_URL` | seu link `https://pay.hotmart.com/...` |

### Build (se o vídeo não aparecer no deploy)

Em **Settings → Build**, comando de build customizado:

```bash
git lfs pull && npm install
```

Start command (já no `package.json`):

```bash
npm start
```

### Domínio customizado no Railway

1. **Settings → Networking → Custom Domain**  
2. Adicione: `convitedomeujeito.shzergerdeveloper.com`  
3. No painel DNS do seu domínio (`shzergerdeveloper.com`), crie o CNAME que o Railway indicar.

Depois disso, atualize `public/js/config.js` para a API no **mesmo domínio** (já preparado se usar domínio único).

---

## Parte 3 — DNS (se o site ainda estiver em outro host)

**Opção A — Tudo no Railway (recomendado)**  
- Aponte `convitedomeujeito` (subdomínio) para o Railway.  
- Remova/arquive o HTML antigo no host anterior.

**Opção B — Site estático + API no Railway**  
- Envie só a pasta `public/` para o host atual (FTP/Git do `shzergerdeveloper`).  
- Mantenha `config.js` com API = `https://backend-convites-production.up.railway.app`.

---

## Parte 4 — Testar antes de vender

1. Abra `/health` — deve retornar `"ok": true` e `"videoExiste": true`.  
2. Abra `/criar.html` e use o código **`DEMO-CASAMENTO`**.  
3. Envie 3 fotos de teste e gere o vídeo.  
4. Confira download do MP4.

Remova ou zere `DEMO-CASAMENTO` em produção (`data/codigos.json`).

---

## Parte 5 — Hotmart

1. Crie o produto digital na Hotmart.  
2. **Página de vendas externa:**  
   `https://convitedomeujeito.shzergerdeveloper.com/hotmart.html`  
3. **Página de obrigado** — cole o texto de `docs/HOTMART.md`.  
4. Para cada compra, gere um código:

```powershell
node scripts/admin-gerar-codigo.js
```

Envie o link: `https://convitedomeujeito.shzergerdeveloper.com/criar?codigo=CDMJ-XXXXXX`

5. Em `public/js/config.js`, substitua `SEU_LINK_AQUI` pelo checkout Hotmart real e faça `git push` de novo.

---

## Parte 6 — Checklist final

- [ ] `git push` feito  
- [ ] Railway com deploy verde  
- [ ] `/health` com vídeo OK  
- [ ] Domínio abrindo `/` e `/criar.html`  
- [ ] Geração de vídeo com código de teste OK  
- [ ] Link Hotmart no site  
- [ ] Página de obrigado com link + código  
- [ ] Código demo desativado  

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Vídeo modelo não encontrado | `git lfs pull` no build do Railway; confira `modelos/casamento.mp4` |
| CORS bloqueado | `CORS_ORIGIN` = URL exata do site (com https) |
| Código inválido | Gere novo com `admin-gerar-codigo.js` ou edite `data/codigos.json` |
| Geração lenta | Normal (1–2 min); FFmpeg no Railway é pesado — plano com RAM suficiente |

---

## Comandos úteis

```powershell
npm start                    # local: http://localhost:3000
npm run test:gerar           # teste de vídeo
node scripts/admin-gerar-codigo.js   # novo código cliente
```

Suporte ao projeto: este arquivo + `README.md` + `docs/HOTMART.md`.
