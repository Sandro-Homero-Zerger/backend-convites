const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CODIGOS_PATH = path.join(__dirname, '..', 'data', 'codigos.json');

const FRASES = {
    romantica: 'Com amor, convidamos você para celebrar conosco!',
    familiar: 'Venha celebrar com a nossa família!',
    elegante: 'Venha celebrar conosco!',
    alegre: 'Vamos comemorar juntos este momento especial!',
};

function carregarCodigos() {
    if (!fs.existsSync(CODIGOS_PATH)) {
        return { codigos: {} };
    }
    return JSON.parse(fs.readFileSync(CODIGOS_PATH, 'utf8'));
}

function salvarCodigos(data) {
    const dir = path.dirname(CODIGOS_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CODIGOS_PATH, JSON.stringify(data, null, 2));
}

function normalizarCodigo(codigo) {
    return String(codigo || '').trim().toUpperCase();
}

function validarCodigo(codigo) {
    const key = normalizarCodigo(codigo);
    if (!key) {
        return { valido: false, motivo: 'Código vazio' };
    }

    const db = carregarCodigos();
    const entrada = db.codigos[key];

    if (!entrada) {
        return { valido: false, motivo: 'Código inválido ou expirado' };
    }

    if (entrada.expiraEm && Date.now() > new Date(entrada.expiraEm).getTime()) {
        return { valido: false, motivo: 'Código expirado' };
    }

    const usos = entrada.usos || 0;
    const maxUsos = entrada.maxUsos ?? 1;

    if (usos >= maxUsos) {
        return { valido: false, motivo: 'Código já utilizado' };
    }

    return {
        valido: true,
        codigo: key,
        modelo: entrada.modelo || 'casamento',
        usosRestantes: maxUsos - usos,
    };
}

function consumirCodigo(codigo) {
    const key = normalizarCodigo(codigo);
    const db = carregarCodigos();
    const entrada = db.codigos[key];

    if (!entrada) {
        throw new Error('Código inválido');
    }

    entrada.usos = (entrada.usos || 0) + 1;
    entrada.ultimoUso = new Date().toISOString();
    db.codigos[key] = entrada;
    salvarCodigos(db);
}

function gerarCodigo({ modelo = 'casamento', maxUsos = 1, prefixo = 'CDMJ' } = {}) {
    const sufixo = crypto.randomBytes(3).toString('hex').toUpperCase();
    const codigo = `${prefixo}-${sufixo}`;
    const db = carregarCodigos();

    db.codigos[codigo] = {
        modelo,
        maxUsos,
        usos: 0,
        criadoEm: new Date().toISOString(),
    };

    salvarCodigos(db);
    return codigo;
}

function frasePorId(fraseId) {
    return FRASES[fraseId] || FRASES.elegante;
}

module.exports = {
    validarCodigo,
    consumirCodigo,
    gerarCodigo,
    frasePorId,
    FRASES,
    CODIGOS_PATH,
};
