/**
 * Learnify - Page de connexion / inscription (login.html)
 */

import { api, setCsrf, loadSession } from './api.js';
import { initHeader } from './auth.js';
import { $ } from './utils.js';

// Redirection seulement vers une page du site (évite qu'un lien piégé renvoie vers un autre site)
const requested = new URLSearchParams(location.search).get('next') || '';
const next = /^[a-z]+\.html(\?[\w=&%.-]*)?$/i.test(requested) ? requested : 'index.html';

function showFeedback(text, ok) {
  const box = $('auth-feedback');
  box.textContent = text;
  box.className = `admin-feedback ${ok ? 'feedback-success' : 'feedback-error'}`;
  box.hidden = false;
}

function showTab(name) {
  $('login-form').hidden = name !== 'login';
  $('register-form').hidden = name !== 'register';
  $('tab-login').classList.toggle('active', name === 'login');
  $('tab-register').classList.toggle('active', name === 'register');
  $('auth-feedback').hidden = true;
}

// Envoie un formulaire à un endpoint PHP, puis redirige
async function submit(form, endpoint, fields) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const body = Object.fromEntries(fields.map((f) => [f, form.elements[f].value]));
    const data = await api(endpoint, { method: 'POST', body });
    setCsrf(data.csrfToken);
    location.href = next;
  } catch (e) {
    showFeedback(e.message, false);
    button.disabled = false;
  }
}

async function init() {
  await initHeader();
  try {
    if ((await loadSession()).user) { location.href = next; return; }
  } catch (e) {
    showFeedback(e.message, false);
  }
  $('tab-login').addEventListener('click', () => showTab('login'));
  $('tab-register').addEventListener('click', () => showTab('register'));
  $('login-form').addEventListener('submit', (e) => { e.preventDefault(); submit(e.target, 'auth/login.php', ['email', 'password']); });
  $('register-form').addEventListener('submit', (e) => { e.preventDefault(); submit(e.target, 'auth/register.php', ['name', 'email', 'password']); });
}

init();
