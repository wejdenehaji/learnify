/**
 * Learnify - petites fonctions utilitaires partagées
 */

// Raccourci : document.getElementById
export const $ = (id) => document.getElementById(id);

// Neutralise les caractères HTML (< > & " ') avant de les mettre dans innerHTML
export const esc = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Affiche un message d'erreur à la place du contenu de la page
export function showMessage(text) {
  document.querySelector('main').innerHTML =
    `<p class="empty-msg">${esc(text)} <a href="index.html">← Retour au catalogue</a></p>`;
}
