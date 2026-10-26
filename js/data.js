/**
 * Learnify - Data Service (Vanilla JS)
 * Charge la bibliothèque de cours via fetch() avec fallback intégré et synchronisation localStorage
 */

import { Storage } from './storage.js';

let cachedCourses = null;

// Données de secours fiables si fetch() local est restreint (protocole file://)
const FALLBACK_COURSES = [
  {
    "id": "html-css",
    "title": "HTML & CSS Fundamentals",
    "eyebrow": "DÉVELOPPEMENT WEB",
    "category": "Web",
    "tagClass": "tag-web",
    "artClass": "art-web",
    "badge": "01",
    "level": "Débutant",
    "duration": "Environ 45 minutes",
    "description": "Apprenez à structurer une page web avec HTML et à la rendre agréable avec CSS. Aucune expérience préalable nécessaire.",
    "about": "Ce cours présente les bases nécessaires pour créer une page web simple. Vous allez découvrir le rôle du HTML, les principales propriétés CSS et la façon d'organiser une mise en page moderne et responsive.",
    "instructor": {
      "name": "Amine Mansour",
      "role": "Développeur Web & Formateur",
      "initials": "AM",
      "bio": "Passionné par le web et les explications simples, Amine vous accompagne dans vos premiers pas vers le développement frontend."
    },
    "objectives": [
      "Structurer une page sémantique avec HTML5",
      "Appliquer des styles élégants avec CSS3",
      "Organiser les éléments facilement avec Flexbox",
      "Adapter l'affichage aux mobiles et tablettes"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Bienvenue dans le développement web",
        "subtitle": "Introduction · 6 min",
        "duration": "6 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/UB1O30fR-EE",
        "markers": [
          {
            "time": "00:00",
            "title": "Présentation du web",
            "seconds": 0
          },
          {
            "time": "01:45",
            "title": "Rôle du navigateur et du code",
            "seconds": 105
          },
          {
            "time": "03:30",
            "title": "HTML vs CSS vs JavaScript",
            "seconds": 210
          },
          {
            "time": "05:00",
            "title": "Premiers pas et résumé",
            "seconds": 300
          }
        ],
        "articleHeading": "Qu'est-ce que le développement web ?",
        "description": "Le développement web consiste à créer des sites et des applications accessibles depuis un navigateur. Pour commencer, on utilise principalement HTML pour organiser le contenu et CSS pour définir son apparence.",
        "tip": "HTML donne une structure logique au contenu, tandis que CSS s'occupe de la présentation visuelle.",
        "codeSnippet": "<h1>Bonjour !</h1>\n<p>Bienvenue sur ma première page web avec Learnify.</p>",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel est le rôle principal du langage HTML ?",
            "options": [
              "Gérer les interactions complexes de la page",
              "Structurer le contenu et les éléments d'une page",
              "Compiler le code en langage machine",
              "Gérer la base de données distante"
            ],
            "correctIndex": 1,
            "explanation": "HTML (HyperText Markup Language) définit la structure et le sens du contenu web grâce aux balises sémantiques."
          },
          {
            "id": "q2",
            "question": "Quel langage sert à styliser et mettre en page les éléments HTML ?",
            "options": [
              "Python",
              "SQL",
              "CSS",
              "JSON"
            ],
            "correctIndex": 2,
            "explanation": "CSS (Cascading Style Sheets) est spécifiquement conçu pour appliquer des couleurs, typographies et mises en page au HTML."
          }
        ]
      },
      {
        "id": 1,
        "title": "La structure d'une page HTML",
        "subtitle": "HTML5 · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/pQN-pnXPaVg",
        "markers": [
          {
            "time": "00:00",
            "title": "Le squelette minimal HTML5",
            "seconds": 0
          },
          {
            "time": "02:30",
            "title": "La balise <head> et métadonnées",
            "seconds": 150
          },
          {
            "time": "06:10",
            "title": "Le corps du document <body>",
            "seconds": 370
          },
          {
            "time": "08:45",
            "title": "Balises sémantiques indispensables",
            "seconds": 525
          }
        ],
        "articleHeading": "Les fondations d'un document HTML5",
        "description": "Toute page web repose sur un squelette standard : la déclaration <!DOCTYPE html>, la balise racine <html>, la section d'en-tête technique <head> et le corps visible <body>.",
        "tip": "Utilisez des balises sémantiques (<header>, <main>, <nav>, <article>, <footer>) pour améliorer l'accessibilité et le référencement.",
        "codeSnippet": "<!DOCTYPE html>\n<html lang=\"fr\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <title>Mon Site</title>\n  </head>\n  <body>\n    <main>\n      <h1>Titre Principal</h1>\n    </main>\n  </body>\n</html>",
        "quiz": [
          {
            "id": "q1",
            "question": "Dans quelle section place-t-on le titre de l'onglet et les liens CSS ?",
            "options": [
              "Dans la balise <header>",
              "Dans la balise <head>",
              "Dans la balise <main>",
              "Dans la balise <footer>"
            ],
            "correctIndex": 1,
            "explanation": "La balise <head> contient toutes les métadonnées techniques invisibles directement dans le corps de la page."
          },
          {
            "id": "q2",
            "question": "Quelle balise sémantique représente la navigation principale d'un site ?",
            "options": [
              "<navigate>",
              "<menu-bar>",
              "<nav>",
              "<links>"
            ],
            "correctIndex": 2,
            "explanation": "La balise HTML5 standard pour une section de liens de navigation est <nav>."
          }
        ]
      },
      {
        "id": 2,
        "title": "Les bases du CSS",
        "subtitle": "CSS3 · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/1PnVor36_40",
        "markers": [
          {
            "time": "00:00",
            "title": "Syntaxe sélecteur { propriété: valeur; }",
            "seconds": 0
          },
          {
            "time": "03:15",
            "title": "Classes, identifiants et éléments",
            "seconds": 195
          },
          {
            "time": "06:40",
            "title": "Le modèle de boîte (Box Model)",
            "seconds": 400
          },
          {
            "time": "09:00",
            "title": "Couleurs et typographies modernes",
            "seconds": 540
          }
        ],
        "articleHeading": "Donner vie à vos pages avec les règles CSS",
        "description": "Le CSS permet de cibler des éléments grâce à des sélecteurs (balises, classes .nom, identifiants #id) pour leur attribuer des propriétés graphiques comme la couleur, les marges et la taille.",
        "tip": "Le Box Model est composé du contenu (content), de la marge intérieure (padding), de la bordure (border) et de la marge extérieure (margin).",
        "codeSnippet": ".card {\n  background-color: #ffffff;\n  border-radius: 12px;\n  padding: 20px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);\n}",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel symbole précède un sélecteur de classe en CSS ?",
            "options": [
              "Le dièse (#)",
              "Le point (.)",
              "L'arobase (@)",
              "L'étoile (*)"
            ],
            "correctIndex": 1,
            "explanation": "En CSS, les classes sont préfixées par un point (ex: .bouton) et les identifiants par un dièse (ex: #bouton)."
          },
          {
            "id": "q2",
            "question": "Quelle propriété crée un espacement intérieur entre le contenu et la bordure ?",
            "options": [
              "margin",
              "spacing",
              "padding",
              "gap"
            ],
            "correctIndex": 2,
            "explanation": "Le padding est l'espace interne situé à l'intérieur de la bordure de l'élément."
          }
        ]
      },
      {
        "id": 3,
        "title": "Organiser avec Flexbox",
        "subtitle": "Mise en page · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/fYq5PXgSsbE",
        "markers": [
          {
            "time": "00:00",
            "title": "Pourquoi Flexbox ?",
            "seconds": 0
          },
          {
            "time": "02:10",
            "title": "display: flex et axe principal",
            "seconds": 130
          },
          {
            "time": "05:00",
            "title": "justify-content et align-items",
            "seconds": 300
          },
          {
            "time": "07:30",
            "title": "Cas concret : la barre de navigation",
            "seconds": 450
          }
        ],
        "articleHeading": "Mise en page unidimensionnelle avec Flexbox",
        "description": "Flexbox facilite l'alignement et la distribution de l'espace entre des éléments, même lorsque leurs dimensions sont inconnues ou dynamiques.",
        "tip": "Définir 'display: flex' sur un conteneur transforme instantanément ses enfants directs en flex-items.",
        "codeSnippet": ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 20px;\n}",
        "quiz": [
          {
            "id": "q1",
            "question": "Quelle propriété permet d'aligner les éléments le long de l'axe principal (horizontal par défaut) ?",
            "options": [
              "align-items",
              "justify-content",
              "flex-direction",
              "align-content"
            ],
            "correctIndex": 1,
            "explanation": "justify-content aligne les éléments sur l'axe principal (ex: flex-start, center, space-between)."
          },
          {
            "id": "q2",
            "question": "Quelle valeur de 'justify-content' sépare les éléments aux deux extrémités opposées ?",
            "options": [
              "space-around",
              "space-between",
              "center",
              "flex-end"
            ],
            "correctIndex": 1,
            "explanation": "space-between place le premier élément au début, le dernier à la fin, et distribue l'espace également entre les autres."
          }
        ]
      },
      {
        "id": 4,
        "title": "Une page adaptée au mobile",
        "subtitle": "Responsive design · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/srvUrASNj0s",
        "markers": [
          {
            "time": "00:00",
            "title": "Le principe du Responsive Web Design",
            "seconds": 0
          },
          {
            "time": "02:40",
            "title": "La balise méta viewport",
            "seconds": 160
          },
          {
            "time": "05:20",
            "title": "Les Media Queries @media",
            "seconds": 320
          },
          {
            "time": "08:10",
            "title": "Tester avec les outils de développement (F12)",
            "seconds": 490
          }
        ],
        "articleHeading": "Rendre votre site responsive sur tous les écrans",
        "description": "Le responsive design garantit une lecture et une navigation optimales sur smartphone, tablette et écran d'ordinateur grâce aux requêtes média CSS et à des grilles souples.",
        "tip": "Pensez 'Mobile First' : concevez d'abord pour les petits écrans puis enrichissez l'affichage pour les grands écrans avec min-width.",
        "codeSnippet": "@media (max-width: 768px) {\n  .layout {\n    flex-direction: column;\n  }\n  .sidebar {\n    width: 100%;\n  }\n}",
        "quiz": [
          {
            "id": "q1",
            "question": "Quelle règle CSS conditionnelle permet d'adapter le style selon la largeur de l'écran ?",
            "options": [
              "@screen",
              "@media",
              "@responsive",
              "@query"
            ],
            "correctIndex": 1,
            "explanation": "La règle @media (ex: @media (max-width: 650px)) applique des styles spécifiques selon les caractéristiques de l'appareil."
          },
          {
            "id": "q2",
            "question": "Quelle balise méta est obligatoire dans le <head> pour que le responsive fonctionne sur smartphone ?",
            "options": [
              "<meta name=\"screen\" content=\"mobile\">",
              "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
              "<meta name=\"responsive\" content=\"true\">",
              "<meta name=\"scale\" content=\"fixed\">"
            ],
            "correctIndex": 1,
            "explanation": "La balise <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"> ajuste la largeur d'affichage à l'écran de l'appareil."
          }
        ]
      }
    ]
  },
  {
    "id": "python",
    "title": "Python Programming",
    "eyebrow": "CODE & LOGIQUE",
    "category": "Programmation",
    "tagClass": "tag-python",
    "artClass": "art-python",
    "badge": "02",
    "level": "Débutant",
    "duration": "Environ 1 heure",
    "description": "Découvrez les variables, les conditions, les boucles et les fonctions avec un langage clair et puissant.",
    "about": "Python est l'un des langages de programmation les plus populaires au monde. Ce cours vous guide pas à pas dans l'apprentissage de la logique de code et de la syntaxe Python.",
    "instructor": {
      "name": "Nour Khemir",
      "role": "Ingénieure Logiciel",
      "initials": "NK",
      "bio": "Développeuse Python passionnée d'algorithmique et de transmission pédagogique."
    },
    "objectives": [
      "Comprendre la syntaxe et les variables en Python",
      "Manipuler les conditions (if, elif, else)",
      "Automatiser des tâches avec les boucles (for, while)",
      "Définir et réutiliser des fonctions modulaires"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Premiers pas avec Python",
        "subtitle": "Introduction · 8 min",
        "duration": "8 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc",
        "markers": [
          {
            "time": "00:00",
            "title": "Pourquoi Python ?",
            "seconds": 0
          },
          {
            "time": "02:30",
            "title": "Installer et exécuter Python",
            "seconds": 150
          },
          {
            "time": "05:10",
            "title": "La fonction print()",
            "seconds": 310
          }
        ],
        "articleHeading": "Votre premier script Python",
        "description": "Python se distingue par sa lisibilité exceptionnelle. Un simple appel à print() permet d'afficher des données dans la console.",
        "tip": "En Python, l'indentation (espaces au début d'une ligne) est obligatoire pour structurer les blocs de code.",
        "codeSnippet": "nom = \"Étudiant\"\nprint(f\"Bienvenue dans Python, {nom} !\")",
        "quiz": [
          {
            "id": "q1",
            "question": "Quelle fonction native sert à afficher du texte dans la console en Python ?",
            "options": [
              "console.log()",
              "echo()",
              "print()",
              "write()"
            ],
            "correctIndex": 2,
            "explanation": "print() est la fonction standard d'affichage en console en Python."
          }
        ]
      },
      {
        "id": 1,
        "title": "Les variables et types de données",
        "subtitle": "Types de base · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc",
        "markers": [
          {
            "time": "00:00",
            "title": "Nombres entiers et flottants",
            "seconds": 0
          },
          {
            "time": "03:40",
            "title": "Chaînes de caractères (str)",
            "seconds": 220
          },
          {
            "time": "07:15",
            "title": "Booléens (True / False)",
            "seconds": 435
          }
        ],
        "articleHeading": "Stocker des informations en mémoire",
        "description": "Les variables permettent de stocker et manipuler des valeurs : entiers (int), décimaux (float), textes (str) ou booléens (bool).",
        "tip": "Python est dynamiquement typé : pas besoin de déclarer explicitement le type lors de la création d'une variable.",
        "codeSnippet": "age = 21\nprix = 19.99\nest_etudiant = True\nnom = \"Sami\"",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel est le type de la valeur 3.14 en Python ?",
            "options": [
              "int",
              "float",
              "str",
              "double"
            ],
            "correctIndex": 1,
            "explanation": "Les nombres à virgule flottante sont représentés par le type 'float' en Python."
          }
        ]
      },
      {
        "id": 2,
        "title": "Les structures conditionnelles",
        "subtitle": "Logique conditionnelle · 12 min",
        "duration": "12 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc",
        "markers": [
          {
            "time": "00:00",
            "title": "Les opérateurs de comparaison",
            "seconds": 0
          },
          {
            "time": "04:00",
            "title": "Le bloc if / elif / else",
            "seconds": 240
          }
        ],
        "articleHeading": "Prendre des décisions dans le code",
        "description": "Les conditions permettent à votre programme d'exécuter différentes instructions selon que certains critères sont vrais ou faux.",
        "tip": "Utilisez le double égal '==' pour tester une égalité, car le simple '=' est réservé à l'assignation.",
        "codeSnippet": "score = 85\nif score >= 90:\n    print(\"Mention Très Bien\")\nelif score >= 50:\n    print(\"Réussi\")\nelse:\n    print(\"À revoir\")",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel mot-clé représente 'sinon si' en Python ?",
            "options": [
              "else if",
              "elseif",
              "elif",
              "case"
            ],
            "correctIndex": 2,
            "explanation": "'elif' est la contraction de 'else if' en syntaxe Python."
          }
        ]
      },
      {
        "id": 3,
        "title": "Les boucles et itérations en Python",
        "subtitle": "Boucles · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/k9TUPpGqYTo",
        "markers": [
          {
            "time": "00:00",
            "title": "La boucle for et range()",
            "seconds": 0
          },
          {
            "time": "03:15",
            "title": "La boucle while et conditions",
            "seconds": 195
          },
          {
            "time": "06:30",
            "title": "Parcourir des listes et dictionnaires",
            "seconds": 390
          }
        ],
        "articleHeading": "Répéter des instructions avec les boucles",
        "description": "Les boucles permettent d'exécuter un bloc de code plusieurs fois sans redondance. La boucle for est idéale quand on connaît le nombre d'itérations, tandis que while boucle tant qu'une condition reste vraie.",
        "tip": "Pensez à toujours vous assurer qu'une boucle while possède une condition d'arrêt pour éviter une boucle infinie.",
        "codeSnippet": "nombres = [1, 2, 3, 4, 5]\npairs = [n for n in nombres if n % 2 == 0]\nprint(f'Nombres pairs: {pairs}')",
        "quiz": [
          {
            "id": "q_py_4_1",
            "question": "Quelle fonction produit une séquence d'entiers pour une boucle for ?",
            "options": [
              "range()",
              "sequence()",
              "loop()",
              "iterate()"
            ],
            "correctIndex": 0,
            "explanation": "range(debut, fin, pas) génère les entiers nécessaires pour itérer simplement dans une boucle for."
          }
        ]
      }
    ]
  },
  {
    "id": "javascript",
    "title": "JavaScript for Beginners",
    "eyebrow": "INTERACTIVITÉ",
    "category": "Programmation",
    "tagClass": "tag-js",
    "artClass": "art-js",
    "badge": "03",
    "level": "Débutant",
    "duration": "Environ 50 minutes",
    "description": "Ajoutez des interactions captivantes à vos pages web grâce au langage du navigateur.",
    "about": "JavaScript donne vie au web en permettant de manipuler le DOM, de réagir aux clics et aux événements de l'utilisateur, et de communiquer avec des APIs distantes.",
    "instructor": {
      "name": "Yassine Dridi",
      "role": "Architecte Frontend",
      "initials": "YD",
      "bio": "Spécialiste de l'écosystème JavaScript moderne et des architectures Single Page Applications."
    },
    "objectives": [
      "Manipuler les éléments du DOM avec document.querySelector",
      "Écouter et réagir aux événements utilisateur (addEventListener)",
      "Sauvegarder l'état dans le navigateur avec localStorage",
      "Effectuer des requêtes asynchrones avec fetch()"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Introduction au JavaScript moderne",
        "subtitle": "Bases · 8 min",
        "duration": "8 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/W6NZfCO5SIk",
        "markers": [
          {
            "time": "00:00",
            "title": "Le rôle de JavaScript",
            "seconds": 0
          },
          {
            "time": "02:40",
            "title": "Variables let et const",
            "seconds": 160
          },
          {
            "time": "05:30",
            "title": "Fonctions fléchées ES6",
            "seconds": 330
          }
        ],
        "articleHeading": "L'interactivité côté client",
        "description": "JavaScript s'exécute directement dans le navigateur de l'internaute et permet de modifier le contenu d'une page sans la recharger.",
        "tip": "Privilégiez 'const' pour les valeurs qui ne changent pas et 'let' pour les variables réassignables. Évitez 'var'.",
        "codeSnippet": "const saluer = (prenom) => {\n  return `Bonjour ${prenom} !`;\n};\nconsole.log(saluer('Karim'));",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel mot-clé est recommandé pour déclarer une valeur immuable en ES6 ?",
            "options": [
              "var",
              "let",
              "const",
              "static"
            ],
            "correctIndex": 2,
            "explanation": "const permet de déclarer une constante dont la référence ne peut pas être réassignée."
          }
        ]
      },
      {
        "id": 1,
        "title": "Le DOM et les écouteurs d'événements",
        "subtitle": "DOM & Events · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/y17RuWkWdn8",
        "markers": [
          {
            "time": "00:00",
            "title": "Qu'est-ce que le DOM ?",
            "seconds": 0
          },
          {
            "time": "03:10",
            "title": "Sélectionner avec querySelector",
            "seconds": 190
          },
          {
            "time": "06:30",
            "title": "addEventListener('click', ...)",
            "seconds": 390
          }
        ],
        "articleHeading": "Connecter le code aux actions de l'utilisateur",
        "description": "Grâce à document.querySelector() et addEventListener(), vous pouvez détecter les clics sur les boutons et mettre à jour le texte ou les classes CSS.",
        "tip": "Les classes CSS sont manipulées facilement avec element.classList.add(), remove() et toggle().",
        "codeSnippet": "const bouton = document.querySelector('#mon-bouton');\nbouton.addEventListener('click', () => {\n  bouton.classList.toggle('active');\n});",
        "quiz": [
          {
            "id": "q1",
            "question": "Quelle méthode moderne permet d'attacher un écouteur d'événement à un élément HTML ?",
            "options": [
              "element.attach()",
              "element.addEventListener()",
              "element.listen()",
              "element.onClick()"
            ],
            "correctIndex": 1,
            "explanation": "addEventListener() est la méthode standard pour écouter des événements comme 'click', 'input', 'keydown', etc."
          }
        ]
      },
      {
        "id": 2,
        "title": "Tableaux et méthodes modernes (map, filter)",
        "subtitle": "Tableaux · 8 min",
        "duration": "8 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/rRgD1yVwIvE",
        "markers": [
          {
            "time": "00:00",
            "title": "Manipulation des tableaux",
            "seconds": 0
          },
          {
            "time": "02:45",
            "title": "La méthode map()",
            "seconds": 165
          },
          {
            "time": "05:20",
            "title": "La méthode filter()",
            "seconds": 320
          }
        ],
        "articleHeading": "Programmation fonctionnelle sur les tableaux",
        "description": "En JavaScript moderne, on évite les boucles for classiques au profit de méthodes immutables comme .map() pour transformer et .filter() pour sélectionner des données.",
        "tip": "map() et filter() renvoient un nouveau tableau sans altérer le tableau original.",
        "codeSnippet": "const scores = [12, 18, 9, 15];\nconst admis = scores.filter(s => s >= 10);\nconst sur20 = admis.map(s => `Note: ${s}/20`);\nconsole.log(sur20);",
        "quiz": [
          {
            "id": "q_js_3_1",
            "question": "Quelle méthode de tableau permet de transformer chaque élément et retourne un nouveau tableau de même taille ?",
            "options": [
              "filter()",
              "map()",
              "reduce()",
              "find()"
            ],
            "correctIndex": 1,
            "explanation": "map() applique une fonction de rappel à chaque élément et retourne un nouveau tableau contenant les résultats."
          }
        ]
      },
      {
        "id": 3,
        "title": "L'asynchronisme et Fetch API",
        "subtitle": "Asynchrone · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/PoRJizFvM7s",
        "markers": [
          {
            "time": "00:00",
            "title": "Le concept d'asynchronisme",
            "seconds": 0
          },
          {
            "time": "03:10",
            "title": "Les Promesses (Promises)",
            "seconds": 190
          },
          {
            "time": "06:00",
            "title": "async / await et fetch()",
            "seconds": 360
          }
        ],
        "articleHeading": "Communiquer avec des serveurs grâce à Fetch",
        "description": "JavaScript est mono-thread mais gère les tâches longues (comme charger des données distantes) de manière asynchrone grâce à l'Event Loop, aux Promesses et à async/await.",
        "tip": "Encadrez toujours vos appels async/await dans un bloc try...catch pour capturer les erreurs réseau.",
        "codeSnippet": "async function chargerCours() {\n  try {\n    const res = await fetch('data/courses.json');\n    const data = await res.json();\n    console.log('Cours chargés:', data.length);\n  } catch (err) {\n    console.error('Erreur:', err);\n  }\n}",
        "quiz": [
          {
            "id": "q_js_4_1",
            "question": "Que retourne la fonction fetch() ?",
            "options": [
              "Un objet JSON direct",
              "Une Promesse (Promise)",
              "Une chaîne de texte",
              "Un tableau HTML"
            ],
            "correctIndex": 1,
            "explanation": "fetch() renvoie une Promesse résolue avec l'objet Response dès que les en-têtes sont reçus."
          }
        ]
      }
    ]
  },
  {
    "id": "ai",
    "title": "Introduction to AI",
    "eyebrow": "NOUVELLES IDÉES",
    "category": "Technologie",
    "tagClass": "tag-ai",
    "artClass": "art-ai",
    "badge": "04",
    "level": "Débutant",
    "duration": "Environ 40 minutes",
    "description": "Comprenez les concepts fondamentaux de l'intelligence artificielle et du machine learning.",
    "about": "Explorez les mécanismes qui permettent aux machines d'apprendre à partir de données : apprentissage supervisé, réseaux de neurones et modèles de langage.",
    "instructor": {
      "name": "Dr. Sarah Ben Salah",
      "role": "Chercheuse en IA",
      "initials": "SB",
      "bio": "Docteure en informatique et conférencière sur les technologies d'apprentissage automatique."
    },
    "objectives": [
      "Distinguer IA, Machine Learning et Deep Learning",
      "Comprendre le cycle de vie d'un modèle d'apprentissage",
      "Découvrir le fonctionnement des réseaux de neurones",
      "Appréhender les considérations éthiques de l'IA"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Les fondations de l'Intelligence Artificielle",
        "subtitle": "Concepts clés · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/JMUxmLyrhSk",
        "markers": [
          {
            "time": "00:00",
            "title": "Histoire et définitions",
            "seconds": 0
          },
          {
            "time": "04:10",
            "title": "Apprentissage supervisé vs non-supervisé",
            "seconds": 250
          }
        ],
        "articleHeading": "Comprendre les principes de l'apprentissage machine",
        "description": "L'IA ne consiste pas à coder manuellement chaque règle, mais à fournir des données d'entraînement pour qu'un algorithme détecte des motifs et apprenne à prédire.",
        "tip": "La qualité des données est essentielle : 'Garbage in, garbage out'.",
        "codeSnippet": "# Exemple conceptuel d'apprentissage supervisé\nmodele.entrainer(donnees_entrainement, etiquettes)\nprediction = modele.predire(nouvelle_donnee)",
        "quiz": [
          {
            "id": "q1",
            "question": "En apprentissage supervisé, de quoi a besoin le modèle pour apprendre ?",
            "options": [
              "De données accompagnées de leurs étiquettes (labels)",
              "Uniquement de code sans données",
              "D'une connexion internet constante",
              "D'un GPU sans processeur"
            ],
            "correctIndex": 0,
            "explanation": "L'apprentissage supervisé utilise des exemples étiquetés (entrée + résultat attendu) pour apprendre la relation."
          }
        ]
      },
      {
        "id": 1,
        "title": "Machine Learning : supervisé vs non supervisé",
        "subtitle": "Apprentissage · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/Gv9_4yMHFhI",
        "markers": [
          {
            "time": "00:00",
            "title": "Données étiquetées et apprentissage supervisé",
            "seconds": 0
          },
          {
            "time": "03:30",
            "title": "Apprentissage non supervisé et clustering",
            "seconds": 210
          },
          {
            "time": "06:45",
            "title": "Évaluation d'un modèle (précision, rappel)",
            "seconds": 405
          }
        ],
        "articleHeading": "Comment les algorithmes apprennent des données",
        "description": "L'apprentissage supervisé utilise des exemples étiquetés pour entraîner un modèle de prédiction. L'apprentissage non supervisé cherche des régularités spontanées sans étiquettes.",
        "tip": "La qualité des données d'entraînement est déterminante pour la précision du modèle.",
        "codeSnippet": "from sklearn.linear_model import LinearRegression\nmodele = LinearRegression()\nmodele.fit(X_train, y_train)\npredictions = modele.predict(X_test)",
        "quiz": [
          {
            "id": "q_ai_2_1",
            "question": "Quelle est la caractéristique principale de l'apprentissage supervisé ?",
            "options": [
              "Les données d'entraînement comportent des labels (étiquettes)",
              "Il n'a besoin d'aucune donnée pour s'entraîner",
              "Il fonctionne uniquement sans ordinateur",
              "Il ne fait jamais d'erreurs"
            ],
            "correctIndex": 0,
            "explanation": "En supervisé, chaque donnée d'entrée est accompagnée de la réponse attendue (la cible / étiquette)."
          }
        ]
      },
      {
        "id": 2,
        "title": "Réseaux de neurones et IA générative",
        "subtitle": "Deep Learning · 11 min",
        "duration": "11 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/aircAruvnKk",
        "markers": [
          {
            "time": "00:00",
            "title": "Neurones artificiels et couches",
            "seconds": 0
          },
          {
            "time": "04:00",
            "title": "L'essor des modèles de langage (LLM)",
            "seconds": 240
          },
          {
            "time": "07:30",
            "title": "Éthique, biais et avenir de l'IA",
            "seconds": 450
          }
        ],
        "articleHeading": "L'architecture des modèles modernes",
        "description": "Le Deep Learning s'appuie sur des réseaux de neurones profonds capables d'extraire automatiquement des représentations complexes à partir d'images, de textes ou de sons.",
        "tip": "Les modèles génératifs prédisent statistiquement les éléments suivants d'une séquence.",
        "codeSnippet": "const prompt = 'Explique les réseaux de neurones en 3 phrases simples.';\nconst reponse = await callAI(prompt);\nconsole.log(reponse);",
        "quiz": [
          {
            "id": "q_ai_3_1",
            "question": "Que signifie l'acronyme LLM en intelligence artificielle ?",
            "options": [
              "Large Language Model",
              "Low Level Machine",
              "Linear Learning Matrix",
              "Logical Logic Module"
            ],
            "correctIndex": 0,
            "explanation": "LLM signifie Large Language Model, désignant les modèles massifs de traitement du langage naturel."
          }
        ]
      }
    ]
  },
  {
    "id": "database",
    "title": "Database Fundamentals",
    "eyebrow": "ORGANISER LES DONNÉES",
    "category": "Technologie",
    "tagClass": "tag-db",
    "artClass": "art-db",
    "badge": "05",
    "level": "Débutant",
    "duration": "Environ 45 minutes",
    "description": "Apprenez à modéliser, structurer et requêter vos données avec SQL.",
    "about": "Les bases de données sont le cœur de toute application web. Découvrez les tables, relations et les requêtes SELECT, INSERT, UPDATE et DELETE.",
    "instructor": {
      "name": "Karim Jlassi",
      "role": "Administrateur de bases de données",
      "initials": "KJ",
      "bio": "Expert en modélisation relationnelle et optimisation de requêtes SQL."
    },
    "objectives": [
      "Comprendre le modèle relationnel et les tables",
      "Écrire des requêtes SQL de sélection (SELECT)",
      "Filtrer et trier avec WHERE, ORDER BY et GROUP BY",
      "Comprendre les clés primaires et étrangères"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Introduction aux bases de données relationnelles",
        "subtitle": "SQL & Tables · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/HXV3zeQKqGY",
        "markers": [
          {
            "time": "00:00",
            "title": "Pourquoi une base de données ?",
            "seconds": 0
          },
          {
            "time": "03:20",
            "title": "Tables, lignes et colonnes",
            "seconds": 200
          }
        ],
        "articleHeading": "Organiser l'information en tables",
        "description": "Une base de données relationnelle organise les données en tables reliées entre elles par des clés d'identification.",
        "tip": "Chaque table doit posséder une clé primaire unique identifiant chaque enregistrement.",
        "codeSnippet": "SELECT nom, email, date_inscription\nFROM utilisateurs\nWHERE actif = 1\nORDER BY date_inscription DESC;",
        "quiz": [
          {
            "id": "q1",
            "question": "Quelle commande SQL sert à extraire des données d'une table ?",
            "options": [
              "GET",
              "SELECT",
              "PULL",
              "EXTRACT"
            ],
            "correctIndex": 1,
            "explanation": "SELECT est la commande fondamentale de consultation en SQL."
          }
        ]
      },
      {
        "id": 1,
        "title": "Le langage SQL : SELECT, WHERE et ORDER BY",
        "subtitle": "Requêtes SQL · 8 min",
        "duration": "8 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/HXV3zeRR3h4",
        "markers": [
          {
            "time": "00:00",
            "title": "Structure de base d'un SELECT",
            "seconds": 0
          },
          {
            "time": "02:40",
            "title": "Filtrer avec WHERE et opérateurs",
            "seconds": 160
          },
          {
            "time": "05:30",
            "title": "Trier et limiter les résultats",
            "seconds": 330
          }
        ],
        "articleHeading": "Interroger et extraire des données avec SQL",
        "description": "Le langage SQL (Structured Query Language) permet de formuler des questions précises à la base pour extraire uniquement les lignes et colonnes pertinentes.",
        "tip": "Pensez à toujours tester vos clauses WHERE avec des conditions combinées entre parenthèses.",
        "codeSnippet": "SELECT nom, email, date_inscription\nFROM utilisateurs\nWHERE statut = 'actif' AND pays = 'Tunisie'\nORDER BY date_inscription DESC\nLIMIT 10;",
        "quiz": [
          {
            "id": "q_db_2_1",
            "question": "Quelle clause SQL permet de trier les résultats par ordre croissant ou décroissant ?",
            "options": [
              "ORDER BY",
              "GROUP BY",
              "SORT BY",
              "WHERE"
            ],
            "correctIndex": 0,
            "explanation": "ORDER BY nom_colonne [ASC|DESC] permet de spécifier l'ordre de restitution des lignes."
          }
        ]
      },
      {
        "id": 2,
        "title": "Les jointures SQL (INNER JOIN, LEFT JOIN)",
        "subtitle": "Jointures · 10 min",
        "duration": "10 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/9yeOJ0ZMUYw",
        "markers": [
          {
            "time": "00:00",
            "title": "Pourquoi découper en plusieurs tables ?",
            "seconds": 0
          },
          {
            "time": "03:15",
            "title": "INNER JOIN : croiser des informations",
            "seconds": 195
          },
          {
            "time": "06:45",
            "title": "LEFT JOIN et valeurs nulles",
            "seconds": 405
          }
        ],
        "articleHeading": "Relier des données entre plusieurs tables",
        "description": "Les clés primaires et clés étrangères permettent d'établir des relations entre tables pour éviter la redondance et garantir la cohérence des données.",
        "tip": "INNER JOIN ne retourne que les lignes qui ont une correspondance dans les deux tables.",
        "codeSnippet": "SELECT u.nom, c.titre, i.date_inscription\nFROM inscriptions i\nINNER JOIN utilisateurs u ON i.utilisateur_id = u.id\nINNER JOIN cours c ON i.cours_id = c.id;",
        "quiz": [
          {
            "id": "q_db_3_1",
            "question": "Que retourne un LEFT JOIN si une ligne de la table gauche n'a pas de correspondance à droite ?",
            "options": [
              "La ligne gauche est affichée avec des valeurs NULL à droite",
              "Une erreur fatale de base de données",
              "La ligne de gauche est complètement supprimée",
              "Un doublon automatique"
            ],
            "correctIndex": 0,
            "explanation": "Le LEFT JOIN conserve l'ensemble des lignes de la table de gauche, complétant les colonnes manquantes par NULL."
          }
        ]
      }
    ]
  },
  {
    "id": "cloud",
    "title": "Introduction to Cloud",
    "eyebrow": "LE MONDE CONNECTÉ",
    "category": "Technologie",
    "tagClass": "tag-cloud",
    "artClass": "art-cloud",
    "badge": "06",
    "level": "Débutant",
    "duration": "Environ 35 minutes",
    "description": "Découvrez les architectures cloud, la virtualisation et le déploiement d'applications.",
    "about": "Comprenez les modèles IaaS, PaaS et SaaS, ainsi que les avantages du cloud computing en matière de scalabilité et de disponibilité.",
    "instructor": {
      "name": "Hela Miled",
      "role": "Ingénieure Cloud & DevOps",
      "initials": "HM",
      "bio": "Accompagne les équipes dans la conteneurisation et le déploiement d'applications résilientes."
    },
    "objectives": [
      "Distinguer IaaS, PaaS et SaaS",
      "Comprendre les régions et zones de disponibilité",
      "Découvrir les conteneurs et la virtualisation",
      "Appréhender la haute disponibilité et la scalabilité"
    ],
    "lessons": [
      {
        "id": 0,
        "title": "Qu'est-ce que le Cloud Computing ?",
        "subtitle": "Concepts Cloud · 8 min",
        "duration": "8 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/M988_fsOSWo",
        "markers": [
          {
            "time": "00:00",
            "title": "Du serveur physique au Cloud",
            "seconds": 0
          },
          {
            "time": "03:10",
            "title": "IaaS, PaaS, SaaS expliqués simplement",
            "seconds": 190
          }
        ],
        "articleHeading": "L'infrastructure à la demande",
        "description": "Le cloud computing fournit des ressources informatiques (serveurs, stockage, bases de données) à la demande via Internet avec facturation à l'usage.",
        "tip": "Le SaaS (Software as a Service) propose une application directement accessible via navigateur sans aucune gestion d'infrastructure.",
        "codeSnippet": "# Exemple de configuration de conteneur d'application\nservices:\n  web:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"",
        "quiz": [
          {
            "id": "q1",
            "question": "Quel acronyme désigne une application prête à l'emploi accessible via le web (ex: Gmail) ?",
            "options": [
              "IaaS",
              "PaaS",
              "SaaS",
              "DaaS"
            ],
            "correctIndex": 2,
            "explanation": "SaaS (Software as a Service) fournit des logiciels complets hébergés et gérés par le fournisseur."
          }
        ]
      },
      {
        "id": 1,
        "title": "Stockage et conteneurisation avec Docker",
        "subtitle": "Conteneurs · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/gAkwW2tuIqE",
        "markers": [
          {
            "time": "00:00",
            "title": "Machine Virtuelle vs Conteneur",
            "seconds": 0
          },
          {
            "time": "03:20",
            "title": "Le Dockerfile et l'image",
            "seconds": 200
          },
          {
            "time": "06:15",
            "title": "Déploiement sur un registre Cloud",
            "seconds": 375
          }
        ],
        "articleHeading": "Embarquer son application partout grâce aux conteneurs",
        "description": "Docker standardise l'environnement d'exécution en encapsulant le code, ses dépendances et sa configuration dans une image légère et portable.",
        "tip": "Un conteneur partage le noyau de l'OS hôte, le rendant bien plus rapide et léger qu'une machine virtuelle complète.",
        "codeSnippet": "FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ['node', 'server.js']",
        "quiz": [
          {
            "id": "q_cl_2_1",
            "question": "Quel est l'avantage majeur d'un conteneur Docker par rapport à une VM ?",
            "options": [
              "Démarrage quasi-instantané et consommation réduite de ressources",
              "Il nécessite obligatoirement Windows XP",
              "Il ne peut contenir aucun code source",
              "Il remplace totalement le réseau Internet"
            ],
            "correctIndex": 0,
            "explanation": "Les conteneurs partagent le noyau de l'OS hôte, évitant de lancer un OS complet par instance."
          }
        ]
      },
      {
        "id": 2,
        "title": "Architecture Serverless et scalabilité",
        "subtitle": "Serverless · 9 min",
        "duration": "9 min",
        "videoUrl": "https://www.youtube-nocookie.com/embed/W_VNn_TqZt8",
        "markers": [
          {
            "time": "00:00",
            "title": "Le concept FaaS (Function as a Service)",
            "seconds": 0
          },
          {
            "time": "03:30",
            "title": "Mise à l'échelle automatique (Auto-scaling)",
            "seconds": 210
          },
          {
            "time": "06:00",
            "title": "Modèle de facturation à l'usage réel",
            "seconds": 360
          }
        ],
        "articleHeading": "Créer des applications sans gérer de serveurs physiques",
        "description": "Le Serverless permet aux développeurs de se concentrer exclusivement sur la logique métier en laissant le fournisseur Cloud gérer l'infrastructure, la haute disponibilité et la scalabilité automatique.",
        "tip": "En Serverless, vous ne payez que pour les millisecondes durant lesquelles votre fonction s'exécute.",
        "codeSnippet": "exports.handler = async (event) => {\n  const nom = event.queryStringParameters?.name || 'Étudiant';\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: `Bienvenue sur Learnify, ${nom} !` })\n  };\n};",
        "quiz": [
          {
            "id": "q_cl_3_1",
            "question": "Comment est facturée une fonction Serverless (FaaS) ?",
            "options": [
              "Au temps exact d'exécution et au nombre de requêtes traitées",
              "Un forfait fixe mensuel obligatoire même éteinte",
              "Au nombre de lignes de code écrites",
              "Par tranche de 24 heures indivisibles"
            ],
            "correctIndex": 0,
            "explanation": "Le Serverless applique une facturation à l'usage strict : si personne n'utilise la fonction, son coût d'exécution est nul."
          }
        ]
      }
    ]
  }
];

