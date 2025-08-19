# 🐳 Docker Quick Start

## הפעלה מהירה עם Docker

### 1. הכנת הפרויקט
```bash
git clone <repository-url>
cd webapp
```

### 2. הגדרת Supabase (חובה!)
```bash
# העתק תבנית environment
cp .env.docker .env

# ערוך .env עם פרטי Supabase שלך
nano .env
```

**עדכן בקובץ .env:**
- `SUPABASE_URL=https://your-project.supabase.co`
- `SUPABASE_ANON_KEY=your_anon_key_here`

### 3. הפעלה
```bash
# אוטומטי
./docker-run.sh

# או ידני
docker-compose up -d
```

### 4. גישה למערכת
- **האפליקציה**: http://localhost:3001
- **בדיקת בריאות**: http://localhost:3001/api/health

## 🔧 פקודות בסיסיות

```bash
# הפעלה
docker-compose up -d

# עצירה  
docker-compose down

# לוגים
docker-compose logs webapp

# סטטוס
docker-compose ps
```

## ⚠️ לפני שמתחילים

1. **Docker מותקן** - וודא שDocker פועל
2. **Supabase פרויקט** - צור פרויקט ב-https://supabase.com
3. **פורט 3001 פנוי** - וודא שהפורט לא בשימוש

---

**לתיעוד מלא ראה**: [DOCKER_SETUP.md](DOCKER_SETUP.md)