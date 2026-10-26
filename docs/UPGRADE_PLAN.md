# 🎓 Learnify — Cahier des Charges & Plan de Mise à Niveau (Upgrade Plan)

> **Projet** : Mini-projet JavaScript FIA2 — ISSAT Sousse  
> **Sujet 8** : Plateforme de cours en ligne (mini LMS)  
> **Enseignant** : Mr. Sofiene Ben Ahmed  
> **Technologies** : HTML5 sémantique, CSS3 moderne (Vanilla), JavaScript ES6+ (Vanilla)  
> **Persistance** : `localStorage` + `fetch` JSON local  

---

## 1. État des Lieux de l'Application Existante (Audit Initial)

### 1.1 Fichiers existants
* `index.html` : Maquette statique de la page d'accueil avec catalogue de 6 cours.
* `course.html` : Maquette statique de présentation du cours *"HTML & CSS Fundamentals"* avec liste de 5 leçons.
* `lesson.html` : Maquette statique d'une leçon avec iframe vidéo, zone de texte, boutons de navigation et barre de progression statique.
* `style.css` : Feuille de style soignée (tokens CSS, responsive design avec breakpoints à 900px et 650px, support de `prefers-reduced-motion`).
* `README.md` : Rapport initial de la partie 1 (validation W3C statique).

### 1.2 Constats majeurs
1. **Absence totale de JavaScript applicatif** : Aucun script n'est actuellement lié aux pages.
2. **Liens statiques codés en dur** : Tous les boutons *"Voir le cours"* ou *"Commencer le cours"* mènent à la même page `course.html` ou `lesson.html?lesson=0`, sans chargement dynamique des données.
3. **Éléments d'interface pré-équipés d'identifiants** : Des IDs tels que `#lesson-title`, `#lesson-progress-percent`, `#complete-lesson`, `#sidebar-progress-fill` sont déjà présents dans `lesson.html`, témoignant d'une excellente préparation pour l'injection dynamique.
4. **Validation W3C préservée** : Le balisage existant est propre et validé W3C sans erreur. Tout ajout JS/HTML devra impérativement conserver cette conformité stricte.

---

## 2. Analyse d'Écart (Gap Analysis) par rapport au Cahier des Charges

| Catégorie | Fonctionnalité exigée | Statut actuel | Action requise |
|---|---|---|---|
| **Obligatoire 1** | **Navigation entre cours sans rechargement (SPA simplifiée)** | ❌ Absent (pages HTML distinctes rechargeant le navigateur) | Mettre en place un routeur client léger (`History API` / URL parameters dynamiques) permettant d'afficher le catalogue, le sommaire du cours et la leçon sans rechargement brutal de la page. |
| **Obligatoire 2** | **Suivi de progression dynamique (pourcentage, checklist)** | ❌ Statique (0% affiché en dur) | Calcul automatique du taux de complétion en temps réel, mise à jour des barres de progression, coches visuelles dynamiques et état "terminé" par leçon et par cours. |
| **Obligatoire 3** | **Sauvegarde automatique de la position dans les cours (localStorage)** | ❌ Absent | Enregistrement continu dans `localStorage` du dernier cours visité, de la dernière leçon consultée et de la liste des leçons validées ; bouton "Reprendre où vous en étiez" sur l'accueil. |
| **Obligatoire 4** | **Système de quiz interactif avec validation immédiate** | ❌ Absent | Module de QCM interactif à la fin de chaque leçon avec rétroaction instantanée (vert/rouge, explication), calcul de note et sauvegarde du meilleur score. |
| **Bonus 1** | **Lecteur vidéo/cours avec marqueurs de progression** | ❌ Iframe YouTube statique sans suivi | Contrôle de lecture avec marqueurs temporels interactifs cliquables (chapitres vidéo), suivi du visionnage et mise à jour dynamique du statut. |
| **Bonus 2** | **Interface d'administration simplifiée (ajout/suppression de cours)** | ❌ Absent | Modale ou section d'administration permettant de créer un nouveau cours (titre, tag, leçons, description) et de supprimer un cours existant avec synchronisation dans `localStorage`. |
| **Règles communes** | **Données fictives (`fetch` local / JSON)** | ❌ Données codées en dur | Création d'un fichier `data/courses.json` complet et modulable lu via l'API `fetch()`. |
| **Règles communes** | **Binôme & Qualité (Console 0 erreur, Accessibilité, W3C)** | ⚠️ Partiel | Structuration modulaire ES6, commentaires clairs, gestion clavier (`focus-visible`, `aria-*`), absence d'erreurs en console. |

---

## 3. Architecture Technique Cible

