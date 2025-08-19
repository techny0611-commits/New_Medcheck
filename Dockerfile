# Simple Dockerfile for Health Testing System
FROM node:20-alpine

# Install PM2 and curl
RUN npm install -g pm2 && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Simple build - just create dist directory with working files
RUN mkdir -p dist && \
    cp -r src/* dist/ 2>/dev/null || true && \
    cp -r public/* dist/ 2>/dev/null || true

# Install minimal hono
RUN npm init -y && npm install hono@^4.0.0

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Run with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]