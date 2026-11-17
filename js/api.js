/**
 * Learnify - Communication JavaScript <-> PHP (API Fetch)
 * Toutes les requêtes passent par api() : JSON en entrée et en sortie, jeton CSRF automatique,
 * erreurs réseau / JSON invalide / 401 / validation gérées au même endroit.
 */

export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;   // code HTTP (0 = pas de réponse du serveur)
    this.errors = errors;   // erreurs par champ : { email: '...' }
  }
}

let csrfToken = null;
let session = null;       // { user: {...}|null, csrfToken }

export function setCsrf(token) { csrfToken = token; }

// Oublie la session mémorisée (après déconnexion)
export function resetSession() { session = null; csrfToken = null; }

// Utilisateur connecté + jeton CSRF (une seule requête par chargement de page)
export async function loadSession(force = false) {
  if (session && !force) return session;
  const data = await api('auth/me.php');
  session = data;
  csrfToken = data.csrfToken;
  return session;
}

// KEY: api('dossier/fichier.php', { method: 'POST', body: {...} }) -> renvoie data, ou lève une ApiError
export async function api(path, { method = 'GET', body } = {}) {
  const options = { method, credentials: 'same-origin', headers: { Accept: 'application/json' } };

  if (method !== 'GET') {
    if (!csrfToken) await loadSession();
    options.headers['Content-Type'] = 'application/json';
    options.headers['X-CSRF-Token'] = csrfToken || '';
    options.body = JSON.stringify(body || {});
  }

  let response;
  try {
    response = await fetch(`php/${path}`, options);
  } catch (e) {
    throw new ApiError('Serveur injoignable : vérifiez que Apache et MySQL sont démarrés.');
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw new ApiError('Réponse invalide du serveur (JSON attendu).', response.status);
  }

  // Session expirée / non connecté : retour à la page de connexion (sauf pour les appels auth/*)
  if (response.status === 401 && !path.startsWith('auth/')) {
    const here = location.pathname.split('/').pop() + location.search;
    location.href = `login.html?next=${encodeURIComponent(here)}`;
  }

  if (!json.success) throw new ApiError(json.message || 'Erreur inconnue.', response.status, json.errors || {});
  return json.data;
}
