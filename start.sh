#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"

# Build if dist is missing (Railway may not run build step reliably)
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
  echo "dist missing or empty — running build"
  npm ci
  npm run build
fi

mkdir -p "$DIST_DIR"

cat > "$DIST_DIR/env-config.js" <<EOF
window.__ENV = {
  API_URL: "${VITE_API_URL:-/api}",
  BACKEND_URL: "${BACKEND_URL:-}",
  NODE_ENV: "${NODE_ENV:-production}"
};
EOF

HOST_PORT="${PORT:-80}"

if command -v caddy >/dev/null 2>&1; then
  exec caddy run --config /Caddyfile --adapter caddyfile
elif command -v docker >/dev/null 2>&1; then
  echo "caddy binary not found — launching caddy:2 container on host port ${HOST_PORT}"
  exec docker run --rm -p "${HOST_PORT}:80" \
    -v "$DIST_DIR":/srv/app/dist \
    -v "$ROOT_DIR/Caddyfile":/srv/app/Caddyfile \
    -w /srv/app \
    caddy:2 caddy run --config /srv/app/Caddyfile --adapter caddyfile
else
  echo "ERROR: neither 'caddy' nor 'docker' available. Install one or use Railway."
  exit 1
fi
