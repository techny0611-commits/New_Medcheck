# Ultra Simple Dockerfile
FROM node:20-alpine

# Install PM2 and curl
RUN npm install -g pm2 && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy only what we need
COPY simple-server.cjs .
COPY ecosystem.config.cjs .

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