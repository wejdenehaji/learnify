/**
 * Learnify - Sauvegarde dans localStorage
 *
 * Clés utilisées :
 *  learnify_progress  -> { "html-css": [0, 2], "python": [1] }   leçons terminées par cours
 *  learnify_position  -> { courseId: "html-css", lessonId: 2 }   dernière leçon visitée
 *  learnify_scores    -> { "html-css_0": { score: 2, total: 2 } } meilleur score par quiz
 *  learnify_courses   -> [ {cours ajoutés par l'admin} ]
 *  learnify_deleted   -> [ "python" ]                            ids de cours masqués
 */

const KEYS = {
  progress: 'learnify_progress',
  position: 'learnify_position',
  scores: 'learnify_scores',
  courses: 'learnify_courses',
  deleted: 'learnify_deleted'
};

// Lit et décode une clé. Si elle est absente, illisible ou du mauvais type : on renvoie `fallback`
function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    const sameType = typeof value === typeof fallback && Array.isArray(value) === Array.isArray(fallback);
    return value !== null && sameType ? value : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* stockage plein ou bloqué */ }
}

/* ---------- Progression ---------- */

export function getDone(courseId) {
  const list = read(KEYS.progress, {})[courseId];
  return Array.isArray(list) ? list.filter(Number.isInteger) : [];
}

export const isDone = (courseId, lessonIndex) => getDone(courseId).includes(lessonIndex);

export function setDone(courseId, lessonIndex, done = true) {
  const all = read(KEYS.progress, {});
  const list = new Set(getDone(courseId));
  if (done) list.add(lessonIndex); else list.delete(lessonIndex);
  all[courseId] = [...list];
  write(KEYS.progress, all);
}

export const toggleDone = (courseId, lessonIndex) => setDone(courseId, lessonIndex, !isDone(courseId, lessonIndex));

/* ---------- Dernière position ---------- */

export function getPosition() {
  const p = read(KEYS.position, null);
  return p && typeof p.courseId === 'string' && Number.isInteger(p.lessonId) ? p : null;
}

export const setPosition = (courseId, lessonId) => write(KEYS.position, { courseId, lessonId });

/* ---------- Scores des quiz ---------- */

export function saveScore(courseId, lessonIndex, score, total) {
  const all = read(KEYS.scores, {});
  const key = `${courseId}_${lessonIndex}`;
  if (!all[key] || score >= all[key].score) {
    all[key] = { score, total };
    write(KEYS.scores, all);
  }
}

export function getScore(courseId, lessonIndex) {
  const s = read(KEYS.scores, {})[`${courseId}_${lessonIndex}`];
  return s && Number.isInteger(s.score) && Number.isInteger(s.total) ? s : null;
}

/* ---------- Cours (administration) ---------- */

export const getCustomCourses = () => read(KEYS.courses, []);
export const getDeleted = () => read(KEYS.deleted, []);

export function addCourse(course) {
  write(KEYS.courses, [course, ...getCustomCourses()]);
}

// Supprime un cours ajouté, ou masque un cours du fichier JSON
export function deleteCourse(courseId) {
  write(KEYS.courses, getCustomCourses().filter((c) => c.id !== courseId));
  write(KEYS.deleted, [...new Set([...getDeleted(), courseId])]);
}

export function resetAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
