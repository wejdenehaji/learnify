/**
 * Learnify - Quiz avec validation immédiate
 * 1. L'étudiant choisit une réponse par question.
 * 2. "Vérifier" : si une question est sans réponse, on le signale et on ne note rien.
 * 3. Sinon : couleur verte/rouge + explication, score affiché et sauvegardé.
 * 4. Score >= la moitié des questions : la leçon est marquée terminée.
 */

import * as Store from './storage.js';
import { esc } from './utils.js';

export function showQuiz(box, course, lessonIndex, onPass) {
  const questions = course.lessons[lessonIndex].quiz || [];
  if (questions.length === 0) { box.innerHTML = ''; return; }

  const best = Store.getScore(course.id, lessonIndex);

  box.innerHTML = `
    <section class="lesson-quiz-section" aria-labelledby="quiz-heading">
      <div class="quiz-header">
        <div>
          <span class="eyebrow">AUTO-ÉVALUATION</span>
          <h2 id="quiz-heading">Quiz de la leçon</h2>
          <p>Répondez à toutes les questions puis vérifiez vos réponses.</p>
        </div>
        <div class="quiz-badge">${best ? `Meilleur score : <strong>${best.score} / ${best.total}</strong>` : 'Non validé'}</div>
      </div>
      <form novalidate>
        <div class="quiz-questions-list">
          ${questions.map((q, i) => `
            <fieldset class="quiz-card">
              <legend class="quiz-question-title"><span class="question-number">Question ${i + 1}</span><strong>${esc(q.question)}</strong></legend>
              <div class="quiz-options">
                ${q.options.map((opt, j) => `
                  <label class="quiz-option-label"><input type="radio" name="q${i}" value="${j}"><span class="opt-text">${esc(opt)}</span></label>`).join('')}
              </div>
              <div class="quiz-feedback" aria-live="polite" hidden></div>
            </fieldset>`).join('')}
        </div>
        <div class="quiz-actions">
          <button type="submit" class="button button-primary">Vérifier mes réponses <span>✓</span></button>
          <button type="button" class="button button-outline" id="quiz-retry" hidden>Recommencer le quiz ↺</button>
        </div>
        <div class="quiz-result-banner" role="alert" hidden></div>
      </form>
    </section>`;

  const form = box.querySelector('form');
  const cards = [...form.querySelectorAll('.quiz-card')];
  const banner = form.querySelector('.quiz-result-banner');
  const submitBtn = form.querySelector('[type="submit"]');
  const retryBtn = form.querySelector('#quiz-retry');

  function feedback(card, type, html) {
    const el = card.querySelector('.quiz-feedback');
    el.className = `quiz-feedback feedback-${type}`;
    el.innerHTML = html;
    el.hidden = false;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const picked = questions.map((_, i) => form.querySelector(`input[name="q${i}"]:checked`));

    // Une question sans réponse : on prévient et on ne calcule aucun score
    if (picked.includes(null)) {
      picked.forEach((p, i) => {
        if (p) cards[i].querySelector('.quiz-feedback').hidden = true;
        else feedback(cards[i], 'warning', 'Choisissez une réponse pour cette question.');
      });
      return;
    }

    let score = 0;
    questions.forEach((q, i) => {
      const correct = Number(picked[i].value) === q.correctIndex;
      if (correct) score++;
      cards[i].classList.add(correct ? 'answered-correct' : 'answered-wrong');
      cards[i].querySelectorAll('input').forEach((input) => { input.disabled = true; });
      feedback(cards[i], correct ? 'success' : 'error', correct
        ? `<strong>✓ Bonne réponse !</strong> ${esc(q.explanation)}`
        : `<strong>✗ Incorrect.</strong> Bonne réponse : ${esc(q.options[q.correctIndex])}. ${esc(q.explanation)}`);
    });

    Store.saveScore(course.id, lessonIndex, score, questions.length);
    const passed = score >= Math.ceil(questions.length / 2);

    banner.className = `quiz-result-banner ${passed ? 'banner-success' : 'banner-warning'}`;
    banner.innerHTML = `<div class="result-icon">${passed ? '🏆' : '💡'}</div><div class="result-text"><strong>Score : ${score} / ${questions.length}</strong><p>${passed ? 'Quiz réussi : la leçon est marquée comme terminée.' : 'Relisez la leçon puis recommencez le quiz.'}</p></div>`;
    banner.hidden = false;
    submitBtn.hidden = true;
    retryBtn.hidden = false;

    if (passed) { Store.setDone(course.id, lessonIndex, true); onPass(); }
  });

  retryBtn.addEventListener('click', () => {
    form.reset();
    cards.forEach((card) => {
      card.classList.remove('answered-correct', 'answered-wrong');
      card.querySelector('.quiz-feedback').hidden = true;
      card.querySelectorAll('input').forEach((input) => { input.disabled = false; });
    });
    banner.hidden = true;
    retryBtn.hidden = true;
    submitBtn.hidden = false;
  });
}
