# Stage 1: Install dependencies
FROM oven/bun:1 AS builder

WORKDIR /app

COPY frontend/package.json ./
COPY frontend/bun.lock* ./
COPY frontend/tsconfig.json ./
COPY frontend/apps/user-app ./apps/user-app

RUN bun install

# Stage 2: Run Bun server (serves static + proxies /api/v1/* to gateway)
FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-app ./apps/user-app

WORKDIR /app/apps/user-app

ENV NODE_ENV=production
ENV API_URL=http://gateway:8080

EXPOSE 3002

CMD ["bun", "run", "src/index.ts"]
