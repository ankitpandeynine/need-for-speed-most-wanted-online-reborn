#!/usr/bin/env bash
# Run Need for Speed: Most Wanted as a Native macOS Application (Apple Silicon Metal)

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================================="
echo " Launching Native macOS NFSMW (Apple Silicon Metal)"
echo "=========================================================="

APP_PATH="$ROOT_DIR/mw-recomp/build/stub/SpeedRecomp.app"

if [ ! -d "$APP_PATH" ]; then
    echo "Building native macOS SpeedRecomp.app..."
    cd "$ROOT_DIR/mw-recomp"
    PATH="$PWD/.venv/bin:$PATH" .venv/bin/python tools/build.py --stub
fi

echo "Opening $APP_PATH..."
open "$APP_PATH"
