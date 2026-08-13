#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Atlas des Trésors de France — tools/build_photos_from_credits.py
-----------------------------------------------------------------------------
Régénère data/photos.js À PARTIR de assets/images/credits.json, en produisant
une attribution CONFORME pour chaque photo :

    { src, credit, link, license, licenseUrl }

  - credit     : « Auteur / Source » (ex. « Basotxerri / Wikimedia Commons »)
  - link       : page de la photo originale (source)
  - license    : nom court de la licence (ex. « CC BY-SA 4.0 »)
  - licenseUrl : lien vers le texte de la licence (ex. creativecommons.org/…)

N'inclut que les fichiers réellement présents dans assets/images/. Aucune
connexion réseau : c'est une transformation locale. À lancer après un
téléchargement de photos, pour rendre les crédits complets et cliquables.

    cd atlas
    python3 tools/build_photos_from_credits.py
"""

import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(ROOT, "assets", "images")
CREDITS_JSON = os.path.join(IMG_DIR, "credits.json")
PHOTOS_JS = os.path.join(ROOT, "data", "photos.js")


def license_url(name):
    """URL canonique du texte d'une licence à partir de son nom court."""
    low = (name or "").lower()
    m = re.search(r'cc[\s-]*by(-sa)?[\s-]*([0-9](?:\.[0-9])?)', low)
    if m:
        kind = "by-sa" if m.group(1) else "by"
        ver = m.group(2)
        if "." not in ver:
            ver += ".0"
        return f"https://creativecommons.org/licenses/{kind}/{ver}/"
    if "cc0" in low or "zero" in low:
        return "https://creativecommons.org/publicdomain/zero/1.0/"
    if "public domain" in low or "domaine public" in low or low.strip() in ("pd", "pdm"):
        return "https://creativecommons.org/publicdomain/mark/1.0/"
    if "licence ouverte" in low or "etalab" in low or "open licence" in low:
        return "https://www.etalab.gouv.fr/licence-ouverte-open-licence/"
    if "gfdl" in low or "gnu free" in low:
        return "https://www.gnu.org/licenses/fdl-1.3.html"
    if low.strip() == "gpl" or "gnu general public" in low:
        return "https://www.gnu.org/licenses/gpl-3.0.html"
    if low.strip() == "fal" or "art libre" in low or "free art" in low:
        return "https://artlibre.org/licence/lal/en/"
    if "cc-by-sa" in low or "cc by-sa" in low:
        return "https://creativecommons.org/licenses/by-sa/4.0/"
    if "cc-by" in low or "cc by" in low:
        return "https://creativecommons.org/licenses/by/4.0/"
    return ""


# Noms de « licence » reconnus mais sans URL formelle (juste indiqués tels quels).
KNOWN_NO_URL = {"no restrictions", "attribution", "cc pd", "flickr"}


def split_credit(credit):
    """Sépare « Auteur / Source / Licence » en (texte auteur+source, licence)."""
    parts = [p.strip() for p in (credit or "").split(" / ") if p.strip()]
    lic = ""
    if parts and (license_url(parts[-1]) or parts[-1].lower() in KNOWN_NO_URL):
        lic = parts[-1]
        parts = parts[:-1]
    return " / ".join(parts), lic


def _esc(s):
    return re.sub(r"\s+", " ", (s or "")).replace("\\", "\\\\").replace('"', '\\"').strip()


def main():
    if not os.path.exists(CREDITS_JSON):
        print("X assets/images/credits.json introuvable — rien à faire.")
        return
    data = json.load(open(CREDITS_JSON, encoding="utf-8"))

    manifest = {}
    n_photos = 0
    missing = 0
    no_author = []
    no_license = []
    for vid in sorted(data):
        entries = []
        for c in data[vid]:
            f = c.get("file", "")
            if not f or not os.path.exists(os.path.join(IMG_DIR, f)):
                missing += 1
                continue
            credit_text, lic = split_credit(c.get("credit", ""))
            entries.append({
                "src": f"assets/images/{f}",
                "credit": credit_text,
                "link": c.get("link", ""),
                "license": lic,
                "licenseUrl": license_url(lic),
            })
            n_photos += 1
            if not credit_text or credit_text.lower() == "wikimedia commons":
                no_author.append(f)
            if not lic:
                no_license.append(f)
        if entries:
            manifest[vid] = entries

    # écriture du manifeste
    lines = [
        "/* ============================================================================",
        " * Atlas des Trésors de France — data/photos.js",
        " * Manifeste des photos réelles, généré par tools/build_photos_from_credits.py.",
        " * Chaque photo porte son attribution : auteur/source (link) + licence (licenseUrl).",
        " * Régénérez ce fichier après tout téléchargement de photos.",
        " * ========================================================================== */",
        "window.ATLAS = window.ATLAS || {};",
        "window.ATLAS.photos = {",
    ]
    for vid in sorted(manifest):
        items = ", ".join(
            '{ src: "%s", credit: "%s", link: "%s", license: "%s", licenseUrl: "%s" }'
            % (_esc(p["src"]), _esc(p["credit"]), _esc(p["link"]), _esc(p["license"]), _esc(p["licenseUrl"]))
            for p in manifest[vid]
        )
        lines.append(f'  "{vid}": [{items}],')
    lines.append("};")
    open(PHOTOS_JS, "w", encoding="utf-8").write("\n".join(lines) + "\n")

    print(f"OK : {len(manifest)} villages, {n_photos} photos référencées.")
    if missing:
        print(f"  {missing} entrée(s) ignorée(s) (fichier absent du disque).")
    if no_author:
        print(f"  ⚠ {len(no_author)} photo(s) sans auteur identifié (ex. {no_author[:3]}).")
    if no_license:
        print(f"  ⚠ {len(no_license)} photo(s) sans licence identifiée (ex. {no_license[:3]}).")
    print(f"-> {os.path.relpath(PHOTOS_JS, ROOT)}")


if __name__ == "__main__":
    main()
