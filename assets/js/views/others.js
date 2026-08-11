/* ============================================================================
 * Atlas des Trésors de France — assets/js/views/others.js
 * Vues : Carte (Leaflet), Road trips, Classements, Statistiques + Galerie, Favoris.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
(function () {  /* IIFE : évite toute collision de `const` au niveau global entre scripts classiques */
const { $, $$, el, esc, stars, coords, slugLabel } = ATLAS.utils;

/* ----------------------------------------------------------------------------
 * CARTE (Leaflet via CDN — nécessite une connexion pour les tuiles)
 * -------------------------------------------------------------------------- */
ATLAS.views.map = (() => {
  let map = null, markersLayer = null, routesLayer = null, done = false;

  function build() {
    if (typeof L === "undefined") {
      $("#map").innerHTML = `<div class="empty" style="padding:3rem">${ATLAS.icons.map}<h3>Carte indisponible hors connexion</h3><p>Leaflet et les tuiles se chargent depuis Internet. Reconnectez-vous pour afficher la carte interactive.</p></div>`;
      return;
    }
    map = L.map("map", { scrollWheelZoom: true }).setView([46.6, 2.4], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap France | © les contributeurs OpenStreetMap", maxZoom: 20, subdomains: "abc"
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
    routesLayer = L.layerGroup().addTo(map);
    drawMarkers();
  }

  function pin(color) {
    return L.divIcon({
      className: "", iconSize: [26, 26], iconAnchor: [13, 26],
      html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="${color}" stroke="#fff" stroke-width="1.5"><path d="M12 22s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6" fill="#fff"/></svg>`
    });
  }

  function unescoPin() {
    return L.divIcon({
      className: "", iconSize: [24, 24], iconAnchor: [12, 24],
      html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#2B5B84" stroke="#fff" stroke-width="1.4"><path d="M12 22s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="4" fill="none" stroke="#fff" stroke-width="1.2"/><path d="M8 10h8M12 6.2c1.6 1.2 2.2 2.7 2.2 3.8S13.6 12.8 12 14c-1.6-1.2-2.2-2.7-2.2-3.8S10.4 7.4 12 6.2Z" fill="none" stroke="#fff" stroke-width="1.1"/></svg>`
    });
  }

  function drawMarkers() {
    markersLayer.clearLayers();
    ATLAS.villages.forEach(v => {
      const color = v.note100 >= 92 ? "#8E2B27" : v.note100 >= 86 ? "#B5872E" : "#2F5D4B";
      const m = L.marker([v.lat, v.lng], { icon: pin(color) }).addTo(markersLayer);
      m.bindPopup(`<div class="map-pop"><b>${esc(v.nom)}</b><br><span class="stars">${stars(v.etoiles)}</span> · ${v.note100}/100<br>${esc(v.departement)}<br><a data-pop="${v.id}">Voir la fiche →</a></div>`);
      m.on("popupopen", () => {
        const a = document.querySelector(`[data-pop="${v.id}"]`);
        if (a) a.addEventListener("click", () => ATLAS.views.villages.openFiche(v.id));
      });
    });
    // Biens UNESCO (repère bleu distinct)
    (ATLAS.unesco || []).forEach(s => {
      const m = L.marker([s.lat, s.lng], { icon: unescoPin() }).addTo(markersLayer);
      const villes = (s.villages || []).map(ATLAS.store.villageById).filter(Boolean);
      const lien = villes.length ? `<a data-upop="${villes[0].id}">Voir « ${esc(villes[0].nom)} » →</a>` : `<a href="${ATLAS.unescoUrl(s)}" target="_blank" rel="noopener">Fiche UNESCO ↗</a>`;
      m.bindPopup(`<div class="map-pop"><span class="map-pop__tag">🌍 UNESCO · ${esc(ATLAS.unescoTypeLabel(s.type))} · ${s.annee}</span><b>${esc(s.nom)}</b><br>${esc(s.region)}<br>${lien}</div>`);
      m.on("popupopen", () => {
        if (!villes.length) return;
        const a = document.querySelector(`[data-upop="${villes[0].id}"]`);
        if (a) a.addEventListener("click", () => ATLAS.views.villages.openFiche(villes[0].id));
      });
    });
  }

  function showRoute(rtId) {
    if (!map || !routesLayer) return;
    routesLayer.clearLayers();
    const rt = (ATLAS.roadtrips || []).find(r => r.id === rtId);
    if (!rt) return;
    const pts = rt.etapes.map(e => ATLAS.store.villageById(e.village)).filter(Boolean).map(v => [v.lat, v.lng]);
    if (pts.length < 1) return;
    L.polyline(pts, { color: "#8E2B27", weight: 3, dashArray: "6 8", opacity: .85 }).addTo(routesLayer);
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.4));
  }

  function mount() {
    if (!done) { build(); done = true; }
    else if (map) setTimeout(() => map.invalidateSize(), 50);
  }
  return { mount, showRoute };
})();

