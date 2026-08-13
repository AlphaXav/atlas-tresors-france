/* ============================================================================
 * Atlas des Trésors de France — assets/js/views/vpah.js
 * Vue « Villes d'art et d'histoire » : synthèse, filtre par région, annuaire.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
ATLAS.views.vpah = (() => {
  const { $, $$, el, esc } = ATLAS.utils;
  const I = ATLAS.icons;
  let current = "toutes";

  const all = () => (ATLAS.vpah || []);
  const regions = () => [...new Set(all().map(c => c.region))].sort((a, b) => a.localeCompare(b, "fr"));

  function fillStats() {
    const C = all();
    const nReg = new Set(C.map(c => c.region)).size;
    const nAtlas = C.filter(c => c.village).length;
    $("#vpah-stats").innerHTML = [
      [C.length, "communes labellisées"], [nReg, "régions"], [nAtlas, "villages de l'Atlas"], ["1985", "création du label"]
    ].map(([b, s]) => `<div class="stat-card"><b>${b}</b><span>${esc(s)}</span></div>`).join("");
  }

  function pill(c) {
    if (c.village && ATLAS.store.villageById(c.village)) {
      return `<a class="vpah-pill vpah-pill--atlas" data-village="${c.village}" title="Fiche dans l'Atlas">${I.book}${esc(c.nom)}</a>`;
    }
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.nom + ", France")}`;
    return `<a class="vpah-pill" href="${maps}" target="_blank" rel="noopener" title="Ouvrir dans Maps">${esc(c.nom)}</a>`;
  }

  function render() {
    fillStats();

    const tabsRoot = $("#vpah-tabs");
    const tabs = ["toutes", ...regions()];
    tabsRoot.innerHTML = tabs.map(t =>
      `<button class="rank-tab ${t === current ? "is-active" : ""}" data-region="${esc(t)}">${t === "toutes" ? "Toutes les régions" : esc(t)}</button>`).join("");
    tabsRoot.querySelectorAll("[data-region]").forEach(b =>
      b.addEventListener("click", () => { current = b.dataset.region; render(); }));

    const listRoot = $("#vpah-list");
    const regs = current === "toutes" ? regions() : [current];
    listRoot.innerHTML = regs.map(r => {
      const meta = (ATLAS.regions || []).find(x => x.nom === r);
      const towns = all().filter(c => c.region === r).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      return `<section class="vpah-block">
        <div class="region-head"><span class="emoji">${meta?.emoji || "🏛️"}</span><h2>${esc(r)}</h2><span class="n">${towns.length} commune${towns.length > 1 ? "s" : ""}</span></div>
        <div class="vpah-wrap">${towns.map(pill).join("")}</div>
      </section>`;
    }).join("");

    listRoot.querySelectorAll("[data-village]").forEach(a =>
      a.addEventListener("click", (e) => { e.preventDefault(); ATLAS.views.villages.openFiche(a.dataset.village); }));
  }

  return { render };
})();
