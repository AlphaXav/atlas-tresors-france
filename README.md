# Atlas des Trésors de France

Guide interactif et autonome (HTML/CSS/JavaScript, sans serveur) des plus beaux
villages de France. Conçu comme un logiciel modulaire et extensible jusqu'à la PWA.

---

## Démarrer

**Option 1 — double-clic (le plus simple).**
Ouvrez `index.html` dans Chrome, Safari, Edge ou Firefox. Tout fonctionne, y
compris en `file://`, car les données sont chargées via des fichiers `data/*.js`
(JSON encapsulé) et non par `fetch()` — ce dernier étant bloqué en local par les
navigateurs.

**Option 2 — serveur local (recommandé pour la PWA et le hors-ligne).**
```bash
cd atlas
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```
Le service worker (cache hors-ligne) et l'installation PWA ne s'activent qu'en
`http(s)`/`localhost`, jamais en `file://` (limite des navigateurs).

---

## Ce qui dépend d'Internet

| Élément            | Hors connexion | Détail |
|--------------------|:--------------:|--------|
| Fiches, filtres, favoris, classements, stats | ✅ | 100 % local |
| Illustrations des villages | ✅ | « Planches » SVG générées (pas de photos requises) |
| Polices Fraunces / Hanken Grotesk | ⚠️ | Repli système hors connexion |
| Carte interactive (Leaflet + tuiles) | ❌ | Nécessite une connexion |
| Installation PWA / cache hors-ligne | ⚠️ | Requiert un service via http(s)/localhost |

---

## Architecture

```
index.html                  Shell + ordre de chargement des scripts
manifest.webmanifest        Manifeste PWA
sw.js                       Service worker (cache du shell)
assets/
  css/styles.css            Design system « atlas cartographique »
  js/
    core.js                 Utilitaires, icônes SVG, générateur de planches
    store.js                État : favoris (localStorage), thème, filtres, tri
    views/villages.js       Cartes, regroupement région→département, fiche
    views/others.js         Carte, road trips, classements, stats, favoris
    app.js                  Routage SPA, navigation, filtres, PWA
  icons/icon.svg            Icône de l'application
  images/                   (Optionnel) vos photos
data/
  villages.js               Base des villages  ← le fichier à enrichir
  regions.js  roadtrips.js  gastronomie.js  panoramas.js  chateaux.js
```

Données **entièrement séparées** du code, dans `data/`.

---

## Photos réelles

Par défaut, chaque village est illustré par une « planche » SVG générée (aucune
photo requise, fonctionne hors-ligne). Pour afficher de vraies photos, trois voies :

**A. Génération automatique (recommandée).** Sur votre machine :
```bash
cd atlas
python3 tools/fetch_photos.py            # jusqu'à 5 photos libres par village
python3 tools/fetch_photos.py --limit 5  # test rapide
python3 tools/fetch_photos.py --max 3    # 3 photos max par village
```
Le script cherche les images sur **Wikimedia Commons** (banque 100 % sous licence
libre), télécharge jusqu'à 5 photos par village (`<id>1.jpg` … `<id>5.jpg`), écrit
les licences dans `assets/images/CREDITS.md`, mémorise les crédits dans
`assets/images/credits.json` (pour des relances rapides) et régénère `data/photos.js`
sous forme de **manifeste-tableau** (carrousel + lightbox automatiques). Aucune
dépendance à installer.

**B. Vos propres photos, par convention.** Déposez `assets/images/<id>.jpg` (l'`id`
est celui du village dans `data/villages.js`), puis activez la détection dans
`data/photos.js` :
```js
window.ATLAS.config = { tryConventionImages: true };
```

**C. Manifeste manuel.** Dans `data/photos.js`, avec crédit :
```js
window.ATLAS.photos["gordes"] = {
  src: "assets/images/gordes.jpg",
  credit: "© Auteur / Wikimedia Commons (CC BY-SA 4.0)",
  link: "https://commons.wikimedia.org/wiki/File:Gordes.jpg"
};
```

Dans tous les cas, si une image manque ou échoue à charger, la planche SVG
reprend automatiquement la main : l'application ne casse jamais. Le crédit, s'il
est renseigné, s'affiche discrètement en bas de la photo dans la fiche.

**Plusieurs photos par village.** La fiche affiche alors un carrousel (flèches +
pastilles) et le lightbox se parcourt aux flèches ← →. Deux façons :
- *Manifeste, tableau* : `ATLAS.photos["gordes"] = ["assets/images/gordes1.jpg", {src:"assets/images/gordes2.jpg", credit:"© Xavier"}, "assets/images/gordes3.jpg"]`.
- *Fichiers numérotés* : avec `tryConventionImages: true`, déposez `gordes.jpg`, `gordes1.jpg`, `gordes2.jpg`… ; les images supplémentaires sont détectées à l'ouverture de la fiche. Un indicateur du nombre de photos apparaît sur la vignette lorsque le total est connu.

**Droits.** Les photos de villages sont protégées. La voie A privilégie les
images sous licence libre et conserve l'attribution, mais vérifiez `CREDITS.md`
avant tout usage commercial.

---

## Label & liens officiels (Plus Beaux Villages de France)

`data/officiel.js` contient la liste des villages labellisés par l'association
*Les Plus Beaux Villages de France*. Sur ces villages, la fiche affiche :

