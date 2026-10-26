/**
 * Learnify - Page d'une leçon
 * Remplit la page avec les données de la leçon, branche la navigation, le bouton "terminée",
 * les chapitres vidéo et le quiz. Enregistre aussi la position (pour "Reprendre").
 */

import { getCourse } from './data.js';
import * as Store from './storage.js';
import { updateLessonProgress } from './progress.js';
import { showMarkers } from './player.js';
import { showQuiz } from './quiz.js';
import { $, esc, showMessage } from './utils.js';

export async function showLesson(courseId, requestedIndex) {
  const course = await getCourse(courseId);
  if (!course || !course.lessons || course.lessons.length === 0) return showMessage('Cours ou leçon introuvable.');

  // Numéro de leçon invalide (négatif, trop grand) : on le ramène dans les limites
  const total = course.lessons.length;
  const index = Math.min(Math.max(requestedIndex, 0), total - 1);
  const lesson = course.lessons[index];
  const id = encodeURIComponent(course.id);
  const lessonLink = (i) => `lesson.html?course=${id}&lesson=${i}`;

  Store.setPosition(course.id, index);

  // Titres
  document.title = `${lesson.title} — ${course.title} — Learnify`;
  $('breadcrumb-course').textContent = course.title;
  $('breadcrumb-course').href = `course.html?course=${id}`;
  $('breadcrumb-lesson').textContent = `Leçon ${index + 1}`;
  $('lesson-eyebrow').textContent = course.title.toUpperCase();
  $('lesson-title').textContent = lesson.title;
  $('lesson-subtitle').textContent = `Leçon ${index + 1} sur ${total} · ${lesson.duration}`;
  $('back-course').href = `course.html?course=${id}`;

  // Vidéo + chapitres
  $('lesson-video').src = lesson.videoUrl || '';
  $('lesson-video').title = `Vidéo : ${lesson.title}`;
  showMarkers($('video-markers'), $('lesson-video'), lesson);

  // Texte et code
  $('article-heading').textContent = lesson.articleHeading || lesson.title;
  $('lesson-description').textContent = lesson.description;
  $('lesson-tip').textContent = lesson.tip;
  $('lesson-code').textContent = lesson.codeSnippet || '// Pas d\'exemple pour cette leçon';

  // Leçon précédente / suivante (cachées aux extrémités)
  const prev = $('previous-lesson');
  const next = $('next-lesson');
  prev.style.visibility = index > 0 ? 'visible' : 'hidden';
  next.style.visibility = index < total - 1 ? 'visible' : 'hidden';
  prev.href = lessonLink(Math.max(index - 1, 0));
  next.href = lessonLink(Math.min(index + 1, total - 1));

  // Liste latérale des leçons (la checklist est mise à jour par updateLessonProgress)
  $('lesson-count').textContent = total;
  $('lesson-list').innerHTML = course.lessons.map((l, i) => `
    <a href="${lessonLink(i)}" data-lesson="${i}" class="sidebar-lesson ${i === index ? 'active' : ''}" ${i === index ? 'aria-current="true"' : ''}>
      <span class="sidebar-lesson-number">${String(i + 1).padStart(2, '0')}</span>
      <span><strong>${esc(l.title)}</strong><small>${esc(l.duration)}</small></span>
      <i>▶</i>
    </a>`).join('');

  // Bouton "Marquer comme terminée"
  $('complete-lesson').addEventListener('click', () => {
    Store.toggleDone(course.id, index);
    updateLessonProgress(course, index);
  });

  // Quiz : si on le réussit, la leçon est marquée terminée et la progression est mise à jour
  showQuiz($('quiz'), course, index, () => updateLessonProgress(course, index));

  updateLessonProgress(course, index);
}
