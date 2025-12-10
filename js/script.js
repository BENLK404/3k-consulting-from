/**
 * PDF ANALYZER - Script Frontend (Version corrigée)
 * Gestion du formulaire d'upload
 */

// ====================================
// VARIABLES GLOBALES
// ====================================

let form, fileInput, fileUploadArea, uploadPlaceholder, filePreview;
let fileName, fileSize, removeFileBtn, submitBtn;
let progressContainer, progressFill, progressText, messageContainer;
let commentaire, charCount;
let selectedFile = null;

// ====================================
// INITIALISATION
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser toutes les références DOM
    initializeDOMReferences();

    // Vérifier que tous les éléments sont présents
    if (!form) {
        console.error('Formulaire non trouvé');
        return;
    }

    // Initialiser les fonctionnalités
    initializeFileUpload();
    initializeForm();
    initializeCharCounter();
    initializeValidation();
});

// ====================================
// INITIALISATION DES RÉFÉRENCES DOM
// ====================================

function initializeDOMReferences() {
    form = document.getElementById('uploadForm');
    fileInput = document.getElementById('pdf');
    fileUploadArea = document.getElementById('fileUploadArea');
    uploadPlaceholder = document.getElementById('uploadPlaceholder');
    filePreview = document.getElementById('filePreview');
    fileName = document.getElementById('fileName');
    fileSize = document.getElementById('fileSize');
    removeFileBtn = document.getElementById('removeFile');
    submitBtn = document.getElementById('submitBtn');
    progressContainer = document.getElementById('progressContainer');
    progressFill = document.getElementById('progressFill');
    progressText = document.getElementById('progressText');
    messageContainer = document.getElementById('messageContainer');
    commentaire = document.getElementById('commentaire');
    charCount = document.getElementById('charCount');
}

// ====================================
// GESTION UPLOAD DE FICHIER
// ====================================

function initializeFileUpload() {
    if (!fileUploadArea || !fileInput) {
        console.error('Éléments d\'upload non trouvés');
        return;
    }

    // Click sur la zone d'upload
    fileUploadArea.addEventListener('click', (e) => {
        // Ne pas ouvrir le sélecteur si on clique sur le bouton supprimer
        if (e.target === removeFileBtn || e.target.closest('.remove-file')) {
            return;
        }
        fileInput.click();
    });

    // Changement de fichier
    fileInput.addEventListener('change', handleFileSelect);

    // Drag & Drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (uploadPlaceholder) {
            uploadPlaceholder.classList.add('drag-over');
        }
    });

    fileUploadArea.addEventListener('dragleave', () => {
        if (uploadPlaceholder) {
            uploadPlaceholder.classList.remove('drag-over');
        }
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (uploadPlaceholder) {
            uploadPlaceholder.classList.remove('drag-over');
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            // Simuler la sélection de fichier
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(files[0]);
            fileInput.files = dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });

    // Bouton supprimer fichier
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clearFile();
        });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];

    if (!file) return;

    // Vérifier le type
    if (file.type !== 'application/pdf') {
        showMessage('Erreur', 'Seuls les fichiers PDF sont acceptés', 'error');
        clearFile();
        return;
    }

    // Vérifier la taille (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showMessage('Erreur', 'Le fichier est trop volumineux (max 10 MB)', 'error');
        clearFile();
        return;
    }

    selectedFile = file;
    displayFilePreview(file);
}

function displayFilePreview(file) {
    if (!uploadPlaceholder || !filePreview || !fileName || !fileSize) {
        console.error('Éléments de prévisualisation non trouvés');
        return;
    }

    // Masquer placeholder
    uploadPlaceholder.style.display = 'none';

    // Afficher preview
    filePreview.style.display = 'flex';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
}

function clearFile() {
    selectedFile = null;

    if (fileInput) {
        fileInput.value = '';
    }

    // Réafficher placeholder
    if (uploadPlaceholder && filePreview) {
        uploadPlaceholder.style.display = 'block';
        filePreview.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ====================================
// GESTION FORMULAIRE
// ====================================

function initializeForm() {
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    form.addEventListener('reset', () => {
        clearFile();
        if (messageContainer) {
            messageContainer.innerHTML = '';
        }
        setTimeout(() => {
            if (charCount) {
                charCount.textContent = '0/500 caractères';
            }
        }, 0);
    });
}

async function handleSubmit(e) {
    e.preventDefault();

    // Vérifier qu'un fichier est sélectionné
    if (!selectedFile) {
        showMessage('Erreur', 'Veuillez sélectionner un fichier PDF', 'error');
        return;
    }

    // Désactiver le formulaire
    setFormState(false);

    // Afficher la progression
    showProgress(true);

    // Préparer les données
    const formData = new FormData();

    const nomInput = document.getElementById('nom');
    const emailInput = document.getElementById('email');
    const telephoneInput = document.getElementById('telephone');
    const commentaireInput = document.getElementById('commentaire');

    if (nomInput) formData.append('nom', nomInput.value.trim());
    if (emailInput) formData.append('email', emailInput.value.trim());
    if (telephoneInput) formData.append('telephone', telephoneInput.value.trim());
    if (commentaireInput) formData.append('commentaire', commentaireInput.value.trim());
    formData.append('pdf', selectedFile);

    try {
        // Simuler progression
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            if (progress <= 90) {
                updateProgress(progress, 'Envoi en cours...');
            }
        }, 100);

        // Envoyer la requête
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);

        const data = await response.json();

        if (response.ok && data.success) {
            updateProgress(100, 'Traitement terminé!');

            setTimeout(() => {
                showSuccessMessage(data);
                if (form) form.reset();
                clearFile();
                showProgress(false);
                setFormState(true);
            }, 500);

        } else {
            throw new Error(data.error || 'Erreur lors de l\'envoi');
        }

    } catch (error) {
        console.error('Erreur:', error);
        showProgress(false);
        showMessage(
            'Erreur',
            error.message || 'Une erreur est survenue lors de l\'envoi',
            'error'
        );
        setFormState(true);
    }
}

