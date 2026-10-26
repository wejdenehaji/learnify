// Learnify course data. Plain data only: no behaviour in this file.
// The lesson page reads it through the LEARNIFY_COURSE constant.
const LEARNIFY_COURSE = {
  id: "html-css",
  title: "HTML & CSS Fundamentals",
  lessons: [
    {
      title: "Bienvenue dans le développement web",
      category: "Introduction",
      duration: 6,
      video: "https://www.youtube-nocookie.com/embed/UB1O30fR-EE",
      heading: "Qu'est-ce que le développement web ?",
      description: "Le développement web consiste à créer des sites et des applications accessibles depuis un navigateur. Pour commencer, on utilise principalement HTML pour organiser le contenu et CSS pour définir son apparence.",
      tip: "HTML donne une structure au contenu, tandis que CSS s'occupe de la présentation visuelle.",
      code: "<h1>Bonjour !</h1>\n<p>Bienvenue sur ma page web.</p>"
    },
    {
      title: "La structure d'une page HTML",
      category: "HTML5",
      duration: 10,
      video: "",
      heading: "Les éléments de base d'une page",
      description: "Une page HTML commence par une déclaration de type de document, puis un élément html qui contient deux parties : head, qui regroupe les informations sur la page, et body, qui contient ce que l'on voit à l'écran.",
      tip: "Le titre placé dans title (dans head) s'affiche dans l'onglet du navigateur, pas dans la page.",
      code: "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Ma page</title>\n</head>\n<body>\n  <h1>Bonjour !</h1>\n</body>\n</html>"
    },
    {
      title: "Les bases du CSS",
      category: "CSS3",
      duration: 10,
      video: "",
      heading: "Appliquer des styles",
      description: "Une règle CSS est composée d'un sélecteur, qui désigne les éléments visés, et d'une ou plusieurs déclarations, chacune formée d'une propriété et d'une valeur.",
      tip: "On peut relier un fichier CSS à une page avec une balise link placée dans head.",
      code: "h1 {\n  color: #7160df;\n  font-size: 32px;\n}"
    },
    {
      title: "Organiser avec Flexbox",
      category: "Mise en page",
      duration: 9,
      video: "",
      heading: "Aligner des éléments avec Flexbox",
      description: "Flexbox est un mode de mise en page qui permet de disposer des éléments en ligne ou en colonne, de les aligner et de les espacer facilement.",
      tip: "Les propriétés Flexbox se placent sur le conteneur (le parent), pas sur les éléments à l'intérieur.",
      code: ".menu {\n  display: flex;\n  gap: 16px;\n  justify-content: space-between;\n}"
    },
    {
      title: "Une page adaptée au mobile",
      category: "Responsive design",
      duration: 10,
      video: "",
      heading: "Adapter la page à tous les écrans",
      description: "Une page responsive s'adapte à la largeur de l'écran. Pour cela, on déclare une balise meta viewport dans head, puis on utilise des media queries pour changer certains styles selon la taille de l'écran.",
      tip: "Sans la balise meta viewport, un téléphone affiche la page comme sur un grand écran, en miniature.",
      code: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\n@media (max-width: 600px) {\n  h1 { font-size: 24px; }\n}"
    }
  ]
};