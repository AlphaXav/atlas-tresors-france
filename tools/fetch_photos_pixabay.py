#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atlas des Trésors de France — tools/fetch_photos_pixabay.py
-----------------------------------------------------------------------------
Télécharge JUSQU'À 4 photos par village depuis Pixabay (licence Pixabay :
réutilisation libre, y compris commerciale, sans attribution obligatoire),
les enregistre en <id>1.jpg … <id>4.jpg, écrit les crédits et régénère
data/photos.js (manifeste en tableau : carrousel + lightbox automatiques).

CLÉ API PIXABAY (gratuite, obligatoire)
    Créez un compte sur https://pixabay.com puis récupérez votre clé API
    sur https://pixabay.com/api/docs/ (section « Search Images »).
    Fournissez-la de l'une de ces façons :
        export PIXABAY_API_KEY="votreCle"      # variable d'environnement
        python3 tools/fetch_photos_pixabay.py --key votreCle

À LANCER SUR VOTRE MACHINE (bibliothèque standard Python seule) :

    cd atlas
    python3 tools/fetch_photos_pixabay.py --limit 3      # essai sur 3 villages
    python3 tools/fetch_photos_pixabay.py                # tous les villages (4 photos)
    python3 tools/fetch_photos_pixabay.py --max 3        # 3 photos max par village
    python3 tools/fetch_photos_pixabay.py --large        # images 1280 px (plus lourdes)
    python3 tools/fetch_photos_pixabay.py --force        # re-télécharge tout
    python3 tools/fetch_photos_pixabay.py --insecure     # si erreur de certificat SSL (macOS)

POIDS DES IMAGES
    Par défaut, on télécharge la version « webformat » de Pixabay (≈ 640 px de
    large, déjà optimisée) : léger et suffisant pour les vignettes et fiches.
    Avec --large, on prend la version ≈ 1280 px (plus belle en lightbox, mais
    plus lourde).

REMARQUE SUR LA PERTINENCE
    Pixabay est une banque d'images de stock : pour les grandes villes et sites
    connus le résultat est bon, mais pour les très petits villages les photos
    peuvent être génériques. Vérifiez le rendu et, au besoin, complétez à la
    main via data/photos.js (voir README).

macOS — ERREUR « certificate verify failed » ?
    Lancez une fois « Install Certificates.command » (dossier /Applications/
    Python 3.x/), OU relancez avec --insecure (désactive la vérification TLS).
