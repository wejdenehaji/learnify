/**
 * Learnify - SPA Router (Vanilla JS)
 * Navigation fluide entre Catalogue, Cours et Leçons sans rechargement complet de la page (SPA simplifiée).
 * Gère l'historique de navigation du navigateur (History API, pushState, popstate).
 */

import { CatalogueController } from './catalogue.js';
import { CourseController } from './course.js';
import { LessonController } from './lesson.js';

export const Router = {
  viewCache: new Map(),

  /**
   * Initialise le routeur SPA
   */
  init() {
    this.interceptLinks();
    this.bindPopState();
  },

  /**
   * Intercepte les clics sur les liens internes du site
   */
  interceptLinks() {
    document.addEventListener('click', async (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignorer les ancres simples sur la même page (#courses, #about) et les liens externes/mailto
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://')) {
        return;
      }

      // Si le lien pointe vers index.html, course.html ou lesson.html
      const isInternalAppPage = href.includes('index.html') || href.includes('course.html') || href.includes('lesson.html');
      if (!isInternalAppPage) return;

      e.preventDefault();
      await this.navigate(href);
    });
  },

  /**
   * Écoute le bouton Précédent / Suivant du navigateur
   */
  bindPopState() {
    window.addEventListener('popstate', async (e) => {
      const currentUrl = window.location.pathname + window.location.search;
      await this.loadRoute(currentUrl, false);
    });
  },

  /**
   * Navigue vers une URL interne sans rechargement
   * @param {string} url 
   */
  async navigate(url) {
    window.history.pushState({}, '', url);
    await this.loadRoute(url, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Charge et injecte la vue correspondante
   * @param {string} url 
   * @param {boolean} shouldScroll 
   */
  async loadRoute(url, shouldScroll = true) {
    try {
      const parsed = new URL(url, window.location.origin);
      const pathname = parsed.pathname;
      const searchParams = parsed.searchParams;

      // Récupérer le contenu HTML distant
      let htmlText = this.viewCache.get(pathname);
      if (!htmlText) {
        const response = await fetch(pathname);
        if (!response.ok) {
          // Si fetch échoue (ex: environnement restreint), recharger normalement
          window.location.href = url;
          return;
        }
        htmlText = await response.text();
        this.viewCache.set(pathname, htmlText);
      }

      // Parser le HTML reçu
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const newMain = doc.querySelector('main');
      const currentMain = document.querySelector('main');

      if (newMain && currentMain) {
        // Remplacer le contenu du main avec animation douce
        currentMain.style.opacity = '0';
        currentMain.style.transition = 'opacity 0.15s ease';

        setTimeout(async () => {
          currentMain.innerHTML = newMain.innerHTML;
          currentMain.className = newMain.className;
          currentMain.style.opacity = '1';

          // Mettre à jour le titre du document
          if (doc.title) document.title = doc.title;

          // Mettre à jour l'état actif dans la navigation du header
          this.updateNavActiveState(pathname);

          // Initialiser le contrôleur approprié selon la page
          if (pathname.includes('lesson.html')) {
            const courseId = searchParams.get('course') || 'html-css';
            const lessonId = Number(searchParams.get('lesson')) || 0;
            await LessonController.init(courseId, lessonId);
          } else if (pathname.includes('course.html')) {
            const courseId = searchParams.get('course') || 'html-css';
            await CourseController.init(courseId);
          } else {
            await CatalogueController.init();
          }

          if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      } else {
        window.location.href = url;
      }
    } catch (err) {
      console.warn('Erreur navigation SPA, fallback sur navigation classique:', err);
      window.location.href = url;
    }
  },

  /**
   * Met à jour la classe .active dans le menu header
   */
  updateNavActiveState(pathname) {
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (pathname.includes('lesson.html') || pathname.includes('course.html')) {
        if (href.includes('course.html') || href.includes('#courses')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } else if (pathname.includes('index.html') || pathname === '/' || pathname.endsWith('/')) {
        if (href === 'index.html' || href === '/') {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }
};
