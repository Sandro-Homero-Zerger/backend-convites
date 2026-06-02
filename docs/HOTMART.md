# Hotmart — textos e links

## Link na página de obrigado (copiar e colar)

**Título:** Crie seu convite agora

**Texto:**
```
Parabéns pela compra!

1. Acesse: https://convitedomeujeito.shzergerdeveloper.com/criar
2. Informe o código: {{CODIGO_DO_CLIENTE}}
3. Envie até 3 fotos e preencha os dados do evento
4. Baixe o vídeo e envie aos convidados

Dúvidas: seu@email.com
```

Substitua `{{CODIGO_DO_CLIENTE}}` pelo código que você gerar para cada compra (ou integração automática).

## URL do checkout

Edite `public/js/config.js` ou variável de ambiente no deploy:

```
HOTMART_URL=https://pay.hotmart.com/SEU_PRODUTO
```

## Código de demonstração

`DEMO-CASAMENTO` — até 10 usos (arquivo `data/codigos.json`). Remova ou desative em produção.

## Gerar código manualmente (Node)

```bash
node -e "const c=require('./lib/codigos'); console.log(c.gerarCodigo());"
```

## Página de vendas externa

Use como URL externa na Hotmart: `https://convitedomeujeito.shzergerdeveloper.com/hotmart.html`

Ou incorpore o conteúdo de `hotmart.html` na descrição do produto.

## Desativar exigência de código (só testes)

```
EXIGE_CODIGO=false
```
