# Learnify — Mini LMS (Sujet 8)

Mini-projet JavaScript FIA2 — ISSAT Sousse. HTML5, CSS3 et JavaScript « vanilla » (sans bibliothèque).

## Fonctionnalités

**Obligatoires**
1. **Navigation sans rechargement** (`js/router.js`) : les liens internes changent l'URL avec `history.pushState`, puis seul le `<main>` de la page est remplacé. Le bouton Précédent fonctionne (`popstate`).
2. **Progression dynamique** (`js/progress.js`) : pourcentage = leçons terminées / total. Barres, checklist et bouton « Marquer comme terminée » restent synchronisés.
3. **Sauvegarde de la position** (`js/storage.js`) : progression, dernière leçon et scores sont dans `localStorage`. La page d'accueil propose « Reprendre ».
4. **Quiz** (`js/quiz.js`) : une réponse par question, vérification immédiate (vert/rouge + explication), score, possibilité de recommencer. Un quiz réussi (au moins la moitié des points) valide la leçon.

**Bonus**
1. **Chapitres vidéo** (`js/player.js`) : un clic recharge la vidéo YouTube à l'instant choisi (on ne mesure pas le temps réellement regardé).
2. **Administration simplifiée** (`admin.html`, `js/admin.js`) : ajout et suppression de cours.

## Structure

```
index.html  course.html  lesson.html  admin.html  style.css
data/courses.json        6 cours avec leçons, chapitres et quiz
js/
  app.js        point d'entrée : choisit la page selon l'URL
  router.js     navigation sans rechargement
  data.js       lit courses.json + cours ajoutés - cours supprimés
  storage.js    tout ce qui touche localStorage
  progress.js   calcul et affichage de la progression
  catalogue.js  accueil : cartes + bannière « Reprendre »
  course.js     page d'un cours
  lesson.js     page d'une leçon
  quiz.js       quiz
  player.js     chapitres vidéo
  admin.js      ajout / suppression de cours
  utils.js      $() , esc() (protège le HTML), showMessage()
```

## Lancer le projet

`fetch()` et les modules JavaScript ne marchent pas en ouvrant le fichier directement : il faut un serveur local.
Dans VS Code : clic droit sur `index.html` → **Open with Live Server**.

## Données dans localStorage

| Clé | Contenu |
|---|---|
| `learnify_progress` | `{ "html-css": [0, 2] }` leçons terminées par cours |
| `learnify_position` | `{ "courseId": "html-css", "lessonId": 2 }` |
| `learnify_scores` | `{ "html-css_0": { "score": 2, "total": 2 } }` meilleur score |
| `learnify_courses` | cours ajoutés dans l'administration |
| `learnify_deleted` | ids des cours supprimés |

Une valeur absente ou illisible est remplacée par une valeur vide, sans erreur.

## Limites connues

- L'administration est une démonstration côté client : les cours ajoutés n'existent que dans ce navigateur et n'ont pas de quiz.
- Les liens contenant une ancre (`index.html#courses`) rechargent la page normalement.
- Le fichier `courses.json` n'est pas modifié par l'administration : supprimer un cours du fichier le masque seulement.

## Tests effectués

_À compléter par l'équipe après vos propres tests dans le navigateur (console F12 sans erreur, mobile/tablette/desktop, clavier, validateur W3C)._

## Équipe

- Étudiant 1 : `data.js`, `storage.js`, `progress.js`, `router.js`, `admin.js`
- Étudiant 2 : `lesson.js`, `course.js`, `quiz.js`, `player.js`, `catalogue.js`
