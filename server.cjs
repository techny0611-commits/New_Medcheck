// Full Health Testing System Server
const { Hono } = require('hono');
const { serve } = require('@hono/node-server');

const app = new Hono();

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Health Testing and Sales Management System is running'
  });
});

// Serve the main React app
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת ניהול בדיקות</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@heroicons/react@2.0.0/24/outline/index.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Assistant', 'system-ui', 'sans-serif'] },
                    colors: {
                        pastel: {
                            mint: '#a3e4d7', pink: '#fbb6ce', purple: '#a78bfa',
                            blue: '#93c5fd', green: '#86efac', yellow: '#fde68a', gray: '#e2e8f0'
                        }
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="font-sans bg-gray-50 text-gray-900" dir="rtl">
    <div id="root">
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">
                    🏥 מערכת ניהול בדיקות רפואיות
                </h1>
                
                <div class="space-y-4">
                    <div class="text-center">
                        <p class="text-lg mb-6">ברוכים הבאים למערכת</p>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-bold text-blue-800 mb-2">💡 הערה</h3>
                        <p class="text-sm text-blue-700">
                            זוהי גרסת Docker פשוטה. המערכת המלאה כוללת:
                        </p>
                        <ul class="text-sm text-blue-600 mt-2 list-disc list-inside">
                            <li>מערכת לוגין עם Supabase</li>
                            <li>ניהול אירועים מלא</li>
                            <li>רישום עובדים</li>
                            <li>דוחות ותוצאות</li>
                            <li>חיבור MongoDB</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="font-bold text-green-800 mb-2">✅ סטטוס</h3>
                        <p class="text-sm text-green-700">
                            השרת פועל על פורט 3001<br>
                            MongoDB זמין על פורט 27017<br>
                            Redis זמין על פורט 6379
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
</body>
</html>
  `);
});

// All other routes serve the React app
app.get('*', (c) => {
  return c.redirect('/');
});

// Start server
const port = 3001;
serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
});

console.log(\`🚀 Health Testing System running on http://0.0.0.0:\${port}\`);
console.log(\`📋 Health check: http://0.0.0.0:\${port}/api/health\`);