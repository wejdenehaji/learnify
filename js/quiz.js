/**
 * Learnify - Quiz Engine (Vanilla JS)
 * Module de quiz interactif avec validation immédiate, explications pédagogiques,
 * calcul du score et persistance locale.
 */

import { Storage } from './storage.js';

export const QuizEngine = {
  /**
   * Initialise et affiche le quiz de la leçon
   * @param {HTMLElement} container Élément DOM récepteur
   * @param {Object} course Objet cours
   * @param {Object} lesson Objet leçon
   * @param {Function} onCompleted Callback optionnel en cas de succès
   */
  render(container, course, lesson, onCompleted) {
    if (!container) return;

    if (!lesson.quiz || lesson.quiz.length === 0) {
      container.innerHTML = '';
      return;
    }

    const previousScore = Storage.getQuizScore(course.id, lesson.id);

    container.innerHTML = `
      <section class="lesson-quiz-section" aria-labelledby="quiz-heading">
        <div class="quiz-header">
          <div>
            <span class="eyebrow">AUTO-ÉVALUATION</span>
            <h2 id="quiz-heading">Quiz express de validation</h2>
            <p>Testez votre compréhension de cette leçon avant de passer à la suite.</p>
          </div>
          <div class="quiz-badge" id="quiz-badge">
            ${previousScore ? `<span>Dernier score : <strong>${previousScore.score} / ${previousScore.total}</strong></span>` : '<span>Non validé</span>'}
          </div>
        </div>

        <form class="quiz-form" id="quiz-form" novalidate>
          <div class="quiz-questions-list">
            ${lesson.quiz.map((q, qIndex) => `
              <fieldset class="quiz-card" data-qid="${q.id}" data-correct="${q.correctIndex}">
                <legend class="quiz-question-title">
                  <span class="question-number">Question ${qIndex + 1}</span>
                  <strong>${q.question}</strong>
                </legend>
                <div class="quiz-options" role="radiogroup">
                  ${q.options.map((opt, optIndex) => `
                    <label class="quiz-option-label" for="q_${q.id}_opt_${optIndex}">
                      <input type="radio" id="q_${q.id}_opt_${optIndex}" name="question_${q.id}" value="${optIndex}">
                      <span class="opt-bullet"></span>
                      <span class="opt-text">${opt}</span>
                    </label>
                  `).join('')}
                </div>
                <div class="quiz-feedback" aria-live="polite" style="display: none;"></div>
              </fieldset>
            `).join('')}
          </div>

          <div class="quiz-actions">
            <button type="submit" class="button button-primary" id="btn-validate-quiz">
              Vérifier mes réponses <span>✓</span>
            </button>
            <button type="button" class="button button-outline" id="btn-reset-quiz" style="display: none;">
              Recommencer le quiz ↺
            </button>
          </div>

          <div class="quiz-result-banner" id="quiz-result-banner" style="display: none;" role="alert"></div>
        </form>
      </section>
    `;

    const form = container.querySelector('#quiz-form');
    const resetBtn = container.querySelector('#btn-reset-quiz');
    const validateBtn = container.querySelector('#btn-validate-quiz');
    const resultBanner = container.querySelector('#quiz-result-banner');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.evaluate(container, course, lesson, onCompleted);
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        form.reset();
        const fieldsets = container.querySelectorAll('.quiz-card');
        fieldsets.forEach(f => {
          f.classList.remove('answered-correct', 'answered-wrong');
          const fb = f.querySelector('.quiz-feedback');
          if (fb) {
            fb.style.display = 'none';
            fb.textContent = '';
          }
          const inputs = f.querySelectorAll('input[type="radio"]');
          inputs.forEach(inp => inp.disabled = false);
        });
        resultBanner.style.display = 'none';
        resetBtn.style.display = 'none';
        validateBtn.style.display = 'inline-flex';
      });
    }
  },

  /**
   * Évalue les réponses et produit un feedback immédiat
   */
  evaluate(container, course, lesson, onCompleted) {
    const questions = lesson.quiz;
    let score = 0;
    let allAnswered = true;

    questions.forEach((q) => {
      const fieldset = container.querySelector(`fieldset[data-qid="${q.id}"]`);
      if (!fieldset) return;

      const checked = fieldset.querySelector(`input[name="question_${q.id}"]:checked`);
      const feedbackEl = fieldset.querySelector('.quiz-feedback');

      if (!checked) {
        allAnswered = false;
        fieldset.classList.add('answered-wrong');
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.className = 'quiz-feedback feedback-warning';
          feedbackEl.textContent = 'Veuillez sélectionner une réponse pour cette question.';
        }
        return;
      }

      const selectedIndex = Number(checked.value);
      const isCorrect = selectedIndex === q.correctIndex;

      // Désactiver les options après évaluation
      const inputs = fieldset.querySelectorAll('input[type="radio"]');
      inputs.forEach(inp => inp.disabled = true);

      fieldset.classList.remove('answered-correct', 'answered-wrong');
      if (isCorrect) {
        score++;
        fieldset.classList.add('answered-correct');
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.className = 'quiz-feedback feedback-success';
          feedbackEl.innerHTML = `<strong>✓ Bonne réponse !</strong> ${q.explanation}`;
        }
      } else {
        fieldset.classList.add('answered-wrong');
        if (feedbackEl) {
          feedbackEl.style.display = 'block';
          feedbackEl.className = 'quiz-feedback feedback-error';
          feedbackEl.innerHTML = `<strong>✗ Réponse incorrecte.</strong> ${q.explanation}`;
        }
      }
    });

    if (!allAnswered) return;

    // Sauvegarder le score
    Storage.saveQuizScore(course.id, lesson.id, score, questions.length);

    // Mettre à jour l'en-tête du badge
    const badge = container.querySelector('#quiz-badge');
    if (badge) {
      badge.innerHTML = `<span>Score obtenu : <strong>${score} / ${questions.length}</strong></span>`;
    }

    // Afficher la bannière de synthèse
    const banner = container.querySelector('#quiz-result-banner');
    const validateBtn = container.querySelector('#btn-validate-quiz');
    const resetBtn = container.querySelector('#btn-reset-quiz');

    if (banner) {
      const isPerfect = score === questions.length;
      const isPassed = score >= Math.ceil(questions.length / 2);

      banner.style.display = 'block';
      if (isPassed) {
        banner.className = 'quiz-result-banner banner-success';
        banner.innerHTML = `
          <div class="result-icon">🏆</div>
          <div class="result-text">
            <strong>Félicitations ! Vous avez validé ce quiz (${score}/${questions.length}).</strong>
            <p>La leçon a été automatiquement marquée comme terminée dans votre suivi de progression.</p>
          </div>
        `;
        // Marquer la leçon comme terminée automatiquement
        Storage.setLessonCompleted(course.id, lesson.id, true);
        if (onCompleted) onCompleted();
      } else {
        banner.className = 'quiz-result-banner banner-warning';
        banner.innerHTML = `
          <div class="result-icon">💡</div>
          <div class="result-text">
            <strong>Score : ${score} / ${questions.length}.</strong>
            <p>Prenez le temps de relire la leçon et retentez le quiz pour perfectionner vos connaissances.</p>
          </div>
        `;
      }
    }

    if (validateBtn) validateBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'inline-flex';
  }
};