/* ----------------------------------------------------------------------------
 * ROAD TRIPS
 * -------------------------------------------------------------------------- */
ATLAS.views.roadtrips = (() => {
  const I = ATLAS.icons;

  function buildSlide(rt) {
    const stepsHtml = rt.etapes.map(e => {
      const v = ATLAS.store.villageById(e.village);
      if (!v) return "";
      return `<li><span class="stepname" data-village="${v.id}">${esc(v.nom)}</span>
        <div class="stepmeta">${esc(v.departement)} · ${esc(e.visite || v.duree)}${e.note ? " — " + esc(e.note) : ""}</div></li>`;
    }).join("");
    const slide = el("article", { class: "rt-slide", id: `rt-${rt.id}` });
    slide.innerHTML = `
      <div class="rt-slide__head">
        <span class="rt-region">${esc(rt.region)}</span>
        <h3>${esc(rt.nom)}</h3>
        <p class="rt-intro">${esc(rt.intro)}</p>
        <div class="rt-stats">
          <div><b>${esc(rt.duree)}</b><span>Durée</span></div>
          <div><b>${rt.km ? rt.km + " km" : "—"}</b><span>Distance</span></div>
          <div><b>${rt.etapes.length || "—"}</b><span>Étapes</span></div>
        </div>
      </div>
      <div class="rt-slide__body">
        ${stepsHtml ? `<ol class="rt-steps">${stepsHtml}</ol>` : `<p class="muted"><em>Itinéraire à enrichir (trame fournie).</em></p>`}
        ${(rt.gastronomie?.length || rt.panoramas?.length || rt.hebergements?.length) ? `<div class="rt-foot">
          ${rt.gastronomie?.length ? `<div><span class="lbl">${I.fork} Gastronomie</span> ${rt.gastronomie.map(esc).join(" · ")}</div>` : ""}
          ${rt.panoramas?.length ? `<div><span class="lbl">${I.compass} Points de vue</span> ${rt.panoramas.map(esc).join(" · ")}</div>` : ""}
          ${rt.hebergements?.length ? `<div><span class="lbl">${I.pin} Hébergements</span> ${rt.hebergements.map(esc).join(" · ")}</div>` : ""}
        </div>` : ""}
        <div class="rt-actions">
          <button class="btn btn--ghost" data-map="${rt.id}">${I.map} Voir le tracé sur la carte</button>
        </div>
      </div>`;
    slide.querySelectorAll("[data-village]").forEach(s => s.addEventListener("click", () => ATLAS.views.villages.openFiche(s.dataset.village)));
    slide.querySelector("[data-map]").addEventListener("click", () => { ATLAS.app.go("map"); ATLAS.views.map.showRoute(rt.id); });
    return slide;
  }

  function render(focusId) {
    const root = $("#view-roadtrips .rt-grid");
    const rts = ATLAS.roadtrips || [];
    root.innerHTML = `
      <div class="rt-carousel">
        <div class="rt-bar">
          <button class="rt-arrow rt-arrow--prev" aria-label="Road trip précédent">${I.chevronLeft || "‹"}</button>
          <span class="rt-counter"></span>
          <button class="rt-arrow rt-arrow--next" aria-label="Road trip suivant">${I.chevronRight || "›"}</button>
        </div>
        <div class="rt-viewport"><div class="rt-track"></div></div>
        <div class="rt-dots"></div>
      </div>`;
    const carousel = root.querySelector(".rt-carousel");
    const track = root.querySelector(".rt-track");
    const dotsWrap = root.querySelector(".rt-dots");
    const counter = root.querySelector(".rt-counter");
    const prev = root.querySelector(".rt-arrow--prev");
    const next = root.querySelector(".rt-arrow--next");

    rts.forEach(rt => track.appendChild(buildSlide(rt)));
    dotsWrap.innerHTML = rts.map((_, k) => `<button class="rt-dot" data-k="${k}" aria-label="Road trip ${k + 1}"></button>`).join("");

    let i = 0;
    if (focusId) { const idx = rts.findIndex(r => r.id === focusId); if (idx >= 0) i = idx; }

    function update() {
      track.style.transform = `translateX(-${i * 100}%)`;
      dotsWrap.querySelectorAll(".rt-dot").forEach((d, k) => d.classList.toggle("is-on", k === i));
      counter.textContent = `${i + 1} / ${rts.length}`;
      prev.disabled = i === 0;
      next.disabled = i === rts.length - 1;
    }
    function goTo(n) { i = Math.max(0, Math.min(rts.length - 1, n)); track.style.transition = ""; update(); }

    prev.addEventListener("click", () => goTo(i - 1));
    next.addEventListener("click", () => goTo(i + 1));
    dotsWrap.querySelectorAll(".rt-dot").forEach(d => d.addEventListener("click", () => goTo(+d.dataset.k)));

    // Swipe tactile (n'interfère pas avec le défilement vertical)
    const vp = root.querySelector(".rt-viewport");
    let sx = null, sy = null, dx = 0, horiz = false;
    vp.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; horiz = false; track.style.transition = "none"; }, { passive: true });
    vp.addEventListener("touchmove", e => {
      if (sx == null) return;
      const mx = e.touches[0].clientX - sx, my = e.touches[0].clientY - sy;
      if (!horiz) { if (Math.abs(mx) > Math.abs(my) + 6) horiz = true; else if (Math.abs(my) > Math.abs(mx)) { sx = null; track.style.transition = ""; return; } }
      if (horiz) { dx = mx; track.style.transform = `translateX(calc(-${i * 100}% + ${dx}px))`; }
    }, { passive: true });
    vp.addEventListener("touchend", () => {
      if (sx == null) { return; }
      track.style.transition = "";
      const th = 55;
      if (dx <= -th) i = Math.min(rts.length - 1, i + 1);
      else if (dx >= th) i = Math.max(0, i - 1);
      sx = null; dx = 0; horiz = false; update();
    });

    // position initiale sans animation
    track.style.transition = "none";
    update();
    requestAnimationFrame(() => { track.style.transition = ""; });
    if (focusId) { const t = document.getElementById(`rt-${focusId}`); if (t) carousel.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  }
  return { render };
})();

