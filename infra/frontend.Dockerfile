# Multi-stage Dockerfile untuk Frontend Next.js
FROM node:24-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci

# Runtime dependencies exclude build tools and test packages.
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
RUN npm ci --omit=dev

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY shared ./shared
COPY frontend ./frontend

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG SITE_URL
ENV SITE_URL=$SITE_URL
ARG API_INTERNAL_URL=http://backend:4000/api/v1
ENV API_INTERNAL_URL=$API_INTERNAL_URL

RUN npm run build --workspace=@konter/frontend

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

COPY --chown=node:node --from=builder /app/frontend/public ./frontend/public
COPY --chown=node:node --from=builder /app/frontend/.next ./frontend/.next
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node --from=builder /app/frontend/package.json ./frontend/package.json
COPY --chown=node:node --from=builder /app/frontend/next.config.mjs ./frontend/next.config.mjs
COPY --chown=node:node --from=builder /app/shared ./shared
COPY --chown=node:node infra/check-frontend-runtime.mjs ./infra/check-frontend-runtime.mjs

EXPOSE 3000

USER node
CMD ["npm", "run", "start", "--workspace=@konter/frontend"]

