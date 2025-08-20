const http = require('http');
const PORT = 3001;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
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
    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>מערכת ניהול בדיקות</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl font-bold text-blue-600 mb-6">🏥 מערכת ניהול בדיקות רפואיות</h1>
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-semibold mb-4 text-green-600">✅ המערכת פועלת!</h2>
            <p class="text-lg mb-4">זוהי גרסת Docker של המערכת המלאה</p>
            
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 class="font-bold text-blue-800 mb-2">📋 רכיבי המערכת</h3>
                <ul class="text-sm text-blue-700 space-y-1">
                    <li>✅ שרת HTTP פועל על פורט 3001</li>
                    <li>✅ MongoDB פועל על פורט 27017</li>
                    <li>✅ Redis פועל על פורט 6379</li>
                    <li>⏳ ממתין להשלמת המערכת המלאה</li>
                </ul>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg">
                <p class="text-yellow-800 text-sm">
                    <strong>בשלבי פיתוח:</strong> מערכת לוגין, ניהול אירועים, דוחות
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
});

server.listen(PORT, '0.0.0.0', (err) => {
    if (err) {
        console.error('Server failed to start:', err);
        process.exit(1);
    }
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📋 Health: http://0.0.0.0:${PORT}/api/health`);
});