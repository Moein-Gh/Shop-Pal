FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client — DATABASE_URL only needs to be a valid URI at generate time
RUN DATABASE_URL=postgresql://localhost/dummy npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# ---- runner ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and generated Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma


EXPOSE 3001

CMD ["node", "dist/index.js"]
