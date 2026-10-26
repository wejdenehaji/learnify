/**
 * Learnify - Point d'entrée
 * Lit l'URL pour savoir quelle page afficher, puis appelle la bonne fonction.
 *   index.html                          -> catalogue
 *   course.html?course=html-css         -> présentation d'un cours
 *   lesson.html?course=html-css&lesson=2 -> une leçon
 */

import { Router } from './router.js';
import { showCatalogue } from './catalogue.js';
import { showCourse } from './course.js';
import { showLesson } from './lesson.js';
import { showMessage } from './utils.js';

async function showPage() {
  const page = location.pathname.split('/').pop();
  const params = new URLSearchParams(location.search);
  const courseId = params.get('course') || 'html-css';

  try {
    if (page === 'lesson.html') await showLesson(courseId, Number(params.get('lesson')) || 0);
    else if (page === 'course.html') await showCourse(courseId);
    else await showCatalogue();
  } catch (e) {
    console.error(e);
    showMessage('Impossible de charger les cours. Lancez le site avec Live Server.');
  }
}

Router.init(showPage);
showPage();
