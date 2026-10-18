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

# Optional: include pre-built web UI if present
COPY web/dist ./web/dist 2>/dev/null || true
COPY web/index.html ./web/index.html 2>/dev/null || true

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.mjs"]
