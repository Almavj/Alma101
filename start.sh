#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"

echo "START: $(date) - running start.sh in $ROOT_DIR"

# Build if dist missing or empty
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
  echo "dist missing or empty — installing and building"
  npm ci
  npm run build
fi

mkdir -p "$DIST_DIR"

# generate runtime env for the browser
cat > "$DIST_DIR/env-config.js" <<EOF
window.__ENV = {
  API_URL: "${VITE_API_URL:-/api}",
  BACKEND_URL: "${BACKEND_URL:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

echo "env-config.js generated:"
cat "$DIST_DIR/env-config.js"

# run caddy (Railway provides caddy in logs)
echo "Starting Caddy..."
exec caddy run --config /Caddyfile --adapter caddyfile
