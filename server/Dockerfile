FROM node:22-bookworm-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts tsconfig*.json index.ts ambient.d.ts ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
