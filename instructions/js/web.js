// Thème clair / sombre
const root = document.documentElement;
try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;
} catch (e) { /* stockage indisponible */ }
document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// Éditeurs avec aperçu en direct (iframe sans scripts)
const entete = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#14172b;line-height:1.5}</style>`;
document.querySelectorAll(".live").forEach((bloc) => {
    const zone = bloc.querySelector("textarea");
    const cadre = bloc.querySelector("iframe");
    let minuteur;
    const maj = () => { cadre.srcdoc = entete + zone.value; };
    zone.addEventListener("input", () => { clearTimeout(minuteur); minuteur = setTimeout(maj, 150); });
    maj();
});

// Suivi des exercices terminés (énoncé du TP)
const cases = document.querySelectorAll(".fait input");
if (cases.length) {
    const CLE = document.body.dataset.cle || "tp-html-css-termines";
    let faits = [];
    try { faits = JSON.parse(localStorage.getItem(CLE)) || []; } catch (e) {}
    const bilan = document.getElementById("bilan");
    const maj = () => {
        cases.forEach((c) => c.closest(".notion").classList.toggle("termine", c.checked));
        if (bilan) bilan.textContent = [...cases].filter((c) => c.checked).length;
        try { localStorage.setItem(CLE, JSON.stringify([...cases].filter((c) => c.checked).map((c) => c.dataset.ex))); } catch (e) {}
    };
    cases.forEach((c) => { c.checked = faits.includes(c.dataset.ex); c.addEventListener("change", maj); });
    maj();
}

// Barre de progression de lecture
root.classList.add("js");
const barre = document.getElementById("progress");
const majProgression = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    barre.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
};
addEventListener("scroll", majProgression, { passive: true });
majProgression();

// Apparition des sections + sommaire actif
const revelateur = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); revelateur.unobserve(e.target); } });
}, { rootMargin: "0px 0px -8% 0px" });
const liens = document.querySelectorAll(".toc a[href^='#']");
const observateur = new IntersectionObserver((entrees) => {
    entrees.forEach((e) => {
        if (e.isIntersecting) liens.forEach((l) => l.classList.toggle("actif", l.getAttribute("href") === "#" + e.target.id));
    });
}, { rootMargin: "-20% 0px -70% 0px" });
document.querySelectorAll(".notion").forEach((s) => { revelateur.observe(s); observateur.observe(s); });
