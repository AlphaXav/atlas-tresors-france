/* ============================================================================
 * Atlas des Trésors de France — data/officiel.js
 * ----------------------------------------------------------------------------
 * Référentiel officiel « Les Plus Beaux Villages de France » (association).
 * Sert à : (1) proposer un lien profond vers la fiche officielle (et ses photos,
 * qui restent chez eux — aucune image n'est copiée), (2) signaler le label.
 *
 * Les "id" de nos villages correspondent aux slugs d'URL du site officiel :
 *   base + <id> + "/"  ->  ex. .../fr/nos-villages/gordes/
 * Un village est labellisé PBVF si son id figure dans "membres".
 * Liste relevée sur le site officiel (≈184 villages, DOM-TOM inclus).
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};
window.ATLAS.officiel = {
  base: "https://www.les-plus-beaux-villages-de-france.org/fr/nos-villages/",
  membres: [
    "aigueze","ainhoa","angles-sur-l-anglin","ansouis","apremont-sur-allier","arlempdes",
    "ars-en-re","aubeterre-sur-dronne","autoire","auvillar","balazuc","barfleur","bargeme",
    "baume-les-messieurs","beaulieu-sur-dordogne","belcastel","belves","bergheim","beuvron-en-auge",
    "beynac-et-cazenac","blangy-le-chateau","blesle","bonneval-sur-arc","bormes-les-mimosas","brouage",
    "brousse-le-chateau","bruniquel","camon","candes-saint-martin","capdenac-le-haut","cardaillac",
    "carennac","castelnau-de-montmiral","castelnaud-la-chapelle","castelnou","chambon-sur-voueize",
    "charroux","chateau-chalon","chateauneuf","chatillon-en-diois","coaraze","collonges-la-rouge",
    "colmars","conques","cordes-sur-ciel","cotignac","crissay-sur-manse","curemonte","domme",
    "eguisheim","entrevaux","estaing","eus","evol","flavigny-sur-ozerain","fontevraud-l-abbaye",
    "fources","gargilesse-dampierre","gassin","gerberoy","gordes","gourdon","grignan","hell-bourg",
    "hierges","hunawihr","hunspach","la-bastide-clairence","la-couvertoirade","la-flotte",
    "la-garde-adhemar","la-garde-guerin","lagrasse","la-roche-guyon","la-romieu","la-roque-gageac",
    "la-roque-sur-ceze","larressingle","lautrec","lauzerte","lavardens","lavardin","lavaudieu",
    "lavoute-chilhac","le-bec-hellouin","le-castellet","le-malzieu-ville","le-poet-laval",
    "les-baux-de-provence","limeuil","locronan","lods","loubressac","lourmarin","lussan","lyons-la-foret",
    "marcoles","martel","menerbes","minerve","mirmande","mittelbergheim","moncontour","monesties",
    "monflanquin","monpazier","montbrun-les-bains","montclus","mont-dauphin","montpeyroux","montreal",
    "montresor","montsoreau","mornac-sur-seudre","mortemart","moustiers-sainte-marie","najac","navarrenx",
    "noyers","oingt","olargues","parfondeval","penne-d-agenais","perouges","pesmes","peyre","piana",
    "polignac","pradelles","prats-de-mollo-la-preste","pujols-le-haut","puycelsi","riquewihr","rocamadour",
    "rochefort-en-terre","rodemack","roussillon","saint-amand-de-coly","saint-antoine-l-abbaye",
    "saint-benoit-du-sault","saint-bertrand-de-comminges","saint-ceneri-le-gerei","saint-cirq-lapopie",
    "saint-come-d-olt","sainte-agnes","sainte-croix-en-jarez","sainte-enimie","sainte-eulalie-d-olt",
    "sainte-suzanne","saint-guilhem-le-desert","saint-jean-de-cole","saint-jean-pied-de-port",
    "saint-leon-sur-vezere","saint-quirin","saint-robert","saint-suliac","saint-veran","salers","sancerre",
    "sant-antonino","saorge","sare","sarrant","sauveterre-de-rouergue","seguret","segur-le-chateau",
    "seillans","semur-en-brionnais","talmont-sur-gironde","tournemire","tournon-d-agenais","tourtour",
    "turenne","usson","venasque","veules-les-roses","vezelay","villefranche-de-conflent","villeneuve",
    "villereal","vogue","vouvant","yevre-le-chatel","yvoire"
  ]
};
