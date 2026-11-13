FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npm run prisma:generate

COPY src ./src
COPY database ./database
COPY scripts ./scripts

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
USER node

CMD ["node", "src/server.js"]
