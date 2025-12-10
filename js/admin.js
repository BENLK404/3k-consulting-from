/**
 * PDF ANALYZER - Admin Interface
 * Gestion de l'interface d'administration
 */

// ====================================
// VARIABLES GLOBALES
// ====================================

let adminPassword = null;
let submissions = [];
let filteredSubmissions = [];

// ====================================
// INITIALISATION
// ====================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeLoginForm();
    initializeSearch();
});

// ====================================
// AUTHENTIFICATION
// ====================================

function checkAuth() {
    adminPassword = sessionStorage.getItem('adminPassword');

    if (adminPassword) {
        showDashboard();
        loadSubmissions();
    } else {
        showLogin();
    }
}

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;

        // Tester le mot de passe en chargeant les submissions
        try {
            const response = await fetch(`/submissions?password=${encodeURIComponent(password)}`);
            const data = await response.json();

            if (response.ok && data.success) {
                adminPassword = password;
                sessionStorage.setItem('adminPassword', password);
                showDashboard();
                loadSubmissions();
            } else {
                showLoginError('Mot de passe incorrect');
            }
        } catch (error) {
            showLoginError('Erreur de connexion');
        }
    });
}

function showLogin() {
    document.getElementById('loginBox').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.innerHTML = `
        <div class="message error">
            <div class="message-content">
                <div class="message-text">${message}</div>
            </div>
        </div>
    `;
}

function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter?')) {
        sessionStorage.removeItem('adminPassword');
        adminPassword = null;
        window.location.reload();
    }
}

// ====================================
// CHARGEMENT DES DONNÉES
// ====================================

async function loadSubmissions() {
    try {
        const response = await fetch(`/submissions?password=${encodeURIComponent(adminPassword)}`);
        const data = await response.json();

        if (response.ok && data.success) {
            submissions = data.data.submissions;
            filteredSubmissions = [...submissions];

            updateStats(data.data.stats);
            renderTable();
        } else {
            throw new Error(data.error || 'Erreur de chargement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des données');
    }
}

// ====================================
// STATISTIQUES
// ====================================

function updateStats(stats) {
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statSize').textContent =
        (stats.totalSize / (1024 * 1024)).toFixed(2) + ' MB';

    if (stats.lastSubmission) {
        const date = new Date(stats.lastSubmission);
        document.getElementById('statLast').textContent = formatDate(date);
    } else {
        document.getElementById('statLast').textContent = 'Aucune';
    }
}

// ====================================
// AFFICHAGE DU TABLEAU
// ====================================

function renderTable() {
    const container = document.getElementById('tableContainer');

    if (filteredSubmissions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p>${submissions.length > 0 ? 'Aucun résultat trouvé' : 'Aucune soumission pour le moment'}</p>
            </div>
        `;
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Fichier</th>
                    <th>Taille</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filteredSubmissions.map(sub => `
                    <tr>
                        <td>${formatDate(new Date(sub.timestamp))}</td>
                        <td><strong>${escapeHtml(sub.nom)}</strong></td>
                        <td>${escapeHtml(sub.email)}</td>
                        <td>${escapeHtml(sub.pdf.originalName)}</td>
                        <td>${formatFileSize(sub.pdf.size)}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-small btn-view" onclick="viewDetails('${sub.id}')">
                                    👁️ Voir
                                </button>
                                <button class="btn btn-small btn-download" onclick="downloadPDF('${sub.pdf.filename}')">
                                    ⬇️ PDF
                                </button>
                                <button class="btn btn-small btn-delete" onclick="deleteSubmission('${sub.id}')">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// ====================================
// RECHERCHE
// ====================================

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            filteredSubmissions = [...submissions];
        } else {
            filteredSubmissions = submissions.filter(sub => {
                return (
                    sub.nom.toLowerCase().includes(query) ||
                    sub.email.toLowerCase().includes(query) ||
                    sub.pdf.originalName.toLowerCase().includes(query) ||
                    sub.telephone?.toLowerCase().includes(query) ||
                    sub.commentaire?.toLowerCase().includes(query)
                );
            });
        }

        renderTable();
    });
}

// ====================================
// ACTIONS
// ====================================

