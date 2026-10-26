#!/bin/sh
# PHP-Werkzeuge ohne lokale PHP-Installation – alles läuft in denselben, per Digest gepinnten Images wie die CI.
#   sh scripts/php.sh install   Composer-Abhängigkeiten (inkl. PHPUnit) nach server/vendor
#   sh scripts/php.sh test      PHPUnit im PHP-8.3-Image des Prod-Nachbaus
set -eu
cd "$(dirname "$0")/.."
COMPOSER_IMAGE="composer@sha256:b6dcd72ca98fa19d0e5b8476de179859704891fad06dd9e0b96833d4c430a5fc"

case "${1:-}" in
  install)
    docker run --rm -u "$(id -u):$(id -g)" -e COMPOSER_HOME=/tmp/composer -v "$PWD/server:/app" -w /app "$COMPOSER_IMAGE" \
      composer install --no-interaction --no-progress --ignore-platform-req=ext-gd --ignore-platform-req=ext-zip
    ;;
  test)
    [ -f server/vendor/autoload.php ] || sh "$0" install
    docker build -q -t goekbau-php docker/web >/dev/null
    docker run --rm -v "$PWD:/repo" -w /repo/server goekbau-php php vendor/bin/phpunit --no-progress
    ;;
  *)
    echo "Aufruf: sh scripts/php.sh install|test" >&2
    exit 1
    ;;
esac
