#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atlas des Trésors de France — tools/fetch_photos_pexels.py
-----------------------------------------------------------------------------
Télécharge JUSQU'À 4 photos par village depuis Pexels (licence Pexels :
réutilisation libre, y compris commerciale ; crédit du photographe demandé),
les enregistre en <id>1.jpg … <id>4.jpg, écrit les crédits et régénère
data/photos.js (manifeste en tableau : carrousel + lightbox automatiques).

CLÉ API PEXELS (gratuite, obligatoire)
    Créez un compte sur https://www.pexels.com puis récupérez votre clé sur
    https://www.pexels.com/api/  (« Get Started » → « Your API Key »).
    Fournissez-la de l'une de ces façons :
        export PEXELS_API_KEY="votreCle"       # variable d'environnement
        python3 tools/fetch_photos_pexels.py --key votreCle

    ⚠ Authentification par EN-TÊTE (Authorization), et non par paramètre d'URL :
      ne partagez jamais votre clé publiquement.

QUOTA
    Par défaut Pexels limite à 200 requêtes/heure et 20 000/mois. Pour les 362
    communes de la base, lancez par lots si nécessaire (--limit), ou laissez
    tourner : le script respecte l'en-tête X-Ratelimit-Remaining et patiente en
    cas de dépassement (HTTP 429).

À LANCER SUR VOTRE MACHINE (bibliothèque standard Python seule) :

    cd atlas
    python3 tools/fetch_photos_pexels.py --limit 3       # essai sur 3 villages
    python3 tools/fetch_photos_pexels.py                 # tous (4 photos, ~1200 px)
    python3 tools/fetch_photos_pexels.py --max 3         # 3 photos max par village
    python3 tools/fetch_photos_pexels.py --large         # ~1880 px (plus lourdes)
    python3 tools/fetch_photos_pexels.py --size large    # ~940 px (plus légères)
    python3 tools/fetch_photos_pexels.py --force         # re-télécharge tout
    python3 tools/fetch_photos_pexels.py --insecure      # si erreur de certificat SSL (macOS)

TAILLES DISPONIBLES (paramètre --size)
    landscape  ~1200 x 627  (défaut, bon compromis pour vignettes/fiches)
    large      ~940 px      (plus léger)
    large2x    ~1880 px     (= option --large ; plus beau en lightbox, plus lourd)
    original   pleine résolution (lourd)

REMARQUE SUR LA PERTINENCE
    Pexels est une banque de stock : bon pour les villes et sites connus, mais
    les très petits villages peuvent recevoir des images génériques. Vérifiez le
    rendu et complétez à la main via data/photos.js si besoin (voir README).

macOS — ERREUR « certificate verify failed » ?
    Lancez une fois « Install Certificates.command », OU relancez avec --insecure.
"""

import argparse, json, os, re, sys, ssl, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VILLAGES_JS = os.path.join(ROOT, "data", "villages.js")
IMG_DIR = os.path.join(ROOT, "assets", "images")
CREDITS_MD = os.path.join(IMG_DIR, "CREDITS.md")
CREDITS_JSON = os.path.join(IMG_DIR, "credits.json")
PHOTOS_JS = os.path.join(ROOT, "data", "photos.js")

UA = "AtlasTresorsFranceBot/1.0 (personal heritage guide) Python-urllib"
PEXELS_API = "https://api.pexels.com/v1/search"
LICENSE_NAME = "Licence Pexels"
LICENSE_URL = "https://www.pexels.com/license/"
MAX_DEFAULT = 4
PAUSE = 0.5            # secondes entre villages (politesse)
RETRIES = 2
SIZE_KEYS = ("landscape", "large", "large2x", "medium", "portrait", "original", "small", "tiny")

SSL_CTX = ssl.create_default_context()


def _open(url, key):
    """Requête authentifiée (header Authorization). Gère 429 (quota) et renvoie
    (objet-réponse). Le corps doit être lu par l'appelant."""
    last = None
    for attempt in range(RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": UA})
            return urllib.request.urlopen(req, timeout=40, context=SSL_CTX)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 60
                print(f"    quota atteint (429) — pause {wait}s…")
                time.sleep(wait)
                last = e
                continue
            raise
        except ssl.SSLCertVerificationError:
            raise
        except Exception as e:
            last = e
            time.sleep(1.2 * (attempt + 1))
    raise last


def api_search(key, query, per_page, min_width):
    """Interroge Pexels et renvoie (liste de hits, remaining)."""
    q = urllib.parse.urlencode({
        "query": query, "per_page": str(per_page),
        "orientation": "landscape", "locale": "fr-FR",
    })
    with _open(f"{PEXELS_API}?{q}", key) as r:
        remaining = r.headers.get("X-Ratelimit-Remaining")
        data = json.load(r)
    out = []
    for p in data.get("photos", []):
        if min_width and p.get("width") and p["width"] < min_width:
            continue
        out.append(p)
    try:
        remaining = int(remaining)
    except (TypeError, ValueError):
        remaining = None
    return out, remaining


def pick_url(photo, size):
    src = photo.get("src", {}) or {}
    if src.get(size):
        return src[size]
    for k in SIZE_KEYS:               # repli si la taille demandée manque
        if src.get(k):
            return src[k]
    return None


def parse_villages():
    text = open(VILLAGES_JS, encoding="utf-8").read()
    rx = re.compile(r'id:\s*"([^"]+)",\s*nom:\s*"([^"]+)",\s*region:\s*"([^"]+)",\s*departement:\s*"([^"]+)"')
    return [{"id": m.group(1), "nom": m.group(2), "region": m.group(3), "departement": m.group(4)}
            for m in rx.finditer(text)]


def get_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40, context=SSL_CTX) as r:
        return r.read()


