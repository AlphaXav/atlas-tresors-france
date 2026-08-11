/* ============================================================================
 * Atlas des Trésors de France — assets/js/store.js
 * État applicatif : favoris (localStorage), thème, filtres, tri.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};

ATLAS.store = (() => {
  const KEY_FAV = "atlas.favoris";
  const KEY_THEME = "atlas.theme";

  const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const state = {
    favoris: new Set(read(KEY_FAV, [])),
    theme: localStorage.getItem(KEY_THEME) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    query: "",
    sort: "note-desc",
    filters: {
      region: "", departement: "", etoilesMin: 0, noteMin: 0,
      medievalMin: 0, gastronomieMin: 0, paysagesMin: 0,
      pbvf: false, vpf: false, vpfpart: false, unesco: false,
      tags: new Set()  // chateau, fortifie, vignoble, montagne, riviere, mer, meconnu, touristique
    },
    listeners: new Set(),
  };

  const emit = () => state.listeners.forEach(fn => fn());
  const subscribe = (fn) => { state.listeners.add(fn); return () => state.listeners.delete(fn); };

  /* ---- Favoris ---- */
  const isFav = (id) => state.favoris.has(id);
  const toggleFav = (id) => {
    state.favoris.has(id) ? state.favoris.delete(id) : state.favoris.add(id);
    write(KEY_FAV, [...state.favoris]); emit();
  };

  /* ---- Thème ---- */
  const applyTheme = () => {
    document.documentElement.setAttribute("data-theme", state.theme);
    write(KEY_THEME, state.theme);
  };
  const toggleTheme = () => { state.theme = state.theme === "dark" ? "light" : "dark"; applyTheme(); emit(); };

  /* ---- Filtres / tri / recherche ---- */
  const setQuery = (q) => { state.query = ATLAS.utils.norm(q); emit(); };
  const setSort = (s) => { state.sort = s; emit(); };
  const setFilter = (k, v) => { state.filters[k] = v; emit(); };
  const toggleTag = (tag) => {
    const s = state.filters.tags;
    s.has(tag) ? s.delete(tag) : s.add(tag); emit();
  };
  const resetFilters = () => {
    state.filters = { region:"", departement:"", etoilesMin:0, noteMin:0, medievalMin:0, gastronomieMin:0, paysagesMin:0, pbvf:false, vpf:false, vpfpart:false, unesco:false, tags:new Set() };
    state.query = ""; emit();
  };

  /* ---- Sélection finale (recherche + filtres + tri) ---- */
  const villageById = (id) => ATLAS.villages.find(v => v.id === id);

  const matches = (v) => {
    const f = state.filters, q = state.query;
    if (q) {
      const hay = ATLAS.utils.norm(`${v.nom} ${v.region} ${v.departement} ${(v.specialites||[]).join(" ")} ${(v.tags||[]).map(ATLAS.utils.slugLabel).join(" ")}`);
      if (!hay.includes(q)) return false;
    }
    if (f.pbvf && !ATLAS.estLabellise(v)) return false;
    if (f.vpf && !ATLAS.estLaureatVpf(v)) return false;
    if (f.vpfpart && !ATLAS.vpfAnnee(v)) return false;
    if (f.unesco && !ATLAS.estUnesco(v)) return false;
    if (f.region && v.region !== f.region) return false;
    if (f.departement && v.departement !== f.departement) return false;
    if (v.etoiles < f.etoilesMin) return false;
    if (v.note100 < f.noteMin) return false;
    if (v.medieval < f.medievalMin) return false;
    if (v.gastronomie < f.gastronomieMin) return false;
    if (v.paysages < f.paysagesMin) return false;
    for (const tag of f.tags) if (!(v.tags || []).includes(tag)) return false;
    return true;
  };

  const sortFns = {
    "note-desc": (a, b) => b.note100 - a.note100,
    "note-asc":  (a, b) => a.note100 - b.note100,
    "nom-asc":   (a, b) => a.nom.localeCompare(b.nom, "fr"),
    "pop-desc":  (a, b) => b.population - a.population,
    "pop-asc":   (a, b) => a.population - b.population,
    "medieval-desc": (a, b) => b.medieval - a.medieval,
    "gastro-desc":   (a, b) => b.gastronomie - a.gastronomie,
  };

  const selection = () => ATLAS.villages.filter(matches).sort(sortFns[state.sort] || sortFns["note-desc"]);
  const favoris = () => ATLAS.villages.filter(v => state.favoris.has(v.id));

  return { state, subscribe, isFav, toggleFav, applyTheme, toggleTheme,
           setQuery, setSort, setFilter, toggleTag, resetFilters,
           villageById, selection, favoris };
})();
