const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API do Gerador de Convites funcionando!');
});

app.post('/gerar-convite', (req, res) => {
    res.json({ message: 'Endpoint recebido com sucesso' });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});