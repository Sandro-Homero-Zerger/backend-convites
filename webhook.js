const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { gerarConvite } = require('./lib/gerarConvite');
const { validarCodigo, consumirCodigo, frasePorId } = require('./lib/codigos');
const { dirUploads, ROOT } = require('./lib/paths');

require('./lib/ffmpegPaths');

const app = express();

if (!fs.existsSync(dirUploads)) {
    fs.mkdirSync(dirUploads, { recursive: true });
}

const upload = multer({
    dest: dirUploads,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const allowedOrigins = [
    'https://convitedomeujeito.shzergerdeveloper.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const publicDir = path.join(ROOT, 'public');
app.use(express.static(publicDir));

app.get('/api/config', (req, res) => {
    res.json({
        siteName: 'Convite do Meu Jeito',
        hotmartUrl: process.env.HOTMART_URL || '',
        demoCodigo: process.env.DEMO_CODIGO || '',
    });
});

app.post('/api/validar-codigo', (req, res) => {
    const { codigo } = req.body;
    const resultado = validarCodigo(codigo);
    if (!resultado.valido) {
        return res.status(401).json(resultado);
    }
    res.json(resultado);
});

app.get('/health', (req, res) => {
    const { resolverVideoModelo, resolverFontsDir } = require('./lib/paths');
    res.json({
        ok: true,
        videoModelo: resolverVideoModelo(),
        videoExiste: fs.existsSync(resolverVideoModelo()),
        fontsDir: resolverFontsDir(),
    });
});

app.post('/gerar-convite', upload.array('fotos', 3), async (req, res) => {
    const {
        codigo,
        nomes,
        data,
        local1,
        endereco1,
        endereco2,
        frase,
        modelo,
    } = req.body;
    const fotos = req.files || [];

    const exigeCodigo = process.env.EXIGE_CODIGO !== 'false';
    if (exigeCodigo) {
        const check = validarCodigo(codigo);
        if (!check.valido) {
            return res.status(401).json({
                error: 'Acesso negado',
                details: check.motivo,
            });
        }
        if (modelo && modelo !== check.modelo) {
            return res.status(400).json({
                error: 'Modelo não incluído neste código de acesso',
            });
        }
    }

    try {
        const fraseTexto = frasePorId(frase);
        const outputPath = await gerarConvite({
            fotos,
            nomes,
            data,
            local1: local1 || '',
            endereco1: endereco1 || '',
            endereco2: endereco2 || '',
            fraseTexto,
        });

        if (exigeCodigo) {
            consumirCodigo(codigo);
        }

        res.sendFile(outputPath, () => {
            setTimeout(() => {
                try {
                    fs.unlinkSync(outputPath);
                    fotos.forEach((foto) => fs.unlinkSync(foto.path));
                } catch (e) {
                    console.error('Erro ao apagar temporários:', e);
                }
            }, 60000);
        });
    } catch (error) {
        console.error('Erro ao gerar vídeo:', error);
        res.status(500).json({
            error: 'Erro ao gerar vídeo',
            details: error.message,
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Site: http://localhost:${port}`);
});