- un badge **✦ Plus Beaux Villages de France** ;
- un bouton **« Fiche officielle & photos »** qui ouvre la page du village sur le
  site de l'association (`.../nos-villages/<id>/`).

Les photos ne sont **pas copiées** : le lien renvoie vers le site officiel, où
elles sont hébergées (leur contenu est « Tous droits réservés »). Sur les 194 villages, **184 sont labellisés** — l'intégralité des membres officiels de l'association — ; 10 ne le sont pas (souvent d'anciens
« Villages préférés des Français » non membres de l'association) et n'affichent
donc ni badge ni lien officiel.

La base couvre désormais **l'intégralité des 184 Plus Beaux Villages de France**
officiels, complétée par 13 villages remarquables non labellisés (anciens
« Villages préférés des Français » notamment). Tout village ajouté dont l'`id`
figure au référentiel génère automatiquement son badge et son lien officiel.

---

## « Village préféré des Français »

`data/vpf.js` recense **l'intégralité des villages ayant concouru** à l'émission
de Stéphane Bern, chaque édition de 2012 à 2026, avec leur **rang** au classement
(clé = identifiant du village, `{ annee, rang }`, `rang: 1` = vainqueur). Soit
238 participations au total.

La fiche d'un village concerné affiche, selon le cas :
- **🏆 Village préféré des Français &lt;année&gt;** (macaron doré, aussi sur la vignette) pour les 15 **vainqueurs** ;
- **★ Finaliste Village préféré &lt;année&gt; · &lt;rang&gt;ᵉ** (badge sobre) pour les autres **participants**.

Deux filtres « Distinctions » permettent d'isoler les vainqueurs (« Lauréat ») ou
tous les participants (« A concouru »). Sur les 238 participations, **115
correspondent à des villages de la base** (15 vainqueurs, 100 finalistes) ; les
123 autres restent dans le référentiel et s'afficheront automatiquement si les
communes correspondantes sont ajoutées un jour à `data/villages.js`.

---

## Patrimoine mondial de l'UNESCO

`data/unesco.js` recense **l'intégralité des 54 biens français** inscrits au
patrimoine mondial de l'UNESCO (45 culturels, 7 naturels, 2 mixtes), à jour au
terme de la 47e session (2025, inscription des mégalithes de Carnac). Chaque
bien comporte : nom officiel, année d'inscription, `type`
(`culturel`/`naturel`/`mixte`), région, coordonnées d'un site représentatif,
identifiant `unescoId` (lien profond `https://whc.unesco.org/fr/list/<id>`) et un
résumé éditorial court.

Ce référentiel alimente :

- un onglet **« Patrimoine mondial »** : synthèse chiffrée, filtre par type et
  grille des 54 biens (triés par région), chacun renvoyant à sa fiche UNESCO ;
- des **repères bleus** dédiés sur la carte interactive ;
- un **badge 🌍 Patrimoine mondial UNESCO** et un bloc détaillé sur la fiche des
  villages de la base situés dans le périmètre d'un bien, plus un filtre
  « Distinctions » associé.

Le lien village↔bien se fait par le champ `villages` (liste d'`id`) de chaque
bien. Sont actuellement reliés : **Vézelay** (basilique et Compostelle),
**Conques**, **Saint-Guilhem-le-Désert**, **Estaing** et **Rocamadour** (Chemins
de Saint-Jacques-de-Compostelle), et **Piana** (golfe de Porto). Ajouter un `id`
de village existant au champ `villages` d'un bien génère automatiquement son
badge et son bloc.

---

## Ajouter / modifier un village

Dans `data/villages.js`, copiez un bloc et gardez un `id` unique (slug en
minuscules). Champs réels attendus : `region`, `departement`, `code` (n° de
département), `lat`, `lng`, `population`. Les notes (`note100`, `etoiles`, et les
sous-notes `/10`) sont **éditoriales** : ajustez-les à votre appréciation.

Tags reconnus par les filtres et classements :
`chateau, fortifie, vignoble, montagne, riviere, mer, meconnu, touristique,
medieval, marche, noel, panorama`.

Pour relier un village à un road trip : ajoutez son `id` dans le champ `etapes`
de l'itinéraire concerné (`data/roadtrips.js`) et l'id du road trip dans le champ
`roadtrips` du village.

---

## Sincérité sur les données

- **Réels** : régions, départements, coordonnées GPS, patrimoine, appartenance à
  l'association *Les Plus Beaux Villages de France* ; populations en ordre de
  grandeur (recensements INSEE arrondis).
- **Éditoriales** : toutes les notes chiffrées. Elles constituent une base de
  travail cohérente, pas un classement officiel.

La base livrée compte **197 villages** couvrant 14 régions et 73 départements, et
l'architecture est dimensionnée pour monter à 100+ sans modification du code.

---

## État des versions (feuille de route du cahier des charges)

- v0.1 architecture · v0.2 interface · v0.3 base de données · v0.4 fiches
  détaillées · v0.5 carte · v0.6 favoris & filtres · **v1.0 application complète**

Cette livraison est une **v1.0 fonctionnelle** : toutes les briques sont en place
et opérationnelles. Les extensions naturelles sont l'enrichissement de la base
(au-delà de 110 villages), l'ajout de photos réelles dans `assets/images/`, et la
tous les 14 itinéraires sont désormais renseignés avec leurs étapes.
