/* Atlas des Trésors de France — data/roadtrips.js
 * Itinéraires prêts à l'emploi. "etapes" = ids de villages dans l'ordre optimal. */
window.ATLAS = window.ATLAS || {};
window.ATLAS.roadtrips = [
  {
    id: "alsace", nom: "Route des vins d'Alsace", region: "Grand Est",
    duree: "3 jours", km: 95, intro: "Le ruban viticole le plus pittoresque de France, de Colmar aux contreforts vosgiens.",
    etapes: [
      { village: "eguisheim", visite: "2 h", note: "Départ matinal, plan circulaire encore désert." },
      { village: "hunawihr", visite: "1 h 30", note: "Église fortifiée et cigognes." },
      { village: "riquewihr", visite: "Demi-journée", note: "Déjeuner et flânerie ; éviter midi en haute saison." },
      { village: "bergheim", visite: "1 h 30", note: "Tour complet des remparts." },
      { village: "kaysersberg", visite: "Demi-journée", note: "Pont fortifié et marché de Noël en décembre." }
    ],
    gastronomie: ["Riesling", "Gewurztraminer", "Tarte flambée", "Kougelhopf", "Munster", "Pain d'épices"],
    panoramas: ["Le Dolder de Riquewihr", "Les trois châteaux d'Eguisheim", "Le château de Kaysersberg"],
    hebergements: ["Maisons d'hôtes vigneronnes à Riquewihr", "Hôtels de charme à Colmar"]
  },
  {
    id: "dordogne", nom: "Vallée de la Dordogne", region: "Nouvelle-Aquitaine",
    duree: "3 à 4 jours", km: 85, intro: "Châteaux face à face, gabares, bastides et villages d'ocre au fil de la rivière.",
    etapes: [
      { village: "domme", visite: "Demi-journée", note: "Belvédère au lever du jour." },
      { village: "la-roque-gageac", visite: "Demi-journée", note: "Balade en gabare l'après-midi." },
      { village: "beynac-et-cazenac", visite: "Demi-journée", note: "Château et coucher de soleil sur la vallée." },
      { village: "monpazier", visite: "Demi-journée", note: "La bastide la mieux conservée de France." }
    ],
    gastronomie: ["Foie gras", "Noix du Périgord", "Cèpes", "Vin de Domme", "Truffe"],
    panoramas: ["Belvédère de la Barre à Domme", "Château de Beynac"],
    hebergements: ["Gîtes en pierre près de Sarlat", "Hôtels au bord de la Dordogne"]
  },
  {
    id: "lot", nom: "Vallée du Lot et Haut-Quercy", region: "Occitanie",
    duree: "3 jours", km: 130, intro: "Falaises, cité sacrée, cirques et villages perchés au-dessus du Lot et de la Dordogne quercynoise.",
    etapes: [
      { village: "rocamadour", visite: "Une journée", note: "Cité religieuse et canyon de l'Alzou." },
      { village: "autoire", visite: "2 h", note: "Cirque et cascade." },
      { village: "loubressac", visite: "1 h 30", note: "Panorama sur trois châteaux." },
      { village: "carennac", visite: "2 h", note: "Prieuré roman au bord de l'eau." },
      { village: "saint-cirq-lapopie", visite: "Demi-journée", note: "Chemin de halage le long du Lot." }
    ],
    gastronomie: ["Rocamadour (fromage)", "Vin de Cahors", "Agneau du Quercy", "Noix", "Safran"],
    panoramas: ["Rocamadour depuis L'Hospitalet", "Le cirque d'Autoire", "Le méandre du Lot à Saint-Cirq"],
    hebergements: ["Hôtels à Rocamadour", "Chambres d'hôtes à Cahors"]
  },
  {
    id: "aveyron", nom: "Aveyron roman, Lot et bastides", region: "Occitanie",
    duree: "4 jours", km: 220, intro: "Art roman, châteaux, clochers tors et cités templières du nord au sud du département.",
    etapes: [
      { village: "conques", visite: "Demi-journée", note: "Abbatiale et vitraux de Soulages." },
      { village: "estaing", visite: "2 h", note: "Château et pont gothique classé." },
      { village: "saint-come-d-olt", visite: "1 h 30", note: "Clocher torsadé unique." },
      { village: "belcastel", visite: "Demi-journée", note: "Château restauré miré dans l'Aveyron." },
      { village: "najac", visite: "Demi-journée", note: "Forteresse royale en éperon." },
      { village: "cordes-sur-ciel", visite: "Demi-journée", note: "Bastide gothique, magique au petit matin." },
      { village: "la-couvertoirade", visite: "Demi-journée", note: "Cité templière sur le Larzac." }
    ],
    gastronomie: ["Aligot", "Fouace", "Vin d'Estaing", "Roquefort", "Gaillac"],
    panoramas: ["Le Bancarel à Conques", "La forteresse de Najac", "Le Larzac à La Couvertoirade"],
    hebergements: ["Auberges à Conques", "Maisons d'hôtes à Cordes"]
  },
  {
    id: "luberon", nom: "Cœur du Luberon", region: "Provence-Alpes-Côte d'Azur",
    duree: "2 à 3 jours", km: 55, intro: "Villages perchés, ocres, lavande et art de vivre au pied du Luberon.",
    etapes: [
      { village: "gordes", visite: "Une journée", note: "Abbaye de Sénanque et village des Bories." },
      { village: "roussillon", visite: "Demi-journée", note: "Sentier des ocres en fin de journée." },
      { village: "menerbes", visite: "2 h", note: "Village-vaisseau et vues sur le Luberon." },
      { village: "lourmarin", visite: "Demi-journée", note: "Château Renaissance ; marché le vendredi." }
    ],
    gastronomie: ["Huile d'olive", "Miel de lavande", "Vin du Luberon", "Truffe"],
    panoramas: ["Gordes depuis la route de Cavaillon", "Les carrières d'ocre de Roussillon", "Le Luberon depuis Ménerbes"],
    hebergements: ["Mas provençaux", "Hôtels de charme à Gordes et Lourmarin"]
  },
  {
    id: "provence", nom: "Provence des villages perchés et du Verdon", region: "Provence-Alpes-Côte d'Azur",
    duree: "4 à 5 jours", km: 210, intro: "Des Alpilles au Verdon, l'essentiel des villages de pierre dorée et leurs panoramas.",
    etapes: [
      { village: "les-baux-de-provence", visite: "Une journée", note: "Château et Carrières de Lumières." },
      { village: "gordes", visite: "Une journée" },
      { village: "roussillon", visite: "Demi-journée" },
      { village: "seguret", visite: "2 h", note: "Dentelles de Montmirail et Côtes-du-Rhône." },
      { village: "moustiers-sainte-marie", visite: "Demi-journée", note: "Porte du Verdon et lac de Sainte-Croix." }
    ],
    gastronomie: ["Huile d'olive AOP", "Vin des Baux", "Tapenade", "Faïence de Moustiers", "Miel de lavande"],
    panoramas: ["Les Alpilles depuis Les Baux", "Gordes perché", "Moustiers entre deux falaises"],
    hebergements: ["Mas dans les Alpilles", "Hôtels à Saint-Rémy-de-Provence et Moustiers"]
  },
  {
    id: "bretagne", nom: "Bretagne, granit, cités fleuries et mer", region: "Bretagne",
    duree: "3 à 4 jours", km: 250, intro: "De Locronan à la Côte de Granit rose, cités de caractère et littoral spectaculaire.",
    etapes: [
      { village: "locronan", visite: "Demi-journée", note: "Place Renaissance et kouign-amann." },
      { village: "rochefort-en-terre", visite: "Demi-journée", note: "Façades fleuries ; illuminations à Noël." },
      { village: "ploumanach", visite: "Demi-journée", note: "Sentier des douaniers au coucher du soleil." }
    ],
    gastronomie: ["Kouign-amann", "Crêpes", "Cidre", "Fruits de mer"],
    panoramas: ["Les rochers roses de Ploumanac'h", "La place de Locronan"],
    hebergements: ["Hôtels à Perros-Guirec", "Chambres d'hôtes près de Quimper et Vannes"]
  },
  {
    id: "corse", nom: "Balagne et golfe de Porto", region: "Corse",
    duree: "4 jours", km: 150, intro: "Villages perchés et d'artisans de Balagne et calanques rouges classées à l'UNESCO.",
    etapes: [
      { village: "sant-antonino", visite: "2 h", note: "Au sommet, panorama à 360°." },
      { village: "pigna", visite: "2 h", note: "Ateliers d'art et polyphonies corses." },
      { village: "piana", visite: "Une journée", note: "Calanche au coucher du soleil." }
    ],
    gastronomie: ["Charcuterie corse", "Brocciu", "Miel de Corse", "Vin de Balagne"],
    panoramas: ["La Balagne depuis Sant'Antonino", "Les Calanche de Piana"],
    hebergements: ["Hôtels à Calvi", "Maisons d'hôtes à Porto"]
  },
  {
    id: "normandie", nom: "Pays d'Auge, abbayes et Côte d'Albâtre", region: "Normandie",
    duree: "3 jours", km: 200, intro: "Colombages, route du cidre, abbayes et falaises de craie.",
    etapes: [
      { village: "beuvron-en-auge", visite: "2 h", note: "Sur la route du cidre." },
      { village: "le-bec-hellouin", visite: "2 h", note: "Abbaye vivante et permaculture." },
      { village: "lyons-la-foret", visite: "2 h", note: "Halles anciennes au cœur de la hêtraie." },
      { village: "veules-les-roses", visite: "Demi-journée", note: "Le plus petit fleuve de France et ses huîtres." }
    ],
    gastronomie: ["Cidre", "Calvados", "Camembert", "Huîtres de Veules"],
    panoramas: ["La place de Beuvron", "La tour de l'abbaye du Bec", "Le fleuve de Veules"],
    hebergements: ["Manoirs du Pays d'Auge", "Hôtels sur la Côte d'Albâtre"]
  },
  {
    id: "bourgogne", nom: "Bourgogne romane et fortifiée", region: "Bourgogne-Franche-Comté",
    duree: "2 à 3 jours", km: 110, intro: "Collines, art roman et bourgs fortifiés du Morvan à l'Auxois.",
    etapes: [
      { village: "vezelay", visite: "Demi-journée", note: "Basilique et lumière du matin." },
      { village: "noyers", visite: "2 h", note: "Cité médiévale dans une boucle du Serein." },
      { village: "flavigny-sur-ozerain", visite: "2 h", note: "Anis et ruelles de « Chocolat »." }
    ],
    gastronomie: ["Vin de Vézelay", "Chablis", "Époisses", "Anis de Flavigny"],
    panoramas: ["La colline éternelle de Vézelay", "Le Serein à Noyers"],
    hebergements: ["Hôtels à Vézelay", "Chambres d'hôtes en Auxois"]
  },
  {
    id: "pays-basque", nom: "Villages du Pays basque intérieur", region: "Nouvelle-Aquitaine",
    duree: "2 jours", km: 60, intro: "Maisons labourdines, frontons et terroir au pied de la Rhune.",
    etapes: [
      { village: "ainhoa", visite: "2 h", note: "Bastide-rue typique." },
      { village: "la-bastide-clairence", visite: "2 h", note: "Place à arcades et ateliers d'art." }
    ],
    gastronomie: ["Piment d'Espelette", "Jambon de Bayonne", "Gâteau basque", "Ardi gasna"],
    panoramas: ["Les maisons rouges d'Ainhoa", "La place de La Bastide-Clairence"],
    hebergements: ["Maisons d'hôtes basques", "Hôtels à Saint-Jean-de-Luz"]
  },
  {
    id: "occitanie", nom: "Gorges, abbayes et cités cathares", region: "Occitanie",
    duree: "3 à 4 jours", km: 280, intro: "Des Gorges du Tarn à l'Hérault et au Minervois, abbayes romanes, canyons et mémoire cathare.",
    etapes: [
      { village: "sainte-enimie", visite: "Demi-journée", note: "Base canoë des Gorges du Tarn." },
      { village: "saint-guilhem-le-desert", visite: "Demi-journée", note: "Abbaye de Gellone et Pont du Diable." },
      { village: "minerve", visite: "Demi-journée", note: "Cité cathare entre deux gorges." }
    ],
    gastronomie: ["Aligot", "Vin du Languedoc", "Minervois", "Huile d'olive"],
    panoramas: ["Les Gorges du Tarn", "Le cirque de l'Infernet", "L'éperon de Minerve"],
    hebergements: ["Gîtes en Lozère", "Hôtels près de Saint-Guilhem et dans le Minervois"]
  },
  {
    id: "jura", nom: "Jura : reculées et vignoble", region: "Bourgogne-Franche-Comté",
    duree: "2 à 3 jours", km: 45, intro: "Cirques de falaises, abbaye, cascades et berceau du vin jaune.",
    etapes: [
      { village: "baume-les-messieurs", visite: "Demi-journée", note: "Abbaye, grottes et cascades des Tufs." },
      { village: "chateau-chalon", visite: "Demi-journée", note: "Vin jaune et panorama sur le vignoble." }
    ],
    gastronomie: ["Comté", "Vin jaune", "Macvin", "Morbier"],
    panoramas: ["La reculée de Baume-les-Messieurs", "Le vignoble depuis Château-Chalon"],
    hebergements: ["Chambres d'hôtes vigneronnes", "Hôtels à Lons-le-Saunier"]
  },
  {
    id: "alpes", nom: "Grande traversée des villages d'altitude", region: "Auvergne-Rhône-Alpes",
    duree: "4 à 5 jours", km: 200, intro: "De la Haute-Maurienne au Queyras, les plus hauts villages préservés des Alpes (itinéraire de cols, été uniquement).",
    etapes: [
      { village: "bonneval-sur-arc", visite: "Demi-journée", note: "Pierre et lauze au pied du col de l'Iseran." },
      { village: "la-grave", visite: "Demi-journée", note: "Face-à-face avec la Meije." },
      { village: "saint-veran", visite: "Demi-journée", note: "L'un des plus hauts villages d'Europe (Queyras)." }
    ],
    gastronomie: ["Beaufort", "Bleu du Queyras", "Génépi", "Tourtons"],
    panoramas: ["La Haute-Maurienne à Bonneval", "La Meije depuis La Grave", "Le Queyras à Saint-Véran"],
    hebergements: ["Refuges et gîtes d'altitude", "Hôtels à Val-d'Isère et Guillestre"]
  }
];
