const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'https://convitedomeujeito.shzergerdeveloper.com',
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.send('API do Gerador de Convites funcionando!');
});

app.post('/gerar-convite', upload.array('fotos', 3), async (req, res) => {
    try {
        const { nomes, data, local1, endereco1, endereco2 } = req.body;
        const fotos = req.files;
        
        res.json({ 
            message: 'Upload recebido', 
            nomes, 
            data,
            fotos: fotos.length 
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


// testando deploy
// testando deploy - versão final com rota POST