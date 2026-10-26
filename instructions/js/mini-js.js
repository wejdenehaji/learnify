(() => {
    // Grille d'évaluation : calcul de la note estimée
    const champs = [...document.querySelectorAll(".grille input[data-max]")];
    const total = document.getElementById("note-total");
    const barre = document.getElementById("note-barre");
    const calculer = () => {
        let somme = 0;
        champs.forEach((c) => {
            const max = Number(c.dataset.max);
            let v = parseFloat(c.value);
            if (isNaN(v) || v < 0) v = 0;
            if (v > max) { v = max; c.value = max; }
            somme += v;
        });
        const note = Math.min(20, somme);   // le bonus peut dépasser 20 : la note est plafonnée
        total.textContent = note.toFixed(1).replace(".0", "").replace(".", ",");
        barre.style.width = `${(note / 20) * 100}%`;
    };
    champs.forEach((c) => c.addEventListener("input", calculer));
    calculer();

    // Checklist « Avant de rendre » mémorisée dans ce navigateur
    const cases = [...document.querySelectorAll(".checklist input")];
    const bilan = document.getElementById("bilan-rendu");
    const CLE = "mini-js-checklist";
    let faits = [];
    try { faits = JSON.parse(localStorage.getItem(CLE)) || []; } catch (e) {}
    const maj = () => {
        bilan.textContent = cases.filter((c) => c.checked).length;
        try { localStorage.setItem(CLE, JSON.stringify(cases.filter((c) => c.checked).map((c) => c.dataset.id))); } catch (e) {}
    };
    document.getElementById("total-rendu").textContent = cases.length;
    cases.forEach((c) => { c.checked = faits.includes(c.dataset.id); c.addEventListener("change", maj); });
    maj();
})();
