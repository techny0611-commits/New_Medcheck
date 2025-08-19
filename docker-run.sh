#!/bin/bash

# Docker Run Script למערכת ניהול בדיקות רפואיות
# מריץ את המערכת המלאה עם MongoDB

set -e

echo "🚀 מתחיל הפעלת מערכת ניהול בדיקות רפואיות עם Docker..."

# בדיקה אם Docker פועל
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker לא פועל. אנא הפעל את Docker ונסה שוב."
    exit 1
fi

# בדיקה אם Docker Compose קיים
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Docker Compose לא מותקן. אנא התקן Docker Compose."
    exit 1
fi

# יצירת קובץ .env אם לא קיים
if [ ! -f .env ]; then
    echo "📝 יוצר קובץ .env מהתבנית..."
    cp .env.docker .env
    echo "⚠️  אנא ערוך את קובץ .env עם הערכים הנכונים של Supabase!"
    echo "   פתח את .env ועדכן:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo ""
    read -p "האם ערכת את קובץ .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "אנא ערוך את קובץ .env והרץ את הסקריפט שוב."
        exit 1
    fi
fi

echo "📦 בונה Docker images..."
docker-compose build

echo "🗄️ מפעיל MongoDB..."
docker-compose up -d mongodb

echo "⏳ ממתין ל-MongoDB להיות מוכן..."
sleep 10

# בדיקה אם MongoDB פועל
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB מוכן!"
else
    echo "❌ MongoDB לא מוכן. בודק logs..."
    docker-compose logs mongodb
    exit 1
fi

echo "🚀 מפעיל את האפליקציה..."
docker-compose up -d webapp

echo "⏳ ממתין לאפליקציה להיות מוכנה..."
sleep 15

# בדיקת health check
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ האפליקציה פועלת בהצלחה!"
    echo ""
    echo "🌐 URLs זמינים:"
    echo "   - האפליקציה הראשית: http://localhost:3001"
    echo "   - בדיקת בריאות: http://localhost:3001/api/health"
    echo "   - MongoDB: mongodb://localhost:27017"
    echo ""
    echo "📊 לצפייה ב-logs:"
    echo "   docker-compose logs -f webapp"
    echo ""
    echo "🛑 לעצירת המערכת:"
    echo "   docker-compose down"
    echo ""
else
    echo "❌ האפליקציה לא מגיבה. בודק logs..."
    docker-compose logs webapp
    echo ""
    echo "💡 לפתרון בעיות, הרץ:"
    echo "   docker-compose logs webapp"
    echo "   docker-compose logs mongodb"
fi

# הצגת סטטוס
echo "📈 סטטוס containers:"
docker-compose ps