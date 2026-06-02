const path = require('path');
const fs = require('fs');
const ffmpeg = require('./ffmpegPaths');
const {
    resolverVideoModelo,
    fontPath,
    carregarSyncConfig,
    dirOutputs,
} = require('./paths');

function escapeDrawtext(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/:/g, '\\:');
}

function fontfileParaFfmpeg(caminho) {
    return caminho.replace(/\\/g, '/').replace(/:/g, '\\:');
}

function montarFiltros({ fotos, nomes, data, local1, endereco1, endereco2, fraseTexto }) {
    const sync = carregarSyncConfig();
    const fontTitulo = fontfileParaFfmpeg(
        fontPath('DancingScript-VariableFont_wght.ttf')
    );
    const fontTexto = fontfileParaFfmpeg(
        fontPath('Montserrat/static/Montserrat-Regular.ttf')
    );

    const filtros = [];
    let videoAtual = '0:v';

    fotos.forEach((foto, i) => {
        if (!foto) return;
        const slot = sync.fotos[i];
        if (!slot) return;

        const inputIndex = i + 1;
        const fotoLabel = `f${i}`;
        const outLabel = `v${i + 1}`;

        filtros.push(
            `[${inputIndex}:v]scale=${slot.largura}:${slot.altura}:force_original_aspect_ratio=increase,crop=${slot.largura}:${slot.altura}[${fotoLabel}]`
        );
        filtros.push(
            `[${videoAtual}][${fotoLabel}]overlay=${slot.x}:${slot.y}:enable='between(t,${slot.inicio},${slot.fim})'[${outLabel}]`
        );
        videoAtual = outLabel;
    });

    if (fotos.length === 0) {
        filtros.push('[0:v]null[v0]');
        videoAtual = 'v0';
    }

    const { texto } = sync;
    const t = `between(t,${texto.inicio},${texto.fim})`;
    const frase = fraseTexto || texto.frase.texto;

    filtros.push(
        `[${videoAtual}]drawtext=text='${escapeDrawtext(nomes)}':fontfile=${fontTitulo}:x=${texto.nomes.x}:y=${texto.nomes.y}:fontsize=${texto.nomes.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v4]`
    );
    filtros.push(
        `[v4]drawtext=text='${escapeDrawtext(frase)}':fontfile=${fontTitulo}:x=${texto.frase.x}:y=${texto.frase.y}:fontsize=${texto.frase.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v5]`
    );
    filtros.push(
        `[v5]drawtext=text='${escapeDrawtext(data)}':fontfile=${fontTexto}:x=${texto.data.x}:y=${texto.data.y}:fontsize=${texto.data.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v6]`
    );
    filtros.push(
        `[v6]drawtext=text='${escapeDrawtext(local1)}':fontfile=${fontTexto}:x=${texto.local1.x}:y=${texto.local1.y}:fontsize=${texto.local1.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v7]`
    );
    filtros.push(
        `[v7]drawtext=text='${escapeDrawtext(endereco1)}':fontfile=${fontTexto}:x=${texto.endereco1.x}:y=${texto.endereco1.y}:fontsize=${texto.endereco1.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v8]`
    );
    filtros.push(
        `[v8]drawtext=text='${escapeDrawtext(endereco2)}':fontfile=${fontTexto}:x=${texto.endereco2.x}:y=${texto.endereco2.y}:fontsize=${texto.endereco2.fontsize}:fontcolor=white:borderw=2:bordercolor=black:enable='${t}'[v9]`
    );

    return filtros;
}

async function gerarConvite({ fotos, nomes, data, local1, endereco1, endereco2, fraseTexto }) {
    const videoModelo = resolverVideoModelo();
    if (!fs.existsSync(videoModelo)) {
        throw new Error(`Vídeo modelo não encontrado: ${videoModelo}`);
    }

    const fontTitulo = fontPath('DancingScript-VariableFont_wght.ttf');
    const fontTexto = fontPath('Montserrat/static/Montserrat-Regular.ttf');
    if (!fs.existsSync(fontTitulo) || !fs.existsSync(fontTexto)) {
        throw new Error('Fontes não encontradas. Copie a pasta fonts/ para o projeto.');
    }

    if (!fs.existsSync(dirOutputs)) {
        fs.mkdirSync(dirOutputs, { recursive: true });
    }

    const outputPath = path.join(dirOutputs, `convite-${Date.now()}.mp4`);
    const filtros = montarFiltros({
        fotos,
        nomes,
        data,
        local1,
        endereco1,
        endereco2,
        fraseTexto,
    });

    let command = ffmpeg(videoModelo);
    fotos.forEach((foto) => command.input(foto.path));

    await new Promise((resolve, reject) => {
        command
            .complexFilter(filtros, 'v9')
            .outputOptions(['-map', '0:a?'])
            .audioCodec('copy')
            .videoCodec('libx264')
            .outputOptions(['-preset', 'ultrafast', '-pix_fmt', 'yuv420p'])
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
    });

    return outputPath;
}

module.exports = { gerarConvite, montarFiltros };
