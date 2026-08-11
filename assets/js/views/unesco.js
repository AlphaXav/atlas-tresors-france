/* ============================================================================
 * Atlas des Trésors de France — assets/js/views/unesco.js
 * Vue « Patrimoine mondial » : synthèse, filtre par type, grille des biens.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
ATLAS.views.unesco = (() => {
  const { $, $$, el, esc } = ATLAS.utils;
  const I = ATLAS.icons;

  const TYPES = [
    { key: "tous",     label: "Tous les biens" },
    { key: "culturel", label: "Culturels" },
    { key: "naturel",  label: "Naturels" },
    { key: "mixte",    label: "Mixtes" },
  ];
  let current = "tous";

  const sites = () => (ATLAS.unesco || []).slice();

  function fillStats() {
    const S = sites();
    const c = S.filter(s => s.type === "culturel").length;
    const n = S.filter(s => s.type === "naturel").length;
    const m = S.filter(s => s.type === "mixte").length;
    const derniere = Math.max(...S.map(s => s.annee));
    $("#unesco-stats").innerHTML = [
      [S.length, "biens inscrits"], [c, "culturels"], [n, "naturels"], [m, "mixtes"],
      ["4ᵉ", "rang mondial"], [derniere, "dernière inscription"]
    ].map(([b, s]) => `<div class="stat-card"><b>${b}</b><span>${esc(s)}</span></div>`).join("");
  }

  function siteCard(s) {
    const villes = (s.villages || []).map(id => ATLAS.store.villageById(id)).filter(Boolean);
    const url = ATLAS.unescoUrl(s);
    const node = el("article", { class: `u-card u-card--${s.type}`, dataset: { id: s.id } });
    node.innerHTML = `
      <div class="u-card__head">
        <span class="u-type u-type--${s.type}">${I.globe}${esc(ATLAS.unescoTypeLabel(s.type))}</span>
        <span class="u-year">${s.annee}</span>
      </div>
      <h3>${esc(s.nom)}</h3>
      <div class="u-region">${I.pin}${esc(s.region)}${s.transfrontalier ? ` · <span class="u-serie">bien en série / transfrontalier</span>` : ""}</div>
      <p class="u-resume">${esc(s.resume)}</p>
      ${villes.length ? `<div class="u-villages"><span class="u-villages__lbl">Dans l'Atlas :</span> ${villes.map(v => `<a data-village="${v.id}">${esc(v.nom)}</a>`).join(" · ")}</div>` : ""}
      <div class="u-card__foot">
        <a class="u-link" href="${url}" target="_blank" rel="noopener">${I.book} Fiche UNESCO ↗</a>
      </div>`;
    node.querySelectorAll("[data-village]").forEach(a =>
      a.addEventListener("click", (e) => { e.stopPropagation(); ATLAS.views.villages.openFiche(a.dataset.village); }));
    return node;
  }

  function render() {
    fillStats();

    const tabsRoot = $("#unesco-tabs");
    tabsRoot.innerHTML = TYPES.map(t =>
      `<button class="rank-tab ${t.key === current ? "is-active" : ""}" data-type="${t.key}">${esc(t.label)}</button>`).join("");
    tabsRoot.querySelectorAll("[data-type]").forEach(b =>
      b.addEventListener("click", () => { current = b.dataset.type; render(); }));

    let arr = sites();
    if (current !== "tous") arr = arr.filter(s => s.type === current);
    // tri : région (fr) puis année
    arr.sort((a, b) => a.region.localeCompare(b.region, "fr") || a.annee - b.annee);

    const listRoot = $("#unesco-list");
    listRoot.innerHTML = "";
    arr.forEach(s => listRoot.appendChild(siteCard(s)));
  }

  return { render };
})();
