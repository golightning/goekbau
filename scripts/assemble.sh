#!/bin/sh
# Setzt das Deploy-Artefakt zusammen: statischer Next-Export + PHP-Endpoint + Server-Konfiguration.
# SITE_ENV=production entfernt Entwicklungsseiten (Styleguide) und bricht bei ⟦OFFEN⟧-Platzhaltern ab.
set -eu
cd "$(dirname "$0")/.."
[ -f out/index.html ] || { echo "out/ fehlt – zuerst 'pnpm build' ausführen" >&2; exit 1; }
COMPOSER_IMAGE="composer@sha256:af98f42dfff7c68ba8d53c2164fd9fde1087b7d449514baa38c418b1f6bc4bac"

rm -rf dist/site
mkdir -p dist/site/_app/app
cp -R out/. dist/site/
cp -R server/public/. dist/site/

# PHP-Anwendung (gesperrt per .htaccess) mit Produktions-Abhängigkeiten ohne Dev-Pakete
cp -R server/app/. dist/site/_app/app/
cp shared/forms.json dist/site/_app/app/forms.json
cp server/composer.json server/composer.lock dist/site/_app/
docker run --rm -u "$(id -u):$(id -g)" -e COMPOSER_HOME=/tmp/composer -v "$PWD/dist/site/_app:/app" -w /app "$COMPOSER_IMAGE" \
  composer install --no-dev --no-interaction --no-progress --optimize-autoloader --classmap-authoritative \
  --ignore-platform-req=ext-gd --ignore-platform-req=ext-zip -q
rm -f dist/site/_app/composer.json dist/site/_app/composer.lock dist/site/_app/app/config.local.php
printf 'Require all denied\n' > dist/site/_app/.htaccess

# Weiterleitungen alter URLs (legacy-url-redirects)
node scripts/write-htaccess.ts dist/site

# Hash-basierte CSP je Seite und Artefakt-Prüfung (web-security, email-security)
node scripts/csp-hash.mjs dist/site
node scripts/check-artifact.mjs dist/site

if [ "${SITE_ENV:-development}" != "production" ]; then
  # seo-metadata „Staging nicht indexierbar“
  printf '\n<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n' >> dist/site/.htaccess
fi
if [ "${SITE_ENV:-development}" = "production" ]; then
  rm -rf dist/site/styleguide
  # Offene redaktionelle/rechtliche Punkte dürfen nie live gehen
  if grep -rl "⟦OFFEN" dist/site --include='*.html' --include='*.txt' >/dev/null 2>&1; then
    echo "Abbruch: offene Platzhalter (⟦OFFEN …⟧) im Produktions-Artefakt:" >&2
    grep -rl "⟦OFFEN" dist/site --include='*.html' --include='*.txt' | sed 's/^/  /' >&2
    exit 1
  fi
fi
echo "Artefakt: dist/site (${SITE_ENV:-development})"
