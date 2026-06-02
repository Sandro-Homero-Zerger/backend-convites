(function () {
    const host = window.location.hostname;
    const origin = `${window.location.protocol}//${window.location.host}`;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    const isSiteProducao = host.includes('convitedomeujeito');

    // Mesmo servidor (Railway + domínio custom) → API na mesma origem
    // Site estático separado → API no Railway
    let apiUrl = origin;
    if (!isLocal && isSiteProducao && !window.CONVITE_UNIFIED_DEPLOY) {
        apiUrl = 'https://backend-convites-production.up.railway.app';
    }

    window.CONVITE_CONFIG = {
        apiUrl: window.CONVITE_API_OVERRIDE || apiUrl,
        hotmartUrl: 'https://pay.hotmart.com/SEU_LINK_AQUI',
        siteUrl: 'https://convitedomeujeito.shzergerdeveloper.com',
    };
})();
