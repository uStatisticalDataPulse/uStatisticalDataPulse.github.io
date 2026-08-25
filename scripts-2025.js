document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scroll for navigation links on the main page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if the link is on the same page
            const currentPath = window.location.pathname.split('/').pop();
            const linkPath = this.pathname.split('/').pop();
            
            if (currentPath === linkPath || linkPath === '') {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                // Hide mobile menu after click
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // --- CÓDIGO ACTUALIZADO PARA EL ACORDEÓN DE LA AGENDA ---
    const allAccordionItems = document.querySelectorAll('.accordion-item');

    allAccordionItems.forEach(item => {
        const toggle = item.querySelector('.accordion-toggle');
        const content = item.querySelector('.accordion-content');
        const icon = item.querySelector('.accordion-icon');

        toggle.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // 1. Cerrar todos los items
            allAccordionItems.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('.accordion-content').style.display = 'none';
                i.querySelector('.accordion-icon').style.transform = 'rotate(0deg)';
            });

            // 2. Si el item clickeado no estaba abierto, abrirlo
            if (!isOpen) {
                item.classList.add('is-open');
                content.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
    // --- FIN DEL CÓDIGO DEL ACORDEÓN ---
});