# 🎓 Learnify — Plateforme de Cours en Ligne (Mini LMS)

> **Projet Universitaire** : Mini-projet JavaScript — FIA2  
> **Établissement** : Institut Supérieur des Sciences Appliquées et de Technologie de Sousse (ISSAT Sousse)  
> **Enseignant** : Mr. Sofiene Ben Ahmed  
> **Sujet 8** : Plateforme de cours en ligne (mini LMS)  

---

## 📖 Présentation du Projet

**Learnify** est une plateforme d'apprentissage en ligne moderne, légère et intuitive développée en **HTML5 sémantique**, **CSS3 Vanilla** et **JavaScript moderne (ES6+ Vanilla)** sans dépendance externe lourde.

Elle propose un parcours complet d'apprentissage :
- Exploration d'un catalogue de cours par thématiques (Web, Programmation, Technologie),
- Consultation du programme détaillé et des objectifs de formation,
- Suivi de leçons interactives multimédia (vidéos chapitrées, théorie, snippets de code),
- Auto-évaluation immédiate par quiz interactifs avec explications pédagogiques,
- Suivi de progression persistant et reprise automatique de session,
- Interface d'administration pour la publication et la gestion des cours.

---

## 🎯 Fonctionnalités Développées (Cahier des Charges)

### ✅ Socle de Fonctionnalités Obligatoires (4/4)

1. **Navigation entre cours sans rechargement (SPA simplifiée)** :
   - Routeur client léger utilisant l'API `History` (`pushState`, `popstate`),
   - Transition instantanée et fluide entre le catalogue d'accueil, la vue détaillée d'un cours et le lecteur de leçon sans rechargement du navigateur,
   - Rétrocompatibilité complète avec les URLs directes (`course.html?course=...` et `lesson.html?course=...&lesson=...`).

2. **Suivi de progression dynamique (pourcentage, checklist)** :
   - Calcul en temps réel du pourcentage de complétion par cours : `(leçons terminées / total) * 100`,
   - Barres de progression dynamiques animées dans le catalogue, la vue cours et le lecteur de leçon,
   - Checklist interactive des leçons avec coches automatiques (`✓`) et mise à jour synchronisée,
   - Bouton d'action toggle *"Marquer comme terminée ✓"*.

3. **Sauvegarde automatique de la position dans les cours (`localStorage`)** :
   - Mémorisation permanente de la dernière position (cours et index de leçon consultés),
   - Bannière d'accueil intelligente *"Reprendre mon apprentissage"* permettant de reprendre exactement où l'étudiant s'était arrêté,
   - Persistance des scores aux quiz et des listes de leçons validées.

4. **Système de quiz interactif avec validation immédiate** :
   - QCM intégré à chaque leçon avec rétroaction visuelle instantanée dès validation,
   - Surbrillance verte pour les réponses correctes avec explications pédagogiques,
   - Surbrillance rouge pour les erreurs avec conseils de révision,
   - Calcul dynamique de la note (ex: 2/2 points),
   - Validation automatique de la leçon dès réussite au quiz et possibilité de recommencer à volonté.

### ★ Fonctionnalités Bonus (2/2)

1. **Lecteur vidéo/cours avec marqueurs de progression** :
   - Panneau de chapitres interactifs cliquables sous le lecteur vidéo (ex: `00:00 Introduction`, `02:30 Squelette HTML5`, etc.),
   - Saut automatique dans la vidéo au segment ciblé avec lecture instantanée,
   - Indication claire du chapitre en cours d'étude.

2. **Interface d'administration complète & dynamique (CRUD cours)** :
   - Espace dédié d'administration (`admin.html`) et modale rapide accessible via *"⚙️ Administration"*,
   - **Création & Modification dynamique** de cours : possibilité de modifier n'importe quel cours existant (titre, niveau, durée, instructeur, etc.) ou de créer un nouveau cours,
   - **Téléversement de miniatures (Thumbnail)** : chargement d'image locale via `FileReader` (convertie en Data URL persistante en `localStorage`) ou saisie d'URL distante avec prévisualisation en temps réel,
   - **Gestionnaire dynamique de sous-leçons** : ajout, suppression et ordonnancement de modules avec formatage automatique des liens vidéo YouTube,
   - **Créateur de marqueurs vidéo** : définition personnalisée des chapitres cliquables par leçon,
   - **Concepteur de quiz d'auto-évaluation** : ajout de questions QCM sur-mesure pour chaque sous-leçon, choix de la bonne réponse et saisie de l'explication pédagogique,
   - Tableau de bord avec recherche en direct, statistiques globales et réinitialisation propre.

---

