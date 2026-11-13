FROM node:24-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY next.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && chown -R node:node .next

ENV NODE_ENV=production
EXPOSE 3000
USER node

CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]
