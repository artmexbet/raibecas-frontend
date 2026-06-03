# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

COPY frontend/package.json ./
COPY frontend/bun.lock* ./
COPY frontend/tsconfig.json ./
COPY frontend/apps/admin-panel ./apps/admin-panel

RUN bun install

WORKDIR /app/apps/admin-panel

ARG BUN_PUBLIC_API_URL=http://localhost:8080
ENV BUN_PUBLIC_API_URL=${BUN_PUBLIC_API_URL}

RUN rm -rf dist && bun build ./src/index.html \
    --outdir=dist \
    --sourcemap \
    --target=browser \
    --minify \
    --define:process.env.NODE_ENV='"production"' \
    "--define:process.env.BUN_PUBLIC_API_URL=$(printf '"%s"' "$BUN_PUBLIC_API_URL")"

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/apps/admin-panel/dist /usr/share/nginx/html

# SPA fallback: all routes serve index.html
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
