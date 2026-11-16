# Multi-stage Dockerfile untuk Backend Express
FROM node:24-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
RUN npm ci --omit=dev

# Runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node shared ./shared
COPY --chown=node:node backend ./backend
RUN mkdir -p /app/uploads && chown node:node /app/uploads

EXPOSE 4000

USER node
CMD ["node", "backend/src/server.js"]