export const DataService = {
  /**
   * Charge tous les cours (fetch local + personnalisés - supprimés)
   * @returns {Promise<Array>}
   */
  async getCourses() {
    let baseList = [];

    try {
      // Détection chemin relatif selon que l'on se trouve à la racine
      const dataUrl = 'data/courses.json';
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      baseList = await response.json();
    } catch (e) {
      console.warn('Mode fallback utilisé pour les données (fetch local non supporté sur ce protocole):', e.message);
      baseList = FALLBACK_COURSES;
    }

    const deletedIds = Storage.getDeletedCourseIds();
    const activeBase = baseList.filter(c => !deletedIds.includes(c.id));
    const customList = Storage.getCustomCourses();

    cachedCourses = [...customList, ...activeBase];
    return cachedCourses;
  },

  /**
   * Récupère un cours par son ID
   * @param {string} courseId 
   * @returns {Promise<Object|null>}
   */
  async getCourseById(courseId) {
    await this.getCourses();
    return (cachedCourses || []).find(c => c.id === courseId) || null;
  },

  /**
   * Récupère une leçon spécifique d'un cours
   * @param {string} courseId 
   * @param {number} lessonIndex 
   * @returns {Promise<{ course: Object, lesson: Object } | null>}
   */
  async getLesson(courseId, lessonIndex) {
    const course = await this.getCourseById(courseId);
    if (!course || !course.lessons) return null;
    const idx = Math.max(0, Math.min(Number(lessonIndex) || 0, course.lessons.length - 1));
    const lesson = course.lessons[idx];
    return lesson ? { course, lesson, index: idx } : null;
  },

  /** Ajoute un cours via le service Storage et invalide le cache */
  addCourse(course) {
    cachedCourses = null;
    Storage.addCustomCourse(course);
  },

  /** Met à jour un cours et invalide le cache */
  updateCourse(courseId, updatedCourse) {
    cachedCourses = null;
    Storage.updateCourse(courseId, updatedCourse);
  },

  /** Supprime un cours et invalide le cache */
  deleteCourse(courseId) {
    cachedCourses = null;
    Storage.deleteCourse(courseId);
  }
};

