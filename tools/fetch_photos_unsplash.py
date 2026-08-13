#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atlas des Trésors de France — tools/fetch_photos_unsplash.py
-----------------------------------------------------------------------------
Télécharge JUSQU'À 4 photos par village depuis Unsplash, les enregistre en
<id>1.jpg … <id>4.jpg, écrit les crédits et régénère data/photos.js.

Conforme aux règles de l'API Unsplash :
  • Attribution : crédit « © Auteur / Unsplash » + lien (avec paramètres UTM).
  • « Download event » : à chaque photo retenue, le script notifie Unsplash via
    l'URL links.download_location (obligatoire selon les guidelines).

CLÉ API UNSPLASH (gratuite)
    Créez une application sur https://unsplash.com/developers puis copiez
    l'« Access Key » (clé publique). Fournissez-la ainsi :
        export UNSPLASH_ACCESS_KEY="votreCle"   # variable d'environnement
        python3 tools/fetch_photos_unsplash.py --key votreCle
    Authentification par en-tête : Authorization: Client-ID <clé>.

QUOTA (ATTENTION)
    En mode « Demo » (par défaut à la création), Unsplash limite à 50 requêtes
    par HEURE. C'est peu pour 362 communes : lancez par lots (--limit ~45), ou
    demandez le passage en « Production » (5000 req/h) depuis votre tableau de
    bord Unsplash. Le script lit X-Ratelimit-Remaining et patiente si besoin.

À LANCER SUR VOTRE MACHINE (bibliothèque standard Python seule) :

    cd atlas
    python3 tools/fetch_photos_unsplash.py --limit 3      # essai
    python3 tools/fetch_photos_unsplash.py --limit 45     # un lot (quota Demo)
    python3 tools/fetch_photos_unsplash.py                # tous (4 photos, ~1080 px)
    python3 tools/fetch_photos_unsplash.py --small        # ~400 px (léger)
    python3 tools/fetch_photos_unsplash.py --large        # pleine largeur (lourd)
    python3 tools/fetch_photos_unsplash.py --force        # re-télécharge tout
    python3 tools/fetch_photos_unsplash.py --insecure     # si erreur SSL (macOS)

TAILLES (paramètre --size)
    regular  ~1080 px (défaut)      small ~400 px (--small)
    full     grande (--large)       raw   pleine résolution      thumb ~200 px

REMARQUE SUR LA PERTINENCE
    Unsplash est une banque de stock (belles images) : bon pour les villes et
    sites connus, plus aléatoire pour les très petits villages. Vérifiez le rendu
    et complétez à la main via data/photos.js si besoin (voir README).