function viewDetails(id) {
    const submission = submissions.find(s => s.id === id);

    if (!submission) {
        alert('Soumission introuvable');
        return;
    }

    const modalContent = document.getElementById('modalContent');

    // Préparer les extractions
    let extractionsHTML = '<p>Aucune donnée extraite</p>';

    if (submission.analysis?.extractions && Object.keys(submission.analysis.extractions).length > 0) {
        const ext = submission.analysis.extractions;
        extractionsHTML = '<ul class="extractions-list">';

        if (ext.dates?.length) {
            extractionsHTML += `<li><strong>Dates :</strong> ${ext.dates.join(', ')}</li>`;
        }
        if (ext.pays?.length) {
            extractionsHTML += `<li><strong>Pays :</strong> ${ext.pays.join(', ')}</li>`;
        }
        if (ext.numeroECTN?.length) {
            extractionsHTML += `<li><strong>Numéro ECTN :</strong> ${ext.numeroECTN.join(', ')}</li>`;
        }
        if (ext.numeroBL?.length) {
            extractionsHTML += `<li><strong>Numéro BL :</strong> ${ext.numeroBL.join(', ')}</li>`;
        }
        if (ext.numeroFacture?.length) {
            extractionsHTML += `<li><strong>Numéro Facture :</strong> ${ext.numeroFacture.join(', ')}</li>`;
        }
        if (ext.emails?.length) {
            extractionsHTML += `<li><strong>Emails :</strong> ${ext.emails.join(', ')}</li>`;
        }
        if (ext.telephones?.length) {
            extractionsHTML += `<li><strong>Téléphones :</strong> ${ext.telephones.join(', ')}</li>`;
        }

        extractionsHTML += '</ul>';
    }

    modalContent.innerHTML = `
        <h2>📄 Détails de la soumission</h2>
        
        <div class="detail-section">
            <h3>Informations générales</h3>
            <div class="detail-row">
                <span class="detail-label">ID :</span>
                <span class="detail-value">${submission.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date :</span>
                <span class="detail-value">${formatDateTime(new Date(submission.timestamp))}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Nom :</span>
                <span class="detail-value">${escapeHtml(submission.nom)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email :</span>
                <span class="detail-value">${escapeHtml(submission.email)}</span>
            </div>
            ${submission.telephone ? `
            <div class="detail-row">
                <span class="detail-label">Téléphone :</span>
                <span class="detail-value">${escapeHtml(submission.telephone)}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="detail-section">
            <h3>Fichier PDF</h3>
            <div class="detail-row">
                <span class="detail-label">Nom original :</span>
                <span class="detail-value">${escapeHtml(submission.pdf.originalName)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Taille :</span>
                <span class="detail-value">${formatFileSize(submission.pdf.size)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pages :</span>
                <span class="detail-value">${submission.analysis?.pages || 'N/A'}</span>
            </div>
        </div>
        
        ${submission.commentaire ? `
        <div class="detail-section">
            <h3>Commentaire</h3>
            <p>${escapeHtml(submission.commentaire)}</p>
        </div>
        ` : ''}
        
        <div class="detail-section">
            <h3>Données extraites</h3>
            ${extractionsHTML}
        </div>
        
        ${submission.analysis?.text ? `
        <div class="detail-section">
            <h3>Contenu du PDF</h3>
            <div style="max-height: 300px; overflow-y: auto; background: var(--gray-50); padding: 16px; border-radius: 8px; font-size: 0.875rem; white-space: pre-wrap;">
${escapeHtml(submission.analysis.text.substring(0, 2000))}${submission.analysis.text.length > 2000 ? '...' : ''}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 24px; display: flex; gap: 12px;">
            <button class="btn btn-primary" onclick="downloadPDF('${submission.pdf.filename}')">
                ⬇️ Télécharger PDF
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
                Fermer
            </button>
        </div>
    `;

    document.getElementById('detailModal').style.display = 'block';
}

async function downloadPDF(filename) {
    try {
        window.open(`/download/${filename}?password=${encodeURIComponent(adminPassword)}`, '_blank');
    } catch (error) {
        alert('Erreur lors du téléchargement');
    }
}

async function deleteSubmission(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette soumission?')) {
        return;
    }

    try {
        const response = await fetch(`/delete/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: adminPassword })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('Soumission supprimée');
            loadSubmissions();
        } else {
            throw new Error(data.error || 'Erreur de suppression');
        }
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Fermer modal en cliquant à l'extérieur
window.addEventListener('click', (e) => {
    const modal = document.getElementById('detailModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ====================================
// UTILITAIRES
// ====================================

function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}