```
learnify/
├── index.html                 # Page d'accueil / Catalogue dynamique + Conteneur SPA
├── course.html                # Vue détaillée d'un cours (rétrocompatible & SPA)
├── lesson.html                # Lecteur de leçon, vidéo & quiz (rétrocompatible & SPA)
├── style.css                  # Styles existants + enrichissements UI (quiz, modale admin, marqueurs)
├── data/
│   └── courses.json           # Base de données locale (cours, chapitres, leçons, quiz)
├── js/
│   ├── app.js                 # Point d'entrée principal & initialisation
│   ├── router.js              # Navigation fluide SPA (History API / popstate / hash)
│   ├── data.js                # Service de chargement et gestion des données (fetch + fallback)
│   ├── storage.js             # Gestionnaire de persistance localStorage (position, progression, scores)
│   ├── progress.js            # Moteur de calcul et d'affichage de progression dynamique
│   ├── lesson.js              # Contrôleur d'affichage et navigation de leçons
│   ├── quiz.js                # Moteur de quiz interactif avec validation immédiate
│   ├── player.js              # Lecteur multimédia avec marqueurs de progression (Bonus 1)
│   └── admin.js               # Gestionnaire d'administration : ajout/suppression de cours (Bonus 2)
└── docs/
    ├── UPGRADE_PLAN.md        # Ce document de cadrage
    └── screenshots/           # Captures W3C, Lighthouse et démonstration
```

---

## 4. Plan de Mise en Œuvre Détaillé (Roadmap par Phases)

### Phase 1 : Données et Persistance Locale
* **Objectif** : Structurer l'ensemble des contenus de la plateforme et mettre en place l'API de persistance.
* **Tâches** :
  1. Créer `data/courses.json` contenant la liste complète des cours (HTML/CSS, Python, JavaScript, IA, etc.), avec pour chaque cours ses leçons détaillées, durées, vidéos et séries de questions de quiz.
  2. Créer `js/storage.js` pour gérer :
     - `learnify_progress` : leçons validées par cours (`{ [courseId]: [lessonIds] }`).
     - `learnify_last_position` : `{ courseId, lessonId, timestamp }`.
     - `learnify_quiz_scores` : scores obtenus et tentatives.
     - `learnify_custom_courses` : cours ajoutés via l'interface d'administration.
  3. Créer `js/data.js` pour charger les données via `fetch()`, fusionner avec les cours personnalisés du `localStorage`, et gérer les états d'erreur réseau.

---

### Phase 2 : Navigation SPA Simplifiée (Obligatoire 1)
* **Objectif** : Permettre une navigation instantanée et fluide sans rechargement complet de la page.
* **Tâches** :
  1. Concevoir `js/router.js` gérant les transitions dynamiques entre :
     - Vue Catalogue (`/` ou `#courses`)
     - Vue Présentation Cours (`#course?id=html-css`)
     - Vue Leçon (`#lesson?course=html-css&lesson=0`)
  2. Conserver une rétrocompatibilité totale avec les fichiers `course.html` et `lesson.html` pour permettre aussi bien un accès direct par URL que la navigation dynamique.
  3. Intercepter les clics sur les liens internes pour mettre à jour le DOM sans recharger la page, tout en synchronisant l'historique de navigation du navigateur (`pushState` et écouteur `popstate`).

---

### Phase 3 : Suivi de Progression Dynamique & Reprise Automatique (Obligatoires 2 & 3)
* **Objectif** : Rendre la progression visible et persistante à tous les niveaux de l'application.
* **Tâches** :
  1. Implémenter `js/progress.js` :
     - Calcul du pourcentage de chaque cours : `(leçons_terminées / total_leçons) * 100`.
     - Mise à jour en temps réel des jauges et barres (`.progress-track`, `#sidebar-progress-fill`, `#lesson-progress-percent`).
     - Mise à jour de la checklist latérale avec états visuels : non commencé, en cours, terminé (icône verte ✓).
     - Ajout de badges de progression sur les cartes du catalogue d'accueil.
  2. Gérer le bouton d'action *"Marquer comme terminée ✓"* (`#complete-lesson`) :
     - Bascule d'état avec animation douce.
     - Déclenchement automatique de la progression globale.
     - Déblocage automatique ou suggestion de la leçon suivante.
  3. Ajouter sur l'accueil une bannière *"Reprendre mon apprentissage"* qui restaure en un clic le cours et la leçon sauvegardés dans `localStorage`.

---

