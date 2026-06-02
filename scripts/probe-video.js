const path = require('path');
const ffmpeg = require('../lib/ffmpegPaths');
const { resolverVideoModelo } = require('../lib/paths');

const video = resolverVideoModelo();

ffmpeg.ffprobe(video, (err, meta) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    const stream = meta.streams.find((s) => s.codec_type === 'video');
    console.log(JSON.stringify({
        arquivo: video,
        duracao: meta.format.duration,
        largura: stream.width,
        altura: stream.height,
        proporcao: stream.display_aspect_ratio,
    }, null, 2));
});
