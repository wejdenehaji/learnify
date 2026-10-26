/**
 * Learnify - Storage Service (Vanilla JS)
 * Gère la persistance locale via localStorage (progression, position, quiz, cours personnalisés)
 */

const STORAGE_KEYS = {
  PROGRESS: 'learnify_progress_v1',
  LAST_POSITION: 'learnify_last_position_v1',
  QUIZ_SCORES: 'learnify_quiz_scores_v1',
  CUSTOM_COURSES: 'learnify_custom_courses_v1',
  DELETED_COURSES: 'learnify_deleted_courses_v1'
};

export const Storage = {
  /**
   * Récupère la liste des IDs de leçons terminées pour un cours
   * @param {string} courseId 
   * @returns {number[]} Tableau des indices de leçons terminées
   */
  getCompletedLessons(courseId) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
      return Array.isArray(data[courseId]) ? data[courseId] : [];
    } catch (e) {
      console.warn('Erreur lecture localStorage progress:', e);
      return [];
    }
  },

  /**
   * Vérifie si une leçon est validée
   * @param {string} courseId 
   * @param {number} lessonId 
   * @returns {boolean}
   */
  isLessonCompleted(courseId, lessonId) {
    const list = this.getCompletedLessons(courseId);
    return list.includes(Number(lessonId));
  },

  /**
   * Marque une leçon comme terminée ou non terminée
   * @param {string} courseId 
   * @param {number} lessonId 
   * @param {boolean} isCompleted 
   */
  setLessonCompleted(courseId, lessonId, isCompleted = true) {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}');
      const list = new Set(data[courseId] || []);
      const numId = Number(lessonId);

      if (isCompleted) {
        list.add(numId);
      } else {
        list.delete(numId);
      }

      data[courseId] = Array.from(list);
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('learnify:progress-updated', { detail: { courseId, lessonId, isCompleted } }));
    } catch (e) {
      console.warn('Erreur écriture localStorage progress:', e);
    }
  },

  /**
   * Bascule l'état d'achèvement d'une leçon
   * @param {string} courseId 
   * @param {number} lessonId 
   * @returns {boolean} Nouvel état
   */
  toggleLessonCompleted(courseId, lessonId) {
    const nextState = !this.isLessonCompleted(courseId, lessonId);
    this.setLessonCompleted(courseId, lessonId, nextState);
    return nextState;
  },

  /**
   * Récupère la dernière position enregistrée
   * @returns {{ courseId: string, lessonId: number, timestamp: number } | null}
   */
  getLastPosition() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LAST_POSITION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Sauvegarde la dernière position de l'étudiant
   * @param {string} courseId 
   * @param {number} lessonId 
   */
  setLastPosition(courseId, lessonId) {
    try {
      const payload = {
        courseId,
        lessonId: Number(lessonId),
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.LAST_POSITION, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent('learnify:position-updated', { detail: payload }));
    } catch (e) {
      console.warn('Erreur écriture dernière position:', e);
    }
  },

  /**
   * Sauvegarde le score d'un quiz
   * @param {string} courseId 
   * @param {number} lessonId 
   * @param {number} score 
   * @param {number} total 
   */
  saveQuizScore(courseId, lessonId, score, total) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES) || '{}');
      const key = `${courseId}_${lessonId}`;
      const previous = all[key];

      if (!previous || score >= previous.score) {
        all[key] = { score, total, date: Date.now() };
        localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(all));
      }
    } catch (e) {
      console.warn('Erreur sauvegarde score quiz:', e);
    }
  },

  /**
   * Récupère le meilleur score d'un quiz
   * @param {string} courseId 
   * @param {number} lessonId 
   * @returns {{ score: number, total: number } | null}
   */
  getQuizScore(courseId, lessonId) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES) || '{}');
      return all[`${courseId}_${lessonId}`] || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Récupère les cours personnalisés ajoutés par l'administration
   * @returns {Array}
   */
  getCustomCourses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_COURSES) || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Ajoute un nouveau cours personnalisé
   * @param {Object} course 
   */
  addCustomCourse(course) {
    const list = this.getCustomCourses();
    list.unshift(course);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_COURSES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('learnify:courses-changed'));
  },

  /**
   * Supprime un cours (personnalisé ou natif masqué)
   * @param {string} courseId 
   */
  deleteCourse(courseId) {
    // 1. Retirer des personnalisés si présent
    const list = this.getCustomCourses().filter(c => c.id !== courseId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_COURSES, JSON.stringify(list));

    // 2. Marquer comme supprimé pour les cours de base
    try {
      const deleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_COURSES) || '[]');
      if (!deleted.includes(courseId)) {
        deleted.push(courseId);
        localStorage.setItem(STORAGE_KEYS.DELETED_COURSES, JSON.stringify(deleted));
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('learnify:courses-changed'));
  },

  /**
   * Met à jour un cours existant (personnalisé ou de base érasé)
   * @param {string} courseId 
   * @param {Object} updatedCourse 
   */
  updateCourse(courseId, updatedCourse) {
    const list = this.getCustomCourses();
    const idx = list.findIndex(c => c.id === courseId);
    if (idx !== -1) {
      list[idx] = { ...updatedCourse, id: courseId };
    } else {
      // Cours de base : masquer l'original et sauvegarder la version modifiée
      const deleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_COURSES) || '[]');
      if (!deleted.includes(courseId)) {
        deleted.push(courseId);
        localStorage.setItem(STORAGE_KEYS.DELETED_COURSES, JSON.stringify(deleted));
      }
      list.unshift({ ...updatedCourse, id: courseId });
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_COURSES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('learnify:courses-changed'));
  },

  /**
   * Récupère la liste des IDs de cours supprimés
   * @returns {string[]}
   */
  getDeletedCourseIds() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_COURSES) || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * Réinitialise toutes les données locales
   */
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.LAST_POSITION);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_SCORES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_COURSES);
    localStorage.removeItem(STORAGE_KEYS.DELETED_COURSES);
    window.dispatchEvent(new CustomEvent('learnify:courses-changed'));
    window.dispatchEvent(new CustomEvent('learnify:progress-updated', { detail: {} }));
  }
};

