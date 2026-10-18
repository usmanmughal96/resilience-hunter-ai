# ResilienceHunter AI – production image (Cloud Run / any container host)
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy server code
COPY server/ ./server/
COPY data/ ./data/
COPY tests/ ./tests/

# Include web UI entry (server falls back to inline HTML / web/ if dist is absent)
COPY web/index.html ./web/index.html

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.mjs"]
