/**
 * Learnify - Lesson View Controller (Vanilla JS)
 * Gère l'affichage dynamique des leçons, la navigation entre leçons sans rechargement,
 * les marqueurs vidéo, le quiz interactif et la sauvegarde de position.
 */

import { DataService } from './data.js';
import { Storage } from './storage.js';
import { ProgressTracker } from './progress.js';
import { VideoPlayer } from './player.js';
import { QuizEngine } from './quiz.js';

export const LessonController = {
  currentCourse: null,
  currentLessonIndex: 0,

  /**
   * Initialise la page de leçon
   * @param {string} courseId 
   * @param {number} lessonIndex 
   */
  async init(courseId = 'html-css', lessonIndex = 0) {
    const data = await DataService.getLesson(courseId, lessonIndex);
    if (!data) {
      console.warn(`Leçon non trouvée pour courseId=${courseId}, lessonIndex=${lessonIndex}`);
      return;
    }

    this.currentCourse = data.course;
    this.currentLessonIndex = data.index;

    // Enregistrer la position pour la reprise automatique
    Storage.setLastPosition(this.currentCourse.id, this.currentLessonIndex);

    // Mettre à jour l'affichage
    this.render();
    this.bindEvents();
  },

  /**
   * Met à jour le DOM avec le contenu de la leçon active
   */
  render() {
    const course = this.currentCourse;
    const lesson = course.lessons[this.currentLessonIndex];
    const total = course.lessons.length;

    // 1. Titre et métadonnées
    document.title = `${lesson.title} — ${course.title} — Learnify`;

    const breadcrumbLesson = document.getElementById('breadcrumb-lesson');
    if (breadcrumbLesson) breadcrumbLesson.textContent = `Leçon ${this.currentLessonIndex + 1}`;

    const breadcrumbCourse = document.querySelector('.breadcrumbs a[href*="course.html"]');
    if (breadcrumbCourse) {
      breadcrumbCourse.textContent = course.title;
      breadcrumbCourse.href = `course.html?course=${course.id}`;
    }

    const eyebrow = document.querySelector('.lesson-page-heading .eyebrow');
    if (eyebrow) eyebrow.textContent = course.eyebrow || course.title.toUpperCase();

    const titleEl = document.getElementById('lesson-title');
    if (titleEl) titleEl.textContent = lesson.title;

    const subtitleEl = document.getElementById('lesson-subtitle');
    if (subtitleEl) subtitleEl.textContent = `Leçon ${this.currentLessonIndex + 1} sur ${total} · ${lesson.duration}`;

    // 2. Vidéo
    const videoIframe = document.getElementById('lesson-video');
    const videoFrame = document.querySelector('.video-frame');
    if (videoIframe && lesson.videoUrl) {
      videoIframe.src = lesson.videoUrl;
      videoIframe.title = `Vidéo de la leçon : ${lesson.title}`;
    }

    // Initialiser les marqueurs vidéo (Bonus 1)
    if (videoFrame) {
      VideoPlayer.init(videoFrame, lesson);
    }

    // 3. Contenu texte et code
    const headingEl = document.getElementById('article-heading');
    if (headingEl) headingEl.textContent = lesson.articleHeading || lesson.title;

    const descEl = document.getElementById('lesson-description');
    if (descEl) descEl.textContent = lesson.description;

    const tipEl = document.getElementById('lesson-tip');
    if (tipEl) tipEl.textContent = lesson.tip;

    const codeEl = document.getElementById('lesson-code');
    if (codeEl) codeEl.textContent = lesson.codeSnippet || '// Aucun exemple pour cette leçon';

    // 4. Navigation précédente / suivante (sans rechargement)
    const prevBtn = document.getElementById('previous-lesson');
    const nextBtn = document.getElementById('next-lesson');

    if (prevBtn) {
      if (this.currentLessonIndex > 0) {
        prevBtn.style.visibility = 'visible';
        prevBtn.href = `lesson.html?course=${course.id}&lesson=${this.currentLessonIndex - 1}`;
        prevBtn.setAttribute('data-target-lesson', this.currentLessonIndex - 1);
      } else {
        prevBtn.style.visibility = 'hidden';
      }
    }

    if (nextBtn) {
      if (this.currentLessonIndex < total - 1) {
        nextBtn.style.visibility = 'visible';
        nextBtn.href = `lesson.html?course=${course.id}&lesson=${this.currentLessonIndex + 1}`;
        nextBtn.setAttribute('data-target-lesson', this.currentLessonIndex + 1);
      } else {
        nextBtn.style.visibility = 'hidden';
      }
    }

    // 5. Rendu de la liste latérale (checklist interactive)
    const lessonListEl = document.getElementById('lesson-list');
    const sidebarCount = document.querySelector('.lesson-sidebar .lesson-count');
    if (sidebarCount) sidebarCount.textContent = total;

    if (lessonListEl) {
      lessonListEl.innerHTML = course.lessons.map((l, idx) => {
        const isDone = Storage.isLessonCompleted(course.id, idx);
        const isActive = idx === this.currentLessonIndex;
        const num = String(idx + 1).padStart(2, '0');

        return `
          <a 
            href="lesson.html?course=${course.id}&lesson=${idx}" 
            data-lesson="${idx}" 
            class="sidebar-lesson ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}"
            role="button"
            aria-current="${isActive ? 'true' : 'false'}"
          >
            <span class="sidebar-lesson-number">${num}</span>
            <span>
              <strong>${l.title}</strong>
              <small>${l.duration}</small>
            </span>
            <i>${isDone ? '✓' : '▶'}</i>
          </a>
        `;
      }).join('');
    }

    // 6. Rendu du Quiz interactif (Obligatoire 4)
    let quizContainer = document.getElementById('lesson-quiz-container');
    if (!quizContainer) {
      quizContainer = document.createElement('div');
      quizContainer.id = 'lesson-quiz-container';
      const lessonContent = document.querySelector('.lesson-content');
      if (lessonContent) {
        const actions = lessonContent.querySelector('.lesson-actions');
        lessonContent.insertBefore(quizContainer, actions);
      }
    }

    QuizEngine.render(quizContainer, course, lesson, () => {
      // Callback en cas de succès au quiz : rafraîchir l'état de progression
      ProgressTracker.updateLessonPage(course, this.currentLessonIndex);
    });

    // 7. Mettre à jour l'ensemble des métriques de progression
    ProgressTracker.updateLessonPage(course, this.currentLessonIndex);
  },

  /**
   * Branche les interactions de la page
   */
  bindEvents() {
    // Bouton "Marquer comme terminée"
    const completeBtn = document.getElementById('complete-lesson');
    if (completeBtn && !completeBtn.dataset.bound) {
      completeBtn.dataset.bound = 'true';
      completeBtn.addEventListener('click', () => {
        if (!this.currentCourse) return;
        Storage.toggleLessonCompleted(this.currentCourse.id, this.currentLessonIndex);
        ProgressTracker.updateLessonPage(this.currentCourse, this.currentLessonIndex);
      });
    }

    // Navigation entre leçons sans rechargement complet (SPA)
    const prevBtn = document.getElementById('previous-lesson');
    const nextBtn = document.getElementById('next-lesson');

    const handleNavClick = (e, btn) => {
      e.preventDefault();
      const target = Number(btn.getAttribute('data-target-lesson'));
      if (!isNaN(target)) {
        this.goToLesson(target);
      }
    };

    if (prevBtn && !prevBtn.dataset.bound) {
      prevBtn.dataset.bound = 'true';
      prevBtn.addEventListener('click', (e) => handleNavClick(e, prevBtn));
    }

    if (nextBtn && !nextBtn.dataset.bound) {
      nextBtn.dataset.bound = 'true';
      nextBtn.addEventListener('click', (e) => handleNavClick(e, nextBtn));
    }

    // Clic sur la liste latérale sans rechargement
    const lessonListEl = document.getElementById('lesson-list');
    if (lessonListEl && !lessonListEl.dataset.bound) {
      lessonListEl.dataset.bound = 'true';
      lessonListEl.addEventListener('click', (e) => {
        const item = e.target.closest('.sidebar-lesson');
        if (item) {
          e.preventDefault();
          const target = Number(item.getAttribute('data-lesson'));
          if (!isNaN(target)) {
            this.goToLesson(target);
          }
        }
      });
    }

    // Écouter les mises à jour globales de progression
    window.addEventListener('learnify:progress-updated', () => {
      if (this.currentCourse) {
        ProgressTracker.updateLessonPage(this.currentCourse, this.currentLessonIndex);
      }
    });
  },

  /**
   * Change de leçon dans la vue active sans recharger la page
   * @param {number} newIndex 
   */
  goToLesson(newIndex) {
    if (!this.currentCourse) return;
    const total = this.currentCourse.lessons.length;
    if (newIndex < 0 || newIndex >= total) return;

    this.currentLessonIndex = newIndex;
    Storage.setLastPosition(this.currentCourse.id, this.currentLessonIndex);

    // Mettre à jour l'URL avec History API
    const newUrl = `lesson.html?course=${this.currentCourse.id}&lesson=${newIndex}`;
    window.history.pushState({ courseId: this.currentCourse.id, lessonIndex: newIndex }, '', newUrl);

    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
