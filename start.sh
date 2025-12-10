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

# start Caddy if installed, otherwise start caddy in Docker, otherwise fail
if command -v caddy >/dev/null 2>&1; then
  exec caddy run --config /Caddyfile --adapter caddyfile
elif command -v docker >/dev/null 2>&1; then
  echo "caddy not found — launching caddy:2 container"
  exec docker run --rm -p 80:80 \
    -v "$PWD/dist":/srv/app/dist \
    -v "$PWD/Caddyfile":/Caddyfile \
    caddy:2 caddy run --config /Caddyfile --adapter caddyfile
else
  echo "ERROR: neither 'caddy' nor 'docker' available. Install one of them."
  exit 1
fi
