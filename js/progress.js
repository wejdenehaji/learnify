/**
 * Learnify - Progress Service (Vanilla JS)
 * Calcule et met à jour en temps réel l'ensemble des indicateurs de progression,
 * pourcentages, checklists et reprises de session.
 */

import { Storage } from './storage.js';

export const ProgressTracker = {
  /**
   * Calcule les métriques de progression pour un cours
   * @param {Object} course 
   * @returns {{ completedCount: number, totalCount: number, percentage: number, isComplete: boolean }}
   */
  getStats(course) {
    if (!course || !course.lessons || course.lessons.length === 0) {
      return { completedCount: 0, totalCount: 0, percentage: 0, isComplete: false };
    }

    const completed = Storage.getCompletedLessons(course.id);
    const totalCount = course.lessons.length;
    // Compter uniquement les IDs valides appartenant au cours
    const validCompleted = completed.filter(id => id >= 0 && id < totalCount);
    const completedCount = validCompleted.length;
    const percentage = Math.round((completedCount / totalCount) * 100);

    return {
      completedCount,
      totalCount,
      percentage,
      isComplete: completedCount === totalCount && totalCount > 0
    };
  },

  /**
   * Met à jour les jauges et états sur la page de Leçon
   * @param {Object} course 
   * @param {number} currentLessonIndex 
   */
  updateLessonPage(course, currentLessonIndex) {
    if (!course) return;
    const stats = this.getStats(course);

    // 1. Barre et pourcentage du haut
    const percentEl = document.getElementById('lesson-progress-percent');
    if (percentEl) percentEl.textContent = `${stats.percentage}%`;

    const fillTop = document.getElementById('lesson-progress-fill');
    if (fillTop) {
      fillTop.style.width = `${stats.percentage}%`;
      fillTop.setAttribute('role', 'progressbar');
      fillTop.setAttribute('aria-valuenow', stats.percentage);
      fillTop.setAttribute('aria-valuemin', '0');
      fillTop.setAttribute('aria-valuemax', '100');
    }

    // 2. Barre latérale de progression
    const fillSidebar = document.getElementById('sidebar-progress-fill');
    if (fillSidebar) {
      fillSidebar.style.width = `${stats.percentage}%`;
      fillSidebar.setAttribute('role', 'progressbar');
      fillSidebar.setAttribute('aria-valuenow', stats.percentage);
      fillSidebar.setAttribute('aria-valuemin', '0');
      fillSidebar.setAttribute('aria-valuemax', '100');
    }

    const textSidebar = document.getElementById('sidebar-progress-text');
    if (textSidebar) {
      textSidebar.textContent = `${stats.completedCount} sur ${stats.totalCount} terminées (${stats.percentage}%)`;
    }

    // 3. Bouton "Marquer comme terminée"
    const completeBtn = document.getElementById('complete-lesson');
    if (completeBtn) {
      const isDone = Storage.isLessonCompleted(course.id, currentLessonIndex);
      if (isDone) {
        completeBtn.textContent = '✓ Leçon terminée';
        completeBtn.classList.remove('button-primary');
        completeBtn.classList.add('button-done');
        completeBtn.setAttribute('aria-pressed', 'true');
      } else {
        completeBtn.textContent = 'Marquer comme terminée ✓';
        completeBtn.classList.remove('button-done');
        completeBtn.classList.add('button-primary');
        completeBtn.setAttribute('aria-pressed', 'false');
      }
    }

    // 4. Liste latérale des leçons (checklist)
    const lessonItems = document.querySelectorAll('#lesson-list .sidebar-lesson');
    lessonItems.forEach((item) => {
      const idx = Number(item.getAttribute('data-lesson'));
      const isDone = Storage.isLessonCompleted(course.id, idx);
      const icon = item.querySelector('i');

      if (idx === currentLessonIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }

      if (isDone) {
        item.classList.add('completed');
        if (icon) icon.textContent = '✓';
      } else {
        item.classList.remove('completed');
        if (icon) icon.textContent = '▶';
      }
    });
  },

  /**
   * Met à jour la liste des leçons sur la page de présentation du cours
   * @param {Object} course 
   */
  updateCoursePage(course) {
    if (!course) return;
    const stats = this.getStats(course);

    const rows = document.querySelectorAll('.curriculum .lesson-row');
    rows.forEach((row, idx) => {
      const isDone = Storage.isLessonCompleted(course.id, idx);
      const stateEl = row.querySelector('.lesson-state');

      if (isDone) {
        row.classList.add('completed');
        if (stateEl) stateEl.textContent = '✓';
      } else {
        row.classList.remove('completed');
        if (stateEl) stateEl.textContent = '▶';
      }
    });

    // Mettre à jour le panneau latéral de progression
    const progressPanel = document.querySelector('.course-sidebar .progress-panel');
    if (progressPanel) {
      let tracker = progressPanel.querySelector('.course-progress-widget');
      if (!tracker) {
        tracker = document.createElement('div');
        tracker.className = 'course-progress-widget';
        progressPanel.insertBefore(tracker, progressPanel.querySelector('.button'));
      }
      tracker.innerHTML = `
        <div class="progress-info-row">
          <span>Progression</span>
          <strong>${stats.percentage}%</strong>
        </div>
        <div class="progress-track" role="progressbar" aria-valuenow="${stats.percentage}" aria-valuemin="0" aria-valuemax="100">
          <span style="width: ${stats.percentage}%;"></span>
        </div>
        <small class="progress-details">${stats.completedCount} sur ${stats.totalCount} leçons validées</small>
      `;
    }
  },

  /**
   * Affiche la bannière de reprise de cours si une session précédente existe
   * @param {Function} onResume Callback de navigation
   */
  renderResumeBanner(container, onResume) {
    if (!container) return;
    const lastPos = Storage.getLastPosition();
    const existingBanner = document.getElementById('learnify-resume-banner');

    if (!lastPos) {
      if (existingBanner) existingBanner.remove();
      return;
    }

    if (!existingBanner) {
      const banner = document.createElement('section');
      banner.id = 'learnify-resume-banner';
      banner.className = 'resume-banner container';
      container.prepend(banner);
    }

    const banner = document.getElementById('learnify-resume-banner');
    banner.innerHTML = `
      <div class="resume-inner">
        <div class="resume-icon">⚡</div>
        <div class="resume-text">
          <span class="resume-eyebrow">CONTINUER MON APPRENTISSAGE</span>
          <h3>Reprenez là où vous vous étiez arrêté</h3>
          <p>Votre dernière leçon est prête. Cliquez pour reprendre immédiatement.</p>
        </div>
        <button type="button" class="button button-primary resume-action" id="btn-resume-session">
          Reprendre le cours <span>→</span>
        </button>
      </div>
    `;

    const btn = document.getElementById('btn-resume-session');
    if (btn) {
      btn.addEventListener('click', () => {
        if (onResume) {
          onResume(lastPos.courseId, lastPos.lessonId);
        } else {
          window.location.href = `lesson.html?course=${lastPos.courseId}&lesson=${lastPos.lessonId}`;
        }
      });
    }
  }
};