### Phase 4 : Système de Quiz Interactif avec Validation Immédiate (Obligatoire 4)
* **Objectif** : Valider les connaissances de l'étudiant avec un retour immédiat et un score dynamique.
* **Tâches** :
  1. Développer `js/quiz.js` :
     - Génération dynamique des questions sous l'article de chaque leçon.
     - Interface propre : options radio cliquables, cartes de choix stylisées.
     - Bouton *"Vérifier ma réponse"* déclenchant une validation instantanée :
       - Surbrillance verte de la bonne réponse avec explication pédagogique.
       - Surbrillance rouge de la mauvaise réponse avec message d'aide.
     - Calcul dynamique du score de la leçon (ex: 3/3 points).
     - Bouton *"Recommencer le quiz"* pour retenter les questions.
     - Validation conditionnelle de la leçon (la leçon est automatiquement marquée terminée si le score est satisfaisant).

---

### Phase 5 : Les Bonus du Sujet 8 (Bonus 1 & Bonus 2)
* **Bonus 1 — Lecteur avec Marqueurs de Progression** :
  - Développer `js/player.js` :
  - Ajouter sous la vidéo des marqueurs de chapitres cliquables (ex : `00:00 Introduction`, `02:15 Balises de base`, `05:30 Pratique`).
  - Clic sur un marqueur pour naviguer directement dans le segment ou afficher le résumé associé.
  - Indicateur visuel d'avancement sur la timeline vidéo.
* **Bonus 2 — Interface d'Administration Simplifiée (Ajout & Suppression)** :
  - Développer `js/admin.js` :
  - Bouton *"Espace Administration"* dans l'en-tête ou le pied de page.
  - Modale moderne et accessible pour :
    - Ajouter un cours : titre, catégorie/tag, niveau, durée, description, URL miniature.
    - Supprimer un cours existant avec confirmation sécurisée.
    - Réinitialiser les données de démonstration d'origine.
  - Mise à jour instantanée du catalogue sans rechargement et persistance dans `localStorage`.

---

### Phase 6 : Validation Qualité, Accessibilité, W3C & Dépôt GitHub
* **Objectif** : Répondre à 100% des critères de la grille d'évaluation du professeur.
* **Tâches** :
  1. **Validation W3C** : Vérifier que tout le HTML généré dynamiquement reste parfaitement valide.
  2. **Accessibilité & Clavier** : Navigation possible avec Tab/Entrée/Espace, présence des attributs ARIA (`role="progressbar"`, `aria-live="polite"` pour les feedbacks de quiz), respect strict de `prefers-reduced-motion`.
  3. **Zero Console Error** : Contrôle systématique dans les DevTools F12.
  4. **Documentation & README** : Mise à jour du `README.md` avec architecture JS, répartition des tâches binôme, instructions d'exécution locale (Live Server) et captures d'écran.
  5. **Stratégie de Commits** : Organiser les commits pour refléter la contribution équitable des deux étudiants du binôme.

---

## 5. Répartition des Rôles en Binôme (Modèle ISSAT Sousse)

| Étudiant | Responsabilités & Modules attribués |
|---|---|
| **Étudiant 1** | **Architecture Données, SPA & Progression**<br>• Structure du JSON et service de données (`data.js`)<br>• Routeur SPA et gestion de l'historique (`router.js`)<br>• Moteur de progression et persistance `localStorage` (`progress.js`, `storage.js`)<br>• Bonus 2 : Interface d'administration et CRUD cours (`admin.js`) |
| **Étudiant 2** | **Expérience Leçon, Quiz & Multimédia**<br>• Affichage dynamique et navigation entre leçons (`lesson.js`)<br>• Moteur de quiz interactif avec validation instantanée (`quiz.js`)<br>• Bonus 1 : Lecteur vidéo avec marqueurs de progression (`player.js`)<br>• Intégration responsive, accessibilité ARIA et validation W3C |

---

## 6. Checklist de Rendu Enseignant (Avant Livraison)

- [ ] Toutes les 4 fonctionnalités obligatoires fonctionnent de manière fluide.
- [ ] Les 2 bonus (marqueurs vidéo + administration) sont intégrés et fonctionnels.
- [ ] Aucune erreur dans la console du navigateur (`F12`).
- [ ] Code HTML et CSS validé avec le validateur W3C.
- [ ] Responsive design testé et vérifié sur mobile (375px), tablette (768px) et desktop (1200px).
- [ ] Navigation au clavier avec `:focus-visible` clair et cohérent.
- [ ] Données locales lues proprement avec `fetch` (compatible avec Live Server).
- [ ] Dépôt GitHub avec commits distincts et équilibrés des deux étudiants.
- [ ] Rapport et démonstration prêts pour l'évaluation.
