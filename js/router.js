/**
 * Learnify - Navigation sans rechargement (SPA simplifiée)
 * 1. On intercepte le clic sur un lien interne (index / course / lesson).
 * 2. On change l'URL avec history.pushState.
 * 3. On télécharge la page demandée et on remplace seulement son <main>.
 * 4. On appelle render() pour remplir le <main> avec les données.
 * Le bouton Précédent du navigateur est géré par l'événement popstate.
 */

const INTERNAL_LINK = /^(index|course|lesson)\.html(\?.*)?$/;

export const Router = {
  init(render) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      const href = link ? link.getAttribute('href') : null;
      if (!href || !INTERNAL_LINK.test(href)) return; // lien externe, ancre, admin.html... : comportement normal
      e.preventDefault();
      history.pushState({}, '', href);
      this.load(href, render);
      window.scrollTo(0, 0);
    });

    window.addEventListener('popstate', () => this.load(location.href, render));
  },

  async load(url, render) {
    try {
      const response = await fetch(url);
      const page = new DOMParser().parseFromString(await response.text(), 'text/html');
      document.querySelector('main').replaceWith(page.querySelector('main'));
      document.title = page.title;
      await render();
    } catch (e) {
      location.href = url; // en cas de problème : navigation classique
    }
  }
};
