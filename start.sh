#!/usr/bin/env bash
set -euo pipefail

DIST_DIR="$(pwd)/dist"
mkdir -p "$DIST_DIR"

cat > "$DIST_DIR/env-config.js" <<EOF
window.__ENV = {
  API_URL: "${VITE_API_URL:-/api}",
  BACKEND_URL: "${BACKEND_URL:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

# start caddy with the Caddyfile in the repo root
exec caddy run --config /Caddyfile --adapter caddyfile
