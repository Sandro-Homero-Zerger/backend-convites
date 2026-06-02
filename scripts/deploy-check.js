const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const checks = [];

function ok(msg) {
    checks.push({ ok: true, msg });
}

function fail(msg) {
    checks.push({ ok: false, msg });
}

const video = path.join(ROOT, 'modelos', 'casamento.mp4');
if (fs.existsSync(video)) {
    ok(`Vídeo modelo: ${(fs.statSync(video).size / 1e6).toFixed(1)} MB`);
} else {
    fail('Falta modelos/casamento.mp4 (rode: git lfs pull)');
}

const font = path.join(ROOT, 'fonts', 'DancingScript-VariableFont_wght.ttf');
if (fs.existsSync(font)) ok('Fontes OK');
else fail('Falta fonts/');

['public/index.html', 'public/criar.html', 'public/hotmart.html', 'webhook.js', 'lib/gerarConvite.js'].forEach((f) => {
    if (fs.existsSync(path.join(ROOT, f))) ok(f);
    else fail(`Falta ${f}`);
});

if (fs.existsSync(path.join(ROOT, 'node_modules'))) ok('node_modules instalado');
else fail('Rode: npm install');

const config = fs.readFileSync(path.join(ROOT, 'public/js/config.js'), 'utf8');
if (config.includes('SEU_LINK_AQUI')) {
    fail('Configure o link Hotmart em public/js/config.js');
} else {
    ok('Link Hotmart configurado');
}

console.log('\n=== Verificação pré-deploy ===\n');
checks.forEach((c) => console.log(c.ok ? '✓' : '✗', c.msg));
const erros = checks.filter((c) => !c.ok);
console.log(erros.length ? `\n${erros.length} item(ns) a corrigir.\n` : '\nPronto para publicar.\n');
process.exit(erros.length ? 1 : 0);
