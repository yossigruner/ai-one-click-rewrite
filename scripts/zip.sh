#!/usr/bin/env bash
set -euo pipefail
OUT=dist
NAME=one-click-rewrite
rm -rf "$OUT"
mkdir -p "$OUT"
zip -r "$OUT/$NAME.zip" manifest.json background.js content.js panel.html panel.js options.html options.js providers
echo "Wrote $OUT/$NAME.zip"