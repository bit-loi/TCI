# ===== Stage 1: Install dependencies =====
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# ===== Stage 2: Production =====
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules

COPY . .

USER appuser

EXPOSE 3000

CMD ["node", "src/index.js"]
