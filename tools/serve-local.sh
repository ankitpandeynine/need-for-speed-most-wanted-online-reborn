#!/usr/bin/env bash
# Local Optimized High-Performance Game Server for NFSMW Browser Edition
# Serves the compiled WebAssembly engine and 2.9 GB retail assets with zero latency

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${1:-8000}"

echo "=========================================================="
echo " Starting Local NFSMW Game Server (Port $PORT)"
echo "=========================================================="

cd "$ROOT_DIR/mw-recomp"

if [ ! -d "original/retail" ]; then
    echo "Linking retail game folder..."
    .venv/bin/python tools/setup.py --install "/Users/ankit/Downloads/ga/Need For Speed Most Wanted Black Edition" --link-only
fi

echo "Launching optimized local streaming server with COOP/COEP headers..."
.venv/bin/python kit/tools/web_launcher.py \
    --game-dir "$ROOT_DIR/mw-recomp" \
    --web-build "nfsmw=$ROOT_DIR/mw-recomp/build/web-stub/recomp" \
    --asset-dir "nfsmw=/Users/ankit/Downloads/ga/Need For Speed Most Wanted Black Edition" \
    --out "$ROOT_DIR/mw-recomp/build/local-site" \
    --serve "$PORT"
