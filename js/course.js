/**
 * Learnify - Course Detail Controller (Vanilla JS)
 * Gère l'affichage dynamique de la présentation d'un cours, de son curriculum
 * et de ses métriques de progression.
 */

import { DataService } from './data.js';
import { Storage } from './storage.js';
import { ProgressTracker } from './progress.js';

export const CourseController = {
  currentCourse: null,

  /**
   * Initialise la page de présentation d'un cours
   * @param {string} courseId 
   */
  async init(courseId = 'html-css') {
    const course = await DataService.getCourseById(courseId);
    if (!course) {
      console.warn(`Cours introuvable : ${courseId}`);
      return;
    }

    this.currentCourse = course;
    this.render();
  },

  /**
   * Rendu complet des informations du cours
   */
  render() {
    const course = this.currentCourse;
    if (!course) return;

    // Titre et métadonnées
    document.title = `${course.title} — Learnify`;

    // Fil d'Ariane
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        <a href="index.html">Accueil</a>
        <span>/</span>
        <a href="index.html#courses">Cours</a>
        <span>/</span>
        <span>${course.title}</span>
      `;
    }

    // Hero du cours
    const heroCopy = document.querySelector('.course-hero-copy');
    if (heroCopy) {
      const stats = ProgressTracker.getStats(course);
      const firstUnfinished = this.getFirstUnfinishedLessonIndex(course);

      heroCopy.innerHTML = `
        <span class="tag ${course.tagClass || 'tag-web'}">${course.eyebrow || course.category.toUpperCase()}</span>
        <h1>${course.title.replace(' ', '<br><span>') + '</span>'}</h1>
        <p>${course.description}</p>
        <div class="course-hero-meta">
          <span>◷ ${course.duration}</span>
          <span>▤ ${course.lessons.length} leçons</span>
          <span>● Niveau ${course.level}</span>
        </div>
        <a class="button button-primary" href="lesson.html?course=${course.id}&lesson=${firstUnfinished}">
          ${stats.completedCount > 0 ? 'Continuer le cours' : 'Commencer le cours'} <span>→</span>
        </a>
      `;
    }

    // Hero Art : afficher la miniature si disponible
    const heroArt = document.querySelector('.course-hero-art');
    if (heroArt && course.thumbnail) {
      heroArt.innerHTML = `
        <img src="${course.thumbnail}" alt="${course.title}" class="course-hero-thumb-img" style="width:100%; height:100%; object-fit:cover; border-radius:18px; box-shadow: 0 16px 36px rgba(0,0,0,.15);">
        <div class="course-hero-sticker">COURS<br><strong>${course.category.toUpperCase()}</strong></div>
      `;
    }

    // Contenu "À propos"
    const aboutPanel = document.querySelector('.content-panel:not(.curriculum)');
    if (aboutPanel) {
      const p = aboutPanel.querySelector('p');
      if (p) p.textContent = course.about || course.description;

      const objGrid = aboutPanel.querySelector('.objective-grid');
      if (objGrid && course.objectives) {
        objGrid.innerHTML = course.objectives.map(obj => `
          <div><span>✓</span>${obj}</div>
        `).join('');
      }
    }

    // Curriculum (liste des leçons)
    const curriculumPanel = document.querySelector('.content-panel.curriculum');
    if (curriculumPanel) {
      const countBadge = curriculumPanel.querySelector('.lesson-count');
      if (countBadge) countBadge.textContent = `${course.lessons.length} leçons`;

      // Supprimer les anciennes lignes
      const oldRows = curriculumPanel.querySelectorAll('.lesson-row');
      oldRows.forEach(r => r.remove());

      // Insérer les lignes dynamiques
      course.lessons.forEach((l, idx) => {
        const isDone = Storage.isLessonCompleted(course.id, idx);
        const row = document.createElement('a');
        row.className = `lesson-row ${isDone ? 'completed' : ''}`;
        row.href = `lesson.html?course=${course.id}&lesson=${idx}`;
        row.innerHTML = `
          <span class="lesson-number">${String(idx + 1).padStart(2, '0')}</span>
          <span class="lesson-text">
            <strong>${l.title}</strong>
            <small>${l.subtitle || l.duration}</small>
          </span>
          <span class="lesson-state">${isDone ? '✓' : '▶'}</span>
        `;
        curriculumPanel.appendChild(row);
      });
    }

    // Instructeur
    const instructorPanel = document.querySelector('.instructor-panel');
    if (instructorPanel && course.instructor) {
      const avatar = instructorPanel.querySelector('.instructor-avatar');
      if (avatar) avatar.textContent = course.instructor.initials || 'IN';

      const strong = instructorPanel.querySelector('.instructor-info strong');
      if (strong) strong.textContent = course.instructor.name;

      const small = instructorPanel.querySelector('.instructor-info small');
      if (small) small.textContent = course.instructor.role;

      const bio = instructorPanel.querySelector('p');
      if (bio) bio.textContent = course.instructor.bio;
    }

    // Panneau de progression latérale
    ProgressTracker.updateCoursePage(course);
  },

  /**
   * Trouve l'indice de la première leçon non validée
   * @param {Object} course 
   * @returns {number}
   */
  getFirstUnfinishedLessonIndex(course) {
    if (!course || !course.lessons) return 0;
    const completed = Storage.getCompletedLessons(course.id);
    const idx = course.lessons.findIndex((_, i) => !completed.includes(i));
    return idx === -1 ? 0 : idx;
  }
};
