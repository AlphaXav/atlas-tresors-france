/* ============================================================================
 * Atlas des Trésors de France — assets/js/app.js
 * Amorçage : routage SPA, navigation, panneau de filtres, thème, recherche, PWA.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
ATLAS.app = (() => {
  const { $, $$, el, esc } = ATLAS.utils;
  const store = ATLAS.store;
  const I = ATLAS.icons;

  const VIEWS = ["villages", "map", "roadtrips", "unesco", "vpah", "rankings", "stats", "favoris", "legal"];
  let current = "villages";

  /* ---- Routage ---- */
  function go(view, arg) {
    if (!VIEWS.includes(view)) view = "villages";
    current = view;
    $$(".view").forEach(v => v.classList.toggle("is-active", v.id === `view-${view}`));
    $$(".nav__link").forEach(a => a.classList.toggle("is-active", a.dataset.view === view));
    $("#nav").classList.remove("is-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
    location.hash = view;

    if (view === "map") ATLAS.views.map.mount();
    if (view === "roadtrips") ATLAS.views.roadtrips.render(arg);
    if (view === "unesco") ATLAS.views.unesco.render();
    if (view === "vpah") ATLAS.views.vpah.render();
    if (view === "rankings") ATLAS.views.rankings.render();
    if (view === "stats") ATLAS.views.stats.render();
    if (view === "favoris") ATLAS.views.favoris.render();
  }

  /* ---- En-tête / navigation ---- */
  function buildHeader() {
    const nav = [
      ["villages", "Villages", I.book], ["map", "Carte", I.map], ["roadtrips", "Road trips", I.route],
      ["unesco", "Patrimoine mondial", I.globe],
      ["vpah", "Villes d'art et d'histoire", I.landmark],
      ["rankings", "Classements", I.trophy], ["stats", "Statistiques", I.chart]
    ];
    $("#nav").innerHTML = nav.map(([v, l]) => `<a class="nav__link" data-view="${v}" href="#${v}">${esc(l)}</a>`).join("");
    $$("#nav .nav__link").forEach(a => a.addEventListener("click", e => { e.preventDefault(); go(a.dataset.view); }));

    $("#nav-toggle").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
    $("#theme-toggle").addEventListener("click", () => store.toggleTheme());
    $("#fav-btn").addEventListener("click", () => go("favoris"));
    const footerLegal = $("#footer-legal");
    if (footerLegal) footerLegal.addEventListener("click", e => { e.preventDefault(); go("legal"); });
    $("#search-input").addEventListener("input", e => { store.setQuery(e.target.value); if (current !== "villages") go("villages"); });
  }

  function syncTheme() {
    const dark = store.state.theme === "dark";
    $("#theme-toggle").innerHTML = dark ? I.sun : I.moon;
    $("#theme-toggle").setAttribute("aria-label", dark ? "Passer en mode clair" : "Passer en mode sombre");
  }
  function syncFavCount() {
    const n = store.state.favoris.size;
    const badge = $("#fav-count");
    badge.textContent = n; badge.classList.toggle("hidden", n === 0);
  }

  /* ---- Panneau de filtres ---- */
  function buildFilters() {
    const f = store.state.filters;
    const regions = [...new Set(ATLAS.villages.map(v => v.region))].sort((a, b) => a.localeCompare(b, "fr"));
    const tagFilters = ["chateau","fortifie","vignoble","montagne","riviere","mer","meconnu","touristique"];

    $("#filters-body").innerHTML = `
      <div class="filter-group">
        <div class="label">Distinctions</div>
        <label class="check"><input type="checkbox" data-flag="pbvf"> ✦ Plus Beaux Villages de France</label>
        <label class="check"><input type="checkbox" data-flag="vpf"> 🏆 Lauréat Village préféré</label>
        <label class="check"><input type="checkbox" data-flag="vpfpart"> ★ A concouru au Village préféré</label>
        <label class="check"><input type="checkbox" data-flag="unesco"> 🌍 Patrimoine mondial UNESCO</label>
        <label class="check"><input type="checkbox" data-flag="vpah"> 🏛️ Ville d'art et d'histoire</label>
      </div>
      <div class="filter-group">
        <div class="label">Région</div>
        <select class="select" id="f-region">
          <option value="">Toutes les régions</option>
          ${regions.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("")}
        </select>
      </div>
      <div class="filter-group">
        <div class="label">Département</div>
        <select class="select" id="f-dept"><option value="">Tous les départements</option></select>
      </div>
      <div class="filter-group">
        <div class="label">Note minimale</div>
        <div class="range-row"><input type="range" id="f-note" min="0" max="100" step="1" value="0"><output id="f-note-o">0</output></div>
      </div>
      <div class="filter-group">
        <div class="label">Étoiles minimales</div>
        <div class="range-row"><input type="range" id="f-stars" min="0" max="5" step="1" value="0"><output id="f-stars-o">0</output></div>
      </div>
      <div class="filter-group">
        <div class="label">Patrimoine médiéval ≥</div>
        <div class="range-row"><input type="range" id="f-med" min="0" max="10" step="1" value="0"><output id="f-med-o">0</output></div>
      </div>
      <div class="filter-group">
        <div class="label">Gastronomie ≥</div>
        <div class="range-row"><input type="range" id="f-gas" min="0" max="10" step="1" value="0"><output id="f-gas-o">0</output></div>
      </div>
      <div class="filter-group">
        <div class="label">Paysages ≥</div>
        <div class="range-row"><input type="range" id="f-pay" min="0" max="10" step="1" value="0"><output id="f-pay-o">0</output></div>
      </div>
      <div class="filter-group">
        <div class="label">Caractéristiques</div>
        ${tagFilters.map(t => `<label class="check"><input type="checkbox" data-tag="${t}"> ${esc(ATLAS.utils.slugLabel(t))}</label>`).join("")}
      </div>`;

    // dépendance département → région
    const deptSel = $("#f-dept");
    function refreshDepts() {
      const reg = $("#f-region").value;
      const depts = [...new Map(ATLAS.villages.filter(v => !reg || v.region === reg)
        .map(v => [v.code, v.departement])).entries()].sort((a, b) => a[0].localeCompare(b[0], "fr", { numeric: true }));
      deptSel.innerHTML = `<option value="">Tous les départements</option>` +
        depts.map(([c, d]) => `<option value="${esc(d)}">${esc(d)} (${c})</option>`).join("");
    }
    refreshDepts();

    $("#f-region").addEventListener("change", e => { store.setFilter("region", e.target.value); store.setFilter("departement", ""); refreshDepts(); });
    deptSel.addEventListener("change", e => store.setFilter("departement", e.target.value));
    const slider = (id, key, out) => $(id).addEventListener("input", e => { $(out).value = e.target.value; store.setFilter(key, +e.target.value); });
    slider("#f-note", "noteMin", "#f-note-o");
    slider("#f-stars", "etoilesMin", "#f-stars-o");
    slider("#f-med", "medievalMin", "#f-med-o");
    slider("#f-gas", "gastronomieMin", "#f-gas-o");
    slider("#f-pay", "paysagesMin", "#f-pay-o");
    $$('#filters-body [data-tag]').forEach(c => c.addEventListener("change", () => store.toggleTag(c.dataset.tag)));
    $$('#filters-body [data-flag]').forEach(c => c.addEventListener("change", () => store.setFilter(c.dataset.flag, c.checked)));

    // tri
    $("#sort-select").addEventListener("change", e => store.setSort(e.target.value));
    // réinitialisation
    $("#filters-reset").addEventListener("click", () => { store.resetFilters(); resetFilterUI(); });
    // repli mobile
    $("#filters-title").addEventListener("click", () => $("#filters").classList.toggle("is-open"));
  }

  function resetFilterUI() {
    $("#search-input").value = "";
    $("#f-region").value = ""; $("#f-dept").value = "";
    ["#f-note","#f-stars","#f-med","#f-gas","#f-pay"].forEach(id => { const e = $(id); if (e){ e.value = 0; const o = $(id + "-o"); if (o) o.value = 0; } });
    $$('#filters-body [data-tag]').forEach(c => c.checked = false);
    $$('#filters-body [data-flag]').forEach(c => c.checked = false);
  }

  /* ---- Statistiques d'en-tête (héros) ---- */
  function fillHero() {
    const V = ATLAS.villages;
    const moy = Math.round(V.reduce((a, v) => a + v.note100, 0) / V.length);
    const regions = new Set(V.map(v => v.region)).size;
    $("#hero-stats").innerHTML = `
      <div class="hero__stat"><b>${V.length}</b><span>villages d'exception</span></div>
      <div class="hero__stat"><b>${regions}</b><span>régions de France</span></div>
      <div class="hero__stat"><b>${(ATLAS.roadtrips||[]).length}</b><span>road trips prêts</span></div>
      <div class="hero__stat"><b>${moy}<small style="font-size:1rem">/100</small></b><span>note moyenne</span></div>`;
  }

  /* ---- Rendu réactif ---- */
  function onChange() {
    syncTheme(); syncFavCount();
    if (current === "villages") ATLAS.views.villages.render();
    if (current === "favoris") ATLAS.views.favoris.render();
  }

  /* ---- PWA ---- */
  function registerPWA() {
    if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  /* ---- Init ---- */
  function init() {
    store.applyTheme();
    buildHeader();
    buildFilters();
    fillHero();
    ATLAS.views.villages.mount(document);
    store.subscribe(onChange);
    onChange();

    // fermeture modale (clic backdrop + Échap)
    $("#modal .modal__backdrop").addEventListener("click", () => ATLAS.views.villages.closeFiche());
    $("#lightbox .lightbox__backdrop").addEventListener("click", () => ATLAS.lightbox.close());
    $("#lightbox-close").addEventListener("click", () => ATLAS.lightbox.close());
    $("#lightbox-prev").addEventListener("click", () => ATLAS.lightbox.prev());
    $("#lightbox-next").addEventListener("click", () => ATLAS.lightbox.next());
    document.addEventListener("keydown", e => {
      if (ATLAS.lightbox.isOpen()) {
        if (e.key === "Escape") ATLAS.lightbox.close();
        else if (e.key === "ArrowRight") ATLAS.lightbox.next();
        else if (e.key === "ArrowLeft") ATLAS.lightbox.prev();
        return;
      }
      if (e.key === "Escape") ATLAS.views.villages.closeFiche();
    });

    // route initiale
    const hash = location.hash.replace("#", "");
    go(VIEWS.includes(hash) ? hash : "villages");
    window.addEventListener("hashchange", () => { const h = location.hash.replace("#", ""); if (VIEWS.includes(h) && h !== current) go(h); });

    registerPWA();
  }

  return { init, go };
})();

document.addEventListener("DOMContentLoaded", ATLAS.app.init);
