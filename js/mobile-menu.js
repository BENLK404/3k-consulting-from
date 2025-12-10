// mobile-menu.js - Gestion du menu hamburger
// Déclarer la fonction globalement AVANT tout
window.closeMobileMenu = function() {
    console.log('closeMobileMenu appelée mais pas encore initialisée');
};

// Gestion du menu mobile hamburger
(function() {
    'use strict';

    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }

    function initMobileMenu() {
        const nav = document.querySelector('nav');
        if (!nav) {
            console.error('Navigation non trouvée');
            return;
        }

        // Créer le bouton hamburger
        const hamburger = document.createElement('button');
        hamburger.className = 'mobile-menu-toggle';
        hamburger.setAttribute('aria-label', 'Menu');
        hamburger.innerHTML = '<span></span><span></span><span></span>';

        // Créer le menu mobile
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-nav';

        const mobileNavContent = document.createElement('div');
        mobileNavContent.className = 'mobile-nav-content';

        // Créer les liens
        const linksList = document.createElement('ul');
        linksList.className = 'mobile-nav-links';
        linksList.innerHTML = `
            <li><a href="#accueil">Accueil</a></li>
            <li><a href="#services">Services ECTN</a></li>
            <li><a href="#contact">Contact</a></li>
        `;

        // Créer le bouton CTA
        const mobileCta = document.createElement('button');
        mobileCta.className = 'mobile-cta';
        mobileCta.textContent = 'Demander un devis';

        // Assembler le menu
        mobileNavContent.appendChild(linksList);
        mobileNavContent.appendChild(mobileCta);
        mobileNav.appendChild(mobileNavContent);

        // Ajouter au DOM
        nav.appendChild(hamburger);
        document.body.appendChild(mobileNav);

        // DÉFINIR LA FONCTION DE FERMETURE (remplace la déclaration globale)
        window.closeMobileMenu = function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Event: Toggle du menu hamburger
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');

            // Empêcher le scroll du body quand le menu est ouvert
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Event: Fermer en cliquant sur le fond
        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                window.closeMobileMenu();
            }
        });

        // Event: Fermer en cliquant sur un lien
        linksList.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                window.closeMobileMenu();
            });
        });

        // Event: CTA - Scroll vers formulaire et fermer menu
        mobileCta.addEventListener('click', function() {
            const devisForm = document.getElementById('devisForm');
            if (devisForm) {
                devisForm.scrollIntoView({ behavior: 'smooth' });
            }
            window.closeMobileMenu();
        });

        // Event: Fermer lors du redimensionnement vers desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                window.closeMobileMenu();
            }
        });

        console.log('✅ Menu mobile initialisé');
    }
})();