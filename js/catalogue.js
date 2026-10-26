/**
 * Learnify - Catalogue Controller (Vanilla JS)
 * Gère l'affichage dynamique de la grille de cours sur la page d'accueil,
 * les badges de progression en temps réel, les filtres de recherche et la bannière de reprise.
 */

import { DataService } from './data.js';
import { ProgressTracker } from './progress.js';

/** Génère le contenu visuel interne de la vignette de cours selon son artClass ou miniature */
function buildCourseArtInner(c) {
  // Si un thumbnail base64/URL a été chargé, l'utiliser comme background
  if (c.thumbnail) {
    return `<img src="${c.thumbnail}" alt="Miniature du cours ${c.title}" class="course-thumb-img" loading="lazy">`;
  }
  switch (c.artClass) {
    case 'art-web':
      return `
        <div class="browser-window">
          <div class="browser-bar"><i></i><i></i><i></i></div>
          <div class="browser-content"><b>&lt;/&gt;</b><span></span><span></span><em></em></div>
        </div>`;
    case 'art-python':
      return `
        <div class="python-mark">Py<span>•</span></div>
        <div class="art-caption">print("hello")</div>`;
    case 'art-js':
      return `
        <div class="js-tile">JS</div>
        <div class="art-caption">make it work_</div>`;
    case 'art-ai':
      return `
        <div class="ai-orb"><span>✳</span></div>
        <div class="art-caption">human + machine</div>`;
    case 'art-db':
      return `
        <div class="database-icon"><i></i><i></i><i></i></div>
        <div class="art-caption">data / structure / query</div>`;
    case 'art-cloud':
      return `
        <div class="cloud-shape">☁</div>
        <div class="art-caption">anywhere · anytime</div>`;
    default:
      return `
        <div class="custom-art-mark">${(c.badge || c.title.substring(0, 2)).toUpperCase()}</div>
        <div class="art-caption">${c.category.toLowerCase()} · nouveau</div>`;
  }
}

export const CatalogueController = {
  activeCategory: 'all',

  /** Initialise le catalogue sur la page d'accueil */
  async init() {
    const grid = document.querySelector('.course-grid');
    if (!grid) return;

    // Bannière de reprise de session
    const mainEl = document.querySelector('main');
    if (mainEl) ProgressTracker.renderResumeBanner(mainEl);

    // Filtres de catégories
    this.injectFilters();

    // Rendu initial des cartes
    await this.renderCards();

    // Écouter les changements en temps réel
    window.addEventListener('learnify:courses-changed', () => this.renderCards());
    window.addEventListener('learnify:progress-updated', () => this.renderCards());
  },

  /** Injecte les boutons de filtrage */
  injectFilters() {
    const heading = document.querySelector('#courses .section-heading');
    if (!heading || document.getElementById('catalogue-filters')) return;

    const filters = document.createElement('div');
    filters.id = 'catalogue-filters';
    filters.className = 'catalogue-filter-bar';
    filters.setAttribute('role', 'toolbar');
    filters.setAttribute('aria-label', 'Filtrer les cours par catégorie');
    filters.innerHTML = `
      <button type="button" class="filter-chip active" data-cat="all">Tous les cours</button>
      <button type="button" class="filter-chip" data-cat="Web">Web</button>
      <button type="button" class="filter-chip" data-cat="Programmation">Programmation</button>
      <button type="button" class="filter-chip" data-cat="Technologie">Technologie</button>
    `;
    heading.parentNode.insertBefore(filters, heading.nextSibling);

    const chips = filters.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', async () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.activeCategory = chip.getAttribute('data-cat');
        await this.renderCards();
      });
    });
  },

  /** Affiche les cartes de cours avec artwork unique par cours */
  async renderCards() {
    const grid = document.querySelector('.course-grid');
    if (!grid) return;

    const courses = await DataService.getCourses();
    const filtered = this.activeCategory === 'all'
      ? courses
      : courses.filter(c => c.category === this.activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="empty-catalogue">Aucun cours disponible dans cette catégorie.</p>';
      return;
    }

    grid.innerHTML = filtered.map(c => {
      const stats = ProgressTracker.getStats(c);
      const isDone = stats.isComplete;
      const inProgress = stats.percentage > 0 && !isDone;

      const badgeHtml = isDone
        ? '<span class="status-badge status-done">✓ Terminé</span>'
        : inProgress
          ? `<span class="status-badge status-progress">${stats.percentage}% validé</span>`
          : '<span class="status-badge status-new">Nouveau</span>';

      const artInner = buildCourseArtInner(c);

      return `
        <article class="course-card" data-course-id="${c.id}">
          <a class="course-art ${c.artClass || 'art-web'}" href="course.html?course=${c.id}" aria-label="Ouvrir le cours ${c.title}">
            <span class="art-label">${c.eyebrow || c.category.toUpperCase()}</span>
            ${artInner}
            <span class="art-orbit">${c.badge || '★'}</span>
            ${badgeHtml}
          </a>
          <div class="course-info">
            <div class="course-meta">
              <span class="tag ${c.tagClass || 'tag-web'}">${c.category}</span>
              <span>${c.lessons ? c.lessons.length : 0} leçons</span>
            </div>
            <h3><a href="course.html?course=${c.id}">${c.title}</a></h3>
            <p>${c.description}</p>
            <div class="card-progress-bar" role="progressbar" aria-valuenow="${stats.percentage}" aria-valuemin="0" aria-valuemax="100" title="${stats.percentage}% complété">
              <span style="width: ${stats.percentage}%;"></span>
            </div>
            <div class="course-bottom">
              <span class="level"><i></i> ${c.level}</span>
              <a href="course.html?course=${c.id}" class="round-link" aria-label="Voir le cours ${c.title}">↗</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
};

