/**
 * Learnify - Authentification côté navigateur
 * Affiche le nom + "Déconnexion" (ou "Connexion") dans l'en-tête, et cache les liens
 * d'administration aux non-administrateurs. (Simple confort d'affichage : la vraie
 * protection est faite par PHP sur chaque requête.)
 */

import { api, loadSession, resetSession } from './api.js';
import { esc } from './utils.js';

export async function getUser() {
  return (await loadSession()).user;
}

export async function logout() {
  await api('auth/logout.php', { method: 'POST' });
  resetSession();
  location.href = 'index.html';
}

// KEY: fills #auth-box in the header; hides admin links unless role === 'admin'
export async function initHeader() {
  let user = null;
  try { user = await getUser(); } catch (e) { /* serveur éteint : l'en-tête reste simple */ }

  document.querySelectorAll('a[href="admin.html"]').forEach((a) => { a.hidden = !(user && user.role === 'admin'); });

  const box = document.getElementById('auth-box');
  if (!box) return;
  if (user) {
    box.innerHTML = `<span class="user-chip" title="${esc(user.email)}">👤 ${esc(user.name)}</span>
      <button type="button" class="link-button" id="logout-btn">Déconnexion</button>`;
    document.getElementById('logout-btn').addEventListener('click', () => logout().catch((e) => alert(e.message)));
  } else {
    box.innerHTML = '<a class="auth-login-link" href="login.html">Connexion</a>';
  }
}
