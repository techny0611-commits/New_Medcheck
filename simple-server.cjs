const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

// Simple HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת ניהול בדיקות</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl font-bold text-blue-600 mb-6">🏥 מערכת ניהול בדיקות רפואיות</h1>
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold mb-4 text-green-600">✅ המערכת פועלת בהצלחה!</h2>
            <p class="text-lg mb-4">ברוכים הבאים למערכת ניהול בדיקות רפואיות ומכירות</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div class="bg-blue-50 p-6 rounded-lg">
                    <h3 class="font-bold text-blue-800 mb-2">👨‍💼 מנהלי מערכת</h3>
                    <p class="text-sm">ניהול אירועים, משתמשים ודוחות</p>
                </div>
                <div class="bg-green-50 p-6 rounded-lg">
                    <h3 class="font-bold text-green-800 mb-2">🔬 בודקים</h3>
                    <p class="text-sm">ניהול רשימות ותוצאות בדיקות</p>
                </div>
                <div class="bg-purple-50 p-6 rounded-lg">
                    <h3 class="font-bold text-purple-800 mb-2">👷‍♂️ עובדים</h3>
                    <p class="text-sm">רישום פשוט וזמינות זמנים</p>
                </div>
            </div>
            
            <div class="mt-8 p-4 bg-yellow-50 rounded-lg">
                <p class="text-yellow-800">🚀 המערכת מוכנה לשימוש עם MongoDB ו-Redis</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    // Health check
    if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            message: 'Health Testing and Sales Management System is running'
        }));
        return;
    }
    
    // Main page
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📋 Health check: http://0.0.0.0:${PORT}/api/health`);
});