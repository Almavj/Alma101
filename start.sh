# ...existing code...
#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$ROOT_DIR/dist"
BACKEND_PUBLIC="$ROOT_DIR/backend/public"
echo "START: $(date) - running start.sh in $ROOT_DIR"
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null || true)" ]; then
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
echo "env-config.js generated:"
cat "$DIST_DIR/env-config.js"
echo "Copying dist/ into backend/public/"
mkdir -p "$BACKEND_PUBLIC"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$DIST_DIR"/ "$BACKEND_PUBLIC"/
else
  cp -a "$DIST_DIR"/. "$BACKEND_PUBLIC"/
fi
echo "Copied dist -> backend/public"
# Start Caddy (prefer binary), fallback to docker container
if command -v caddy >/dev/null 2>&1; then
  exec caddy run --config /Caddyfile --adapter caddyfile
elif command -v docker >/dev/null 2>&1; then
  HOST_PORT="${PORT:-80}"
  exec docker run --rm -p "${HOST_PORT}:80" -v "$DIST_DIR":/srv/app/dist -v "$ROOT_DIR/Caddyfile":/srv/app/Caddyfile -w /srv/app caddy:2 caddy run --config /srv/app/Caddyfile --adapter caddyfile
else
  echo "ERROR: neither 'caddy' nor 'docker' available."
  exit 1
fi
# ...existing code...