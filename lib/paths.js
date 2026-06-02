const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

function resolverVideoModelo() {
    const candidatos = [
        path.join(ROOT, 'modelos', 'casamento.mp4'),
        path.join(ROOT, 'modelo-casamento.mp4', '0225(2)', 'casamento.mp4'),
    ];
    return candidatos.find((p) => fs.existsSync(p)) || candidatos[0];
}

function resolverFontsDir() {
    const local = path.join(ROOT, 'fonts');
    if (fs.existsSync(path.join(local, 'DancingScript-VariableFont_wght.ttf'))) {
        return local;
    }
    return process.env.FONTS_DIR || local;
}

function fontPath(nomeRelativo) {
    return path.join(resolverFontsDir(), nomeRelativo);
}

function carregarSyncConfig() {
    const configPath = path.join(ROOT, 'config', 'casamento-sync.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

module.exports = {
    ROOT,
    resolverVideoModelo,
    resolverFontsDir,
    fontPath,
    carregarSyncConfig,
    dirOutputs: path.join(ROOT, 'outputs'),
    dirUploads: path.join(ROOT, 'uploads'),
};
