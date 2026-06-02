const path = require('path');
const fs = require('fs');
const { gerarConvite } = require('../lib/gerarConvite');

require('../lib/ffmpegPaths');

const fotosTeste = [
    'Namorados.jpg',
    'Namorados2.jpg',
    'Namorados3.jpg',
].map((nome) => path.join(__dirname, '..', nome));

const fotos = fotosTeste
    .filter((p) => fs.existsSync(p))
    .map((p) => ({ path: p }));

if (fotos.length === 0) {
    console.error('Nenhuma foto de teste encontrada (Namorados*.jpg).');
    process.exit(1);
}

gerarConvite({
    fotos,
    nomes: 'Maria & João',
    data: '15 de Junho de 2026',
    local1: 'Igreja Nossa Senhora',
    endereco1: 'Rua das Flores, 123',
    endereco2: 'São Paulo - SP',
})
    .then((output) => {
        console.log('Vídeo gerado:', output);
    })
    .catch((err) => {
        console.error('Falha:', err.message);
        process.exit(1);
    });
