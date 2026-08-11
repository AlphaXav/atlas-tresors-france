/* ============================================================================
 * Atlas des Trésors de France — data/vpf.js
 * ----------------------------------------------------------------------------
 * « Le Village préféré des Français » (émission de Stéphane Bern, 2012→2026).
 * Référentiel COMPLET : tous les villages en compétition, chaque année, avec
 * leur rang au classement final (rang 1 = vainqueur).
 * Clé = identifiant du village (slug). annee = édition. rang = place au classement.
 * Sources : classements publiés par l'association Les Plus Beaux Villages de
 * France (rétrospective VPF) et fiches d'édition (TheTVDB). Distinct du label PBVF.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
window.ATLAS.vpf = {
  /* 2012 — 22 villages */
  "saint-cirq-lapopie": { annee: 2012, rang: 1 }, "saint-guilhem-le-desert": { annee: 2012, rang: 2 },
  "barfleur": { annee: 2012, rang: 3 }, "salers": { annee: 2012, rang: 4 }, "yvoire": { annee: 2012, rang: 5 },
  "riquewihr": { annee: 2012, rang: 6 }, "beynac-et-cazenac": { annee: 2012, rang: 7 },
  "les-baux-de-provence": { annee: 2012, rang: 8 }, "collonges-la-rouge": { annee: 2012, rang: 9 },
  "maroilles": { annee: 2012, rang: 10 }, "angles-sur-l-anglin": { annee: 2012, rang: 11 },
  "piana": { annee: 2012, rang: 12 }, "saint-suliac": { annee: 2012, rang: 13 }, "montsoreau": { annee: 2012, rang: 14 },
  "baume-les-messieurs": { annee: 2012, rang: 15 }, "rodemack": { annee: 2012, rang: 16 },
  "gerberoy": { annee: 2012, rang: 17 }, "le-bec-hellouin": { annee: 2012, rang: 18 }, "essoyes": { annee: 2012, rang: 19 },
  "apremont-sur-allier": { annee: 2012, rang: 20 }, "vezelay": { annee: 2012, rang: 21 }, "la-roche-guyon": { annee: 2012, rang: 22 },

  /* 2013 — 22 villages */
  "eguisheim": { annee: 2013, rang: 1 }, "locronan": { annee: 2013, rang: 2 }, "sainte-suzanne": { annee: 2013, rang: 3 },
  "perouges": { annee: 2013, rang: 4 }, "conques": { annee: 2013, rang: 5 }, "veules-les-roses": { annee: 2013, rang: 6 },
  "talmont-sur-gironde": { annee: 2013, rang: 7 }, "flavigny-sur-ozerain": { annee: 2013, rang: 8 },
  "turenne": { annee: 2013, rang: 9 }, "moustiers-sainte-marie": { annee: 2013, rang: 10 }, "blesle": { annee: 2013, rang: 11 },
  "parfondeval": { annee: 2013, rang: 12 }, "wissant": { annee: 2013, rang: 13 }, "espelette": { annee: 2013, rang: 14 },
  "pesmes": { annee: 2013, rang: 15 }, "villefranche-de-conflent": { annee: 2013, rang: 16 }, "corbara": { annee: 2013, rang: 17 },
  "lavardin": { annee: 2013, rang: 18 }, "saint-amand-sur-fion": { annee: 2013, rang: 19 }, "la-perriere": { annee: 2013, rang: 20 },
  "saint-quirin": { annee: 2013, rang: 21 }, "maincy": { annee: 2013, rang: 22 },

  /* 2014 — 22 villages */
  "cordes-sur-ciel": { annee: 2014, rang: 1 }, "andlau": { annee: 2014, rang: 2 }, "chambon-sur-voueize": { annee: 2014, rang: 3 },
  "sauzon": { annee: 2014, rang: 4 }, "antraigues-sur-volane": { annee: 2014, rang: 5 }, "etretat": { annee: 2014, rang: 6 },
  "noyers": { annee: 2014, rang: 7 }, "vouvant": { annee: 2014, rang: 8 }, "gourdon": { annee: 2014, rang: 9 },
  "beuvron-en-auge": { annee: 2014, rang: 10 }, "chateau-chalon": { annee: 2014, rang: 11 }, "charroux": { annee: 2014, rang: 12 },
  "sebourg": { annee: 2014, rang: 13 }, "septmonts": { annee: 2014, rang: 14 }, "saint-benoit-du-sault": { annee: 2014, rang: 15 },
  "labastide-d-armagnac": { annee: 2014, rang: 16 }, "chateauvillain": { annee: 2014, rang: 17 }, "sainte-enimie": { annee: 2014, rang: 18 },
  "arcais": { annee: 2014, rang: 19 }, "grez-sur-loing": { annee: 2014, rang: 20 }, "pigna": { annee: 2014, rang: 21 }, "marville": { annee: 2014, rang: 22 },

  /* 2015 — 22 villages */
  "ploumanach": { annee: 2015, rang: 1 }, "montresor": { annee: 2015, rang: 2 }, "saint-antonin-noble-val": { annee: 2015, rang: 3 },
  "barbizon": { annee: 2015, rang: 4 }, "terdeghem": { annee: 2015, rang: 5 }, "bonneval-sur-arc": { annee: 2015, rang: 6 },
  "castelnou": { annee: 2015, rang: 7 }, "ferrette": { annee: 2015, rang: 8 }, "ault": { annee: 2015, rang: 9 },
  "moutier-d-ahun": { annee: 2015, rang: 10 }, "saint-emilion": { annee: 2015, rang: 11 }, "ars-en-re": { annee: 2015, rang: 12 },
  "tourtour": { annee: 2015, rang: 13 }, "solutre-pouilly": { annee: 2015, rang: 14 }, "saint-ceneri-le-gerei": { annee: 2015, rang: 15 },
  "trentemoult": { annee: 2015, rang: 16 }, "saint-nectaire": { annee: 2015, rang: 17 }, "fenetrange": { annee: 2015, rang: 18 },
  "lyons-la-foret": { annee: 2015, rang: 19 }, "lods": { annee: 2015, rang: 20 }, "mussy-sur-seine": { annee: 2015, rang: 21 }, "centuri": { annee: 2015, rang: 22 },

  /* 2016 — 13 villages */
  "rochefort-en-terre": { annee: 2016, rang: 1 }, "montreuil-sur-mer": { annee: 2016, rang: 2 }, "rocamadour": { annee: 2016, rang: 3 },
  "arbois": { annee: 2016, rang: 4 }, "vogue": { annee: 2016, rang: 5 }, "nonza": { annee: 2016, rang: 6 }, "gordes": { annee: 2016, rang: 7 },
  "varengeville-sur-mer": { annee: 2016, rang: 8 }, "behuard": { annee: 2016, rang: 9 }, "sare": { annee: 2016, rang: 10 },
  "plombieres-les-bains": { annee: 2016, rang: 11 }, "candes-saint-martin": { annee: 2016, rang: 12 }, "courances": { annee: 2016, rang: 13 },

  /* 2017 — 13 villages */
  "kaysersberg": { annee: 2017, rang: 1 }, "saint-valery-sur-somme": { annee: 2017, rang: 2 }, "la-roque-gageac": { annee: 2017, rang: 3 },
  "moncontour": { annee: 2017, rang: 4 }, "piriac-sur-mer": { annee: 2017, rang: 5 }, "belleme": { annee: 2017, rang: 6 },
  "lourmarin": { annee: 2017, rang: 7 }, "sant-antonino": { annee: 2017, rang: 8 }, "lagrasse": { annee: 2017, rang: 9 },
  "beze": { annee: 2017, rang: 10 }, "la-garde-adhemar": { annee: 2017, rang: 11 }, "gargilesse-dampierre": { annee: 2017, rang: 12 }, "montchauvet": { annee: 2017, rang: 13 },

  /* 2018 — 14 villages (outre-mer inclus) */
  "cassel": { annee: 2018, rang: 1 }, "mittelbergheim": { annee: 2018, rang: 2 }, "roussillon": { annee: 2018, rang: 3 },
  "hell-bourg": { annee: 2018, rang: 4 }, "le-mont-saint-michel": { annee: 2018, rang: 5 }, "ile-de-sein": { annee: 2018, rang: 6 },
  "monpazier": { annee: 2018, rang: 7 }, "janvry": { annee: 2018, rang: 8 }, "la-couvertoirade": { annee: 2018, rang: 9 },
  "lama": { annee: 2018, rang: 10 }, "asnieres-sur-vegre": { annee: 2018, rang: 11 }, "yevre-le-chatel": { annee: 2018, rang: 12 },
  "mirmande": { annee: 2018, rang: 13 }, "semur-en-brionnais": { annee: 2018, rang: 14 },

  /* 2019 — 14 villages */
  "saint-vaast-la-hougue": { annee: 2019, rang: 1 }, "pont-croix": { annee: 2019, rang: 2 }, "terre-de-haut": { annee: 2019, rang: 3 },
  "lauzerte": { annee: 2019, rang: 4 }, "mouthier-haute-pierre": { annee: 2019, rang: 5 }, "cotignac": { annee: 2019, rang: 6 },
  "souvigny": { annee: 2019, rang: 7 }, "les-riceys": { annee: 2019, rang: 8 }, "bourron-marlotte": { annee: 2019, rang: 9 },
  "fraze": { annee: 2019, rang: 10 }, "la-ferte-milon": { annee: 2019, rang: 11 }, "mornac-sur-seudre": { annee: 2019, rang: 12 },
  "erbalunga": { annee: 2019, rang: 13 }, "le-thoureil": { annee: 2019, rang: 14 },

  /* 2020 — 14 villages */
  "hunspach": { annee: 2020, rang: 1 }, "les-anses-d-arlet": { annee: 2020, rang: 2 }, "menerbes": { annee: 2020, rang: 3 },
  "pont-aven": { annee: 2020, rang: 4 }, "pierrefonds": { annee: 2020, rang: 5 }, "batz-sur-mer": { annee: 2020, rang: 6 },
  "troo": { annee: 2020, rang: 7 }, "montpeyroux": { annee: 2020, rang: 8 }, "montfort-l-amaury": { annee: 2020, rang: 9 },
  "chablis": { annee: 2020, rang: 10 }, "aubeterre-sur-dronne": { annee: 2020, rang: 11 }, "saint-bertrand-de-comminges": { annee: 2020, rang: 12 },
  "giverny": { annee: 2020, rang: 13 }, "cargese": { annee: 2020, rang: 14 },

  /* 2021 — 14 villages */
  "sancerre": { annee: 2021, rang: 1 }, "fresnay-sur-sarthe": { annee: 2021, rang: 2 }, "herisson": { annee: 2021, rang: 3 },
  "auvillar": { annee: 2021, rang: 4 }, "la-desirade": { annee: 2021, rang: 5 }, "domme": { annee: 2021, rang: 6 },
  "rocroi": { annee: 2021, rang: 7 }, "long": { annee: 2021, rang: 8 }, "villerville": { annee: 2021, rang: 9 },
  "saint-veran": { annee: 2021, rang: 10 }, "ile-d-houat": { annee: 2021, rang: 11 }, "chateauneuf": { annee: 2021, rang: 12 },
  "saint-florent": { annee: 2021, rang: 13 }, "samois-sur-seine": { annee: 2021, rang: 14 },

  /* 2022 — 14 villages */
  "bergheim": { annee: 2022, rang: 1 }, "hesdin": { annee: 2022, rang: 2 }, "quintin": { annee: 2022, rang: 3 },
  "le-malzieu-ville": { annee: 2022, rang: 4 }, "dieulefit": { annee: 2022, rang: 5 }, "la-bouille": { annee: 2022, rang: 6 },
  "saint-sulpice-de-favieres": { annee: 2022, rang: 7 }, "la-grave": { annee: 2022, rang: 8 }, "saint-sauveur-en-puisaye": { annee: 2022, rang: 9 },
  "levroux": { annee: 2022, rang: 10 }, "saul": { annee: 2022, rang: 11 }, "ainhoa": { annee: 2022, rang: 12 },
  "pino": { annee: 2022, rang: 13 }, "port-joinville": { annee: 2022, rang: 14 },

  /* 2023 — 14 villages */
  "esquelbecq": { annee: 2023, rang: 1 }, "lavoute-chilhac": { annee: 2023, rang: 2 }, "lassay-les-chateaux": { annee: 2023, rang: 3 },
  "druyes-les-belles-fontaines": { annee: 2023, rang: 4 }, "hattonchatel": { annee: 2023, rang: 5 }, "pontrieux": { annee: 2023, rang: 6 },
  "belcastel": { annee: 2023, rang: 7 }, "beaumont-en-auge": { annee: 2023, rang: 8 }, "beaulieu-les-loches": { annee: 2023, rang: 9 },
  "belves": { annee: 2023, rang: 10 }, "l-entre-deux": { annee: 2023, rang: 11 }, "flagy": { annee: 2023, rang: 12 },
  "saintes-maries-de-la-mer": { annee: 2023, rang: 13 }, "lumio": { annee: 2023, rang: 14 },

  /* 2024 — 14 villages */
  "collioure": { annee: 2024, rang: 1 }, "mers-les-bains": { annee: 2024, rang: 2 }, "villereal": { annee: 2024, rang: 3 },
  "deshaies": { annee: 2024, rang: 4 }, "montherme": { annee: 2024, rang: 5 }, "sallertaine": { annee: 2024, rang: 6 },
  "ry": { annee: 2024, rang: 7 }, "gassin": { annee: 2024, rang: 8 }, "l-ile-tudy": { annee: 2024, rang: 9 },
  "cleron": { annee: 2024, rang: 10 }, "grignan": { annee: 2024, rang: 11 }, "thomery": { annee: 2024, rang: 12 }, "saint-dye-sur-loire": { annee: 2024, rang: 13 },

  /* 2025 — 14 villages */
  "saint-antoine-l-abbaye": { annee: 2025, rang: 1 }, "malestroit": { annee: 2025, rang: 2 }, "semur-en-auxois": { annee: 2025, rang: 3 },
  "beaulieu-sur-dordogne": { annee: 2025, rang: 4 }, "clecy": { annee: 2025, rang: 5 }, "sierck-les-bains": { annee: 2025, rang: 6 },
  "grand-riviere": { annee: 2025, rang: 7 }, "ferrieres-en-gatinais": { annee: 2025, rang: 8 }, "longpont": { annee: 2025, rang: 9 },
  "lupiac": { annee: 2025, rang: 10 }, "fontevraud-l-abbaye": { annee: 2025, rang: 11 }, "calcatoggio": { annee: 2025, rang: 12 }, "saorge": { annee: 2025, rang: 13 },

  /* 2026 — 14 villages */
  "bormes-les-mimosas": { annee: 2026, rang: 1 }, "dambach-la-ville": { annee: 2026, rang: 2 }, "locquirec": { annee: 2026, rang: 3 },
  "saulges": { annee: 2026, rang: 4 }, "marcoles": { annee: 2026, rang: 5 }, "nolay": { annee: 2026, rang: 6 },
  "blangy-le-chateau": { annee: 2026, rang: 7 }, "saint-martin-de-londres": { annee: 2026, rang: 8 }, "chaumont-en-vexin": { annee: 2026, rang: 9 },
  "la-ferte-vidame": { annee: 2026, rang: 10 }, "la-flotte": { annee: 2026, rang: 11 }, "vescovato": { annee: 2026, rang: 12 },
  "cacao": { annee: 2026, rang: 13 }, "dampierre-en-yvelines": { annee: 2026, rang: 14 }
};
