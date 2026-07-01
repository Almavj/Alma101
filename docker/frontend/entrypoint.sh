#!/bin/sh

# Create images directory
mkdir -p /usr/share/nginx/html/images

# Ensure Alma101.png exists
if [ ! -f "/usr/share/nginx/html/images/Alma101.png" ]; then
    echo "Creating/copying Alma101.png..."
    if [ -f "/usr/share/nginx/html/Alma101.png" ]; then
        cp /usr/share/nginx/html/Alma101.png /usr/share/nginx/html/images/Alma101.png
    elif [ -f "/usr/share/nginx/html/Alma101.jpg" ]; then
        cp /usr/share/nginx/html/Alma101.jpg /usr/share/nginx/html/images/Alma101.png
    else
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > /usr/share/nginx/html/images/Alma101.png
    fi
fi

# Create env-config.js from environment variables
cat > /usr/share/nginx/html/env-config.js << JS
window.__ENV__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY}",
  VITE_API_URL: "${VITE_API_URL}",
  VITE_SUPABASE_ADMIN_EMAIL: "${VITE_SUPABASE_ADMIN_EMAIL}"
};
JS

# Inject env-config.js into <head> of index.html BEFORE the module script
if ! grep -q 'env-config.js' /usr/share/nginx/html/index.html 2>/dev/null; then
  sed -i 's|</head>|    <script src="/env-config.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
fi
sed -i '/<body>/,/<\/body>/{/<script src="\/env-config.js"><\/script>/d;}' /usr/share/nginx/html/index.html

# Handle Render's PORT env var (default 80)
if [ -n "$PORT" ] && [ "$PORT" != "80" ]; then
  sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf
  EXPOSE_PORT=$PORT
else
  EXPOSE_PORT=80
fi

# Start nginx
exec nginx -g 'daemon off;'
