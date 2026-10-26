/**
 * Learnify - Calcul et affichage de la progression
 * Pourcentage = leçons terminées / total des leçons x 100
 */

import * as Store from './storage.js';
import { $ } from './utils.js';

export function getStats(course) {
  const total = (course.lessons || []).length;
  const done = Store.getDone(course.id).filter((i) => i >= 0 && i < total).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

function setBar(bar, percent) {
  bar.style.width = `${percent}%`;
  bar.setAttribute('aria-valuenow', percent);
}

// Met à jour tous les indicateurs de la page leçon (sans recharger la vidéo ni le quiz)
export function updateLessonProgress(course, lessonIndex) {
  const { done, total, percent } = getStats(course);

  $('lesson-progress-percent').textContent = `${percent}%`;
  setBar($('lesson-progress-fill'), percent);
  setBar($('sidebar-progress-fill'), percent);
  $('sidebar-progress-text').textContent =
    `${done} sur ${total} terminées${percent === 100 ? ' — cours terminé, bravo !' : ''}`;

  // Checklist latérale
  document.querySelectorAll('#lesson-list .sidebar-lesson').forEach((item) => {
    const finished = Store.isDone(course.id, Number(item.dataset.lesson));
    item.classList.toggle('completed', finished);
    item.querySelector('i').textContent = finished ? '✓' : '▶';
  });

  // Bouton "Marquer comme terminée"
  const button = $('complete-lesson');
  const finished = Store.isDone(course.id, lessonIndex);
  button.textContent = finished ? '✓ Leçon terminée' : 'Marquer comme terminée ✓';
  button.classList.toggle('button-done', finished);
  button.classList.toggle('button-primary', !finished);
  button.setAttribute('aria-pressed', finished);
}
