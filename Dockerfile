# ResilienceHunter AI – production image
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application code
COPY server/ ./server/
COPY data/ ./data/
COPY web/ ./web/

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/index.mjs"]
