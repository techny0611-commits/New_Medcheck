# Dockerfile למערכת ניהול בדיקות רפואיות
FROM node:18-alpine

# התקן PM2 גלובלית
RUN npm install -g pm2

# יצירת ספריית עבודה
WORKDIR /app

# העתקת package files
COPY package*.json ./
COPY wrangler.jsonc ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# התקנת dependencies
RUN npm ci

# התקנת Wrangler לצורך development
RUN npm install -g wrangler

# העתקת קבצי המקור
COPY src/ ./src/
COPY public/ ./public/
COPY ecosystem.config.cjs ./

# בניית הפרויקט
RUN npm run build

# יצירת משתמש non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# שינוי הבעלות על הקבצים
RUN chown -R nodejs:nodejs /app
USER nodejs

# פריצת פורט
EXPOSE 3001

# הגדרת health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# הפעלה עם PM2
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]