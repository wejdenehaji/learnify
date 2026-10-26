/**
 * Learnify - Page de présentation d'un cours
 */

import { getCourse } from './data.js';
import * as Store from './storage.js';
import { getStats } from './progress.js';
import { $, esc, showMessage } from './utils.js';

export async function showCourse(courseId) {
  const course = await getCourse(courseId);
  if (!course) return showMessage('Cours introuvable.');

  const lessons = course.lessons || [];
  const { done, total, percent } = getStats(course);
  const id = encodeURIComponent(course.id);
  // Première leçon non terminée (0 si tout est terminé)
  const next = Math.max(0, lessons.findIndex((_, i) => !Store.isDone(course.id, i)));
  const startLink = `lesson.html?course=${id}&lesson=${next}`;
  const instructor = course.instructor || {};

  document.title = `${course.title} — Learnify`;

  $('breadcrumbs').innerHTML = `
    <a href="index.html">Accueil</a><span>/</span>
    <a href="index.html#courses">Cours</a><span>/</span>
    <span>${esc(course.title)}</span>`;

  $('course-hero').innerHTML = `
    <span class="tag ${esc(course.tagClass || 'tag-web')}">${esc(course.eyebrow || course.category)}</span>
    <h1>${esc(course.title)}</h1>
    <p>${esc(course.description)}</p>
    <div class="course-hero-meta">
      <span>◷ ${esc(course.duration)}</span><span>▤ ${lessons.length} leçons</span><span>● Niveau ${esc(course.level)}</span>
    </div>
    <a class="button button-primary" href="${startLink}">${done > 0 ? 'Continuer le cours' : 'Commencer le cours'} <span>→</span></a>`;

  $('course-about').textContent = course.about || course.description;
  $('course-objectives').innerHTML = (course.objectives || []).map((o) => `<div><span>✓</span>${esc(o)}</div>`).join('');

  $('lesson-count').textContent = `${lessons.length} leçons`;
  $('lesson-rows').innerHTML = lessons.map((l, i) => {
    const finished = Store.isDone(course.id, i);
    return `
      <a class="lesson-row ${finished ? 'completed' : ''}" href="lesson.html?course=${id}&lesson=${i}">
        <span class="lesson-number">${String(i + 1).padStart(2, '0')}</span>
        <span class="lesson-text"><strong>${esc(l.title)}</strong><small>${esc(l.subtitle || l.duration)}</small></span>
        <span class="lesson-state">${finished ? '✓' : '▶'}</span>
      </a>`;
  }).join('');

  $('course-progress').innerHTML = `
    <div class="eyebrow">VOTRE PROGRESSION</div>
    <div class="course-progress-widget">
      <div class="progress-info-row"><span>Progression</span><strong>${percent}%</strong></div>
      <div class="progress-track"><span role="progressbar" aria-label="Progression du cours" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" style="width: ${percent}%;"></span></div>
      <small class="progress-details">${done} sur ${total} leçons terminées</small>
    </div>
    <a href="${startLink}" class="button button-primary button-full">${done > 0 ? 'Continuer le cours' : 'Commencer le cours'} <span>→</span></a>`;

  $('course-instructor').innerHTML = `
    <div class="eyebrow">VOTRE INSTRUCTEUR</div>
    <div class="instructor-info">
      <div class="instructor-avatar">${esc(instructor.initials || '?')}</div>
      <div><strong>${esc(instructor.name || 'Formateur')}</strong><small>${esc(instructor.role || '')}</small></div>
    </div>
    <p>${esc(instructor.bio || '')}</p>`;
}
