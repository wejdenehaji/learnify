/**
 * Learnify - Chapitres de la vidéo (Bonus 1)
 * Un clic sur un chapitre recharge l'iframe YouTube avec ?start=<secondes>&autoplay=1.
 * Remarque : on ne mesure pas le temps réellement regardé, seulement le chapitre choisi.
 */

import { esc } from './utils.js';

export function showMarkers(box, iframe, lesson) {
  const markers = lesson.markers || [];
  if (markers.length === 0 || !lesson.videoUrl) { box.innerHTML = ''; return; }

  box.innerHTML = `
    <div class="video-markers-panel">
      <div class="markers-heading">
        <span class="markers-badge">CHAPITRES DE LA LEÇON</span>
        <small>Cliquez sur un chapitre pour sauter à cet endroit</small>
      </div>
      <div class="markers-timeline-bar">
        ${markers.map((m, i) => `
          <button type="button" class="marker-chip ${i === 0 ? 'active' : ''}" data-seconds="${Number(m.seconds) || 0}" aria-pressed="${i === 0}">
            <span class="marker-time">${esc(m.time)}</span><span>${esc(m.title)}</span>
          </button>`).join('')}
      </div>
    </div>`;

  const chips = box.querySelectorAll('.marker-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => { c.classList.toggle('active', c === chip); c.setAttribute('aria-pressed', c === chip); });
      const separator = lesson.videoUrl.includes('?') ? '&' : '?';
      iframe.src = `${lesson.videoUrl}${separator}start=${chip.dataset.seconds}&autoplay=1`;
    });
  });
}
