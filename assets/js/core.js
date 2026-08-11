/* ============================================================================
 * Atlas des Trésors de France — assets/js/core.js
 * Espace de noms, utilitaires DOM, icônes SVG, générateur de « planches »
 * (illustrations procédurales tenant lieu de photos, 100 % hors-ligne).
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
ATLAS.views = {};

/* ---- Sélecteurs courts ---- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const el = (tag, attrs = {}, html = "") => {
  const n = document.createElement(tag);
  for (const k in attrs) {
    if (k === "class") n.className = attrs[k];
    else if (k === "dataset") Object.assign(n.dataset, attrs[k]);
    else if (k.startsWith("on") && typeof attrs[k] === "function") n.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  }
  if (html) n.innerHTML = html;
  return n;
};

ATLAS.utils = {
  $, $$, el,
  esc: (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c])),
  /* normalise pour la recherche : minuscules + suppression des accents/diacritiques */
  norm: (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
  slugLabel: (tag) => ({
    chateau:"Château", fortifie:"Village fortifié", vignoble:"Vignoble", montagne:"Montagne",
    riviere:"Rivière", mer:"Mer", meconnu:"Méconnu", touristique:"Très touristique",
    medieval:"Médiéval", marche:"Marché", noel:"Marché de Noël", panorama:"Panorama",
    gastronomie:"Gastronomie", photogenie:"Photogénie", paysages:"Paysages", authenticite:"Authenticité"
  }[tag] || tag),
  stars: (n) => "★".repeat(n) + `<span class="off">${"★".repeat(5 - n)}</span>`,
  /* coordonnées format carto : 44.7994° N, 1.6181° E */
  coords: (lat, lng) =>
    `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "O"}`,
};

