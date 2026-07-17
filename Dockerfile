# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm ci --legacy-peer-deps && npm run build

# Production Stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy only the compiled client assets and server code
COPY --from=builder /app/dist ./dist
COPY src/server/ ./server/

# Create a non-root user for security
RUN addgroup -S nodeuser && adduser -S nodeuser -G nodeuser
USER nodeuser

EXPOSE 8080
ENV PORT=8080

CMD ["node", "server/index.js"]
