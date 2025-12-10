// app.js - Frontend JavaScript avec intégration backend
const API_URL = 'http://localhost:3000/api'; // À modifier selon votre déploiement

// Données des pays avec drapeaux et indicatifs téléphoniques
const countries = [
    {name: 'France', code: 'FR', flag: '🇫🇷', dial: '+33'},
    {name: 'Belgique', code: 'BE', flag: '🇧🇪', dial: '+32'},
    {name: 'Suisse', code: 'CH', flag: '🇨🇭', dial: '+41'},
    {name: 'Togo', code: 'TG', flag: '🇹🇬', dial: '+228'},
    {name: 'Bénin', code: 'BJ', flag: '🇧🇯', dial: '+229'},
    {name: 'Côte d\'Ivoire', code: 'CI', flag: '🇨🇮', dial: '+225'},
    {name: 'Sénégal', code: 'SN', flag: '🇸🇳', dial: '+221'},
    {name: 'Mali', code: 'ML', flag: '🇲🇱', dial: '+223'},
    {name: 'Burkina Faso', code: 'BF', flag: '🇧🇫', dial: '+226'},
    {name: 'Niger', code: 'NE', flag: '🇳🇪', dial: '+227'},
    {name: 'Ghana', code: 'GH', flag: '🇬🇭', dial: '+233'},
    {name: 'Nigeria', code: 'NG', flag: '🇳🇬', dial: '+234'},
    {name: 'Cameroun', code: 'CM', flag: '🇨🇲', dial: '+237'},
    {name: 'Gabon', code: 'GA', flag: '🇬🇦', dial: '+241'},
    {name: 'Congo', code: 'CG', flag: '🇨🇬', dial: '+242'},
    {name: 'RD Congo', code: 'CD', flag: '🇨🇩', dial: '+243'},
    {name: 'Maroc', code: 'MA', flag: '🇲🇦', dial: '+212'},
    {name: 'Algérie', code: 'DZ', flag: '🇩🇿', dial: '+213'},
    {name: 'Tunisie', code: 'TN', flag: '🇹🇳', dial: '+216'},
    {name: 'Chine', code: 'CN', flag: '🇨🇳', dial: '+86'},
    {name: 'Inde', code: 'IN', flag: '🇮🇳', dial: '+91'},
    {name: 'Allemagne', code: 'DE', flag: '🇩🇪', dial: '+49'},
    {name: 'Espagne', code: 'ES', flag: '🇪🇸', dial: '+34'},
    {name: 'Italie', code: 'IT', flag: '🇮🇹', dial: '+39'},
    {name: 'Portugal', code: 'PT', flag: '🇵🇹', dial: '+351'},
    {name: 'Royaume-Uni', code: 'GB', flag: '🇬🇧', dial: '+44'},
    {name: 'États-Unis', code: 'US', flag: '🇺🇸', dial: '+1'},
    {name: 'Canada', code: 'CA', flag: '🇨🇦', dial: '+1'}
];

// Variables pour stocker les widgets reCAPTCHA
let recaptchaWidget1 = null;
let recaptchaWidget2 = null;

// Initialisation des sélecteurs personnalisés
function initCustomSelect(id, type = 'country') {
    const el = document.getElementById(id);
    if (!el) return;

    const input = el.querySelector('.select-input');
    const dropdown = el.querySelector('.select-dropdown');
    const searchInput = el.querySelector('.select-search input');
    const optionsContainer = el.querySelector('.select-options');

    function renderOptions(filter = '') {
        const filtered = countries.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase()) ||
            (type === 'phone' && item.dial.includes(filter))
        );

        optionsContainer.innerHTML = filtered.map(item => {
            const displayText = type === 'phone'
                ? `${item.flag} ${item.name} (${item.dial})`
                : `${item.flag} ${item.name}`;

            return `<div class="select-option" data-value="${item.name}" data-dial="${item.dial}" data-flag="${item.flag}">
                <span class="country-flag">${item.flag}</span>
                <span>${type === 'phone' ? `${item.name} (${item.dial})` : item.name}</span>
            </div>`;
        }).join('');

        optionsContainer.querySelectorAll('.select-option').forEach(opt => {
            opt.addEventListener('click', () => selectOption(opt));
        });
    }

    function selectOption(opt) {
        const val = opt.dataset.value;
        const dial = opt.dataset.dial;

        if (type === 'phone') {
            input.value = dial;
        } else {
            input.value = val;
        }

        el.classList.remove('open');
        searchInput.value = '';
        renderOptions();
    }

    input.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select.open').forEach(s => {
            if (s !== el) s.classList.remove('open');
        });
        el.classList.toggle('open');
    });

    searchInput.addEventListener('input', (e) => {
        renderOptions(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (!el.contains(e.target)) {
            el.classList.remove('open');
        }
    });

    renderOptions();
}

