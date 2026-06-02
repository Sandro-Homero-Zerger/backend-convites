const path = require('path');
const fs = require('fs');
const ffmpeg = require('../lib/ffmpegPaths');
const { resolverVideoModelo, carregarSyncConfig } = require('../lib/paths');

const video = resolverVideoModelo();
const sync = carregarSyncConfig();
const outDir = path.join(__dirname, '..', 'debug', 'frames');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const momentos = sync.fotos.map((slot) => ({
    nome: `slot${slot.slot}_${slot.inicio}-${slot.fim}s`,
    tempo: (slot.inicio + slot.fim) / 2,
}));

let chain = Promise.resolve();

momentos.forEach(({ nome, tempo }) => {
    chain = chain.then(() => new Promise((resolve, reject) => {
        const destino = path.join(outDir, `${nome}.jpg`);
        ffmpeg(video)
            .seekInput(tempo)
            .frames(1)
            .output(destino)
            .on('end', () => {
                console.log('Frame:', destino);
                resolve();
            })
            .on('error', reject)
            .run();
    }));
});

chain.catch((err) => {
    console.error(err);
    process.exit(1);
});
