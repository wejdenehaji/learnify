/**
 * Learnify - Administration simplifiée (Bonus 2) : ajouter / supprimer un cours
 * Les cours ajoutés sont gardés dans le localStorage de CE navigateur :
 * c'est une démonstration côté client, pas une vraie administration avec serveur.
 */

import * as Store from './storage.js';
import { getCourses } from './data.js';
import { $, esc } from './utils.js';

const DEFAULT_VIDEO = 'https://www.youtube-nocookie.com/embed/UB1O30fR-EE';
const TAG_CLASS = { Web: 'tag-web', Programmation: 'tag-js', Technologie: 'tag-ai', Design: 'tag-python' };

// Transforme un lien YouTube (watch, youtu.be ou embed) en lien embed ; null si le lien est invalide
function toEmbedUrl(link) {
  if (!link) return DEFAULT_VIDEO;
  const match = link.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cours';
}

function showFeedback(message, ok) {
  const box = $('admin-feedback');
  box.textContent = message;
  box.className = `admin-feedback ${ok ? 'feedback-success' : 'feedback-error'}`;
  box.hidden = false;
}

// Tableau des cours avec bouton Supprimer
async function renderTable() {
  const courses = await getCourses();
  $('course-count').textContent = `${courses.length} cours`;
  $('courses-tbody').innerHTML = courses.length ? courses.map((c) => `
    <tr>
      <td><strong>${esc(c.title)}</strong><small style="display:block;color:#888;">ID : ${esc(c.id)}</small></td>
      <td><span class="tag ${esc(c.tagClass || 'tag-web')}">${esc(c.category)}</span></td>
      <td>${(c.lessons || []).length} leçons</td>
      <td>
        <a href="course.html?course=${encodeURIComponent(c.id)}" class="btn-view-course">Voir ↗</a>
        <button type="button" class="btn-delete-course" data-delete="${esc(c.id)}" aria-label="Supprimer ${esc(c.title)}">🗑️</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="4">Aucun cours.</td></tr>';
}

// Lit le formulaire, vérifie les champs, puis ajoute le cours
async function addCourseFromForm() {
  const title = $('course-title').value.trim();
  const description = $('course-desc').value.trim();
  const category = $('course-category').value;
  const instructorName = $('course-instructor').value.trim() || 'Formateur';
  const lines = $('course-lessons').value.split('\n').map((l) => l.trim()).filter(Boolean);

  if (title.length < 3) return showFeedback('Le titre doit contenir au moins 3 caractères.', false);
  if (!description) return showFeedback('La description est obligatoire.', false);
  if (lines.length === 0) return showFeedback('Ajoutez au moins une leçon (une par ligne).', false);

  // Chaque ligne : "Titre de la leçon | lien YouTube (facultatif)"
  const lessons = [];
  for (const [i, line] of lines.entries()) {
    const [lessonTitle, link = ''] = line.split('|').map((part) => part.trim());
    const videoUrl = toEmbedUrl(link);
    if (!lessonTitle || !videoUrl) return showFeedback(`Ligne ${i + 1} invalide : vérifiez le titre et le lien YouTube.`, false);
    lessons.push({
      id: i, title: lessonTitle, subtitle: `Leçon ${i + 1} · 8 min`, duration: '8 min', videoUrl,
      markers: [], articleHeading: lessonTitle, description: `Contenu de la leçon « ${lessonTitle} ».`,
      tip: 'Pratiquez après chaque leçon pour mieux retenir.', codeSnippet: '', quiz: []
    });
  }

  // Identifiant unique basé sur le titre
  const existingIds = (await getCourses()).map((c) => c.id);
  let id = slugify(title);
  if (existingIds.includes(id)) id += `-${Date.now()}`;

  Store.addCourse({
    id, title, eyebrow: category.toUpperCase(), category, tagClass: TAG_CLASS[category] || 'tag-web',
    artClass: 'art-web', badge: 'NEW', level: $('course-level').value,
    duration: `Environ ${lessons.length * 8} minutes`, description, about: description,
    instructor: { name: instructorName, role: 'Formateur', initials: instructorName.slice(0, 2).toUpperCase(), bio: '' },
    objectives: [`Suivre les ${lessons.length} leçons de ${title}`], lessons
  });

  $('admin-form').reset();
  showFeedback(`✓ Le cours « ${title} » a été ajouté.`, true);
  renderTable();
}

$('admin-form').addEventListener('submit', (e) => { e.preventDefault(); addCourseFromForm(); });

$('courses-tbody').addEventListener('click', (e) => {
  const button = e.target.closest('[data-delete]');
  if (button && confirm('Supprimer ce cours ?')) {
    Store.deleteCourse(button.dataset.delete);
    renderTable();
  }
});

$('btn-reset').addEventListener('click', () => {
  if (confirm('Réinitialiser les cours et toute la progression ?')) {
    Store.resetAll();
    renderTable();
  }
});

renderTable().catch(() => showFeedback('Impossible de charger les cours. Lancez le site avec Live Server.', false));
