#!/bin/sh

# Create images directory
mkdir -p /usr/share/nginx/html/images

# Ensure Alma101.png exists
if [ ! -f "/usr/share/nginx/html/images/Alma101.png" ]; then
    echo "Creating/copying Alma101.png..."
    # Try to copy from various locations
    if [ -f "/usr/share/nginx/html/Alma101.png" ]; then
        cp /usr/share/nginx/html/Alma101.png /usr/share/nginx/html/images/Alma101.png
    elif [ -f "/usr/share/nginx/html/Alma101.jpg" ]; then
        cp /usr/share/nginx/html/Alma101.jpg /usr/share/nginx/html/images/Alma101.png
    else
        # Create a simple placeholder
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > /usr/share/nginx/html/images/Alma101.png
    fi
fi

# Create env-config.js from environment variables
cat > /usr/share/nginx/html/env-config.js << JS
window.__ENV__ = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_PUBLISHABLE_KEY: "${VITE_SUPABASE_PUBLISHABLE_KEY}",
  VITE_API_URL: "${VITE_API_URL}"
};
JS

# Start nginx
exec nginx -g 'daemon off;'