// Gestion des fichiers PDF avec aperçu
function initFileInputs() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        const previewId = input.dataset.preview;
        const preview = document.getElementById(previewId);
        const wrapper = input.closest('.file-input-wrapper');

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileName = file.name;
                const fileSize = (file.size / 1024).toFixed(1) + ' Ko';

                preview.querySelector('.file-name').textContent = fileName;
                preview.querySelector('.file-size').textContent = fileSize;
                preview.classList.add('active');
                wrapper.style.display = 'none';
            }
        });

        if (preview) {
            const removeBtn = preview.querySelector('.file-remove');
            removeBtn.addEventListener('click', () => {
                input.value = '';
                preview.classList.remove('active');
                wrapper.style.display = 'block';
            });
        }
    });
}

// Fonction pour afficher une notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Fonction pour afficher un loader sur le bouton
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = `
            <svg style="width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; margin-right: 8px;" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            Envoi en cours...
        `;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Gestion du formulaire 1: Demande de devis
async function handleForm1Submit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('.submit-btn');
    setButtonLoading(submitBtn, true);

    try {
        const formData = new FormData();

        // Récupérer les valeurs des champs
        const inputs = e.target.querySelectorAll('input[type="text"]');
        const nom = inputs[0].value;
        const date = e.target.querySelector('input[type="date"]').value;
        const pays = document.getElementById('country1').querySelector('.select-input').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const telPrefix = document.getElementById('phone1').querySelector('.select-input').value;
        const telNumber = e.target.querySelector('.phone-number').value;
        const commentaires = e.target.querySelector('textarea').value;

        // Récupérer le token reCAPTCHA
        const recaptchaResponse = recaptchaWidget1 !== null
            ? grecaptcha.getResponse(recaptchaWidget1)
            : grecaptcha.getResponse();

        if (!recaptchaResponse) {
            showNotification('⚠️ Veuillez valider le reCAPTCHA', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        // Ajouter les données textuelles
        formData.append('nom_raison_sociale', nom);
        formData.append('date_depart', date);
        formData.append('pays_expedition', pays);
        formData.append('email', email);
        formData.append('telephone_prefix', telPrefix);
        formData.append('telephone_number', telNumber);
        formData.append('commentaires', commentaires);
        formData.append('g-recaptcha-response', recaptchaResponse);

        // Ajouter les fichiers
        const connaissement = e.target.querySelector('input[data-preview="preview12"]').files[0];
        const facture = e.target.querySelector('input[data-preview="preview11"]').files[0];
        const exportation = e.target.querySelector('input[data-preview="preview14"]').files[0];

        if (!connaissement || !facture) {
            showNotification('⚠️ Veuillez uploader tous les documents obligatoires', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        if (connaissement) formData.append('connaissement', connaissement);
        if (facture) formData.append('facture_commerciale', facture);
        if (exportation) formData.append('facture_exportation', exportation);

        // Envoyer au backend
        const response = await fetch(`${API_URL}/devis`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('✅ Demande de devis envoyée avec succès ! Vous recevrez une réponse sous 24-48h.', 'success');
            e.target.reset();
            // Réinitialiser les aperçus de fichiers
            document.querySelectorAll('#form1 .file-preview').forEach(preview => {
                preview.classList.remove('active');
            });
            document.querySelectorAll('#form1 .file-input-wrapper').forEach(wrapper => {
                wrapper.style.display = 'block';
            });
            if (recaptchaWidget1 !== null) {
                grecaptcha.reset(recaptchaWidget1);
            } else {
                grecaptcha.reset();
            }
        } else {
            showNotification('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de l\'envoi. Vérifiez que le serveur est démarré.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Gestion du formulaire 2: Soumission BSC
async function handleForm2Submit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('.submit-btn');
    setButtonLoading(submitBtn, true);

    try {
        const formData = new FormData();

        // Récupérer les valeurs des champs
        const inputs = e.target.querySelectorAll('input[type="text"]');
        const nom = inputs[0].value;
        const date = e.target.querySelector('input[type="date"]').value;
        const paysChargeur = document.getElementById('country3').querySelector('.select-input').value;
        const paysDestinataire = document.getElementById('country4').querySelector('.select-input').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const telPrefix = document.getElementById('phone2').querySelector('.select-input').value;
        const telNumber = e.target.querySelectorAll('.phone-number')[1].value;
        const commentaires = e.target.querySelector('textarea').value;

        // Récupérer le token reCAPTCHA du 2ème widget
        const recaptchaResponse = recaptchaWidget2 !== null
            ? grecaptcha.getResponse(recaptchaWidget2)
            : grecaptcha.getResponse(1);

        if (!recaptchaResponse) {
            showNotification('⚠️ Veuillez valider le reCAPTCHA', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        // Ajouter les données textuelles
        formData.append('nom_raison_sociale', nom);
        formData.append('date_depart', date);
        formData.append('pays_chargeur', paysChargeur);
        formData.append('pays_destinataire', paysDestinataire);
        formData.append('email', email);
        formData.append('telephone_prefix', telPrefix);
        formData.append('telephone_number', telNumber);
        formData.append('commentaires', commentaires);
        formData.append('g-recaptcha-response', recaptchaResponse);

        // Ajouter les fichiers
        const connaissement = e.target.querySelector('input[data-preview="preview3"]').files[0];
        const facture = e.target.querySelector('input[data-preview="preview4"]').files[0];
        const exportation = e.target.querySelector('input[data-preview="preview5"]').files[0];

        if (!connaissement || !facture) {
            showNotification('⚠️ Veuillez uploader tous les documents obligatoires', 'error');
            setButtonLoading(submitBtn, false);
            return;
        }

        if (connaissement) formData.append('connaissement_bsc', connaissement);
        if (facture) formData.append('facture_commerciale_bsc', facture);
        if (exportation) formData.append('facture_exportation_bsc', exportation);

        // Envoyer au backend
        const response = await fetch(`${API_URL}/bsc`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showNotification('✅ Soumission BSC envoyée avec succès ! Vérifiez vos emails (et spams).', 'success');
            e.target.reset();
            // Réinitialiser les aperçus de fichiers
            document.querySelectorAll('#form2 .file-preview').forEach(preview => {
                preview.classList.remove('active');
            });
            document.querySelectorAll('#form2 .file-input-wrapper').forEach(wrapper => {
                wrapper.style.display = 'block';
            });
            if (recaptchaWidget2 !== null) {
                grecaptcha.reset(recaptchaWidget2);
            } else {
                grecaptcha.reset(1);
            }
        } else {
            showNotification('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('❌ Erreur lors de l\'envoi. Vérifiez que le serveur est démarré.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Fonction de callback reCAPTCHA
window.onRecaptchaLoad = function() {
    const recaptchaContainers = document.querySelectorAll('.g-recaptcha');

    if (recaptchaContainers.length >= 1) {
        recaptchaWidget1 = grecaptcha.render(recaptchaContainers[0], {
            'sitekey': '6LfreiYsAAAAANtzK3iYPJFDdMf0f7YrQghe2H79'
        });
    }

    if (recaptchaContainers.length >= 2) {
        recaptchaWidget2 = grecaptcha.render(recaptchaContainers[1], {
            'sitekey': '6LfreiYsAAAAANtzK3iYPJFDdMf0f7YrQghe2H79'
        });
    }
};

// Fonction pour empêcher le zoom sur iOS lors du focus sur les inputs
function preventIOSZoom() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth < 768) {
                const fontSize = window.getComputedStyle(this).fontSize;
                if (parseFloat(fontSize) < 16) {
                    this.style.fontSize = '16px';
                }
            }
        });
    });
}

// Améliorer le comportement des dropdowns sur mobile
function improveDropdownMobile() {
    document.querySelectorAll('.custom-select').forEach(select => {
        const dropdown = select.querySelector('.select-dropdown');

        select.addEventListener('click', function(e) {
            if (window.innerWidth < 768 && select.classList.contains('open')) {
                // Sur mobile, empêcher le scroll du body quand le dropdown est ouvert
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    });

    // Restaurer le scroll quand on clique en dehors
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            document.body.style.overflow = '';
        }
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser tous les sélecteurs
    initCustomSelect('country1', 'country');
    initCustomSelect('country3', 'country');
    initCustomSelect('country4', 'country');
    initCustomSelect('phone1', 'phone');
    initCustomSelect('phone2', 'phone');

    // Améliorations mobile
    preventIOSZoom();
    improveDropdownMobile();

    // Initialiser les inputs de fichiers
    initFileInputs();

    // Attacher les gestionnaires de formulaires
    const form1 = document.getElementById('form1');
    const form2 = document.getElementById('form2');

    if (form1) {
        form1.addEventListener('submit', handleForm1Submit);
    }

    if (form2) {
        form2.addEventListener('submit', handleForm2Submit);
    }

    // Ajouter les animations CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});