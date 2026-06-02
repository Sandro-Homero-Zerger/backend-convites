(function () {
    const cfg = window.CONVITE_CONFIG || {};
    const API_URL = cfg.apiUrl || '';

    const FRASES_LABEL = {
        romantica: 'Romântica',
        familiar: 'Familiar',
        elegante: 'Elegante',
        alegre: 'Alegre',
    };

    function formatarData(iso) {
        if (!iso) return '';
        const d = new Date(`${iso}T12:00:00`);
        return d.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    function getCodigo() {
        const params = new URLSearchParams(window.location.search);
        return (
            params.get('codigo')
            || sessionStorage.getItem('convite_codigo')
            || ''
        ).trim();
    }

    function salvarCodigo(codigo) {
        sessionStorage.setItem('convite_codigo', codigo);
    }

    async function validarCodigo(codigo) {
        const res = await fetch(`${API_URL}/api/validar-codigo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.motivo || 'Código inválido');
        return data;
    }

    function initCodigoGate() {
        const gate = document.getElementById('codigo-gate');
        const app = document.getElementById('gerador-app');
        const input = document.getElementById('codigo-input');
        const btn = document.getElementById('codigo-validar');
        const msg = document.getElementById('codigo-msg');

        if (!gate) return Promise.resolve(getCodigo());

        return new Promise((resolve) => {
            const codigoUrl = getCodigo();
            if (codigoUrl) input.value = codigoUrl;

            async function tentar() {
                const codigo = input.value.trim();
                if (!codigo) {
                    msg.textContent = 'Informe o código recebido após a compra.';
                    return;
                }
                btn.disabled = true;
                msg.textContent = 'Validando...';
                try {
                    const info = await validarCodigo(codigo);
                    salvarCodigo(codigo);
                    gate.style.display = 'none';
                    if (app) app.style.display = 'block';
                    msg.textContent = '';
                    if (document.getElementById('codigo-info')) {
                        document.getElementById('codigo-info').textContent =
                            `Acesso liberado · ${info.usosRestantes} geração(ões) restante(s)`;
                    }
                    resolve(codigo);
                } catch (err) {
                    msg.textContent = err.message;
                } finally {
                    btn.disabled = false;
                }
            }

            btn.addEventListener('click', tentar);
            if (codigoUrl) tentar();
        });
    }

    function initUploadForm(codigoFixo) {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const previewArea = document.getElementById('preview-area');
        const fileCount = document.getElementById('file-count');
        const submitBtn = document.getElementById('submit-btn');
        const nomes = document.getElementById('nomes');
        const data = document.getElementById('data');
        const modelo = document.getElementById('modelo');
        const frase = document.getElementById('frase');
        const local1 = document.getElementById('local1');
        const endereco1 = document.getElementById('endereco1');
        const endereco2 = document.getElementById('endereco2');
        const codigoHidden = document.getElementById('codigo-hidden');

        let selectedFiles = [];
        let codigoAtual = codigoFixo || getCodigo();

        if (codigoHidden) codigoHidden.value = codigoAtual;

        function updateSubmit() {
            const ok = selectedFiles.length > 0
                && nomes?.value
                && data?.value
                && frase?.value
                && codigoAtual
                && (!modelo || modelo.value);
            if (submitBtn) submitBtn.disabled = !ok;
        }

        function handleFiles(files) {
            const novos = Array.from(files);
            if (selectedFiles.length + novos.length > 3) {
                alert('Máximo de 3 fotos');
                return;
            }
            novos.forEach((file) => {
                if (!file.type.startsWith('image/')) {
                    alert(`"${file.name}" não é imagem`);
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    alert(`"${file.name}" passa de 5MB`);
                    return;
                }
                selectedFiles.push(file);
                const reader = new FileReader();
                const item = document.createElement('div');
                item.className = 'preview-item';
                const idx = selectedFiles.length - 1;
                reader.onload = (e) => {
                    item.innerHTML = `<img src="${e.target.result}" alt=""><button type="button" class="remove-photo" data-i="${idx}">×</button>`;
                    previewArea.appendChild(item);
                    item.querySelector('.remove-photo').onclick = () => {
                        selectedFiles.splice(Number(item.querySelector('.remove-photo').dataset.i), 1);
                        previewArea.innerHTML = '';
                        selectedFiles.forEach((f, i) => {
                            const r = new FileReader();
                            const el = document.createElement('div');
                            el.className = 'preview-item';
                            r.onload = (ev) => {
                                el.innerHTML = `<img src="${ev.target.result}" alt=""><button type="button" class="remove-photo" data-i="${i}">×</button>`;
                                el.querySelector('.remove-photo').onclick = () => {
                                    selectedFiles.splice(i, 1);
                                    previewArea.innerHTML = '';
                                    selectedFiles.forEach((ff, ii) => handleFiles([ff]));
                                };
                                previewArea.appendChild(el);
                            };
                            r.readAsDataURL(f);
                        });
                        updateFileCounter();
                        updateSubmit();
                    };
                };
                reader.readAsDataURL(file);
            });
            updateFileCounter();
            updateSubmit();
        }

        function updateFileCounter() {
            if (fileCount) fileCount.textContent = selectedFiles.length;
        }

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
        }

        [nomes, data, modelo, frase, local1, endereco1, endereco2].forEach((el) => {
            if (el) el.addEventListener('input', updateSubmit);
            if (el) el.addEventListener('change', updateSubmit);
        });

        const form = document.getElementById('upload-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            codigoAtual = codigoHidden?.value || getCodigo();
            if (!codigoAtual) {
                alert('Informe seu código de acesso.');
                return;
            }

            submitBtn.disabled = true;
            const progressContainer = document.querySelector('.progress-container');
            const progressFill = document.getElementById('progress-fill');
            const progressStatus = document.getElementById('progress-status');
            const resultContainer = document.querySelector('.result-container');

            progressContainer.style.display = 'block';
            progressFill.style.width = '10%';
            progressStatus.textContent = 'Preparando...';

            const formData = new FormData();
            formData.append('codigo', codigoAtual);
            formData.append('nomes', nomes.value);
            formData.append('data', formatarData(data.value));
            formData.append('frase', frase.value);
            formData.append('modelo', modelo?.value || 'casamento');
            formData.append('local1', local1?.value || '');
            formData.append('endereco1', endereco1?.value || '');
            formData.append('endereco2', endereco2?.value || '');
            selectedFiles.forEach((f) => formData.append('fotos', f));

            try {
                progressFill.style.width = '35%';
                progressStatus.textContent = 'Enviando fotos...';

                const response = await fetch(`${API_URL}/gerar-convite`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.details || err.error || 'Erro no servidor');
                }

                progressFill.style.width = '75%';
                progressStatus.textContent = 'Gerando vídeo (pode levar 1–2 min)...';

                const videoBlob = await response.blob();
                progressFill.style.width = '100%';
                progressStatus.textContent = 'Pronto!';

                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    document.querySelector('.upload-area')?.style.setProperty('display', 'none');
                    form.style.display = 'none';
                    document.querySelector('.file-counter')?.style.setProperty('display', 'none');
                    resultContainer.style.display = 'block';

                    const videoUrl = URL.createObjectURL(videoBlob);
                    document.getElementById('video-preview').innerHTML =
                        `<video controls playsinline width="100%" style="border-radius:12px"><source src="${videoUrl}" type="video/mp4"></video>`;
                    const dl = document.getElementById('download-btn');
                    dl.href = videoUrl;
                    dl.download = `convite-${Date.now()}.mp4`;
                }, 600);
            } catch (err) {
                alert(err.message || 'Erro ao gerar convite.');
                submitBtn.disabled = false;
                progressContainer.style.display = 'none';
            }
        });

        updateSubmit();
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (cfg.hotmartUrl && cfg.hotmartUrl.includes('hotmart')) {
            document.querySelectorAll('[data-hotmart]').forEach((el) => {
                el.href = cfg.hotmartUrl;
            });
        }

        const codigo = await initCodigoGate();
        initUploadForm(codigo);
    });
})();
