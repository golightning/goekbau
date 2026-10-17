#!/bin/sh
# Startet den lokalen Prod-Nachbau: Build → Artefakt → Apache/PHP 8.3 + Mailpit in Docker.
set -eu
cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker läuft nicht. Bitte Docker Desktop starten und erneut versuchen." >&2
  exit 1
fi

pnpm build
pnpm assemble
docker compose up -d --build --wait

cat <<'INFO'

  ✔ Lokale Umgebung läuft

    Website      http://localhost:8080
    Mailpit      http://localhost:8025   (alle Formular-Mails landen hier, nichts geht nach außen)
    Styleguide   http://localhost:8080/styleguide/

    Tests        pnpm check        (alles: Lint, Typen, Unit, PHP, E2E)
    Stoppen      pnpm local:down
INFO
