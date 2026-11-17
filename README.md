# Learnify — LMS full-stack (HTML/CSS/JS + PHP 8 + MySQL)

Mini-projet ISSAT Sousse. Le frontend « vanilla » existant est conservé (même design, mêmes pages, mêmes modules) ;
les cours, les comptes et la progression sont maintenant stockés dans **MySQL** via des endpoints **PHP** appelés avec **fetch()**.

## 1. Logiciels nécessaires
- **XAMPP** (Apache + PHP 8.0+ + MySQL/MariaDB) — ou WAMP / MAMP / Laragon.
- Extensions PHP : `pdo_mysql`, `mbstring`, `json` (activées par défaut dans XAMPP).
- Un navigateur récent. Une connexion Internet pour les vidéos YouTube.

## 2. Installation
1. Copiez le dossier `learnify/` dans `C:\xampp\htdocs\` (Linux : `/opt/lampp/htdocs/`, ou `/var/www/html/`).
2. Lancez **Apache** et **MySQL** dans le panneau XAMPP.
3. Créez la base : ouvrez `http://localhost/phpmyadmin` → onglet **Importer** → choisissez `database/learnify.sql` → **Exécuter**.
   (Ou en terminal : `mysql -u root < database/learnify.sql`.) Le script crée la base `learnify`, les tables et les 6 cours d'origine.
4. Vérifiez la connexion dans `php/config/database.php` (par défaut XAMPP : hôte `127.0.0.1`, utilisateur `root`, mot de passe vide).
5. Ouvrez **http://localhost/learnify/**.

> Ne pas ouvrir les `.html` en double-cliquant : il faut passer par `http://localhost/...` (fetch, modules JS et PHP l'exigent).

## 3. Créer un administrateur
Aucun compte n'est fourni. L'inscription crée toujours un **étudiant** ; le rôle ne vient jamais du navigateur.
- **Méthode A (terminal)** : `php php/tools/create_admin.php "Votre Nom" admin@exemple.com MotDePasse123`
  (sous XAMPP Windows : `C:\xampp\php\php.exe php\tools\create_admin.php ...`). Si l'e-mail existe déjà, le compte devient admin.
- **Méthode B (phpMyAdmin)** : créez un compte via la page *Connexion → Créer un compte*, puis exécutez
  `UPDATE users SET role='admin' WHERE email='admin@exemple.com';`

Le lien **⚙️ Administration** n'apparaît que pour un administrateur.

## 4. Comment JavaScript et PHP communiquent
```
navigateur (js/*.js)  --fetch JSON-->  php/<dossier>/<fichier>.php  --PDO-->  MySQL
        ^                                   |
        +---- { "success", "message", "data" } ----+
```
- `js/api.js` : unique fonction `api('courses/list.php', {method, body})`. Elle envoie du JSON, ajoute le cookie de session et le jeton
  **CSRF** (`X-CSRF-Token`) aux requêtes POST, vérifie la réponse JSON et lève une `ApiError` (réseau, JSON invalide, 401, 403, 422...).
- `php/middleware/bootstrap.php` : inclus par tous les endpoints (réponses JSON uniformes, session sécurisée, CSRF, `require_login()`, `require_admin()`).
- `js/storage.js` garde son ancienne interface (`getDone`, `isDone`, `setDone`, `getPosition`…) mais lit/écrit désormais en base :
  `Store.load()` récupère la progression au chargement, `setDone()` etc. appellent `progress/*.php` puis mettent l'écran à jour.
- `js/data.js` : `getCourses()` / `getCourse()` appellent `courses/list.php` et `courses/get.php`, qui renvoient **le même format que l'ancien `courses.json`** ;
  c'est pourquoi `catalogue.js`, `course.js`, `lesson.js`, `player.js`, `progress.js` et `router.js` n'ont presque pas changé.
- `js/auth.js`, `js/login.js`, `login.html` : inscription, connexion, déconnexion, en-tête avec le nom de l'utilisateur.

Réponse type : `{ "success": true, "message": "Progression enregistrée.", "data": { ... } }` ;
en cas d'erreur : `{ "success": false, "message": "...", "data": null, "errors": { "champ": "..." } }` avec le code HTTP adapté (401, 403, 404, 405, 409, 422, 500).

## 5. Endpoints PHP
| Fichier | Méthode | Accès | Rôle |
|---|---|---|---|
| `auth/register.php` | POST | public | inscription (étudiant) |
| `auth/login.php` | POST | public | connexion |
| `auth/logout.php` | POST | public | déconnexion |
| `auth/me.php` | GET | public | utilisateur courant + jeton CSRF |
| `courses/list.php`, `courses/get.php?id=` | GET | public | catalogue / cours complet |
| `courses/create.php`, `update.php`, `delete.php` | POST | **admin** | gestion des cours |
| `lessons/create.php`, `update.php`, `delete.php` | POST | **admin** | gestion des leçons |
| `progress/get.php` | GET | connecté | progression de l'utilisateur connecté (leçons, position, scores, % par cours) |
| `progress/save.php` | POST | connecté | leçon terminée / non terminée (renvoie le % du cours) |
| `progress/position.php` | POST | connecté | dernière leçon consultée |
| `progress/score.php` | POST | connecté | meilleur score de quiz |
| `progress/reset.php` | POST | connecté | efface **sa propre** progression |

## 6. Fonctionnalités
- Inscription / connexion / déconnexion, `password_hash` / `password_verify`, e-mail unique, validation serveur, `session_regenerate_id` à la connexion.
- Rôles `student` / `admin` vérifiés **côté serveur** à chaque requête (le rôle est relu en base).
- Cours et leçons en MySQL ; ajout, modification, suppression (cours et leçons) depuis `admin.html`, avec messages de confirmation et d'erreur.
- Progression par étudiant en base : leçons terminées, dernière leçon (bannière « Reprendre »), meilleurs scores de quiz, pourcentage calculé.
- Fonctions d'origine conservées : navigation sans rechargement (`router.js`), quiz avec correction immédiate, chapitres vidéo, barres de progression, design responsive.
- Sécurité : PDO préparé (`ATTR_EMULATE_PREPARES = false`), CSRF sur tous les POST, cookie de session `HttpOnly` + `SameSite=Lax` (+ `Secure` en HTTPS),
  échappement `esc()` à l'affichage, erreurs PHP jamais affichées au visiteur, `.htaccess` bloquant l'accès direct à `config/`, `lib/`, `middleware/`, `tools/`.

## 7. Structure
```
learnify/
├── index.html  course.html  lesson.html  admin.html  login.html  style.css
├── data/courses.json        données d'origine (sert de source au script SQL, plus lu par le site)
├── database/learnify.sql    schéma + 6 cours
├── js/   app router data storage progress catalogue course lesson quiz player admin utils  + api auth login
└── php/  config/ middleware/ lib/ auth/ courses/ lessons/ progress/ tools/
```
Base : `users`, `courses`, `lessons`, `progress` (UNIQUE `user_id, lesson_id`), plus `quiz_questions` et `quiz_scores` pour conserver les quiz existants.
Adaptations du schéma : `courses.slug` = ancien identifiant (`html-css`) utilisé dans les URLs ; `lessons.content` = texte de la leçon ; `lessons.lesson_order` = numéro 0, 1, 2…