/* ---- Bibliothèque d'icônes (SVG inline, trait courant) ---- */
ATLAS.icons = (() => {
  const s = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  return {
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="16,8 13,13 8,16 11,11"/></svg>`,
    search:  s(`<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>`),
    heart:   s(`<path d="M12 20s-7-4.5-9.2-9C1.4 8 3 4.5 6.3 4.5 8.3 4.5 9.7 6 12 8.3 14.3 6 15.7 4.5 17.7 4.5 21 4.5 22.6 8 21.2 11 19 15.5 12 20 12 20Z"/>`),
    sun:     s(`<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>`),
    moon:    s(`<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>`),
    map:     s(`<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>`),
    route:   s(`<circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="5" r="2.4"/><path d="M8.4 19h6.6a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.6"/>`),
    trophy:  s(`<path d="M8 4h8v4a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3M9 14h6M10 19h4M12 14v5"/>`),
    chart:   s(`<path d="M4 4v16h16"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="13" width="3" height="4"/>`),
    print:   s(`<path d="M7 9V3h10v6M7 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"/><rect x="7" y="15" width="10" height="6"/>`),
    pdf:     s(`<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>`),
    close:   s(`<path d="M6 6l12 12M18 6 6 18"/>`),
    menu:    s(`<path d="M4 7h16M4 12h16M4 17h16"/>`),
    pin:     s(`<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>`),
    book:    s(`<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z"/><path d="M5 18a2 2 0 0 1 2-2h11"/>`),
    fork:    s(`<path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11M16 3c-1.5 1-2 3-2 5s.5 3 2 3v10"/>`),
    eye:     s(`<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="2.5"/>`),
    clock:   s(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`),
    leaf:    s(`<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><path d="M5 19c3-3 6-5 10-6"/>`),
    flag:    s(`<path d="M5 21V4M5 4h11l-2 3 2 3H5"/>`),
    star:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.8 6.6 19.4l1.2-6L3.4 9.3l6-.7L12 3Z"/></svg>`,
    images:  s(`<rect x="8" y="3" width="13" height="13" rx="2"/><path d="M16 19v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h0"/><path d="m11 10 2.5 3 2-2.5L19 14"/>`),
    chevronLeft:  s(`<path d="m15 18-6-6 6-6"/>`),
    chevronRight: s(`<path d="m9 18 6-6-6-6"/>`),
    globe:   s(`<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z"/>`),
  };
})();

/* ----------------------------------------------------------------------------
 * Générateur de « planche » : illustration SVG procédurale par village.
 * Le motif dépend des tags (mer, montagne, vignoble, rivière, château…).
 * -------------------------------------------------------------------------- */
ATLAS.plate = (v, w = 400, h = 300) => {
  const t = new Set(v.tags || []);
  // palettes par dominante de paysage
  let sky = "#cfe0e6", land = "#7fae8c", land2 = "#5d8f72", accent = "#b5872e";
  if (t.has("mer"))       { sky = "#bcd6df"; land = "#5a93a6"; land2 = "#3e6b82"; }
  if (t.has("montagne"))  { sky = "#d6dbe0"; land = "#8a93a0"; land2 = "#5b6776"; }
  if (t.has("vignoble"))  { sky = "#e3dcc4"; land = "#9aa861"; land2 = "#6f7d3d"; }
  if (t.has("medieval") && !t.has("mer") && !t.has("montagne")) { land = "#a99366"; land2 = "#7d6a45"; }
  const sun = (Math.abs(Math.round(v.lat * 100)) % 2 === 0);
  // seed déterministe pour les collines
  const seed = [...v.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hill = (yBase, amp, color, o = 1) => {
    let d = `M0 ${yBase}`;
    for (let x = 0; x <= w; x += w / 6) {
      const y = yBase + Math.sin((x + seed) / 60) * amp;
      d += ` Q ${x + w / 12} ${y - amp} ${x + w / 6} ${y}`;
    }
    d += ` L${w} ${h} L0 ${h} Z`;
    return `<path d="${d}" fill="${color}" opacity="${o}"/>`;
  };
  let scene = "";
  // soleil / lune
  scene += sun
    ? `<circle cx="${w * .78}" cy="${h * .28}" r="26" fill="${accent}" opacity=".85"/>`
    : `<circle cx="${w * .78}" cy="${h * .28}" r="22" fill="#f0ead7" opacity=".8"/>`;
  // eau pour mer / rivière
  if (t.has("mer") || t.has("riviere")) {
    scene += `<rect x="0" y="${h * .62}" width="${w}" height="${h * .38}" fill="${land2}" opacity=".55"/>`;
    for (let i = 0; i < 4; i++)
      scene += `<path d="M${20 + i * 30} ${h * .7 + i * 12} q 30 -6 60 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".3"/>`;
  }
  scene += hill(h * .62, 18, land2, .9);
  scene += hill(h * .72, 14, land, 1);
  // pic / village perché
  if (t.has("montagne") || t.has("panorama")) {
    scene += `<path d="M${w * .3} ${h * .72} L${w * .42} ${h * .34} L${w * .54} ${h * .72} Z" fill="${land2}"/>`;
    scene += `<path d="M${w * .42} ${h * .34} L${w * .47} ${h * .44} L${w * .37} ${h * .44} Z" fill="#fff" opacity=".5"/>`;
  }
  // silhouette de bourg (toits + clocher)
  const bx = w * .12, by = h * .66;
  let town = `<rect x="${bx}" y="${by}" width="46" height="26" fill="#efe7d4"/><polygon points="${bx},${by} ${bx + 23},${by - 14} ${bx + 46},${by}" fill="${accent}"/>`;
  town += `<rect x="${bx + 52}" y="${by - 22}" width="14" height="48" fill="#efe7d4"/><polygon points="${bx + 52},${by - 22} ${bx + 59},${by - 34} ${bx + 66},${by - 22}" fill="${land2}"/>`;
  if (t.has("chateau") || t.has("fortifie")) {
    town += `<rect x="${bx + 74}" y="${by - 10}" width="34" height="36" fill="#e3dac4"/>`;
    town += `<rect x="${bx + 74}" y="${by - 16}" width="6" height="8" fill="#e3dac4"/><rect x="${bx + 88}" y="${by - 16}" width="6" height="8" fill="#e3dac4"/><rect x="${bx + 102}" y="${by - 16}" width="6" height="8" fill="#e3dac4"/>`;
  }
  if (t.has("vignoble")) {
    for (let i = 0; i < 6; i++)
      scene += `<line x1="${w * .5 + i * 22}" y1="${h * .78}" x2="${w * .5 + i * 22 - 10}" y2="${h * .98}" stroke="${land2}" stroke-width="2" opacity=".5"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration de ${ATLAS.utils.esc(v.nom)}">
    <rect width="${w}" height="${h}" fill="${sky}"/>
    ${scene}${town}
    <rect width="${w}" height="${h}" fill="none" stroke="rgba(22,48,46,.15)" stroke-width="6"/>
  </svg>`;
};

/* ----------------------------------------------------------------------------
 * PHOTOS RÉELLES — une OU plusieurs par village, avec repli sur la planche SVG.
 * Trois façons de fournir des images, par priorité :
 *   1. Manifeste, une photo   : ATLAS.photos[id] = "chemin" | {src, credit, link}
 *   2. Manifeste, plusieurs   : ATLAS.photos[id] = [ "a.jpg", {src:"b.jpg", credit}, ... ]
 *   3. Convention de nommage  : assets/images/<id>.jpg, puis <id>1.jpg, <id>2.jpg…
 *      (si tryConventionImages = true ; les fichiers en trop sont détectés à la
 *       demande, à l'ouverture de la fiche, via ATLAS.probePhotos).
 * -------------------------------------------------------------------------- */
ATLAS.config = Object.assign({ tryConventionImages: false, imageDir: "assets/images", imageExt: "jpg" }, ATLAS.config);

ATLAS._normPhoto = (x) => typeof x === "string" ? { src: x, credit: "", link: "" } : { src: x.src, credit: x.credit || "", link: x.link || "" };

/* Liste des photos connues SANS sondage (manifeste, ou 1 candidat en convention). */
ATLAS.photosFor = (v) => {
  const m = (ATLAS.photos && ATLAS.photos[v.id]) || null;
  if (Array.isArray(m)) return m.map(ATLAS._normPhoto).filter(p => p.src);
  if (m) return [ATLAS._normPhoto(m)];
  if (ATLAS.config.tryConventionImages) return [{ src: `${ATLAS.config.imageDir}/${v.id}.${ATLAS.config.imageExt}`, credit: "", link: "" }];
  return [];
};
ATLAS.photoFor = (v) => ATLAS.photosFor(v)[0] || null;
ATLAS.hasPhoto = (v) => ATLAS.photosFor(v).length > 0;
ATLAS.photoCount = (v) => ATLAS.photosFor(v).length;

/* Crédit formaté d'une photo (objet {src,credit,link}). */
ATLAS.creditHTML = (p) => {
  if (!p || !p.credit) return "";
  const txt = ATLAS.utils.esc(p.credit);
  return p.link ? `<a href="${ATLAS.utils.esc(p.link)}" target="_blank" rel="noopener">${txt}</a>` : txt;
};
ATLAS.photoCredit = (v) => ATLAS.creditHTML(ATLAS.photoFor(v)); // compat : crédit de la 1re photo

/* HTML du média de vignette : 1re photo (repli id.jpg -> id1.jpg -> planche), sinon planche. */
ATLAS.media = (v, w = 400, h = 300) => {
  const list = ATLAS.photosFor(v);
  if (!list.length) return ATLAS.plate(v, w, h);
  const conv = ATLAS.config.tryConventionImages && !(ATLAS.photos && ATLAS.photos[v.id]);
  const fb = conv ? `${ATLAS.config.imageDir}/${v.id}1.${ATLAS.config.imageExt}` : "";
  return `<img class="ph" src="${ATLAS.utils.esc(list[0].src)}" alt="${ATLAS.utils.esc(v.nom)}" loading="lazy" decoding="async" data-fb="${ATLAS.utils.esc(fb)}" onerror="ATLAS.imgError(this,'${v.id}')">`;
};

/* Repli : tenter <id>1.jpg une fois (convention), sinon remplacer par la planche. */
ATLAS.imgError = (img, id) => {
  const fb = img.getAttribute && img.getAttribute("data-fb");
  if (fb && !img.dataset.fbTried) { img.dataset.fbTried = "1"; img.src = fb; return; }
  const v = (ATLAS.villages || []).find(x => x.id === id);
  if (v && img && img.parentNode) img.outerHTML = ATLAS.plate(v);
};

/* Sonde à la demande la liste complète des photos d'un village (pour la fiche).
 * Manifeste -> liste de confiance. Convention -> ne garde que les fichiers qui chargent. */
ATLAS.probePhotos = (v, cb) => {
  if (ATLAS.photos && ATLAS.photos[v.id]) return cb(ATLAS.photosFor(v));
  if (!ATLAS.config.tryConventionImages) return cb([]);
  const dir = ATLAS.config.imageDir, ext = ATLAS.config.imageExt, CAP = 12;
  const cands = [`${dir}/${v.id}.${ext}`];
  for (let i = 1; i <= CAP; i++) cands.push(`${dir}/${v.id}${i}.${ext}`);
  const found = []; let idx = 0, miss = 0;
  const next = () => {
    if (idx >= cands.length || (found.length && miss >= 2)) return cb(found);
    const src = cands[idx++], im = new Image();
    im.onload = () => { found.push({ src, credit: "", link: "" }); miss = 0; next(); };
    im.onerror = () => { miss++; next(); };
    im.src = src;
  };
  next();
};

/* ----------------------------------------------------------------------------
 * LABEL OFFICIEL « Les Plus Beaux Villages de France »
 * Lien profond vers la fiche officielle (photos incluses, hébergées chez eux).
 * -------------------------------------------------------------------------- */
ATLAS.estLabellise = (v) => !!(ATLAS.officiel && ATLAS.officiel.membres.includes(v.id));
ATLAS.officielUrl = (v) => ATLAS.estLabellise(v) ? ATLAS.officiel.base + v.id + "/" : null;

/* « Village préféré des Français » : info complète (année + rang), et raccourcis. */
ATLAS.vpfInfo = (v) => (ATLAS.vpf && ATLAS.vpf[v.id]) || null;
ATLAS.vpfAnnee = (v) => { const i = ATLAS.vpfInfo(v); return i ? i.annee : null; };
ATLAS.vpfRang = (v) => { const i = ATLAS.vpfInfo(v); return i ? i.rang : null; };
ATLAS.estLaureatVpf = (v) => { const i = ATLAS.vpfInfo(v); return !!i && i.rang === 1; };

/* ----------------------------------------------------------------------------
 * PATRIMOINE MONDIAL DE L'UNESCO
 * Un village « porte » le label si son id figure dans le périmètre (champ
 * "villages") d'au moins un bien inscrit. unescoFor(v) rend la liste des biens.
 * -------------------------------------------------------------------------- */
ATLAS.unescoUrl = (site) => site ? ATLAS.unescoBase + site.unescoId : null;
ATLAS.unescoFor = (v) => (ATLAS.unesco || []).filter(s => (s.villages || []).includes(v.id));
ATLAS.estUnesco = (v) => ATLAS.unescoFor(v).length > 0;
ATLAS.unescoTypeLabel = (t) => ({ culturel: "Culturel", naturel: "Naturel", mixte: "Mixte" }[t] || t);

/* ----------------------------------------------------------------------------
 * LIGHTBOX — agrandissement plein écran, avec défilement si plusieurs photos.
 * open(photos, index, alt) : photos = [{src,credit,link}, ...]
 * -------------------------------------------------------------------------- */
ATLAS.lightbox = {
  _photos: [], _i: 0, _alt: "",
  open(photos, index, alt) {
    this._photos = (photos || []).filter(p => p && p.src);
    if (!this._photos.length) return;
    this._i = Math.min(Math.max(index || 0, 0), this._photos.length - 1);
    this._alt = alt || "";
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.add("is-open");
    lb.classList.toggle("has-nav", this._photos.length > 1);
    document.body.style.overflow = "hidden";
    this._render();
  },
  _render() {
    const p = this._photos[this._i];
    const img = document.getElementById("lightbox-img");
    img.src = p.src; img.alt = this._alt;
    const credit = ATLAS.creditHTML(p);
    const counter = this._photos.length > 1 ? `<span class="lb-count">${this._i + 1} / ${this._photos.length}</span>` : "";
    document.getElementById("lightbox-cap").innerHTML = counter + (credit ? (counter ? " · " : "") + credit : "");
  },
  next() { if (this._photos.length > 1) { this._i = (this._i + 1) % this._photos.length; this._render(); } },
  prev() { if (this._photos.length > 1) { this._i = (this._i - 1 + this._photos.length) % this._photos.length; this._render(); } },
  close() {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.remove("is-open");
    const modal = document.getElementById("modal");
    document.body.style.overflow = (modal && modal.classList.contains("is-open")) ? "hidden" : "";
    document.getElementById("lightbox-img").src = "";
    this._photos = [];
  },
  isOpen() {
    const lb = document.getElementById("lightbox");
    return !!(lb && lb.classList.contains("is-open"));
  }
};
