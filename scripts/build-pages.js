const fs = require('fs');
const path = require('path');

const public = path.join(__dirname, '..', 'public');
let body = fs.readFileSync(path.join(public, '_body.html'), 'utf8');

body = body.replace(/<script>[\s\S]*?<\/script>/, '');
body = body.replace(/ð[\s\S]*?/g, '');
body = body.replace(/<a href="#casamento">[^<]*<\/a>/, '<a href="#casamento">Casamento</a>');
body = body.replace(/<a href="#aniversario">[^<]*<\/a>/, '<a href="#aniversario">Aniversário</a>');
body = body.replace(/<a href="#debutante">[^<]*<\/a>/, '<a href="#debutante">Debutante</a>');
body = body.replace(/<a href="#formatura">[^<]*<\/a>/, '<a href="#formatura">Formatura</a>');
body = body.replace(/<a href="#homenagem">[^<]*<\/a>/, '<a href="#homenagem">Homenagem</a>');
body = body.replace(
    /<nav class="menu-fixo">/,
    `<nav class="menu-fixo">
        <a href="/hotmart.html" class="menu-hotmart">Comprar</a>`
);
body = body.replace(
    /<a href="#upload">[^<]*<\/a>\s*<!--[^>]*-->/,
    '<a href="/criar.html" class="menu-cta">Criar Convite</a>'
);
body = body.replace(
    /onclick="window\.location\.href='#upload'"/g,
    'onclick="window.location.href=\'/criar.html\'"'
);

const uploadSection = `
        <section id="destaque" class="hero-banner">
            <div class="hero-inner">
                <p class="hero-tag">Novidade · Vídeo personalizado</p>
                <h1>Convite de casamento em vídeo com as fotos de vocês</h1>
                <p class="hero-text">Três momentos especiais do filme recebem suas fotos. Pronto para enviar no WhatsApp em minutos.</p>
                <div class="hero-actions">
                    <a href="/criar.html" class="btn btn-gold">Já comprei — criar meu convite</a>
                    <a href="/hotmart.html" class="btn btn-outline" data-hotmart>Comprar na Hotmart</a>
                    <a href="#casamento" class="btn btn-ghost">Ver modelos</a>
                </div>
            </div>
        </section>
`;

const uploadReplace = `
        <section id="como-funciona">
            <div class="upload-container steps-card">
                <h2>Como funciona</h2>
                <ol class="steps-list">
                    <li>Compre na Hotmart e receba seu código por e-mail</li>
                    <li>Acesse <strong>/criar</strong> e envie até 3 fotos</li>
                    <li>Preencha nomes, data e local do evento</li>
                    <li>Baixe o vídeo MP4 e compartilhe com os convidados</li>
                </ol>
                <div class="hero-actions" style="margin-top:24px">
                    <a href="/criar.html" class="btn btn-gold">Criar convite agora</a>
                    <a href="/hotmart.html" class="btn btn-outline" data-hotmart>Ver oferta</a>
                </div>
                <p class="demo-hint">Teste interno: código <code>DEMO-CASAMENTO</code></p>
            </div>
        </section>
`;

body = body.replace(/<!-- ===== NOVA[\s\S]*?<\/section>\s*<\/div>/, uploadReplace + '\n    </div>');
body = body.replace(
    '<div class="content">',
    `<div class="content">${uploadSection}`
);

const head = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Convites digitais em vídeo — casamento e eventos. Personalize com suas fotos.">
    <title>Convite do Meu Jeito — Convites Elegantes em Vídeo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/site.css">
    <link rel="stylesheet" href="/css/extras.css">
</head>
<body>
`;

const foot = `
    <footer class="site-footer">
        <p>Convite do Meu Jeito · <a href="/hotmart.html">Oferta Hotmart</a> · <a href="/criar.html">Criar convite</a></p>
    </footer>
    <script src="/js/config.js"></script>
    <script src="/js/parallax.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(public, 'index.html'), head + body + foot, 'utf8');
console.log('index.html gerado');
