FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY ./frontend/package*.json ./
RUN npm install

# Copy all source files
COPY ./frontend/ .

# Build the app (env vars will be injected at runtime via entrypoint)
RUN VITE_SUPABASE_URL='' VITE_SUPABASE_PUBLISHABLE_KEY='' npm run build

FROM nginx:stable-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Create images directory
RUN mkdir -p /usr/share/nginx/html/images

# Try to copy the image from build context
COPY --from=build /app/src/assets/Alma101.png /usr/share/nginx/html/images/Alma101.png 2>/dev/null || \
echo "Note: Alma101.png not found in build, will be created at runtime"

# Entrypoint script
COPY docker/frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
