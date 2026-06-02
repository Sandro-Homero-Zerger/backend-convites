document.addEventListener('DOMContentLoaded', () => {
    const layer1 = document.getElementById('layer1');
    const layer2 = document.getElementById('layer2');
    const layer3 = document.getElementById('layer3');
    const sections = document.querySelectorAll('section[id]');
    const parallaxContainer = document.querySelector('.parallax-container');

    if (!parallaxContainer) return;

    let currentTheme = 'casamento';

    if (window.innerWidth > 768 && layer1 && layer2 && layer3) {
        let targetX = 0;
        let currentX = 0;

        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            targetX = (mouseX - 0.5) * 100;
        });

        function animate() {
            currentX += (targetX - currentX) * 0.05;
            layer1.style.transform = `translateX(${currentX * 0.3}px)`;
            layer2.style.transform = `translateX(${currentX * 0.6}px)`;
            layer3.style.transform = `translateX(${currentX}px)`;
            requestAnimationFrame(animate);
        }
        animate();
    }

    function changeTheme(theme) {
        if (!theme || currentTheme === theme) return;
        parallaxContainer.classList.remove(`theme-${currentTheme}`);
        parallaxContainer.classList.add(`theme-${theme}`);
        currentTheme = theme;
    }

    function detectActiveSection() {
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const h = window.innerHeight;
            if (rect.top < h * 0.6 && rect.bottom > h * 0.4 && section.id) {
                changeTheme(section.id);
            }
        });
    }

    parallaxContainer.classList.add('theme-casamento');
    window.addEventListener('scroll', detectActiveSection);
    window.addEventListener('load', detectActiveSection);

    document.querySelectorAll('.menu-fixo a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
