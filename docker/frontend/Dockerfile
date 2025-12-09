FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN VITE_SUPABASE_URL='' VITE_SUPABASE_PUBLISHABLE_KEY='' npm run build

FROM nginx:stable-alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Ensure images dir exists; entrypoint will create/copy Alma101.png at runtime
RUN mkdir -p /usr/share/nginx/html/images

# Entrypoint script (already handles env-config.js + placeholder image)
COPY docker/frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]