## 🏗️ Architecture Technique

```
learnify/
├── index.html                 # Catalogue de cours, bannière de reprise & conteneur SPA
├── course.html                # Présentation détaillée du cours, objectifs et curriculum
├── lesson.html                # Lecteur de leçon, vidéo chapitrée, article et quiz interactif
├── admin.html                 # Espace d'administration complet (création/édition, upload miniature, leçons, quiz)
├── style.css                  # Design system complet (tokens, responsive, dark/light tones, a11y)
├── data/
│   └── courses.json           # Jeu de données structuré enrichi (6 cours complets avec vidéos et quiz)
├── js/
│   ├── app.js                 # Point d'entrée principal et orchestration
│   ├── router.js              # Routeur SPA (History API, interception de liens, popstate)
│   ├── data.js                # Service de données (fetch local + fallback résilient)
│   ├── storage.js             # Gestionnaire de persistance localStorage
│   ├── progress.js            # Moteur de calcul et de rendu de la progression
│   ├── lesson.js              # Contrôleur d'affichage et de navigation des leçons
│   ├── course.js              # Contrôleur de la vue détail d'un cours
│   ├── catalogue.js           # Contrôleur du catalogue d'accueil et des filtres
│   ├── quiz.js                # Moteur de quiz avec validation immédiate
│   ├── player.js              # Lecteur vidéo avec marqueurs de progression (Bonus 1)
│   └── admin.js               # Panneau d'administration modal et passerelle vers l'éditeur (Bonus 2)
└── docs/
    └── UPGRADE_PLAN.md        # Plan de mise à niveau complet validé
```

---

## 👥 Répartition des Tâches en Binôme

Conformément aux règles du mini-projet (projet réalisé à deux étudiants avec contribution conjointe) :

| Étudiant | Responsabilités & Modules pris en charge |
|---|---|
| **Étudiant 1** | **Architecture Données, SPA & Progression**<br>• Conception du schéma de données `data/courses.json`<br>• Service de persistance locale `js/storage.js`<br>• Routeur SPA et gestion de l'historique `js/router.js`<br>• Moteur de progression et checklist `js/progress.js`<br>• Bonus 2 : Interface d'administration CRUD cours `js/admin.js` |
| **Étudiant 2** | **Expérience Leçon, Quiz & Multimédia**<br>• Contrôleur de leçon dynamique `js/lesson.js` et cours `js/course.js`<br>• Moteur de quiz interactif et validation `js/quiz.js`<br>• Bonus 1 : Lecteur avec marqueurs de chapitres `js/player.js`<br>• Catalogue dynamique et filtres de recherche `js/catalogue.js`<br>• Accessibilité ARIA, validation W3C et tests responsive |

---

## 🚀 Installation & Exécution Locale

Pour garantir le bon fonctionnement de l'API `fetch()` et des modules JavaScript ES6 (`type="module"`), l'application doit être servie via un serveur HTTP local :

### Option 1 : Visual Studio Code — Live Server (Recommandé)
1. Ouvrir le dossier `learnify` dans **VS Code**.
2. Faire un clic droit sur `index.html` puis sélectionner **"Open with Live Server"**.
3. L'application s'ouvre automatiquement sur `http://127.0.0.1:5500/index.html`.

### Option 2 : Node.js (Alternative en ligne de commande)
```bash
# Avec npx serve (aucune installation requise)
npx -y serve .

# Ou via Python si installé
python -m http.server 3000
```

---

## 🔍 Validation & Qualité

- **Validation W3C** : Balisage HTML5 sémantique et CSS3 validés sans erreurs.
- **Console DevTools (F12)** : 0 erreur, 0 avertissement non géré.
- **Responsive Design** : Testé et optimisé sur Smartphone (<650px), Tablette (<900px) et Desktop (>1100px).
- **Accessibilité & Clavier** :
  - Support complet de la navigation clavier (`Tab`, `Entrée`, `Espace`, `Échap`),
  - Indicateur visuel `:focus-visible` contrasté,
  - Attributs ARIA pour les lecteurs d'écran (`role="progressbar"`, `aria-valuenow`, `aria-live="polite"`, `role="tab"`),
  - Respect scrupuleux de la directive `@media (prefers-reduced-motion: reduce)`.

---

## 📜 Validation Initiale W3C (Partie 1)

| Fichier | Validateur | Résultat |
|---|---|---|
| `index.html` | W3C Markup Validation Service | Sans erreurs |
| `course.html` | W3C Markup Validation Service | Sans erreurs |
| `style.css` | W3C CSS Validation Service | Sans erreurs |

![W3C validation](docs/screenshots/validation-w3c.png)