def existing_files(vid):
    out = []
    for n in range(1, 21):
        f = os.path.join(IMG_DIR, f"{vid}{n}.jpg")
        if os.path.exists(f):
            out.append((n, f))
    return out


def main():
    ap = argparse.ArgumentParser(description="Télécharge jusqu'à N photos Pexels par village.")
    ap.add_argument("--key", default=os.environ.get("PEXELS_API_KEY", ""), help="clé API Pexels (ou variable PEXELS_API_KEY)")
    ap.add_argument("--limit", type=int, default=0, help="nombre de villages (0 = tous)")
    ap.add_argument("--max", type=int, default=MAX_DEFAULT, help="photos max par village (défaut 4)")
    ap.add_argument("--size", default="landscape", choices=SIZE_KEYS, help="taille des images (défaut : landscape ~1200 px)")
    ap.add_argument("--large", action="store_true", help="raccourci pour --size large2x (~1880 px)")
    ap.add_argument("--min-width", type=int, default=1000, help="largeur minimale des images retenues (défaut 1000)")
    ap.add_argument("--suffix", default="France", help="mot(s) ajouté(s) à la requête (défaut : France)")
    ap.add_argument("--force", action="store_true", help="re-télécharge même si déjà présent")
    ap.add_argument("--insecure", action="store_true", help="désactive la vérification TLS (dépannage macOS)")
    args = ap.parse_args()

    if not args.key:
        print("X Clé API Pexels manquante.")
        print("  -> export PEXELS_API_KEY=\"votreCle\"   ou   --key votreCle")
        print("  Obtenez-en une (gratuite, instantanée) sur https://www.pexels.com/api/")
        sys.exit(2)

    size = "large2x" if args.large else args.size

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
    print(f"{len(villages)} villages à traiter (jusqu'à {args.max} photos, taille « {size} »).\n")

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
            # 1re requête « <nom> <suffix> » ; repli « <nom> » seul si rien
            hits, remaining = api_search(args.key, f"{nom} {args.suffix}".strip(), max(args.max * 3, 9), args.min_width)
            if not hits:
                hits, remaining = api_search(args.key, nom, max(args.max * 3, 9), args.min_width)

            entries, cdata, n = [], [], 0
            for p in hits:
                if n >= args.max:
                    break
                url = pick_url(p, size)
                if not url:
                    continue
                try:
                    data = get_bytes(url)
                except Exception:
                    continue
                n += 1
                base = f"{vid}{n}.jpg"
                with open(os.path.join(IMG_DIR, base), "wb") as f:
                    f.write(data)
                author = p.get("photographer") or "Pexels"
                page = p.get("url", "")
                credit = f"© {author} / Pexels"
                entries.append({"src": f"assets/images/{base}", "credit": credit, "link": page,
                                "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                cdata.append({"file": base, "credit": credit, "link": page,
                              "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                credits_rows.append((nom, page, "Licence Pexels", author, page))
            if entries:
                manifest[vid] = entries
                creditsData[vid] = cdata
                extra = f" (quota restant : {remaining})" if remaining is not None else ""
                print(f"{tag} : {len(entries)} photo(s) téléchargée(s){extra}")
                ok += 1
            else:
                print(f"{tag} : aucune image trouvée — planche SVG conservée")
                empty += 1

            # respect du quota : ralentit fortement quand il reste peu de requêtes
            if remaining is not None and remaining <= 5:
                print("    quota presque épuisé — pause 60s…")
                time.sleep(60)
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
    lines = ["/* Atlas des Tresors de France — data/photos.js (genere par tools/fetch_photos_pexels.py) */",
             "window.ATLAS = window.ATLAS || {};", "window.ATLAS.photos = {"]
    for vid in sorted(manifest):
        photos = manifest[vid]
        inner = ", ".join('{ src: "%s", credit: "%s", link: "%s", license: "%s", licenseUrl: "%s" }' % (_esc(p["src"]), _esc(p.get("credit")), _esc(p.get("link")), _esc(p.get("license")), _esc(p.get("licenseUrl"))) for p in photos)
        lines.append(f'  "{vid}": [{inner}],')
    lines.append("};")
    open(PHOTOS_JS, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def write_credits_md(rows):
    out = ["# Credits photographiques", "",
           "Photos issues de Pexels (licence Pexels : reutilisation libre ; le credit",
           "du photographe est demande par Pexels et indique ci-dessous).", "",
           "| Village | Page | Licence | Auteur | Source |", "|---|---|---|---|---|"]
    for nom, page, lic, author, link in rows:
        out.append(f"| {nom} | {page} | {lic} | {author} | {link} |")
    open(CREDITS_MD, "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrompu."); sys.exit(1)
