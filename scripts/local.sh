#!/bin/sh
# Startet den lokalen Prod-Nachbau: Build → Artefakt → Apache/PHP 8.3 + Mailpit in Docker.
set -eu
cd "$(dirname "$0")/.."

if ! docker info >/dev/null 2>&1; then
  echo "Docker läuft nicht. Bitte Docker Desktop starten und erneut versuchen." >&2
  exit 1
fi

# Ports 8080 (Website) und 8025 (Mailpit) müssen frei sein – außer sie gehören bereits zu diesem Projekt
project=$(docker compose config --format json 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).name)}catch{console.log("")}})')
for port in 8080 8025; do
  owner=$(docker ps --filter "publish=$port" --format '{{.Names}}' | head -1)
  if [ -n "$owner" ] && [ "${owner#"$project"-}" = "$owner" ]; then
    echo "Port $port ist bereits belegt durch Container \"$owner\"." >&2
    echo "Bitte stoppen (z. B. 'docker stop $owner' oder 'pnpm local:down' im anderen Projektordner) und erneut starten." >&2
    exit 1
  fi
  if [ -z "$owner" ] && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port ist bereits durch ein anderes Programm belegt:" >&2
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >&2 || true
    exit 1
  fi
done

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