"""

import argparse, json, os, re, sys, ssl, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VILLAGES_JS = os.path.join(ROOT, "data", "villages.js")
IMG_DIR = os.path.join(ROOT, "assets", "images")
CREDITS_MD = os.path.join(IMG_DIR, "CREDITS.md")
CREDITS_JSON = os.path.join(IMG_DIR, "credits.json")
PHOTOS_JS = os.path.join(ROOT, "data", "photos.js")

UA = "AtlasTresorsFranceBot/1.0 (personal heritage guide) Python-urllib"
UNSPLASH_SEARCH = "https://api.unsplash.com/search/photos"
LICENSE_NAME = "Unsplash License"
LICENSE_URL = "https://unsplash.com/license"
APP_NAME = "atlas-tresors-france"          # pour les paramètres UTM d'attribution
UTM = f"?utm_source={APP_NAME}&utm_medium=referral"
MAX_DEFAULT = 4
PAUSE = 0.6
RETRIES = 2
SIZE_KEYS = ("regular", "full", "raw", "small", "thumb")

SSL_CTX = ssl.create_default_context()


def _open(url, key):
    """Requête authentifiée (Authorization: Client-ID). Gère 403 (quota)."""
    last = None
    for attempt in range(RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers={"Authorization": f"Client-ID {key}", "User-Agent": UA})
            return urllib.request.urlopen(req, timeout=40, context=SSL_CTX)
        except urllib.error.HTTPError as e:
            if e.code == 403:                      # quota horaire atteint
                wait = 90
                print(f"    quota atteint (403) — pause {wait}s… (mode Demo = 50 req/h)")
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
    q = urllib.parse.urlencode({
        "query": query, "per_page": str(per_page),
        "orientation": "landscape", "content_filter": "high",
    })
    with _open(f"{UNSPLASH_SEARCH}?{q}", key) as r:
        remaining = r.headers.get("X-Ratelimit-Remaining")
        data = json.load(r)
    out = []
    for p in data.get("results", []):
        if min_width and p.get("width") and p["width"] < min_width:
            continue
        out.append(p)
    try:
        remaining = int(remaining)
    except (TypeError, ValueError):
        remaining = None
    return out, remaining


def trigger_download(key, photo):
    """Notifie Unsplash de l'utilisation d'une photo (obligatoire selon l'API)."""
    loc = (photo.get("links") or {}).get("download_location")
    if not loc:
        return
    try:
        with _open(loc, key):
            pass
    except Exception:
        pass   # best-effort : ne bloque pas le téléchargement


def pick_url(photo, size):
    urls = photo.get("urls", {}) or {}
    if urls.get(size):
        return urls[size]
    for k in SIZE_KEYS:
        if urls.get(k):
            return urls[k]
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
    ap = argparse.ArgumentParser(description="Télécharge jusqu'à N photos Unsplash par village.")
    ap.add_argument("--key", default=os.environ.get("UNSPLASH_ACCESS_KEY", ""), help="Access Key Unsplash (ou variable UNSPLASH_ACCESS_KEY)")
    ap.add_argument("--limit", type=int, default=0, help="nombre de villages (0 = tous)")
    ap.add_argument("--max", type=int, default=MAX_DEFAULT, help="photos max par village (défaut 4)")
    ap.add_argument("--size", default="regular", choices=SIZE_KEYS, help="taille des images (défaut : regular ~1080 px)")
    ap.add_argument("--small", action="store_true", help="raccourci pour --size small (~400 px)")
    ap.add_argument("--large", action="store_true", help="raccourci pour --size full (grande)")
    ap.add_argument("--min-width", type=int, default=1000, help="largeur minimale des images retenues (défaut 1000)")
    ap.add_argument("--suffix", default="France", help="mot(s) ajouté(s) à la requête (défaut : France)")
    ap.add_argument("--force", action="store_true", help="re-télécharge même si déjà présent")
    ap.add_argument("--insecure", action="store_true", help="désactive la vérification TLS (dépannage macOS)")
    args = ap.parse_args()

    if not args.key:
        print("X Access Key Unsplash manquante.")
        print("  -> export UNSPLASH_ACCESS_KEY=\"votreCle\"   ou   --key votreCle")
        print("  Creez une application (gratuite) sur https://unsplash.com/developers")
        sys.exit(2)

    size = "small" if args.small else ("full" if args.large else args.size)

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
                trigger_download(args.key, p)      # exigé par les guidelines Unsplash
                n += 1
                base = f"{vid}{n}.jpg"
                with open(os.path.join(IMG_DIR, base), "wb") as f:
                    f.write(data)
                author = (p.get("user") or {}).get("name") or "Unsplash"
                page = (p.get("links") or {}).get("html", "")
                link = (page + UTM) if page else ""
                credit = f"© {author} / Unsplash"
                entries.append({"src": f"assets/images/{base}", "credit": credit, "link": link,
                                "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                cdata.append({"file": base, "credit": credit, "link": link,
                              "license": LICENSE_NAME, "licenseUrl": LICENSE_URL})
                credits_rows.append((nom, page, "Unsplash License", author, link))
            if entries:
                manifest[vid] = entries
                creditsData[vid] = cdata
                extra = f" (quota restant : {remaining})" if remaining is not None else ""
                print(f"{tag} : {len(entries)} photo(s) téléchargée(s){extra}")
                ok += 1
            else:
                print(f"{tag} : aucune image trouvée — planche SVG conservée")
                empty += 1

            if remaining is not None and remaining <= 3:
                print("    quota presque épuisé — pause 90s…")
                time.sleep(90)
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
    lines = ["/* Atlas des Tresors de France — data/photos.js (genere par tools/fetch_photos_unsplash.py) */",
             "window.ATLAS = window.ATLAS || {};", "window.ATLAS.photos = {"]
    for vid in sorted(manifest):
        photos = manifest[vid]
        inner = ", ".join('{ src: "%s", credit: "%s", link: "%s", license: "%s", licenseUrl: "%s" }' % (_esc(p["src"]), _esc(p.get("credit")), _esc(p.get("link")), _esc(p.get("license")), _esc(p.get("licenseUrl"))) for p in photos)
        lines.append(f'  "{vid}": [{inner}],')
    lines.append("};")
    open(PHOTOS_JS, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def write_credits_md(rows):
    out = ["# Credits photographiques", "",
           "Photos issues d'Unsplash (Unsplash License). Attribution requise :",
           "« Photo de <auteur> sur Unsplash », lien inclus ci-dessous.", "",
           "| Village | Page | Licence | Auteur | Source |", "|---|---|---|---|---|"]
    for nom, page, lic, author, link in rows:
        out.append(f"| {nom} | {page} | {lic} | {author} | {link} |")
    open(CREDITS_MD, "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrompu."); sys.exit(1)
