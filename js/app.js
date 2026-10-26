/**
 * Learnify - Application Entry Point (Vanilla JS)
 * Initialise l'ensemble des modules, le routeur SPA, l'administration
 * et les contrôleurs selon la page chargée initialement.
 */

import { Router } from './router.js';
import { AdminPanel } from './admin.js';
import { CatalogueController } from './catalogue.js';
import { CourseController } from './course.js';
import { LessonController } from './lesson.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialiser le routeur SPA
  Router.init();

  // 2. Initialiser le panneau d'administration (Bonus 2)
  AdminPanel.init(async () => {
    // Si la page contient le catalogue, rafraîchir les cartes
    if (document.querySelector('.course-grid')) {
      await CatalogueController.renderCards();
    }
  });

  // 3. Détecter la page courante et initialiser le bon contrôleur
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  if (path.includes('lesson.html')) {
    const courseId = searchParams.get('course') || 'html-css';
    const lessonId = Number(searchParams.get('lesson')) || 0;
    await LessonController.init(courseId, lessonId);
  } else if (path.includes('course.html')) {
    const courseId = searchParams.get('course') || 'html-css';
    await CourseController.init(courseId);
  } else {
    // Accueil / Catalogue
    await CatalogueController.init();
  }
});
