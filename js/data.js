/**
 * Learnify - Chargement des cours
 * Cours du fichier data/courses.json (sauf ceux supprimés) + cours ajoutés dans l'admin.
 * fetch() demande un serveur local : utiliser Live Server.
 */

import * as Store from './storage.js';

export async function getCourses() {
  const response = await fetch('data/courses.json');
  if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
  const baseCourses = await response.json();

  const deleted = Store.getDeleted();
  return [...Store.getCustomCourses(), ...baseCourses.filter((c) => !deleted.includes(c.id))];
}

export async function getCourse(courseId) {
  const courses = await getCourses();
  return courses.find((c) => c.id === courseId) || null;
}
