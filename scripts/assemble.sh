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
fi
echo "Artefakt: dist/site (${SITE_ENV:-development})"
