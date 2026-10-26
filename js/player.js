/**
 * Learnify - Video Player Service (Bonus 1)
 * Lecteur vidéo interactif avec marqueurs de progression, chapitres cliquables
 * et synchronisation de la timeline.
 */

export const VideoPlayer = {
  /**
   * Initialise le lecteur et les marqueurs sous la vidéo
   * @param {HTMLElement} videoContainer Conteneur de l'iframe vidéo
   * @param {Object} lesson Objet de la leçon actuelle
   */
  init(videoContainer, lesson) {
    if (!videoContainer || !lesson) return;

    // Supprimer tout ancien bloc de marqueurs s'il existe déjà
    const existingMarkers = document.getElementById('lesson-video-markers');
    if (existingMarkers) existingMarkers.remove();

    if (!lesson.markers || lesson.markers.length === 0) return;

    const iframe = videoContainer.querySelector('iframe');
    const baseVideoUrl = lesson.videoUrl || (iframe ? iframe.src : '');

    // Créer la barre de marqueurs
    const markersBlock = document.createElement('div');
    markersBlock.id = 'lesson-video-markers';
    markersBlock.className = 'video-markers-panel';

    markersBlock.innerHTML = `
      <div class="markers-heading">
        <span class="markers-badge">CHAPITRES DE LA LEÇON</span>
        <small>Cliquez sur un marqueur pour sauter directement à cette section</small>
      </div>
      <div class="markers-timeline-bar" role="tablist" aria-label="Chapitres de la vidéo">
        ${lesson.markers.map((marker, index) => `
          <button 
            type="button" 
            class="marker-chip ${index === 0 ? 'active' : ''}" 
            data-seconds="${marker.seconds || 0}"
            data-index="${index}"
            aria-selected="${index === 0 ? 'true' : 'false'}"
            role="tab"
          >
            <span class="marker-time">${marker.time}</span>
            <span class="marker-title">${marker.title}</span>
          </button>
        `).join('')}
      </div>
      <div class="marker-active-note" id="marker-active-note" aria-live="polite">
        Chapitre actif : <strong>${lesson.markers[0].title}</strong> (dès ${lesson.markers[0].time})
      </div>
    `;

    // Insérer juste en dessous de videoContainer
    videoContainer.parentNode.insertBefore(markersBlock, videoContainer.nextSibling);

    // Écouteurs sur les marqueurs
    const chips = markersBlock.querySelectorAll('.marker-chip');
    const activeNote = markersBlock.querySelector('#marker-active-note');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const seconds = Number(chip.getAttribute('data-seconds')) || 0;
        const index = Number(chip.getAttribute('data-index'));
        const marker = lesson.markers[index];

        chips.forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-selected', 'true');

        if (activeNote && marker) {
          activeNote.innerHTML = `Chapitre actif : <strong>${marker.title}</strong> (dès ${marker.time})`;
        }

        // Mettre à jour l'iframe pour sauter au moment souhaité (avec autoplay)
        if (iframe && baseVideoUrl) {
          const sep = baseVideoUrl.includes('?') ? '&' : '?';
          iframe.src = `${baseVideoUrl}${sep}start=${seconds}&autoplay=1`;
        }
      });
    });
  }
};