function setFormState(enabled) {
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, button');
    inputs.forEach(input => {
        input.disabled = !enabled;
    });
}

function showProgress(show) {
    if (!progressContainer) return;

    if (show) {
        progressContainer.style.display = 'block';
        updateProgress(0, 'Préparation...');
    } else {
        progressContainer.style.display = 'none';
    }
}

function updateProgress(percent, text) {
    if (progressFill) {
        progressFill.style.width = percent + '%';
    }
    if (progressText) {
        progressText.textContent = text;
    }
}

// ====================================
// GESTION MESSAGES
// ====================================

function showMessage(title, text, type = 'info') {
    if (!messageContainer) {
        console.error('Message container non trouvé');
        return;
    }

    const icons = {
        success: `<svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        error: `<svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`,
        info: `<svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>`
    };

    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.innerHTML = `
        ${icons[type] || icons.info}
        <div class="message-content">
            <div class="message-title">${title}</div>
            <div class="message-text">${text}</div>
        </div>
    `;

    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageEl);

    // Scroll vers le message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-dismiss après 10 secondes (sauf erreurs)
    if (type !== 'error') {
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => messageEl.remove(), 300);
        }, 10000);
    }
}

function showSuccessMessage(data) {
    let extractionsText = '';

    if (data.data?.analysis && Object.keys(data.data.analysis).length > 0) {
        extractionsText = '<br><br><strong>Informations extraites :</strong><ul style="margin-top: 8px; padding-left: 20px;">';

        const extractions = data.data.analysis;

        if (extractions.dates?.length) {
            extractionsText += `<li>Dates : ${extractions.dates.join(', ')}</li>`;
        }
        if (extractions.pays?.length) {
            extractionsText += `<li>Pays : ${extractions.pays.join(', ')}</li>`;
        }
        if (extractions.numeroECTN?.length) {
            extractionsText += `<li>ECTN : ${extractions.numeroECTN.join(', ')}</li>`;
        }
        if (extractions.numeroBL?.length) {
            extractionsText += `<li>BL : ${extractions.numeroBL.join(', ')}</li>`;
        }
        if (extractions.numeroFacture?.length) {
            extractionsText += `<li>Facture : ${extractions.numeroFacture.join(', ')}</li>`;
        }

        extractionsText += '</ul>';
    }

    showMessage(
        'Succès !',
        `Votre document a été envoyé et analysé avec succès.<br>
        <strong>ID :</strong> ${data.data.id}${extractionsText}`,
        'success'
    );
}

// ====================================
// COMPTEUR DE CARACTÈRES
// ====================================

function initializeCharCounter() {
    if (!commentaire || !charCount) return;

    commentaire.addEventListener('input', () => {
        const length = commentaire.value.length;
        charCount.textContent = `${length}/500 caractères`;

        if (length > 450) {
            charCount.style.color = 'var(--warning-color, #f59e0b)';
        } else {
            charCount.style.color = 'var(--gray-500, #64748b)';
        }
    });
}

// ====================================
// VALIDATION EN TEMPS RÉEL
// ====================================

function initializeValidation() {
    const emailInput = document.getElementById('email');
    const nomInput = document.getElementById('nom');

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.style.borderColor = 'var(--danger-color, #dc2626)';
            } else {
                this.style.borderColor = 'var(--gray-300, #cbd5e1)';
            }
        });
    }

    if (nomInput) {
        nomInput.addEventListener('blur', function() {
            if (this.value && this.value.length < 2) {
                this.style.borderColor = 'var(--danger-color, #dc2626)';
            } else {
                this.style.borderColor = 'var(--gray-300, #cbd5e1)';
            }
        });
    }
}

// ====================================
// PRÉVENTION DE LA FERMETURE ACCIDENTELLE
// ====================================

window.addEventListener('beforeunload', (e) => {
    if (selectedFile && form && !form.querySelector('button[type="submit"]')?.disabled) {
        e.preventDefault();
        e.returnValue = '';
    }
});