/* ----------------------------------------------------------------------------
 * CLASSEMENTS THÉMATIQUES
 * -------------------------------------------------------------------------- */
ATLAS.views.rankings = (() => {
  const tops = {
    medieval:    { label: "Plus beaux villages médiévaux", key: v => v.medieval, suffix:"/10" },
    fortifie:    { label: "Plus beaux villages fortifiés", tag: "fortifie", key: v => v.note100, suffix:"/100" },
    panorama:    { label: "Plus beaux panoramas", tag: "panorama", key: v => v.paysages, suffix:"/10" },
    vignoble:    { label: "Plus beaux villages viticoles", tag: "vignoble", key: v => v.note100, suffix:"/100" },
    marche:      { label: "Meilleurs marchés", tag: "marche", key: v => v.note100, suffix:"/100" },
    gastro:      { label: "Meilleurs villages gastronomiques", key: v => v.gastronomie, suffix:"/10" },
    montagne:    { label: "Meilleurs villages de montagne", tag: "montagne", key: v => v.note100, suffix:"/100" },
    noel:        { label: "Meilleurs villages de Noël", tag: "noel", key: v => v.note100, suffix:"/100" },
    photo:       { label: "Villages les plus photogéniques", key: v => v.photogenie, suffix:"/10" },
    meconnu:     { label: "Villages les plus méconnus", tag: "meconnu", key: v => v.note100, suffix:"/100" },
  };
  let current = "medieval";

  function list(def) {
    let arr = ATLAS.villages.slice();
    if (def.tag) arr = arr.filter(v => (v.tags || []).includes(def.tag));
    return arr.sort((a, b) => def.key(b) - def.key(a)).slice(0, 12);
  }

  function render() {
    const tabsRoot = $("#rank-tabs"), listRoot = $("#rank-list");
    tabsRoot.innerHTML = Object.entries(tops).map(([k, d]) =>
      `<button class="rank-tab ${k === current ? "is-active" : ""}" data-rank="${k}">${esc(d.label)}</button>`).join("");
    tabsRoot.querySelectorAll("[data-rank]").forEach(b => b.addEventListener("click", () => { current = b.dataset.rank; render(); }));

    const def = tops[current];
    const arr = list(def);
    listRoot.innerHTML = arr.length ? arr.map((v, i) =>
      `<div class="rank-item" data-village="${v.id}">
        <div class="pos">${i + 1}</div>
        <div class="who"><b>${esc(v.nom)}</b><span>${esc(v.region)} · ${esc(v.departement)}</span></div>
        <div class="score"><b>${def.key(v)}</b><span class="muted" style="font-size:.7rem">${def.suffix}</span></div>
      </div>`).join("")
      : `<div class="empty">${ATLAS.icons.trophy}<h3>Aucun village référencé</h3><p>Ajoutez le tag « ${esc(def.tag || current)} » à des villages pour alimenter ce classement.</p></div>`;
    listRoot.querySelectorAll("[data-village]").forEach(it => it.addEventListener("click", () => ATLAS.views.villages.openFiche(it.dataset.village)));
  }
  return { render };
})();

