/* ============================================================================
 * Atlas des Trésors de France — assets/js/views/villages.js
 * Vue « Villages » : cartes, regroupement région → département, fiche détaillée.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
ATLAS.views.villages = (() => {
  const { $, el, esc, stars, coords, slugLabel } = ATLAS.utils;
  const I = ATLAS.icons;
  const store = ATLAS.store;

  let mounted = false, container, countEl;

  /* ---- Carte (planche) d'un village ---- */
  function card(v, index) {
    const fav = store.isFav(v.id);
    const vpf = ATLAS.estLaureatVpf(v) ? ATLAS.vpfAnnee(v) : null;
    const node = el("article", { class: "card", dataset: { id: v.id } });
    node.innerHTML = `
      <div class="card__media">
        <span class="card__num">${index}</span>
        <div class="card__plate">${ATLAS.media(v)}</div>
        <button class="card__fav ${fav ? "is-fav" : ""}" aria-label="${fav ? "Retirer des favoris" : "Ajouter aux favoris"}" data-fav="${v.id}">${I.heart}</button>
        ${vpf ? `<span class="card__vpf" title="Village préféré des Français ${vpf}">${I.trophy}<b>${vpf}</b></span>` : ""}
        ${ATLAS.estUnesco(v) ? `<span class="card__unesco" title="Patrimoine mondial de l'UNESCO">${I.globe}</span>` : ""}
        ${ATLAS.estVpah(v) ? `<span class="card__vpah" title="Ville d'art et d'histoire">${I.landmark}</span>` : ""}
        ${ATLAS.photoCount(v) > 1 ? `<span class="card__multi" title="${ATLAS.photoCount(v)} photos">${I.images || ""}<b>${ATLAS.photoCount(v)}</b></span>` : ""}
      </div>
      <div class="card__body">
        <div class="card__title">
          <h3>${esc(v.nom)}</h3>
          <div class="seal" title="Note ${v.note100}/100"><b>${v.note100}</b><span>/ 100</span></div>
        </div>
        <div class="card__meta"><span class="stars">${stars(v.etoiles)}</span> · ${esc(v.departement)} (${v.code})</div>
        <div class="chips">${(v.tags || []).slice(0, 3).map(tagChip).join("")}</div>
        <div class="card__coords">${I.pin}${coords(v.lat, v.lng)}</div>
      </div>`;
    node.addEventListener("click", (e) => {
      if (e.target.closest("[data-fav]")) return;
      openFiche(v.id);
    });
    node.querySelector("[data-fav]").addEventListener("click", () => store.toggleFav(v.id));
    return node;
  }

  function tagChip(tag) {
    const cls = tag === "vignoble" || tag === "montagne" ? "chip--forest"
      : (tag === "mer" || tag === "riviere") ? "chip--water"
      : (tag === "chateau" || tag === "fortifie") ? "chip--gold" : "";
    return `<span class="chip ${cls}">${esc(slugLabel(tag))}</span>`;
  }

  /* ---- Rendu : regroupement région (alpha) → département (croissant) ---- */
  function render() {
    if (!mounted) return;
    const list = store.selection();
    countEl.innerHTML = `<span>${list.length}</span> village${list.length > 1 ? "s" : ""}`;

    if (!list.length) {
      container.innerHTML = "";
      container.appendChild(el("div", { class: "empty" },
        `${I.search}<h3>Aucun village ne correspond</h3><p>Élargissez la recherche ou réinitialisez les filtres.</p>`));
      return;
    }

    // groupement
    const byRegion = {};
    for (const v of list) (byRegion[v.region] ??= []).push(v);
    const regions = Object.keys(byRegion).sort((a, b) => a.localeCompare(b, "fr"));

    container.innerHTML = "";
    let counter = 0;
    for (const region of regions) {
      const meta = (ATLAS.regions || []).find(r => r.nom === region);
      const block = el("section", { class: "region-block" });
      block.appendChild(el("div", { class: "region-head" },
        `<span class="emoji">${meta?.emoji || "📍"}</span><h2>${esc(region)}</h2><span class="n">${byRegion[region].length} village${byRegion[region].length>1?"s":""}</span>`));
      if (meta?.description) block.appendChild(el("p", { class: "region-desc" }, esc(meta.description)));

      // par département (code croissant)
      const byDept = {};
      for (const v of byRegion[region]) (byDept[`${v.code}|${v.departement}`] ??= []).push(v);
      const depts = Object.keys(byDept).sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));

      for (const dk of depts) {
        const [code, dept] = dk.split("|");
        block.appendChild(el("div", { class: "dept-label" }, `${esc(dept)} — ${code}`));
        const grid = el("div", { class: "grid" });
        byDept[dk].forEach(v => grid.appendChild(card(v, ++counter)));
        block.appendChild(grid);
      }
      container.appendChild(block);
    }
  }

  /* ---- Fiche détaillée (modale) ---- */
  function ratingRow(label, val) {
    return `<div class="rating"><span>${label}</span><div class="bar"><i style="width:${val * 10}%"></i></div><b>${val}</b></div>`;
  }

  function openFiche(id) {
    const v = store.villageById(id);
    if (!v) return;
    const modal = $("#modal");
    const panel = $("#modal .modal__panel");

    const proches = (v.proches || []).map(store.villageById).filter(Boolean);
    const rts = (v.roadtrips || []).map(id => (ATLAS.roadtrips || []).find(r => r.id === id)).filter(Boolean);
    const fav = store.isFav(v.id);

    const gmaps = `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
    const officielUrl = ATLAS.officielUrl(v);
    const vpf = ATLAS.vpfInfo(v);
    const unescoSites = ATLAS.unescoFor(v);
    const vpah = ATLAS.vpahForVillage(v);

    panel.innerHTML = `
      <div class="fiche">
        <div class="fiche__hero">
          <button class="fiche__close" id="fiche-close" aria-label="Fermer la fiche">${I.close}</button>
          <div class="card__plate">${ATLAS.media(v, 640, 360)}</div>${ATLAS.hasPhoto(v) ? `<div class="ph-credit">${ATLAS.photoCredit(v)}</div>` : ""}
          <div class="fiche__heading">
            <div class="eyebrow">${esc(v.region)}</div>
            <h2>${esc(v.nom)}</h2>
            <div class="stars">${stars(v.etoiles)} <span class="muted" style="font-family:var(--font-body);font-size:.8rem">${esc(v.departement)} (${v.code})</span></div>
          </div>
        </div>
        <div class="fiche__body">
          <div class="fiche__topline">
            <div class="seal" style="--s:64px"><b>${v.note100}</b><span>/ 100</span></div>
            <div class="chips">${officielUrl ? `<span class="chip chip--label" title="Membre officiel de l'association">✦ Plus Beaux Villages de France</span>` : ""}${vpf ? (vpf.rang === 1 ? `<span class="chip chip--vpf" title="Émission de Stéphane Bern">🏆 Village préféré des Français ${vpf.annee}</span>` : `<span class="chip chip--vpfpart" title="A concouru au Village préféré des Français ${vpf.annee}">★ Finaliste Village préféré ${vpf.annee}${vpf.rang ? ` · ${vpf.rang}ᵉ` : ""}</span>`) : ""}${unescoSites.length ? `<span class="chip chip--unesco" title="Patrimoine mondial de l'UNESCO">🌍 Patrimoine mondial UNESCO</span>` : ""}${vpah ? `<span class="chip chip--vpah" title="Label national du ministère de la Culture">🏛️ Ville d'art et d'histoire</span>` : ""}${(v.tags || []).map(tagChip).join("")}</div>
          </div>

          <div class="kv">
            <div><span>Population</span><b>${v.population.toLocaleString("fr-FR")} hab.</b></div>
            <div><span>Durée idéale</span><b>${esc(v.duree)}</b></div>
            <div><span>Meilleure saison</span><b>${esc(v.saison)}</b></div>
            <div><span>Coordonnées</span><b style="font-size:.85rem">${coords(v.lat, v.lng)}</b></div>
          </div>

          <h4>${I.book} Histoire</h4>
          <p>${esc(v.histoire)}</p>

          <h4>${I.eye} Pourquoi visiter</h4>
          <p>${esc(v.pourquoi)}</p>

          ${unescoSites.length ? `<h4>${I.globe} Patrimoine mondial de l'UNESCO</h4>
          <div class="fiche-unesco">${unescoSites.map(s => `
            <a class="fiche-unesco__item" href="${ATLAS.unescoUrl(s)}" target="_blank" rel="noopener">
              <span class="u-type u-type--${s.type}">${ATLAS.unescoTypeLabel(s.type)}</span>
              <b>${esc(s.nom)}</b>
              <span class="fiche-unesco__meta">Inscrit en ${s.annee} · ${esc(s.resume)}</span>
            </a>`).join("")}</div>` : ""}

          ${vpah ? `<h4>${I.landmark} Ville d'art et d'histoire</h4>
          <p>Commune labellisée <b>« Ville d'art et d'histoire »</b> par le ministère de la Culture, au titre de la richesse et de la valorisation de son patrimoine (région ${esc(vpah.region)}).</p>` : ""}

          <h4>${I.star} Notation détaillée</h4>
          <div class="ratings">
            ${ratingRow("Patrimoine médiéval", v.medieval)}
            ${ratingRow("Paysages", v.paysages)}
            ${ratingRow("Photogénie", v.photogenie)}
            ${ratingRow("Gastronomie", v.gastronomie)}
            ${ratingRow("Authenticité", v.authenticite)}
          </div>

          <h4>${I.flag} Principaux monuments</h4>
          <ul class="li-list">${(v.monuments || []).map(m => `<li>${esc(m)}</li>`).join("")}</ul>

          <h4>${I.compass} Panorama incontournable</h4>
          <p>${esc(v.panorama)}</p>

          <h4>${I.fork} Spécialités culinaires</h4>
          <div class="tag-list">${(v.specialites || []).map(s => `<span class="chip chip--gold">${esc(s)}</span>`).join("")}</div>

          ${proches.length ? `<h4>${I.pin} Villages à proximité</h4>
            <div class="nearby">${proches.map(p => `<a data-goto="${p.id}">${esc(p.nom)}</a>`).join("")}</div>` : ""}

          ${rts.length ? `<h4>${I.route} Road trips associés</h4>
            <div class="linkrow">${rts.map(r => `<a data-rt="${r.id}">${esc(r.nom)} · ${r.duree}</a>`).join("")}</div>` : ""}

          <div class="fiche__actions">
            <button class="btn" data-fav="${v.id}" id="fiche-fav">${I.heart} ${fav ? "Dans vos favoris" : "Ajouter aux favoris"}</button>
            ${officielUrl ? `<a class="btn btn--ghost" href="${officielUrl}" target="_blank" rel="noopener">${I.book} Fiche officielle &amp; photos</a>` : ""}
            <a class="btn btn--ghost" href="${gmaps}" target="_blank" rel="noopener">${I.map} Ouvrir dans Maps</a>
            <button class="btn btn--ghost" id="fiche-print">${I.print} Imprimer la fiche</button>
          </div>
        </div>
      </div>`;

    // interactions internes
    panel.querySelector("#fiche-close").addEventListener("click", closeFiche);
    panel.querySelector("#fiche-fav").addEventListener("click", () => { store.toggleFav(v.id); openFiche(v.id); });
    panel.querySelector("#fiche-print").addEventListener("click", () => window.print());
    panel.querySelectorAll("[data-goto]").forEach(a => a.addEventListener("click", () => openFiche(a.dataset.goto)));
    panel.querySelectorAll("[data-rt]").forEach(a => a.addEventListener("click", () => { closeFiche(); ATLAS.app.go("roadtrips", a.dataset.rt); }));

    // agrandissement de la photo (uniquement s'il y a une vraie photo)
    // photos : carrousel dans la fiche + agrandissement (défilement si plusieurs)
    setupFicheCarousel(panel, v);

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    panel.scrollTop = 0;
  }

  function closeFiche() {
    $("#modal").classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* Carrousel de la fiche : sonde les photos, gère flèches/pastilles/compteur et le lightbox. */
  function setupFicheCarousel(panel, v) {
    const hero = panel.querySelector(".fiche__hero");
    if (!hero) return;
    const plate = hero.querySelector(".card__plate");
    const creditEl = hero.querySelector(".ph-credit");

    ATLAS.probePhotos(v, (photos) => {
      if (!photos.length) return; // aucune vraie photo : la planche SVG reste affichée
      let i = 0;
      plate.innerHTML = `<img class="ph" alt="${esc(v.nom)}">`;
      const img = plate.querySelector("img.ph");
      img.style.cursor = "zoom-in";
      img.onerror = () => { img.outerHTML = ATLAS.plate(v); };
      img.addEventListener("click", () => ATLAS.lightbox.open(photos, i, v.nom));

      let counterEl = null, dotsEl = null;
      if (photos.length > 1) {
        hero.insertAdjacentHTML("beforeend",
          `<button class="fiche-nav fiche-prev" aria-label="Photo précédente">‹</button>
           <button class="fiche-nav fiche-next" aria-label="Photo suivante">›</button>
           <span class="fiche-counter"></span>
           <div class="fiche-dots">${photos.map((_, k) => `<span class="fiche-dot" data-k="${k}"></span>`).join("")}</div>`);
        counterEl = hero.querySelector(".fiche-counter");
        dotsEl = hero.querySelector(".fiche-dots");
        hero.querySelector(".fiche-prev").addEventListener("click", (e) => { e.stopPropagation(); i = (i - 1 + photos.length) % photos.length; show(); });
        hero.querySelector(".fiche-next").addEventListener("click", (e) => { e.stopPropagation(); i = (i + 1) % photos.length; show(); });
        dotsEl.querySelectorAll(".fiche-dot").forEach(d => d.addEventListener("click", (e) => { e.stopPropagation(); i = +d.dataset.k; show(); }));
      }

      function show() {
        img.src = photos[i].src;
        if (creditEl) creditEl.innerHTML = ATLAS.creditHTML(photos[i]) || "";
        if (counterEl) counterEl.textContent = `${i + 1} / ${photos.length}`;
        if (dotsEl) dotsEl.querySelectorAll(".fiche-dot").forEach((d, k) => d.classList.toggle("is-on", k === i));
      }
      show();
    });
  }

  function mount(root) {
    container = $("#villages-list", root);
    countEl = $("#villages-count", root);
    mounted = true;
    render();
  }

  return { mount, render, openFiche, closeFiche };
})();
