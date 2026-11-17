-- ============================================================================
-- Learnify - base de données MySQL / MariaDB (schéma + données initiales)
-- Import : phpMyAdmin > Importer, ou  mysql -u root < database/learnify.sql
-- ============================================================================
CREATE DATABASE IF NOT EXISTS learnify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learnify;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS quiz_scores, quiz_questions, progress, lessons, courses, users;
SET FOREIGN_KEY_CHECKS = 1;

-- Utilisateurs (mot de passe = hash password_hash(), jamais en clair)
CREATE TABLE users (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(190) NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('student','admin') NOT NULL DEFAULT 'student',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- Cours (slug = identifiant lisible utilisé dans les URLs : ?course=html-css)
CREATE TABLE courses (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug                 VARCHAR(100) NOT NULL,
  title                VARCHAR(150) NOT NULL,
  description          TEXT NOT NULL,
  image                VARCHAR(500) NULL,
  category             VARCHAR(50) NOT NULL,
  eyebrow              VARCHAR(60) NOT NULL,
  tag_class            VARCHAR(30) NOT NULL DEFAULT 'tag-web',
  art_class            VARCHAR(30) NOT NULL DEFAULT 'art-web',
  badge                VARCHAR(10) NOT NULL DEFAULT 'NEW',
  level                VARCHAR(30) NOT NULL DEFAULT 'Débutant',
  duration             VARCHAR(50) NOT NULL,
  about                TEXT NOT NULL,
  instructor_name      VARCHAR(100) NOT NULL,
  instructor_role      VARCHAR(100) NOT NULL,
  instructor_initials  VARCHAR(5) NOT NULL,
  instructor_bio       TEXT NOT NULL,
  objectives           JSON NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_slug (slug),
  KEY idx_courses_category (category)
) ENGINE=InnoDB;

-- Leçons (lesson_order = 0, 1, 2... dans le cours ; content = texte de la leçon)
CREATE TABLE lessons (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  course_id        INT UNSIGNED NOT NULL,
  title            VARCHAR(200) NOT NULL,
  subtitle         VARCHAR(100) NOT NULL DEFAULT '',
  duration         VARCHAR(30) NOT NULL DEFAULT '8 min',
  video_url        VARCHAR(255) NOT NULL DEFAULT '',
  article_heading  VARCHAR(200) NOT NULL DEFAULT '',
  content          TEXT NOT NULL,
  tip              TEXT NOT NULL,
  code_snippet     TEXT NOT NULL,
  markers          JSON NULL,
  lesson_order     INT UNSIGNED NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lessons_course_order (course_id, lesson_order),
  CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Questions de quiz d'une leçon
CREATE TABLE quiz_questions (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lesson_id      INT UNSIGNED NOT NULL,
  position       INT UNSIGNED NOT NULL DEFAULT 0,
  question       TEXT NOT NULL,
  options        JSON NOT NULL,
  correct_index  TINYINT UNSIGNED NOT NULL,
  explanation    TEXT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_quiz_lesson (lesson_id, position),
  CONSTRAINT fk_quiz_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Progression : une ligne par étudiant et par leçon visitée (completed = 1 si terminée)
CREATE TABLE progress (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT UNSIGNED NOT NULL,
  course_id      INT UNSIGNED NOT NULL,
  lesson_id      INT UNSIGNED NOT NULL,
  completed      TINYINT(1) NOT NULL DEFAULT 0,
  last_accessed  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_progress_user_lesson (user_id, lesson_id),
  KEY idx_progress_user_course (user_id, course_id),
  KEY idx_progress_user_last (user_id, last_accessed),
  CONSTRAINT fk_progress_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Meilleur score de quiz par étudiant et par leçon
CREATE TABLE quiz_scores (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  lesson_id   INT UNSIGNED NOT NULL,
  score       INT UNSIGNED NOT NULL,
  total       INT UNSIGNED NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_scores_user_lesson (user_id, lesson_id),
  CONSTRAINT fk_scores_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
  CONSTRAINT fk_scores_lesson FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Données initiales : les 6 cours de data/courses.json (aucun compte utilisateur)
-- ---------------------------------------------------------------------------

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(1, 'html-css', 'HTML & CSS Fundamentals', 'Apprenez à structurer une page web avec HTML et à la rendre agréable avec CSS. Aucune expérience préalable nécessaire.', NULL, 'Web', 'DÉVELOPPEMENT WEB', 'tag-web', 'art-web', '01', 'Débutant', 'Environ 45 minutes', 'Ce cours présente les bases nécessaires pour créer une page web simple. Vous allez découvrir le rôle du HTML, les principales propriétés CSS et la façon d''organiser une mise en page moderne et responsive.', 'Amine Mansour', 'Développeur Web & Formateur', 'AM', 'Passionné par le web et les explications simples, Amine vous accompagne dans vos premiers pas vers le développement frontend.', '["Structurer une page sémantique avec HTML5","Appliquer des styles élégants avec CSS3","Organiser les éléments facilement avec Flexbox","Adapter l''affichage aux mobiles et tablettes"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(1, 1, 'Bienvenue dans le développement web', 'Introduction · 6 min', '6 min', 'https://www.youtube-nocookie.com/embed/UB1O30fR-EE', 'Qu''est-ce que le développement web ?', 'Le développement web consiste à créer des sites et des applications accessibles depuis un navigateur. Pour commencer, on utilise principalement HTML pour organiser le contenu et CSS pour définir son apparence.', 'HTML donne une structure logique au contenu, tandis que CSS s''occupe de la présentation visuelle.', '<h1>Bonjour !</h1>
<p>Bienvenue sur ma première page web avec Learnify.</p>', '[{"time":"00:00","title":"Présentation du web","seconds":0},{"time":"01:45","title":"Rôle du navigateur et du code","seconds":105},{"time":"03:30","title":"HTML vs CSS vs JavaScript","seconds":210},{"time":"05:00","title":"Premiers pas et résumé","seconds":300}]', 0),
(2, 1, 'La structure d''une page HTML', 'HTML5 · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/pQN-pnXPaVg', 'Les fondations d''un document HTML5', 'Toute page web repose sur un squelette standard : la déclaration <!DOCTYPE html>, la balise racine <html>, la section d''en-tête technique <head> et le corps visible <body>.', 'Utilisez des balises sémantiques (<header>, <main>, <nav>, <article>, <footer>) pour améliorer l''accessibilité et le référencement.', '<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8">
    <title>Mon Site</title>
  </head>
  <body>
    <main>
      <h1>Titre Principal</h1>
    </main>
  </body>
</html>', '[{"time":"00:00","title":"Le squelette minimal HTML5","seconds":0},{"time":"02:30","title":"La balise <head> et métadonnées","seconds":150},{"time":"06:10","title":"Le corps du document <body>","seconds":370},{"time":"08:45","title":"Balises sémantiques indispensables","seconds":525}]', 1),
(3, 1, 'Les bases du CSS', 'CSS3 · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/1PnVor36_40', 'Donner vie à vos pages avec les règles CSS', 'Le CSS permet de cibler des éléments grâce à des sélecteurs (balises, classes .nom, identifiants #id) pour leur attribuer des propriétés graphiques comme la couleur, les marges et la taille.', 'Le Box Model est composé du contenu (content), de la marge intérieure (padding), de la bordure (border) et de la marge extérieure (margin).', '.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}', '[{"time":"00:00","title":"Syntaxe sélecteur { propriété: valeur; }","seconds":0},{"time":"03:15","title":"Classes, identifiants et éléments","seconds":195},{"time":"06:40","title":"Le modèle de boîte (Box Model)","seconds":400},{"time":"09:00","title":"Couleurs et typographies modernes","seconds":540}]', 2),
(4, 1, 'Organiser avec Flexbox', 'Mise en page · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/fYq5PXgSsbE', 'Mise en page unidimensionnelle avec Flexbox', 'Flexbox facilite l''alignement et la distribution de l''espace entre des éléments, même lorsque leurs dimensions sont inconnues ou dynamiques.', 'Définir ''display: flex'' sur un conteneur transforme instantanément ses enfants directs en flex-items.', '.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}', '[{"time":"00:00","title":"Pourquoi Flexbox ?","seconds":0},{"time":"02:10","title":"display: flex et axe principal","seconds":130},{"time":"05:00","title":"justify-content et align-items","seconds":300},{"time":"07:30","title":"Cas concret : la barre de navigation","seconds":450}]', 3),
(5, 1, 'Une page adaptée au mobile', 'Responsive design · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/srvUrASNj0s', 'Rendre votre site responsive sur tous les écrans', 'Le responsive design garantit une lecture et une navigation optimales sur smartphone, tablette et écran d''ordinateur grâce aux requêtes média CSS et à des grilles souples.', 'Pensez ''Mobile First'' : concevez d''abord pour les petits écrans puis enrichissez l''affichage pour les grands écrans avec min-width.', '@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
  }
}', '[{"time":"00:00","title":"Le principe du Responsive Web Design","seconds":0},{"time":"02:40","title":"La balise méta viewport","seconds":160},{"time":"05:20","title":"Les Media Queries @media","seconds":320},{"time":"08:10","title":"Tester avec les outils de développement (F12)","seconds":490}]', 4);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(1, 1, 0, 'Quel est le rôle principal du langage HTML ?', '["Gérer les interactions complexes de la page","Structurer le contenu et les éléments d''une page","Compiler le code en langage machine","Gérer la base de données distante"]', 1, 'HTML (HyperText Markup Language) définit la structure et le sens du contenu web grâce aux balises sémantiques.'),
(2, 1, 1, 'Quel langage sert à styliser et mettre en page les éléments HTML ?', '["Python","SQL","CSS","JSON"]', 2, 'CSS (Cascading Style Sheets) est spécifiquement conçu pour appliquer des couleurs, typographies et mises en page au HTML.'),
(3, 2, 0, 'Dans quelle section place-t-on le titre de l''onglet et les liens CSS ?', '["Dans la balise <header>","Dans la balise <head>","Dans la balise <main>","Dans la balise <footer>"]', 1, 'La balise <head> contient toutes les métadonnées techniques invisibles directement dans le corps de la page.'),
(4, 2, 1, 'Quelle balise sémantique représente la navigation principale d''un site ?', '["<navigate>","<menu-bar>","<nav>","<links>"]', 2, 'La balise HTML5 standard pour une section de liens de navigation est <nav>.'),
(5, 3, 0, 'Quel symbole précède un sélecteur de classe en CSS ?', '["Le dièse (#)","Le point (.)","L''arobase (@)","L''étoile (*)"]', 1, 'En CSS, les classes sont préfixées par un point (ex: .bouton) et les identifiants par un dièse (ex: #bouton).'),
(6, 3, 1, 'Quelle propriété crée un espacement intérieur entre le contenu et la bordure ?', '["margin","spacing","padding","gap"]', 2, 'Le padding est l''espace interne situé à l''intérieur de la bordure de l''élément.'),
(7, 4, 0, 'Quelle propriété permet d''aligner les éléments le long de l''axe principal (horizontal par défaut) ?', '["align-items","justify-content","flex-direction","align-content"]', 1, 'justify-content aligne les éléments sur l''axe principal (ex: flex-start, center, space-between).'),
(8, 4, 1, 'Quelle valeur de ''justify-content'' sépare les éléments aux deux extrémités opposées ?', '["space-around","space-between","center","flex-end"]', 1, 'space-between place le premier élément au début, le dernier à la fin, et distribue l''espace également entre les autres.'),
(9, 5, 0, 'Quelle règle CSS conditionnelle permet d''adapter le style selon la largeur de l''écran ?', '["@screen","@media","@responsive","@query"]', 1, 'La règle @media (ex: @media (max-width: 650px)) applique des styles spécifiques selon les caractéristiques de l''appareil.'),
(10, 5, 1, 'Quelle balise méta est obligatoire dans le <head> pour que le responsive fonctionne sur smartphone ?', '["<meta name=\\"screen\\" content=\\"mobile\\">","<meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1.0\\">","<meta name=\\"responsive\\" content=\\"true\\">","<meta name=\\"scale\\" content=\\"fixed\\">"]', 1, 'La balise <meta name="viewport" content="width=device-width, initial-scale=1.0"> ajuste la largeur d''affichage à l''écran de l''appareil.');

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(2, 'python', 'Python Programming', 'Découvrez les variables, les conditions, les boucles et les fonctions avec un langage clair et puissant.', NULL, 'Programmation', 'CODE & LOGIQUE', 'tag-python', 'art-python', '02', 'Débutant', 'Environ 1 heure', 'Python est l''un des langages de programmation les plus populaires au monde. Ce cours vous guide pas à pas dans l''apprentissage de la logique de code et de la syntaxe Python.', 'Nour Khemir', 'Ingénieure Logiciel', 'NK', 'Développeuse Python passionnée d''algorithmique et de transmission pédagogique.', '["Comprendre la syntaxe et les variables en Python","Manipuler les conditions (if, elif, else)","Automatiser des tâches avec les boucles (for, while)","Définir et réutiliser des fonctions modulaires"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(6, 2, 'Premiers pas avec Python', 'Introduction · 8 min', '8 min', 'https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc', 'Votre premier script Python', 'Python se distingue par sa lisibilité exceptionnelle. Un simple appel à print() permet d''afficher des données dans la console.', 'En Python, l''indentation (espaces au début d''une ligne) est obligatoire pour structurer les blocs de code.', 'nom = "Étudiant"
print(f"Bienvenue dans Python, {nom} !")', '[{"time":"00:00","title":"Pourquoi Python ?","seconds":0},{"time":"02:30","title":"Installer et exécuter Python","seconds":150},{"time":"05:10","title":"La fonction print()","seconds":310}]', 0),
(7, 2, 'Les variables et types de données', 'Types de base · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc', 'Stocker des informations en mémoire', 'Les variables permettent de stocker et manipuler des valeurs : entiers (int), décimaux (float), textes (str) ou booléens (bool).', 'Python est dynamiquement typé : pas besoin de déclarer explicitement le type lors de la création d''une variable.', 'age = 21
prix = 19.99
est_etudiant = True
nom = "Sami"', '[{"time":"00:00","title":"Nombres entiers et flottants","seconds":0},{"time":"03:40","title":"Chaînes de caractères (str)","seconds":220},{"time":"07:15","title":"Booléens (True / False)","seconds":435}]', 1),
(8, 2, 'Les structures conditionnelles', 'Logique conditionnelle · 12 min', '12 min', 'https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc', 'Prendre des décisions dans le code', 'Les conditions permettent à votre programme d''exécuter différentes instructions selon que certains critères sont vrais ou faux.', 'Utilisez le double égal ''=='' pour tester une égalité, car le simple ''='' est réservé à l''assignation.', 'score = 85
if score >= 90:
    print("Mention Très Bien")
elif score >= 50:
    print("Réussi")
else:
    print("À revoir")', '[{"time":"00:00","title":"Les opérateurs de comparaison","seconds":0},{"time":"04:00","title":"Le bloc if / elif / else","seconds":240}]', 2),
(9, 2, 'Les boucles et itérations en Python', 'Boucles · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/k9TUPpGqYTo', 'Répéter des instructions avec les boucles', 'Les boucles permettent d''exécuter un bloc de code plusieurs fois sans redondance. La boucle for est idéale quand on connaît le nombre d''itérations, tandis que while boucle tant qu''une condition reste vraie.', 'Pensez à toujours vous assurer qu''une boucle while possède une condition d''arrêt pour éviter une boucle infinie.', 'nombres = [1, 2, 3, 4, 5]
pairs = [n for n in nombres if n % 2 == 0]
print(f''Nombres pairs: {pairs}'')', '[{"time":"00:00","title":"La boucle for et range()","seconds":0},{"time":"03:15","title":"La boucle while et conditions","seconds":195},{"time":"06:30","title":"Parcourir des listes et dictionnaires","seconds":390}]', 3);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(11, 6, 0, 'Quelle fonction native sert à afficher du texte dans la console en Python ?', '["console.log()","echo()","print()","write()"]', 2, 'print() est la fonction standard d''affichage en console en Python.'),
(12, 7, 0, 'Quel est le type de la valeur 3.14 en Python ?', '["int","float","str","double"]', 1, 'Les nombres à virgule flottante sont représentés par le type ''float'' en Python.'),
(13, 8, 0, 'Quel mot-clé représente ''sinon si'' en Python ?', '["else if","elseif","elif","case"]', 2, '''elif'' est la contraction de ''else if'' en syntaxe Python.'),
(14, 9, 0, 'Quelle fonction produit une séquence d''entiers pour une boucle for ?', '["range()","sequence()","loop()","iterate()"]', 0, 'range(debut, fin, pas) génère les entiers nécessaires pour itérer simplement dans une boucle for.');

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(3, 'javascript', 'JavaScript for Beginners', 'Ajoutez des interactions captivantes à vos pages web grâce au langage du navigateur.', NULL, 'Programmation', 'INTERACTIVITÉ', 'tag-js', 'art-js', '03', 'Débutant', 'Environ 50 minutes', 'JavaScript donne vie au web en permettant de manipuler le DOM, de réagir aux clics et aux événements de l''utilisateur, et de communiquer avec des APIs distantes.', 'Yassine Dridi', 'Architecte Frontend', 'YD', 'Spécialiste de l''écosystème JavaScript moderne et des architectures Single Page Applications.', '["Manipuler les éléments du DOM avec document.querySelector","Écouter et réagir aux événements utilisateur (addEventListener)","Sauvegarder l''état dans le navigateur avec localStorage","Effectuer des requêtes asynchrones avec fetch()"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(10, 3, 'Introduction au JavaScript moderne', 'Bases · 8 min', '8 min', 'https://www.youtube-nocookie.com/embed/W6NZfCO5SIk', 'L''interactivité côté client', 'JavaScript s''exécute directement dans le navigateur de l''internaute et permet de modifier le contenu d''une page sans la recharger.', 'Privilégiez ''const'' pour les valeurs qui ne changent pas et ''let'' pour les variables réassignables. Évitez ''var''.', 'const saluer = (prenom) => {
  return `Bonjour ${prenom} !`;
};
console.log(saluer(''Karim''));', '[{"time":"00:00","title":"Le rôle de JavaScript","seconds":0},{"time":"02:40","title":"Variables let et const","seconds":160},{"time":"05:30","title":"Fonctions fléchées ES6","seconds":330}]', 0),
(11, 3, 'Le DOM et les écouteurs d''événements', 'DOM & Events · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/y17RuWkWdn8', 'Connecter le code aux actions de l''utilisateur', 'Grâce à document.querySelector() et addEventListener(), vous pouvez détecter les clics sur les boutons et mettre à jour le texte ou les classes CSS.', 'Les classes CSS sont manipulées facilement avec element.classList.add(), remove() et toggle().', 'const bouton = document.querySelector(''#mon-bouton'');
bouton.addEventListener(''click'', () => {
  bouton.classList.toggle(''active'');
});', '[{"time":"00:00","title":"Qu''est-ce que le DOM ?","seconds":0},{"time":"03:10","title":"Sélectionner avec querySelector","seconds":190},{"time":"06:30","title":"addEventListener(''click'', ...)","seconds":390}]', 1),
(12, 3, 'Tableaux et méthodes modernes (map, filter)', 'Tableaux · 8 min', '8 min', 'https://www.youtube-nocookie.com/embed/rRgD1yVwIvE', 'Programmation fonctionnelle sur les tableaux', 'En JavaScript moderne, on évite les boucles for classiques au profit de méthodes immutables comme .map() pour transformer et .filter() pour sélectionner des données.', 'map() et filter() renvoient un nouveau tableau sans altérer le tableau original.', 'const scores = [12, 18, 9, 15];
const admis = scores.filter(s => s >= 10);
const sur20 = admis.map(s => `Note: ${s}/20`);
console.log(sur20);', '[{"time":"00:00","title":"Manipulation des tableaux","seconds":0},{"time":"02:45","title":"La méthode map()","seconds":165},{"time":"05:20","title":"La méthode filter()","seconds":320}]', 2),
(13, 3, 'L''asynchronisme et Fetch API', 'Asynchrone · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/PoRJizFvM7s', 'Communiquer avec des serveurs grâce à Fetch', 'JavaScript est mono-thread mais gère les tâches longues (comme charger des données distantes) de manière asynchrone grâce à l''Event Loop, aux Promesses et à async/await.', 'Encadrez toujours vos appels async/await dans un bloc try...catch pour capturer les erreurs réseau.', 'async function chargerCours() {
  try {
    const res = await fetch(''data/courses.json'');
    const data = await res.json();
    console.log(''Cours chargés:'', data.length);
  } catch (err) {
    console.error(''Erreur:'', err);
  }
}', '[{"time":"00:00","title":"Le concept d''asynchronisme","seconds":0},{"time":"03:10","title":"Les Promesses (Promises)","seconds":190},{"time":"06:00","title":"async / await et fetch()","seconds":360}]', 3);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(15, 10, 0, 'Quel mot-clé est recommandé pour déclarer une valeur immuable en ES6 ?', '["var","let","const","static"]', 2, 'const permet de déclarer une constante dont la référence ne peut pas être réassignée.'),
(16, 11, 0, 'Quelle méthode moderne permet d''attacher un écouteur d''événement à un élément HTML ?', '["element.attach()","element.addEventListener()","element.listen()","element.onClick()"]', 1, 'addEventListener() est la méthode standard pour écouter des événements comme ''click'', ''input'', ''keydown'', etc.'),
(17, 12, 0, 'Quelle méthode de tableau permet de transformer chaque élément et retourne un nouveau tableau de même taille ?', '["filter()","map()","reduce()","find()"]', 1, 'map() applique une fonction de rappel à chaque élément et retourne un nouveau tableau contenant les résultats.'),
(18, 13, 0, 'Que retourne la fonction fetch() ?', '["Un objet JSON direct","Une Promesse (Promise)","Une chaîne de texte","Un tableau HTML"]', 1, 'fetch() renvoie une Promesse résolue avec l''objet Response dès que les en-têtes sont reçus.');

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(4, 'ai', 'Introduction to AI', 'Comprenez les concepts fondamentaux de l''intelligence artificielle et du machine learning.', NULL, 'Technologie', 'NOUVELLES IDÉES', 'tag-ai', 'art-ai', '04', 'Débutant', 'Environ 40 minutes', 'Explorez les mécanismes qui permettent aux machines d''apprendre à partir de données : apprentissage supervisé, réseaux de neurones et modèles de langage.', 'Dr. Sarah Ben Salah', 'Chercheuse en IA', 'SB', 'Docteure en informatique et conférencière sur les technologies d''apprentissage automatique.', '["Distinguer IA, Machine Learning et Deep Learning","Comprendre le cycle de vie d''un modèle d''apprentissage","Découvrir le fonctionnement des réseaux de neurones","Appréhender les considérations éthiques de l''IA"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(14, 4, 'Les fondations de l''Intelligence Artificielle', 'Concepts clés · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/JMUxmLyrhSk', 'Comprendre les principes de l''apprentissage machine', 'L''IA ne consiste pas à coder manuellement chaque règle, mais à fournir des données d''entraînement pour qu''un algorithme détecte des motifs et apprenne à prédire.', 'La qualité des données est essentielle : ''Garbage in, garbage out''.', '# Exemple conceptuel d''apprentissage supervisé
modele.entrainer(donnees_entrainement, etiquettes)
prediction = modele.predire(nouvelle_donnee)', '[{"time":"00:00","title":"Histoire et définitions","seconds":0},{"time":"04:10","title":"Apprentissage supervisé vs non-supervisé","seconds":250}]', 0),
(15, 4, 'Machine Learning : supervisé vs non supervisé', 'Apprentissage · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/Gv9_4yMHFhI', 'Comment les algorithmes apprennent des données', 'L''apprentissage supervisé utilise des exemples étiquetés pour entraîner un modèle de prédiction. L''apprentissage non supervisé cherche des régularités spontanées sans étiquettes.', 'La qualité des données d''entraînement est déterminante pour la précision du modèle.', 'from sklearn.linear_model import LinearRegression
modele = LinearRegression()
modele.fit(X_train, y_train)
predictions = modele.predict(X_test)', '[{"time":"00:00","title":"Données étiquetées et apprentissage supervisé","seconds":0},{"time":"03:30","title":"Apprentissage non supervisé et clustering","seconds":210},{"time":"06:45","title":"Évaluation d''un modèle (précision, rappel)","seconds":405}]', 1),
(16, 4, 'Réseaux de neurones et IA générative', 'Deep Learning · 11 min', '11 min', 'https://www.youtube-nocookie.com/embed/aircAruvnKk', 'L''architecture des modèles modernes', 'Le Deep Learning s''appuie sur des réseaux de neurones profonds capables d''extraire automatiquement des représentations complexes à partir d''images, de textes ou de sons.', 'Les modèles génératifs prédisent statistiquement les éléments suivants d''une séquence.', 'const prompt = ''Explique les réseaux de neurones en 3 phrases simples.'';
const reponse = await callAI(prompt);
console.log(reponse);', '[{"time":"00:00","title":"Neurones artificiels et couches","seconds":0},{"time":"04:00","title":"L''essor des modèles de langage (LLM)","seconds":240},{"time":"07:30","title":"Éthique, biais et avenir de l''IA","seconds":450}]', 2);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(19, 14, 0, 'En apprentissage supervisé, de quoi a besoin le modèle pour apprendre ?', '["De données accompagnées de leurs étiquettes (labels)","Uniquement de code sans données","D''une connexion internet constante","D''un GPU sans processeur"]', 0, 'L''apprentissage supervisé utilise des exemples étiquetés (entrée + résultat attendu) pour apprendre la relation.'),
(20, 15, 0, 'Quelle est la caractéristique principale de l''apprentissage supervisé ?', '["Les données d''entraînement comportent des labels (étiquettes)","Il n''a besoin d''aucune donnée pour s''entraîner","Il fonctionne uniquement sans ordinateur","Il ne fait jamais d''erreurs"]', 0, 'En supervisé, chaque donnée d''entrée est accompagnée de la réponse attendue (la cible / étiquette).'),
(21, 16, 0, 'Que signifie l''acronyme LLM en intelligence artificielle ?', '["Large Language Model","Low Level Machine","Linear Learning Matrix","Logical Logic Module"]', 0, 'LLM signifie Large Language Model, désignant les modèles massifs de traitement du langage naturel.');

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(5, 'database', 'Database Fundamentals', 'Apprenez à modéliser, structurer et requêter vos données avec SQL.', NULL, 'Technologie', 'ORGANISER LES DONNÉES', 'tag-db', 'art-db', '05', 'Débutant', 'Environ 45 minutes', 'Les bases de données sont le cœur de toute application web. Découvrez les tables, relations et les requêtes SELECT, INSERT, UPDATE et DELETE.', 'Karim Jlassi', 'Administrateur de bases de données', 'KJ', 'Expert en modélisation relationnelle et optimisation de requêtes SQL.', '["Comprendre le modèle relationnel et les tables","Écrire des requêtes SQL de sélection (SELECT)","Filtrer et trier avec WHERE, ORDER BY et GROUP BY","Comprendre les clés primaires et étrangères"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(17, 5, 'Introduction aux bases de données relationnelles', 'SQL & Tables · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/HXV3zeQKqGY', 'Organiser l''information en tables', 'Une base de données relationnelle organise les données en tables reliées entre elles par des clés d''identification.', 'Chaque table doit posséder une clé primaire unique identifiant chaque enregistrement.', 'SELECT nom, email, date_inscription
FROM utilisateurs
WHERE actif = 1
ORDER BY date_inscription DESC;', '[{"time":"00:00","title":"Pourquoi une base de données ?","seconds":0},{"time":"03:20","title":"Tables, lignes et colonnes","seconds":200}]', 0),
(18, 5, 'Le langage SQL : SELECT, WHERE et ORDER BY', 'Requêtes SQL · 8 min', '8 min', 'https://www.youtube-nocookie.com/embed/HXV3zeRR3h4', 'Interroger et extraire des données avec SQL', 'Le langage SQL (Structured Query Language) permet de formuler des questions précises à la base pour extraire uniquement les lignes et colonnes pertinentes.', 'Pensez à toujours tester vos clauses WHERE avec des conditions combinées entre parenthèses.', 'SELECT nom, email, date_inscription
FROM utilisateurs
WHERE statut = ''actif'' AND pays = ''Tunisie''
ORDER BY date_inscription DESC
LIMIT 10;', '[{"time":"00:00","title":"Structure de base d''un SELECT","seconds":0},{"time":"02:40","title":"Filtrer avec WHERE et opérateurs","seconds":160},{"time":"05:30","title":"Trier et limiter les résultats","seconds":330}]', 1),
(19, 5, 'Les jointures SQL (INNER JOIN, LEFT JOIN)', 'Jointures · 10 min', '10 min', 'https://www.youtube-nocookie.com/embed/9yeOJ0ZMUYw', 'Relier des données entre plusieurs tables', 'Les clés primaires et clés étrangères permettent d''établir des relations entre tables pour éviter la redondance et garantir la cohérence des données.', 'INNER JOIN ne retourne que les lignes qui ont une correspondance dans les deux tables.', 'SELECT u.nom, c.titre, i.date_inscription
FROM inscriptions i
INNER JOIN utilisateurs u ON i.utilisateur_id = u.id
INNER JOIN cours c ON i.cours_id = c.id;', '[{"time":"00:00","title":"Pourquoi découper en plusieurs tables ?","seconds":0},{"time":"03:15","title":"INNER JOIN : croiser des informations","seconds":195},{"time":"06:45","title":"LEFT JOIN et valeurs nulles","seconds":405}]', 2);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(22, 17, 0, 'Quelle commande SQL sert à extraire des données d''une table ?', '["GET","SELECT","PULL","EXTRACT"]', 1, 'SELECT est la commande fondamentale de consultation en SQL.'),
(23, 18, 0, 'Quelle clause SQL permet de trier les résultats par ordre croissant ou décroissant ?', '["ORDER BY","GROUP BY","SORT BY","WHERE"]', 0, 'ORDER BY nom_colonne [ASC|DESC] permet de spécifier l''ordre de restitution des lignes.'),
(24, 19, 0, 'Que retourne un LEFT JOIN si une ligne de la table gauche n''a pas de correspondance à droite ?', '["La ligne gauche est affichée avec des valeurs NULL à droite","Une erreur fatale de base de données","La ligne de gauche est complètement supprimée","Un doublon automatique"]', 0, 'Le LEFT JOIN conserve l''ensemble des lignes de la table de gauche, complétant les colonnes manquantes par NULL.');

INSERT INTO courses (id, slug, title, description, image, category, eyebrow, tag_class, art_class, badge, level, duration, about, instructor_name, instructor_role, instructor_initials, instructor_bio, objectives) VALUES
(6, 'cloud', 'Introduction to Cloud', 'Découvrez les architectures cloud, la virtualisation et le déploiement d''applications.', NULL, 'Technologie', 'LE MONDE CONNECTÉ', 'tag-cloud', 'art-cloud', '06', 'Débutant', 'Environ 35 minutes', 'Comprenez les modèles IaaS, PaaS et SaaS, ainsi que les avantages du cloud computing en matière de scalabilité et de disponibilité.', 'Hela Miled', 'Ingénieure Cloud & DevOps', 'HM', 'Accompagne les équipes dans la conteneurisation et le déploiement d''applications résilientes.', '["Distinguer IaaS, PaaS et SaaS","Comprendre les régions et zones de disponibilité","Découvrir les conteneurs et la virtualisation","Appréhender la haute disponibilité et la scalabilité"]');
INSERT INTO lessons (id, course_id, title, subtitle, duration, video_url, article_heading, content, tip, code_snippet, markers, lesson_order) VALUES
(20, 6, 'Qu''est-ce que le Cloud Computing ?', 'Concepts Cloud · 8 min', '8 min', 'https://www.youtube-nocookie.com/embed/M988_fsOSWo', 'L''infrastructure à la demande', 'Le cloud computing fournit des ressources informatiques (serveurs, stockage, bases de données) à la demande via Internet avec facturation à l''usage.', 'Le SaaS (Software as a Service) propose une application directement accessible via navigateur sans aucune gestion d''infrastructure.', '# Exemple de configuration de conteneur d''application
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"', '[{"time":"00:00","title":"Du serveur physique au Cloud","seconds":0},{"time":"03:10","title":"IaaS, PaaS, SaaS expliqués simplement","seconds":190}]', 0),
(21, 6, 'Stockage et conteneurisation avec Docker', 'Conteneurs · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/gAkwW2tuIqE', 'Embarquer son application partout grâce aux conteneurs', 'Docker standardise l''environnement d''exécution en encapsulant le code, ses dépendances et sa configuration dans une image légère et portable.', 'Un conteneur partage le noyau de l''OS hôte, le rendant bien plus rapide et léger qu''une machine virtuelle complète.', 'FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD [''node'', ''server.js'']', '[{"time":"00:00","title":"Machine Virtuelle vs Conteneur","seconds":0},{"time":"03:20","title":"Le Dockerfile et l''image","seconds":200},{"time":"06:15","title":"Déploiement sur un registre Cloud","seconds":375}]', 1),
(22, 6, 'Architecture Serverless et scalabilité', 'Serverless · 9 min', '9 min', 'https://www.youtube-nocookie.com/embed/W_VNn_TqZt8', 'Créer des applications sans gérer de serveurs physiques', 'Le Serverless permet aux développeurs de se concentrer exclusivement sur la logique métier en laissant le fournisseur Cloud gérer l''infrastructure, la haute disponibilité et la scalabilité automatique.', 'En Serverless, vous ne payez que pour les millisecondes durant lesquelles votre fonction s''exécute.', 'exports.handler = async (event) => {
  const nom = event.queryStringParameters?.name || ''Étudiant'';
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Bienvenue sur Learnify, ${nom} !` })
  };
};', '[{"time":"00:00","title":"Le concept FaaS (Function as a Service)","seconds":0},{"time":"03:30","title":"Mise à l''échelle automatique (Auto-scaling)","seconds":210},{"time":"06:00","title":"Modèle de facturation à l''usage réel","seconds":360}]', 2);
INSERT INTO quiz_questions (id, lesson_id, position, question, options, correct_index, explanation) VALUES
(25, 20, 0, 'Quel acronyme désigne une application prête à l''emploi accessible via le web (ex: Gmail) ?', '["IaaS","PaaS","SaaS","DaaS"]', 2, 'SaaS (Software as a Service) fournit des logiciels complets hébergés et gérés par le fournisseur.'),
(26, 21, 0, 'Quel est l''avantage majeur d''un conteneur Docker par rapport à une VM ?', '["Démarrage quasi-instantané et consommation réduite de ressources","Il nécessite obligatoirement Windows XP","Il ne peut contenir aucun code source","Il remplace totalement le réseau Internet"]', 0, 'Les conteneurs partagent le noyau de l''OS hôte, évitant de lancer un OS complet par instance.'),
(27, 22, 0, 'Comment est facturée une fonction Serverless (FaaS) ?', '["Au temps exact d''exécution et au nombre de requêtes traitées","Un forfait fixe mensuel obligatoire même éteinte","Au nombre de lignes de code écrites","Par tranche de 24 heures indivisibles"]', 0, 'Le Serverless applique une facturation à l''usage strict : si personne n''utilise la fonction, son coût d''exécution est nul.');
