#!/bin/sh
set -e

# Create runtime env config for the SPA from environment variables
# Use default empty string if not defined to avoid creating undefined tokens
: "${VITE_SUPABASE_URL:=}"
: "${VITE_SUPABASE_PUBLISHABLE_KEY:=}"
: "${VITE_BASE_PATH:=/}"

TEMPLATE=/usr/share/nginx/html/env-config.template.js
OUT=/usr/share/nginx/html/env-config.js

if [ -f "$TEMPLATE" ]; then
  echo "[entrypoint] Generating runtime env config at $OUT"
  # Replace placeholders with environment values and write to target
  /bin/sh -c "cat $TEMPLATE | envsubst > $OUT"
else
  echo "[entrypoint] Template $TEMPLATE not found, skipping env-config generation"
fi

# Start nginx in foreground
exec nginx -g 'daemon off;'
