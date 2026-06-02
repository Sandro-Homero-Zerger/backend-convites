const { gerarCodigo } = require('../lib/codigos');

const codigo = gerarCodigo({
    modelo: process.argv[2] || 'casamento',
    maxUsos: Number(process.argv[3]) || 1,
});

console.log('Novo código:', codigo);
console.log('Link:', `https://convitedomeujeito.shzergerdeveloper.com/criar?codigo=${codigo}`);
