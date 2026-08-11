#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atlas des Trésors de France — tools/fetch_photos.py
-----------------------------------------------------------------------------
Télécharge JUSQU'À 5 photos par village depuis Wikimedia Commons (banque
d'images 100 % sous licence libre), les enregistre en <id>1.jpg … <id>5.jpg,
écrit les crédits et régénère data/photos.js (manifeste en tableau).

À LANCER SUR VOTRE MACHINE (bibliothèque standard Python seule, rien à installer) :

    cd atlas
    python3 tools/fetch_photos.py --limit 3     # essai sur 3 villages
    python3 tools/fetch_photos.py               # tous les villages
    python3 tools/fetch_photos.py --max 3        # 3 photos max par village
    python3 tools/fetch_photos.py --force        # re-télécharge tout
    python3 tools/fetch_photos.py --insecure     # si erreur de certificat SSL (macOS)

Résultat :
    assets/images/<id>1.jpg …    les photos (jusqu'à 5 par village)
    assets/images/CREDITS.md     licences et auteurs (lisible)
    assets/images/credits.json   crédits réutilisés lors des relances (ne pas supprimer)
    data/photos.js               manifeste régénéré, en tableau, crédits inclus

macOS — ERREUR « certificate verify failed » ?
    Classique et sans gravité. Deux solutions :
      • Lancez une fois « Install Certificates.command » (dossier /Applications/Python 3.x/).
      • OU relancez avec  --insecure  (désactive la vérification TLS ; usage personnel).
"""

import argparse, json, os, re, sys, ssl, time, html, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VILLAGES_JS = os.path.join(ROOT, "data", "villages.js")
IMG_DIR = os.path.join(ROOT, "assets", "images")
CREDITS_MD = os.path.join(IMG_DIR, "CREDITS.md")
CREDITS_JSON = os.path.join(IMG_DIR, "credits.json")
PHOTOS_JS = os.path.join(ROOT, "data", "photos.js")

UA = "AtlasTresorsFranceBot/1.0 (personal heritage guide; contact: utilisateur@exemple.fr) Python-urllib"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
THUMB_W = 1200
MAX_DEFAULT = 5
PAUSE = 0.7            # secondes entre villages (politesse)
RETRIES = 2

SSL_CTX = ssl.create_default_context()

SKIP_NAME = re.compile(r"(blason|coat[_ ]of[_ ]arms|logo|drapeau|flag|armoiries|\bmap\b|carte|plan|localisation|panorama_?map|\.svg$|\.pdf$|\.tif)", re.I)
OK_MIME = ("image/jpeg", "image/png")


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


def clean_artist(raw):
    return html.unescape(re.sub(r"<[^>]+>", "", raw or "")).strip()


def commons_candidates(nom, departement, want):
    """Cherche des fichiers image sur Commons et renvoie une liste ordonnée de
    dicts {thumburl, filetitle, credit, link, landscape}."""
    q = urllib.parse.urlencode({
        "action": "query", "format": "json",
        "generator": "search", "gsrsearch": f"{nom} {departement}",
        "gsrnamespace": "6", "gsrlimit": "24",
        "prop": "imageinfo", "iiprop": "url|extmetadata|mime|size", "iiurlwidth": str(THUMB_W),
    })
    data = get_json(f"{COMMONS_API}?{q}")
    pages = data.get("query", {}).get("pages", {})
    items = []
    for p in pages.values():
        title = p.get("title", "")
        if SKIP_NAME.search(title):
            continue
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") not in OK_MIME:
            continue
        thumb = ii.get("thumburl")
        if not thumb:
            continue
        w, h = ii.get("thumbwidth") or ii.get("width") or 0, ii.get("thumbheight") or ii.get("height") or 0
        ext = ii.get("extmetadata", {})
        lic = ext.get("LicenseShortName", {}).get("value", "").strip()
        artist = clean_artist(ext.get("Artist", {}).get("value", ""))
        credit = " / ".join(x for x in [artist or None, "Wikimedia Commons", lic or None] if x)
        link = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))
        items.append({
            "thumburl": thumb, "filetitle": title, "credit": credit, "link": link,
            "landscape": (w >= h), "index": p.get("index", 999), "lic": lic or "?", "artist": artist or "?",
        })
    # paysage d'abord (meilleur pour les vignettes), en conservant l'ordre de pertinence
    items.sort(key=lambda x: (0 if x["landscape"] else 1, x["index"]))
    return items[: max(want * 3, want)]


def existing_files(vid):
    """Fichiers <id>N.jpg déjà présents, triés par numéro."""
    out = []
    for n in range(1, 21):
        f = os.path.join(IMG_DIR, f"{vid}{n}.jpg")
        if os.path.exists(f):
            out.append((n, f))
    return out


def main():
    ap = argparse.ArgumentParser(description="Télécharge jusqu'à N photos libres par village.")
    ap.add_argument("--limit", type=int, default=0, help="nombre de villages (0 = tous)")
    ap.add_argument("--max", type=int, default=MAX_DEFAULT, help="photos max par village (défaut 5)")
    ap.add_argument("--force", action="store_true", help="re-télécharge même si déjà présent")
    ap.add_argument("--insecure", action="store_true", help="désactive la vérification TLS (dépannage macOS)")
    args = ap.parse_args()

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
    print(f"{len(villages)} villages à traiter (jusqu'à {args.max} photos chacun).\n")

    manifest, creditsData, credits_rows = {}, {}, []
    ok = skipped = empty = 0

    for i, v in enumerate(villages, 1):
        vid, nom = v["id"], v["nom"]
        tag = f"[{i}/{len(villages)}] {nom}"
        disk = existing_files(vid)

        if disk and not args.force:
            # reconstruit le manifeste depuis le disque + crédits mémorisés (rapide, sans réseau)
            saved = {c.get("file"): c for c in prev.get(vid, [])}
            entries = []
            for _, f in disk:
                base = os.path.basename(f)
                c = saved.get(base, {})
                entries.append({"src": f"assets/images/{base}", "credit": c.get("credit", ""), "link": c.get("link", "")})
            manifest[vid] = entries
            creditsData[vid] = [{"file": os.path.basename(f), "credit": e.get("credit", ""), "link": e.get("link", "")}
                                for (_, f), e in zip(disk, entries)]
            print(f"{tag} : {len(entries)} déjà présente(s), conservée(s)")
            skipped += 1
            continue

        try:
            cands = commons_candidates(nom, v["departement"], args.max)
            entries, cdata, n = [], [], 0
            for c in cands:
                if n >= args.max:
                    break
                try:
                    data = get_bytes(c["thumburl"])
                except Exception:
                    continue
                n += 1
                base = f"{vid}{n}.jpg"
                with open(os.path.join(IMG_DIR, base), "wb") as f:
                    f.write(data)
                entries.append({"src": f"assets/images/{base}", "credit": c["credit"], "link": c["link"]})
                cdata.append({"file": base, "credit": c["credit"], "link": c["link"]})
                credits_rows.append((nom, c["filetitle"], c["lic"], c["artist"], c["link"]))
            if entries:
                manifest[vid] = entries
                creditsData[vid] = cdata
                print(f"{tag} : {len(entries)} photo(s) téléchargée(s)")
                ok += 1
            else:
                print(f"{tag} : aucune image exploitable — planche SVG conservée")
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
    lines = ["/* Atlas des Tresors de France — data/photos.js (genere par tools/fetch_photos.py) */",
             "window.ATLAS = window.ATLAS || {};", "window.ATLAS.photos = {"]
    for vid in sorted(manifest):
        photos = manifest[vid]
        inner = ", ".join('{ src: "%s", credit: "%s", link: "%s" }' % (_esc(p["src"]), _esc(p.get("credit")), _esc(p.get("link"))) for p in photos)
        lines.append(f'  "{vid}": [{inner}],')
    lines.append("};")
    open(PHOTOS_JS, "w", encoding="utf-8").write("\n".join(lines) + "\n")


def write_credits_md(rows):
    out = ["# Credits photographiques", "",
           "Photos issues de Wikimedia Commons (banque d'images libres). Chaque fichier",
           "reste soumis a sa licence : verifiez la colonne Licence avant reutilisation.", "",
           "| Village | Fichier | Licence | Auteur | Source |", "|---|---|---|---|---|"]
    for nom, fname, lic, artist, link in rows:
        out.append(f"| {nom} | {fname} | {lic} | {artist} | {link} |")
    open(CREDITS_MD, "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nInterrompu."); sys.exit(1)