/* ----------------------------------------------------------------------------
 * STATISTIQUES + GALERIE
 * -------------------------------------------------------------------------- */
ATLAS.views.stats = (() => {
  function render() {
    const V = ATLAS.villages;
    const n = V.length;
    const moy = Math.round(V.reduce((a, v) => a + v.note100, 0) / n);
    const cinq = V.filter(v => v.etoiles === 5).length;
    const regions = new Set(V.map(v => v.region)).size;
    const depts = new Set(V.map(v => v.code)).size;
    const chateaux = V.filter(v => (v.tags || []).includes("chateau")).length;
    const popMoy = Math.round(V.reduce((a, v) => a + v.population, 0) / n);

    $("#stat-cards").innerHTML = [
      [n, "villages référencés"], [moy, "note moyenne / 100"], [cinq, "villages 5 étoiles"],
      [regions, "régions couvertes"], [depts, "départements"], [chateaux, "villages à château"],
      [popMoy.toLocaleString("fr-FR"), "population moyenne"], [(ATLAS.roadtrips||[]).length, "road trips"],
      [(ATLAS.unesco||[]).length, "sites UNESCO"]
    ].map(([b, s]) => `<div class="stat-card"><b>${b}</b><span>${esc(s)}</span></div>`).join("");

    // répartition par région
    const byRegion = {};
    V.forEach(v => byRegion[v.region] = (byRegion[v.region] || 0) + 1);
    const max = Math.max(...Object.values(byRegion));
    const rows = Object.entries(byRegion).sort((a, b) => b[1] - a[1]);
    $("#stat-bars").innerHTML = rows.map(([r, c]) =>
      `<div class="row"><span>${esc(r)}</span><div class="track"><i style="width:${c / max * 100}%"></i></div><b>${c}</b></div>`).join("");

    // galerie
    $("#gallery").innerHTML = V.slice().sort((a, b) => b.photogenie - a.photogenie).map(v =>
      `<figure data-village="${v.id}"><div class="card__plate">${ATLAS.media(v, 300, 300)}</div><figcaption>${esc(v.nom)}</figcaption></figure>`).join("");
    $$("#gallery figure").forEach(f => f.addEventListener("click", () => ATLAS.views.villages.openFiche(f.dataset.village)));
  }
  return { render };
})();

/* ----------------------------------------------------------------------------
 * FAVORIS
 * -------------------------------------------------------------------------- */
ATLAS.views.favoris = (() => {
  function render() {
    const root = $("#favoris-list");
    const favs = ATLAS.store.favoris();
    if (!favs.length) {
      root.innerHTML = `<div class="empty">${ATLAS.icons.heart}<h3>Aucun favori pour l'instant</h3><p>Touchez le cœur sur une fiche ou une carte pour bâtir votre sélection. Elle est enregistrée sur cet appareil.</p></div>`;
      return;
    }
    root.innerHTML = `<div class="grid" id="favoris-grid"></div>`;
    const grid = $("#favoris-grid");
    favs.forEach((v, i) => {
      const c = el("article", { class: "card", dataset: { id: v.id } });
      c.innerHTML = `
        <div class="card__media"><span class="card__num">${i + 1}</span>
          <div class="card__plate">${ATLAS.media(v)}</div>
          <button class="card__fav is-fav" data-fav="${v.id}" aria-label="Retirer des favoris">${ATLAS.icons.heart}</button>${ATLAS.estLaureatVpf(v) ? `<span class="card__vpf" title="Village préféré des Français ${ATLAS.vpfAnnee(v)}">${ATLAS.icons.trophy}<b>${ATLAS.vpfAnnee(v)}</b></span>` : ""}${ATLAS.photoCount(v) > 1 ? `<span class="card__multi" title="${ATLAS.photoCount(v)} photos">${ATLAS.icons.images}<b>${ATLAS.photoCount(v)}</b></span>` : ""}</div>
        <div class="card__body">
          <div class="card__title"><h3>${esc(v.nom)}</h3><div class="seal"><b>${v.note100}</b><span>/ 100</span></div></div>
          <div class="card__meta"><span class="stars">${stars(v.etoiles)}</span> · ${esc(v.departement)}</div>
          <div class="card__coords">${ATLAS.icons.pin}${coords(v.lat, v.lng)}</div>
        </div>`;
      c.addEventListener("click", e => { if (!e.target.closest("[data-fav]")) ATLAS.views.villages.openFiche(v.id); });
      c.querySelector("[data-fav]").addEventListener("click", () => ATLAS.store.toggleFav(v.id));
      grid.appendChild(c);
    });
  }
  return { render };
})();

})(); /* fin IIFE others.js */
