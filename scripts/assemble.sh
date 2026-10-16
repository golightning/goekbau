#!/bin/sh
# Setzt das Deploy-Artefakt zusammen: statischer Next-Export + PHP-Endpoint + Server-Konfiguration.
# SITE_ENV=production entfernt Entwicklungsseiten (Styleguide) aus dem Artefakt.
set -eu
cd "$(dirname "$0")/.."
[ -f out/index.html ] || { echo "out/ fehlt – zuerst 'pnpm build' ausführen" >&2; exit 1; }
rm -rf dist/site
mkdir -p dist/site
cp -R out/. dist/site/
cp -R server/public/. dist/site/
if [ "${SITE_ENV:-development}" = "production" ]; then
  rm -rf dist/site/styleguide
  # Offene redaktionelle/rechtliche Punkte dürfen nie live gehen
  if grep -rl "⟦OFFEN" dist/site >/dev/null 2>&1; then
    echo "Abbruch: offene Platzhalter (⟦OFFEN …⟧) im Produktions-Artefakt:" >&2
    grep -rlo "⟦OFFEN" dist/site | sed 's/^/  /' >&2
    exit 1
  fi
fi
echo "Artefakt: dist/site (${SITE_ENV:-development})"
