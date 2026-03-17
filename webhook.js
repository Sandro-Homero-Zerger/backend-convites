const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/gerar-convite', upload.array('fotos', 3), async (req, res) => {
    const { nomes, data, local1, endereco1, endereco2 } = req.body;
    const fotos = req.files;
    
    // Caminhos
    const videoModelo = path.join(__dirname, 'modelos', 'casamento.mp4');
    const fontTitulo = '/app/fonts/DancingScript-VariableFont_wght.ttf';
    const fontTexto = '/app/fonts/Montserrat-Regular.ttf';
    const outputPath = path.join(__dirname, 'outputs', `convite-${Date.now()}.mp4`);
    
    // Tempos: 1:42:30 até 1:48:05
    const inicioTexto = 102.5;
    const fimTexto = 108.1;

    try {
        let command = ffmpeg(videoModelo);
        
        // Adicionar fotos
        fotos.forEach(foto => {
            command = command.input(foto.path);
        });
        
        const filtros = [];
        
        // Fotos (ajuste os tempos conforme necessário)
        if (fotos[0]) {
            filtros.push(`[1:v]scale=300:400[f0]`);
            filtros.push(`[0:v][f0]overlay=100:100:enable='between(t,5,10)'[v1]`);
        } else {
            filtros.push(`[0:v]null[v1]`);
        }
        
        if (fotos[1]) {
            filtros.push(`[2:v]scale=300:400[f1]`);
            filtros.push(`[v1][f1]overlay=450:100:enable='between(t,15,20)'[v2]`);
        } else {
            filtros.push(`[v1]null[v2]`);
        }
        
        if (fotos[2]) {
            filtros.push(`[3:v]scale=300:400[f2]`);
            filtros.push(`[v2][f2]overlay=100:450:enable='between(t,25,30)'[v3]`);
        } else {
            filtros.push(`[v2]null[v3]`);
        }

        // TEXTOS NO CLIPE FINAL
        // Título (nomes)
        filtros.push(`[v3]drawtext=text='${nomes}':fontfile=${fontTitulo}:x=100:y=350:fontsize=72:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v4]`);

        // Frase
        filtros.push(`[v4]drawtext=text='Venha celebrar conosco!':fontfile=${fontTitulo}:x=100:y=440:fontsize=48:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v5]`);

        // Data
        filtros.push(`[v5]drawtext=text='${data}':fontfile=${fontTexto}:x=100:y=520:fontsize=36:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v6]`);

        // Local 1
        filtros.push(`[v6]drawtext=text='${local1}':fontfile=${fontTexto}:x=100:y=570:fontsize=24:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v7]`);

        // Endereço 1
        filtros.push(`[v7]drawtext=text='${endereco1}':fontfile=${fontTexto}:x=100:y=610:fontsize=20:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v8]`);

        // Endereço 2
        filtros.push(`[v8]drawtext=text='${endereco2}':fontfile=${fontTexto}:x=100:y=640:fontsize=20:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v9]`);

        // Executar FFmpeg
        await new Promise((resolve, reject) => {
            command
                .complexFilter(filtros, 'v9')
                .audioCodec('aac')
                .videoCodec('libx264')
                .outputOptions(['-preset ultrafast', '-pix_fmt yuv420p'])
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });
        
        res.sendFile(outputPath, () => {
            setTimeout(() => {
                fs.unlinkSync(outputPath);
                fotos.forEach(foto => fs.unlinkSync(foto.path));
            }, 60000);
        });
        
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('Erro ao gerar vídeo');
    }
});

app.listen(3000);
