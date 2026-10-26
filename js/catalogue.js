/**
 * Learnify - Page d'accueil : bannière "Reprendre" + cartes des cours
 */

import { getCourses } from './data.js';
import * as Store from './storage.js';
import { getStats } from './progress.js';
import { $, esc } from './utils.js';

// Petite illustration pour chaque cours du fichier JSON (les cours ajoutés utilisent un badge)
const ART = {
  'html-css': '<div class="browser-window"><div class="browser-bar"><i></i><i></i><i></i></div><div class="browser-content"><b>&lt;/&gt;</b><span></span><span></span><em></em></div></div>',
  python: '<div class="python-mark">Py<span>•</span></div><div class="art-caption">print("hello")</div>',
  javascript: '<div class="js-tile">JS</div><div class="art-caption">make it work_</div>',
  ai: '<div class="ai-orb"><span>✳</span></div><div class="art-caption">human + machine</div>',
  database: '<div class="database-icon"><i></i><i></i><i></i></div><div class="art-caption">data / structure / query</div>',
  cloud: '<div class="cloud-shape">☁</div><div class="art-caption">anywhere · anytime</div>'
};

function courseCard(c) {
  const { percent } = getStats(c);
  const id = encodeURIComponent(c.id);
  const art = ART[c.id] || `<div class="custom-art-mark">${esc((c.badge || c.title.slice(0, 2)).toUpperCase())}</div>`;

  return `
    <article class="course-card">
      <a class="course-art ${esc(c.artClass)}" href="course.html?course=${id}" aria-label="Ouvrir le cours ${esc(c.title)}">
        <span class="art-label">${esc(c.eyebrow || c.category)}</span>
        ${art}
        <span class="art-orbit">${esc(c.badge)}</span>
      </a>
      <div class="course-info">
        <div class="course-meta">
          <span class="tag ${esc(c.tagClass || 'tag-web')}">${esc(c.category)}</span>
          <span>${(c.lessons || []).length} leçons</span>
        </div>
        <h3><a href="course.html?course=${id}">${esc(c.title)}</a></h3>
        <p>${esc(c.description)}</p>
        <div class="card-progress-bar" role="progressbar" aria-label="Progression du cours" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <span style="width: ${percent}%;"></span>
        </div>
        <div class="course-bottom">
          <span class="level"><i></i> ${esc(c.level)} · ${percent}%</span>
          <a href="course.html?course=${id}" class="round-link" aria-label="Voir le cours ${esc(c.title)}">↗</a>
        </div>
      </div>
    </article>`;
}

// Bannière "Reprendre là où vous vous étiez arrêté" (basée sur la dernière position sauvegardée)
function showResume(courses) {
  const box = $('resume');
  const pos = Store.getPosition();
  const course = pos && courses.find((c) => c.id === pos.courseId);
  const lesson = course && (course.lessons || [])[pos.lessonId];

  if (!lesson) { box.innerHTML = ''; return; }

  box.innerHTML = `
    <div class="resume-inner">
      <div class="resume-icon">⚡</div>
      <div class="resume-text">
        <span class="resume-eyebrow">CONTINUER MON APPRENTISSAGE</span>
        <h3>${esc(course.title)} — Leçon ${pos.lessonId + 1}</h3>
        <p>${esc(lesson.title)}</p>
      </div>
      <a class="button button-primary resume-action" href="lesson.html?course=${encodeURIComponent(course.id)}&lesson=${pos.lessonId}">Reprendre <span>→</span></a>
    </div>`;
}

export async function showCatalogue() {
  const courses = await getCourses();
  showResume(courses);
  $('course-grid').innerHTML = courses.length
    ? courses.map(courseCard).join('')
    : '<p class="empty-msg">Aucun cours disponible.</p>';
}
