/* ============================================================================
 * Atlas des Trésors de France — data/photos.js
 * ----------------------------------------------------------------------------
 * Manifeste des photos réelles. Tant qu'une entrée n'existe pas pour un village,
 * l'application affiche sa « planche » SVG générée. Aucune photo n'est requise
 * pour que l'app fonctionne.
 *
 * DEUX FAÇONS DE FOURNIR DES PHOTOS
 * ---------------------------------
 * 1) Ce manifeste (recommandé — gère les crédits et les URL).
 *    ATLAS.photos["riquewihr"] = "assets/images/riquewihr.jpg";
 *    // ou, avec attribution :
 *    ATLAS.photos["gordes"] = {
 *      src: "assets/images/gordes.jpg",
 *      credit: "© Jean Dupont / Wikimedia Commons (CC BY-SA 4.0)",
 *      link: "https://commons.wikimedia.org/wiki/File:Gordes.jpg"
 *    };
 *    // une URL distante fonctionne aussi (mais l'app n'est alors plus 100 % hors-ligne) :
 *    ATLAS.photos["conques"] = { src: "https://upload.wikimedia.org/.../Conques.jpg", credit: "…" };
 *
 * 2) Convention de nommage (le plus simple : aucune édition de ce fichier).
 *    Déposez vos images sous assets/images/<id>.jpg (ex. assets/images/eguisheim.jpg)
 *    puis activez la détection automatique en ajoutant cette ligne AVANT le
 *    chargement des scripts (ou ici) :
 *        window.ATLAS = window.ATLAS || {};
 *        window.ATLAS.config = { tryConventionImages: true };
 *    Les ids correspondent au champ "id" de chaque village (voir data/villages.js).
 *
 * PLUSIEURS PHOTOS PAR VILLAGE (défilement dans la fiche + lightbox)
 * -----------------------------------------------------------------
 * a) Manifeste, tableau (recommandé, gère les crédits par photo) :
 *        ATLAS.photos["gordes"] = [
 *          "assets/images/gordes1.jpg",
 *          { src: "assets/images/gordes2.jpg", credit: "© Xavier" },
 *          "assets/images/gordes3.jpg"
 *        ];
 * b) Convention numérotée (aucune édition) : activez tryConventionImages puis
 *    déposez assets/images/gordes.jpg, gordes1.jpg, gordes2.jpg, gordes3.jpg…
 *    Les fichiers en trop sont détectés automatiquement à l'ouverture de la fiche.
 *
 * GÉNÉRATION AUTOMATIQUE
 * ----------------------
 * Le script tools/fetch_photos.py (à lancer sur votre machine) télécharge une
 * photo libre de droits par village depuis Wikipédia/Wikimedia Commons, écrit
 * les fichiers dans assets/images/, enregistre les crédits, et RÉÉCRIT ce
 * fichier automatiquement. Voir le README.
 * ========================================================================== */
window.ATLAS = window.ATLAS || {};

/* Pour activer la convention de nommage sans éditer ailleurs, décommentez :
   window.ATLAS.config = Object.assign({}, window.ATLAS.config, { tryConventionImages: true });
*/

window.ATLAS.photos = {
  /* Exemples (commentés). Décommentez après avoir déposé les fichiers :
  "riquewihr": "assets/images/riquewihr.jpg",
  "gordes": { src: "assets/images/gordes.jpg", credit: "© Auteur / Source (licence)", link: "https://…" },
  */
};
