/**
 * Learnify - Admin Service (Bonus 2)
 * Interface d'administration simplifiée pour l'ajout et la suppression de cours
 * avec persistance immédiate dans localStorage.
 */

import { Storage } from './storage.js';
import { DataService } from './data.js';

export const AdminPanel = {
  /**
   * Initialise le bouton d'accès admin et injecte la modale dans le DOM
   * @param {Function} onCoursesUpdated Callback de rafraîchissement
   */
  init(onCoursesUpdated) {
    this.onCoursesUpdated = onCoursesUpdated;
    this.injectAdminTrigger();
    this.injectAdminModal();
    this.bindEvents();
  },

  /**
   * Ajoute le bouton d'administration dans la navigation ou le footer
   */
  injectAdminTrigger() {
    if (window.location.pathname.includes('admin.html')) return;
    if (document.getElementById('btn-open-admin')) return;

    // Utiliser le lien du header s'il existe déjà, sinon le créer
    const nav = document.querySelector('.main-nav');
    if (nav) {
      const existing = nav.querySelector('.admin-nav-button');
      if (existing) {
        existing.id = 'btn-open-admin';
        existing.setAttribute('aria-haspopup', 'dialog');
        existing.setAttribute('aria-expanded', 'false');
      } else {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.id = 'btn-open-admin';
        adminLink.className = 'admin-nav-button';
        adminLink.innerHTML = '⚙️ Administration';
        adminLink.setAttribute('aria-haspopup', 'dialog');
        adminLink.setAttribute('aria-expanded', 'false');
        nav.appendChild(adminLink);
      }
    }
  },

  /**
   * Injecte la structure de la modale d'administration
   */
  injectAdminModal() {
    if (document.getElementById('admin-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.className = 'admin-modal-backdrop';
    modal.style.display = 'none';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'admin-modal-title');

    modal.innerHTML = `
      <div class="admin-modal-card">
        <div class="admin-modal-header">
          <div>
            <span class="eyebrow">ESPACE FORMATEUR</span>
            <h2 id="admin-modal-title">Gestion de la plateforme LMS</h2>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <a href="admin.html" class="button button-outline" style="font-size: 11px; padding: 6px 12px; text-decoration: none;">
              Éditeur complet (Quiz & Vidéos) ↗
            </a>
            <button type="button" class="btn-close-modal" id="btn-close-admin" aria-label="Fermer la modale d'administration">✕</button>
          </div>
        </div>

        <div class="admin-tabs" role="tablist">
          <button type="button" class="admin-tab active" id="tab-btn-add" role="tab" aria-selected="true">Ajouter un nouveau cours</button>
          <button type="button" class="admin-tab" id="tab-btn-list" role="tab" aria-selected="false">Catalogue des cours & suppression</button>
        </div>

        <!-- Onglet 1 : Formulaire d'ajout -->
        <div class="admin-tab-content" id="tab-panel-add" role="tabpanel">
          <form id="admin-add-course-form" class="admin-form" novalidate>
            <div class="form-row-2">
              <div class="form-group">
                <label for="course-title">Titre du cours *</label>
                <input type="text" id="course-title" required placeholder="Ex: React.js Moderne">
              </div>
              <div class="form-group">
                <label for="course-category">Catégorie *</label>
                <select id="course-category" required>
                  <option value="Web">Web (tag-web)</option>
                  <option value="Programmation">Programmation (tag-python / tag-js)</option>
                  <option value="Technologie">Technologie (tag-ai / tag-db / tag-cloud)</option>
                  <option value="Design">Design & UX</option>
                </select>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="course-duration">Durée estimée</label>
                <input type="text" id="course-duration" placeholder="Ex: Environ 45 minutes" value="Environ 40 minutes">
              </div>
              <div class="form-group">
                <label for="course-level">Niveau</label>
                <select id="course-level">
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="course-desc">Description courte *</label>
              <textarea id="course-desc" rows="2" required placeholder="Résumé attractif pour le catalogue..."></textarea>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="course-instructor">Nom de l'instructeur</label>
                <input type="text" id="course-instructor" placeholder="Ex: Dr. Ahmed Ben Ali" value="Professeur ISSAT">
              </div>
              <div class="form-group">
                <label for="course-lessons-count">Nombre de leçons simulées</label>
                <input type="number" id="course-lessons-count" min="1" max="10" value="3">
              </div>
            </div>

            <div class="admin-form-actions">
              <button type="submit" class="button button-primary" id="btn-save-course">
                Enregistrer et publier le cours <span>+</span>
              </button>
            </div>
            <div id="admin-add-feedback" class="admin-feedback" style="display: none;" role="status"></div>
          </form>
        </div>

        <!-- Onglet 2 : Liste et suppression -->
        <div class="admin-tab-content" id="tab-panel-list" role="tabpanel" style="display: none;">
          <div class="admin-courses-table-wrap">
            <table class="admin-courses-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Leçons</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="admin-courses-tbody">
                <!-- Rempli dynamiquement -->
              </tbody>
            </table>
          </div>
          <div class="admin-danger-zone">
            <h4>Zone de réinitialisation</h4>
            <p>Rétablit les cours d'origine et réinitialise les progressions enregistrées.</p>
            <button type="button" class="button button-outline btn-danger" id="btn-reset-demo-data">
              Réinitialiser les données d'origine ↺
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  /**
   * Associe les écouteurs d'événements
   */
  bindEvents() {
    const modal = document.getElementById('admin-modal');
    const openBtn = document.getElementById('btn-open-admin');
    const closeBtn = document.getElementById('btn-close-admin');

    const tabBtnAdd = document.getElementById('tab-btn-add');
    const tabBtnList = document.getElementById('tab-btn-list');
    const panelAdd = document.getElementById('tab-panel-add');
    const panelList = document.getElementById('tab-panel-list');

    const form = document.getElementById('admin-add-course-form');
    const resetDataBtn = document.getElementById('btn-reset-demo-data');

    // Ouverture
    if (openBtn) {
      openBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
        openBtn.setAttribute('aria-expanded', 'true');
        await this.renderCoursesList();
      });
    }

    // Fermeture
    const closeModal = () => {
      modal.style.display = 'none';
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
      }
    });

    // Bascule d'onglets
    if (tabBtnAdd && tabBtnList) {
      tabBtnAdd.addEventListener('click', () => {
        tabBtnAdd.classList.add('active');
        tabBtnAdd.setAttribute('aria-selected', 'true');
        tabBtnList.classList.remove('active');
        tabBtnList.setAttribute('aria-selected', 'false');
        panelAdd.style.display = 'block';
        panelList.style.display = 'none';
      });

      tabBtnList.addEventListener('click', async () => {
        tabBtnList.classList.add('active');
        tabBtnList.setAttribute('aria-selected', 'true');
        tabBtnAdd.classList.remove('active');
        tabBtnAdd.setAttribute('aria-selected', 'false');
        panelList.style.display = 'block';
        panelAdd.style.display = 'none';
        await this.renderCoursesList();
      });
    }

    // Soumission du formulaire d'ajout
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('course-title');
        const catInput = document.getElementById('course-category');
        const descInput = document.getElementById('course-desc');
        const durationInput = document.getElementById('course-duration');
        const levelInput = document.getElementById('course-level');
        const instructorInput = document.getElementById('course-instructor');
        const countInput = document.getElementById('course-lessons-count');
        const feedback = document.getElementById('admin-add-feedback');

        if (!titleInput.value.trim() || !descInput.value.trim()) {
          feedback.style.display = 'block';
          feedback.className = 'admin-feedback feedback-error';
          feedback.textContent = 'Veuillez remplir tous les champs obligatoires (*).';
          return;
        }

        const count = Math.max(1, Number(countInput.value) || 3);
        const slug = titleInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `custom-${Date.now()}`;

        // Générer les leçons simulées avec quiz
        const generatedLessons = [];
        for (let i = 0; i < count; i++) {
          generatedLessons.push({
            id: i,
            title: `Leçon ${i + 1} : Notions clés`,
            subtitle: `Module ${i + 1} · 8 min`,
            duration: '8 min',
            videoUrl: 'https://www.youtube-nocookie.com/embed/UB1O30fR-EE',
            markers: [
              { time: '00:00', title: 'Introduction au module', seconds: 0 },
              { time: '03:30', title: 'Application pratique', seconds: 210 }
            ],
            articleHeading: `Approfondissement : Chapitre ${i + 1}`,
            description: `Contenu d'apprentissage pour ${titleInput.value}. Découvrez les méthodes pratiques et les cas concrets d'utilisation.`,
            tip: `Astuce clé du chapitre ${i + 1} : Pratiquez régulièrement pour assimiler la notion.`,
            codeSnippet: `// Exemple de code pour ${titleInput.value}\nfunction executer() {\n  console.log("Leçon ${i + 1} en cours");\n}`,
            quiz: [
              {
                id: `q${i}_1`,
                question: `Quel est l'objectif premier abordé dans la leçon ${i + 1} ?`,
                options: [
                  "Assimiler les concepts fondamentaux",
                  "Ignorer les bonnes pratiques",
                  "Écrire du code sans le tester"
                ],
                correctIndex: 0,
                explanation: "Ce module met l'accent sur les bases solides et la rigueur d'apprentissage."
              }
            ]
          });
        }

        const tagClassMap = {
          Web: 'tag-web',
          Programmation: 'tag-js',
          Technologie: 'tag-ai',
          Design: 'tag-python'
        };

        const newCourse = {
          id: slug,
          title: titleInput.value.trim(),
          eyebrow: catInput.value.toUpperCase(),
          category: catInput.value,
          tagClass: tagClassMap[catInput.value] || 'tag-web',
          artClass: 'art-web',
          badge: 'NEW',
          level: levelInput.value,
          duration: durationInput.value.trim() || '45 minutes',
          description: descInput.value.trim(),
          about: `Ce cours complet vous enseigne ${titleInput.value}. Conçu pour les étudiants désireux d'élargir leurs compétences techniques.`,
          instructor: {
            name: instructorInput.value.trim() || 'Formateur',
            role: 'Enseignant & Expert',
            initials: instructorInput.value.trim().substring(0, 2).toUpperCase() || 'EX',
            bio: 'Formateur passionné par les technologies modernes et l’accompagnement des étudiants.'
          },
          objectives: [
            `Maîtriser les principes de ${titleInput.value}`,
            "Mettre en œuvre des projets concrets",
            "Valider chaque module grâce aux quiz interactifs"
          ],
          lessons: generatedLessons
        };

        Storage.addCustomCourse(newCourse);

        feedback.style.display = 'block';
        feedback.className = 'admin-feedback feedback-success';
        feedback.textContent = `✓ Le cours "${newCourse.title}" a été créé avec succès !`;

        form.reset();
        await this.renderCoursesList();

        if (this.onCoursesUpdated) {
          this.onCoursesUpdated();
        }
      });
    }

    // Réinitialisation
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', async () => {
        if (confirm('Voulez-vous vraiment réinitialiser toutes les données ? (Vos cours ajoutés et votre progression seront remis à zéro)')) {
          Storage.resetAll();
          alert('Données réinitialisées avec succès.');
          await this.renderCoursesList();
          if (this.onCoursesUpdated) {
            this.onCoursesUpdated();
          }
        }
      });
    }
  },

  /**
   * Génère le tableau des cours avec bouton de suppression
   */
  async renderCoursesList() {
    const tbody = document.getElementById('admin-courses-tbody');
    if (!tbody) return;

    const courses = await DataService.getCourses();

    if (courses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Aucun cours disponible.</td></tr>';
      return;
    }

    tbody.innerHTML = courses.map(c => `
      <tr>
        <td>
          <strong>${c.title}</strong>
          <small style="display:block; color: #888;">ID: ${c.id}</small>
        </td>
        <td><span class="tag ${c.tagClass || 'tag-web'}">${c.category || 'Général'}</span></td>
        <td>${c.lessons ? c.lessons.length : 0} leçons</td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            <a href="admin.html?edit=${c.id}" class="btn-edit-course" title="Modifier ce cours dans l'éditeur complet">
              ✏️ Modifier
            </a>
            <button type="button" class="btn-delete-course" data-cid="${c.id}" aria-label="Supprimer le cours ${c.title}">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Écouteurs de suppression
    const delBtns = tbody.querySelectorAll('.btn-delete-course');
    delBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const cid = btn.getAttribute('data-cid');
        const course = courses.find(c => c.id === cid);
        const name = course ? course.title : cid;

        if (confirm(`Confirmez-vous la suppression du cours "${name}" ?`)) {
          Storage.deleteCourse(cid);
          await this.renderCoursesList();
          if (this.onCoursesUpdated) {
            this.onCoursesUpdated();
          }
        }
      });
    });
  }
};