"""

import argparse, json, os, re, sys, ssl, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VILLAGES_JS = os.path.join(ROOT, "data", "villages.js")
IMG_DIR = os.path.join(ROOT, "assets", "images")
CREDITS_MD = os.path.join(IMG_DIR, "CREDITS.md")
CREDITS_JSON = os.path.join(IMG_DIR, "credits.json")
PHOTOS_JS = os.path.join(ROOT, "data", "photos.js")

UA = "AtlasTresorsFranceBot/1.0 (personal heritage guide) Python-urllib"
PIXABAY_API = "https://pixabay.com/api/"
LICENSE_NAME = "Licence Pixabay"
LICENSE_URL = "https://pixabay.com/service/license-summary/"
MAX_DEFAULT = 4
PAUSE = 0.5            # secondes entre villages (politesse / quota)
RETRIES = 2

SSL_CTX = ssl.create_default_context()


def _open(url):
    last = None
    for attempt in range(RETRIES):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return urllib.request.urlopen(req, timeout=40, context=SSL_CTX)
        except ssl.SSLCertVerificationError:
            raise
        except Exception as e:
            last = e
            time.sleep(1.2 * (attempt + 1))
    raise last


def get_json(url):
    with _open(url) as r:
        return json.load(r)


def get_bytes(url):
    with _open(url) as r:
        return r.read()


def parse_villages():
    text = open(VILLAGES_JS, encoding="utf-8").read()
    rx = re.compile(r'id:\s*"([^"]+)",\s*nom:\s*"([^"]+)",\s*region:\s*"([^"]+)",\s*departement:\s*"([^"]+)"')
    return [{"id": m.group(1), "nom": m.group(2), "region": m.group(3), "departement": m.group(4)}
            for m in rx.finditer(text)]


def pixabay_search(key, query, want, use_large, min_width):
    """Renvoie une liste de dicts {url, page, credit, link, w, h} pour une requête."""
    q = urllib.parse.urlencode({
        "key": key, "q": query, "image_type": "photo", "orientation": "horizontal",
        "safesearch": "true", "per_page": str(max(want * 4, 12)), "lang": "fr",
        "order": "popular",
    })
    data = get_json(f"{PIXABAY_API}?{q}")
    items = []
    for h in data.get("hits", []):
        w, ht = h.get("imageWidth", 0), h.get("imageHeight", 0)
        if min_width and w and w < min_width:
            continue
        url = h.get("largeImageURL") if use_large else h.get("webformatURL")
        if not url:
            continue
        author = h.get("user") or "Pixabay"
        items.append({
            "url": url, "page": h.get("pageURL", ""),
            "credit": f"© {author} / Pixabay", "link": h.get("pageURL", ""),
            "w": w, "h": ht,
        })
    return items


def existing_files(vid):
    out = []
    for n in range(1, 21):
        f = os.path.join(IMG_DIR, f"{vid}{n}.jpg")
        if os.path.exists(f):
            out.append((n, f))
    return out


def main():
    ap = argparse.ArgumentParser(description="Télécharge jusqu'à N photos Pixabay par village.")
    ap.add_argument("--key", default=os.environ.get("PIXABAY_API_KEY", ""), help="clé API Pixabay (ou variable PIXABAY_API_KEY)")
    ap.add_argument("--limit", type=int, default=0, help="nombre de villages (0 = tous)")
    ap.add_argument("--max", type=int, default=MAX_DEFAULT, help="photos max par village (défaut 4)")
    ap.add_argument("--large", action="store_true", help="images ~1280 px au lieu de ~640 px")
    ap.add_argument("--min-width", type=int, default=800, help="largeur minimale des images retenues (défaut 800)")
    ap.add_argument("--suffix", default="France", help="mot(s) ajouté(s) à la requête (défaut : France)")
    ap.add_argument("--force", action="store_true", help="re-télécharge même si déjà présent")
    ap.add_argument("--insecure", action="store_true", help="désactive la vérification TLS (dépannage macOS)")
    args = ap.parse_args()

    if not args.key:
        print("X Clé API Pixabay manquante.")
        print("  -> export PIXABAY_API_KEY=\"votreCle\"   ou   --key votreCle")
        print("  Obtenez-en une (gratuite) sur https://pixabay.com/api/docs/")
        sys.exit(2)

    if args.insecure:
        SSL_CTX.check_hostname = False
        SSL_CTX.verify_mode = ssl.CERT_NONE
        print("/!\\  Vérification TLS désactivée (--insecure).\n")

    os.makedirs(IMG_DIR, exist_ok=True)
    prev = {}
    if os.path.exists(CREDITS_JSON):
        try:
            prev = json.load(open(CREDITS_JSON, encoding="utf-8"))
        except Exception:
            prev = {}

    villages = parse_villages()
    if args.limit:
        villages = villages[: args.limit]
    print(f"{len(villages)} villages à traiter (jusqu'à {args.max} photos, "
          f"{'~1280' if args.large else '~640'} px).\n")

    manifest, creditsData, credits_rows = {}, {}, []
    ok = skipped = empty = 0

    for i, v in enumerate(villages, 1):
        vid, nom = v["id"], v["nom"]
        tag = f"[{i}/{len(villages)}] {nom}"
        disk = existing_files(vid)

        if disk and not args.force:
            saved = {c.get("file"): c for c in prev.get(vid, [])}
            entries = []
            for _, f in disk:
                base = os.path.basename(f)
                c = saved.get(base, {})
                entries.append({"src": f"assets/images/{base}", "credit": c.get("credit", ""), "link": c.get("link", ""),
                                "license": c.get("license", LICENSE_NAME), "licenseUrl": c.get("licenseUrl", LICENSE_URL)})
            manifest[vid] = entries
            creditsData[vid] = [{"file": os.path.basename(f), "credit": e.get("credit", ""), "link": e.get("link", ""),
                                 "license": e.get("license", ""), "licenseUrl": e.get("licenseUrl", "")}
                                for (_, f), e in zip(disk, entries)]
            print(f"{tag} : {len(entries)} déjà présente(s), conservée(s)")
            skipped += 1
            continue

        try:
            # deux tentatives : « <nom> <suffix> » puis « <nom> » seul (meilleur rappel)
            queries = [f"{nom} {args.suffix}".strip(), nom]
            cands = []
            seen = set()
            for query in queries:
                for c in pixabay_search(args.key, query, args.max, args.large, args.min_width):
                    if c["url"] in seen:
                        continue
                    seen.add(c["url"])
                    cands.append(c)
                if len(cands) >= args.max:
                    break

            entries, cdata, n = [], [], 0
            for c in cands:
                if n >= args.max:
                    break
                try:
                    data = get_bytes(c["url"])
                except Exception:
                    continue
                n += 1
                base = f"{vid}{n}.jpg"
                with open(os.path.join(IMG_DIR, base), "wb") as f:
                    f.write(data)
                entries.append({"src": f"assets/images/{base}", "credit": c["credit"], "link": c["link"],
                                "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                cdata.append({"file": base, "credit": c["credit"], "link": c["link"],
                              "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                credits_rows.append((nom, c["link"], "Licence Pixabay", c["credit"], c["link"]))
            if entries:
                manifest[vid] = entries
                creditsData[vid] = cdata
                print(f"{tag} : {len(entries)} photo(s) téléchargée(s)")
                ok += 1
            else:
                print(f"{tag} : aucune image trouvée — planche SVG conservée")
                empty += 1
        except ssl.SSLCertVerificationError:
            print("\nX Erreur de certificat SSL (macOS).")
            print("  -> Lancez « Install Certificates.command », ou relancez avec --insecure\n")
            break
        except Exception as e:
            print(f"{tag} : echec ({e})")
            empty += 1
        time.sleep(PAUSE)

    write_photos_js(manifest)
    write_credits_md(credits_rows)
    json.dump(creditsData, open(CREDITS_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    total = sum(len(x) for x in manifest.values())
    print(f"\nTermine. {ok} villages avec nouvelles photos, {skipped} conserves, {empty} sans image.")
    print(f"{total} photos au total.")
    print(f"-> {os.path.relpath(PHOTOS_JS, ROOT)}\n-> {os.path.relpath(CREDITS_MD, ROOT)}")
    print("Rechargez index.html : les photos et le carrousel apparaissent.")


def _esc(s):
    return re.sub(r"\s+", " ", (s or "")).replace("\\", "\\\\").replace('"', '\\"').strip()


def write_photos_js(manifest):
    lines = ["/* Atlas des Tresors de France — data/photos.js (genere par tools/fetch_photos_pixabay.py) */",
             "window.ATLAS = window.ATLAS || {};", "window.ATLAS.photos = {"]
    for vid in sorted(manifest):
        photos = manifest[vid]
        inner = ", ".join('{ src: "%s", credit: "%s", link: "%s", license: "%s", licenseUrl: "%s" }' % (_esc(p["src"]), _esc(p.get("credit")), _esc(p.get("link")), _esc(p.get("license")), _esc(p.get("licenseUrl"))) for p in photos)
        lines.append(f'  "{vid}": [{inner}],')
    lines.append("};")
    open(PHOTOS_JS, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def write_credits_md(rows):
    out = ["# Credits photographiques", "",
           "Photos issues de Pixabay (licence Pixabay : reutilisation libre, sans",
           "attribution obligatoire). Le credit ci-dessous est indique par courtoisie.", "",
           "| Village | Page | Licence | Auteur | Source |", "|---|---|---|---|---|"]
    for nom, page, lic, author, link in rows:
        out.append(f"| {nom} | {page} | {lic} | {author} | {link} |")
    open(CREDITS_MD, "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrompu."); sys.exit(1)
