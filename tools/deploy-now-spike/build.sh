#!/bin/sh
set -eu
cd "$(dirname "$0")/../.."
# Eigenes Artefakt: weder WordPress-Export noch Repository-Dateien veröffentlichen.
mkdir -p dist/deploy-now-spike
cp -R tools/deploy-now-spike/public/. dist/deploy-now-spike/
echo 'Spike-Artefakt: dist/deploy-now-spike'
