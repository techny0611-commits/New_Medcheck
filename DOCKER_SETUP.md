# 🐳 הפעלת המערכת עם Docker

מדריך מפורט להפעלת **מערכת ניהול בדיקות רפואיות ומכירות** באמצעות Docker.

## 📋 דרישות מוקדמות

### 1. התקנת Docker
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# macOS (עם Homebrew)
brew install --cask docker

# Windows
# הורד Docker Desktop מ: https://www.docker.com/products/docker-desktop
```

### 2. הגדרת Supabase (חובה!)
לפני הפעלת המערכת, צריך ליצור פרויקט Supabase:

1. **צור חשבון ב-Supabase**: https://supabase.com
2. **צור פרויקט חדש** ורשום:
   - `Project URL` (משהו כמו: https://abcdefghijk.supabase.co)
   - `anon/public key` מהגדרות API
3. **הפעל Google OAuth** (אופציונלי אך מומלץ):
   - עבור ל-Authentication → Providers
   - הפעל Google Provider
   - הוסף Google OAuth credentials

## 🚀 הפעלה מהירה

### אופציה 1: באמצעות Script אוטומטי (מומלץ)
```bash
# Clone הפרויקט
git clone <repository-url>
cd webapp

# הפעלה אוטומטית
./docker-run.sh
```

### אופציה 2: צעדים ידניים

#### 1. הכנת Environment Variables
```bash
# העתק קובץ התבנית
cp .env.docker .env

# ערוך את .env עם הערכים שלך
nano .env  # או vim/code .env
```

#### 2. עדכון ערכי Supabase בקובץ .env
```bash
# החלף את הערכים עם הערכים האמיתיים שלך
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_real_anon_key_here

# אופציונלי - הגדרות SMTP
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

#### 3. בניה והפעלה
```bash
# בניית הcontainers
docker-compose build

# הפעלה
docker-compose up -d

# בדיקת סטטוס
docker-compose ps
```

## 🔧 פקודות ניהול

### הפעלה ועצירה
```bash
# הפעלה
docker-compose up -d

# עצירה
docker-compose down

# עצירה עם מחיקת volumes
docker-compose down -v

# הפעלה מחדש
docker-compose restart webapp
```

### מעקב ו-Debugging
```bash
# צפייה ב-logs
docker-compose logs webapp
docker-compose logs mongodb

# logs בזמן אמת
docker-compose logs -f webapp

# כניסה לcontainer
docker-compose exec webapp sh
docker-compose exec mongodb mongosh
```

### גיבוי ושחזור
```bash
# גיבוי MongoDB
docker-compose exec mongodb mongodump --db webapp --out /data/backup

# שחזור MongoDB
docker-compose exec mongodb mongorestore /data/backup
```

## 🌐 URLs זמינים

לאחר ההפעלה, המערכת תהיה זמינה ב:

- **🏠 דף הבית**: http://localhost:3001
- **🔍 בדיקת בריאות**: http://localhost:3001/api/health
- **📊 API Docs**: http://localhost:3001/api (JSON responses)
- **🗄️ MongoDB**: mongodb://localhost:27017
- **📧 Redis** (אופציונלי): redis://localhost:6379

## 📁 מבנה הפרויקט עם Docker

```
webapp/
├── Dockerfile                 # הגדרות בניית האפליקציה
├── docker-compose.yml        # הגדרות כל השירותים
├── docker-run.sh            # Script הפעלה אוטומטי
├── mongo-init.js            # אתחול MongoDB
├── .env.docker              # תבנית Environment Variables
├── .dockerignore            # קבצים שלא נכנסים לDocker
└── DOCKER_SETUP.md          # המדריך הזה
```

## 🛠 פתרון בעיות נפוצות

### בעיה: אפליקציה לא מגיבה
```bash
# בדוק logs
docker-compose logs webapp

# בדוק אם MongoDB פועל
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# הפעל מחדש
docker-compose restart webapp
```

### בעיה: Port בשימוש
```bash
# מצא מה משתמש בפורט
sudo lsof -i :3001

# או שנה פורט בdocker-compose.yml
ports:
  - "3002:3001"  # שנה ל-3002
```

### בעיה: בעיות permissions
```bash
# תן הרשאות לdocker
sudo usermod -aG docker $USER
# התחבר מחדש לטרמינל
```

### בעיה: MongoDB לא מתחבר
```bash
# בדוק MongoDB logs
docker-compose logs mongodb

# איפוס MongoDB
docker-compose down
docker volume rm webapp_mongodb_data
docker-compose up -d
```

## 🔒 אבטחה והגדרות Production

### לשימוש ב-Production:
1. **שנה סיסמאות**: עדכן סיסמאות MongoDB בdocker-compose.yml
2. **SSL/HTTPS**: הוסף reverse proxy (nginx/traefik)
3. **Firewall**: חסום גישה ישירה ל-MongoDB (27017)
4. **Backup**: הגדר גיבויים אוטומטיים
5. **Monitoring**: הוסף monitoring (Prometheus/Grafana)

### קובץ docker-compose.prod.yml לProduction:
```yaml
version: '3.8'
services:
  webapp:
    build: .
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:STRONG_PASSWORD@mongodb:27017/webapp?authSource=admin
    # הוסף SSL certificates, nginx, monitoring...
```

## 📊 Monitoring ו-Health Checks

המערכת כוללת health checks מובנים:

```bash
# בדיקה ידנית
curl http://localhost:3001/api/health

# health check אוטומטי של Docker
docker-compose ps  # מציג health status
```

## 🚀 Production Deployment

לפריסה ב-Production עם Docker:

```bash
# Clone בשרת
git clone <repo> && cd webapp

# הגדר production environment
cp .env.docker .env.prod
# ערוך .env.prod עם הגדרות production

# הפעל עם production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# הגדר reverse proxy (nginx)
# הגדר SSL certificates
# הגדר monitoring
```

## 💡 Tips ו-Best Practices

1. **Resources**: הגדר memory/CPU limits בproduction
2. **Logs**: הפנה logs לmount volume או external service
3. **Backup**: גבה MongoDB בקביעות
4. **Updates**: השתמש בtags גרסאות ולא latest
5. **Security**: השתמש בDocker secrets לסיסמאות רגישות

---

**המערכת מוכנה לשימוש מלא עם Docker!** 🎉

לתמיכה נוספת או בעיות, בדוק את ה-logs או פנה לתיעוד הטכני במערכת.