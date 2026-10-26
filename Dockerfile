# syntax=docker/dockerfile:1
# Production image for the public site + customer portal (Next.js standalone).
# Build:  docker build --build-arg NEXT_PUBLIC_API_URL=https://api.<domain>/api -t g2h-customer .
# Run:    docker run -p 3002:3002 g2h-customer

# ---- deps: install with a cached, reproducible lockfile ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the standalone server bundle ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the real
# public API origin must be passed here (not at runtime). Defaults to a placeholder.
ARG NEXT_PUBLIC_API_URL=https://api.example.com/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- runner: minimal runtime, non-root ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# Standalone output: the traced server, then the static assets and public files beside it.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3002
CMD ["node", "server.js"]
