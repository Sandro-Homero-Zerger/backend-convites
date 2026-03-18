const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configuração CORS
app.use(cors({
    origin: 'https://convitedomeujeito.shzergerdeveloper.com',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rota de teste
app.get('/', (req, res) => {
    res.send('API do Gerador de Convites funcionando!');
});

// Rota principal para gerar convite
app.post('/gerar-convite', upload.array('fotos', 3), async (req, res) => {
    console.log('Recebida requisição de:', req.headers.origin);
    
    const { nomes, data, local1, endereco1, endereco2 } = req.body;
    const fotos = req.files;
    
    // Caminhos dos arquivos
    const videoModelo = path.join(__dirname, 'modelos', 'casamento.mp4');
    const fontTitulo = path.join(__dirname, 'fonts', 'DancingScript-VariableFont_wght.ttf');
    const fontTexto = path.join(__dirname, 'fonts', 'Montserrat-Regular.ttf');
    const outputPath = path.join(__dirname, 'outputs', `convite-${Date.now()}.mp4`);
    
    // Tempos: 1:42:30 até 1:48:05
    const inicioTexto = 102.5;
    const fimTexto = 108.1;

    // Verificar se o vídeo modelo existe
    if (!fs.existsSync(videoModelo)) {
        return res.status(500).json({ error: 'Vídeo modelo não encontrado' });
    }

    try {
        let command = ffmpeg(videoModelo);
        
        // Adicionar fotos como input
        fotos.forEach(foto => {
            command = command.input(foto.path);
        });
        
        const filtros = [];
        
        // Posicionar FOTO 1 (se existir)
        if (fotos[0]) {
            filtros.push(`[1:v]scale=300:400[f0]`);
            filtros.push(`[0:v][f0]overlay=100:100:enable='between(t,5,10)'[v1]`);
        } else {
            filtros.push(`[0:v]null[v1]`);
        }
        
        // Posicionar FOTO 2 (se existir)
        if (fotos[1]) {
            filtros.push(`[2:v]scale=300:400[f1]`);
            filtros.push(`[v1][f1]overlay=450:100:enable='between(t,15,20)'[v2]`);
        } else {
            filtros.push(`[v1]null[v2]`);
        }
        
        // Posicionar FOTO 3 (se existir)
        if (fotos[2]) {
            filtros.push(`[3:v]scale=300:400[f2]`);
            filtros.push(`[v2][f2]overlay=100:450:enable='between(t,25,30)'[v3]`);
        } else {
            filtros.push(`[v2]null[v3]`);
        }

        // TEXTO 1: Nomes do casal (fonte cursiva)
        filtros.push(`[v3]drawtext=text='${nomes}':fontfile=${fontTitulo}:x=100:y=350:fontsize=72:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v4]`);

        // TEXTO 2: Frase "Venha celebrar conosco!" (fonte cursiva)
        filtros.push(`[v4]drawtext=text='Venha celebrar conosco!':fontfile=${fontTitulo}:x=100:y=440:fontsize=48:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v5]`);

        // TEXTO 3: Data (fonte simples)
        filtros.push(`[v5]drawtext=text='${data}':fontfile=${fontTexto}:x=100:y=520:fontsize=36:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v6]`);

        // TEXTO 4: Local 1
        filtros.push(`[v6]drawtext=text='${local1}':fontfile=${fontTexto}:x=100:y=570:fontsize=24:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v7]`);

        // TEXTO 5: Endereço 1
        filtros.push(`[v7]drawtext=text='${endereco1}':fontfile=${fontTexto}:x=100:y=610:fontsize=20:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v8]`);

        // TEXTO 6: Endereço 2
        filtros.push(`[v8]drawtext=text='${endereco2}':fontfile=${fontTexto}:x=100:y=640:fontsize=20:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${inicioTexto},${fimTexto})'[v9]`);

        // Criar diretório de saída se não existir
        if (!fs.existsSync(path.join(__dirname, 'outputs'))) {
            fs.mkdirSync(path.join(__dirname, 'outputs'));
        }

        // Executar FFmpeg
        await new Promise((resolve, reject) => {
            command
                .complexFilter(filtros, 'v9')
                .audioCodec('aac')
                .videoCodec('libx264')
                .outputOptions(['-preset ultrafast', '-pix_fmt yuv420p'])
                .on('end', () => {
                    console.log('Vídeo gerado com sucesso:', outputPath);
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Erro no FFmpeg:', err);
                    reject(err);
                })
                .save(outputPath);
        });
        
        // Enviar o vídeo para o cliente
        res.sendFile(outputPath, () => {
            // Apagar arquivos temporários após 1 minuto
            setTimeout(() => {
                try {
                    fs.unlinkSync(outputPath);
                    fotos.forEach(foto => fs.unlinkSync(foto.path));
                } catch (e) {
                    console.error('Erro ao apagar arquivos temporários:', e);
                }
            }, 60000);
        });
        
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar vídeo', 
            details: error.message 
        });
    }
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
