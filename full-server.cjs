const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;

// Read the full React app from file
let reactAppContent = '';
try {
  reactAppContent = fs.readFileSync(path.join(__dirname, 'public/static/app.js'), 'utf8');
} catch (error) {
  console.log('React app file not found, using basic version');
}

// Serve files from public/static
function serveStaticFile(req, res, filePath) {
  const fullPath = path.join(__dirname, 'public', filePath);
  
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath);
    const contentTypes = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    const contentType = contentTypes[ext] || 'text/plain';
    const content = fs.readFileSync(fullPath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
  
  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Health Testing and Sales Management System is running',
      features: ['Authentication', 'Events', 'Users', 'Reports', 'MongoDB', 'React SPA']
    }));
    return;
  }
  
  // Serve static files
  if (pathname.startsWith('/static/')) {
    if (serveStaticFile(req, res, pathname)) {
      return;
    }
  }
  
  // API mock responses for development
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: 'API endpoint placeholder',
      endpoint: pathname,
      note: 'Full API integration in progress'
    }));
    return;
  }
  
  // Main React SPA page
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>מערכת ניהול בדיקות</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Heroicons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@heroicons/react@2.0.0/24/outline/index.css" />
    
    <!-- Custom CSS -->
    <link href="/static/style.css" rel="stylesheet" />
    
    <!-- Configure Tailwind for RTL -->
    <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                sans: ['Assistant', 'system-ui', 'sans-serif']
              },
              colors: {
                pastel: {
                  mint: '#a3e4d7',
                  pink: '#fbb6ce', 
                  purple: '#a78bfa',
                  blue: '#93c5fd',
                  green: '#86efac',
                  yellow: '#fde68a',
                  gray: '#e2e8f0'
                }
              }
            }
          }
        }
    </script>
    
    <!-- Hebrew Font -->
    <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body class="font-sans bg-gray-50 text-gray-900" dir="rtl">
    <div id="root"></div>
    
    <!-- React and ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Axios for HTTP requests -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    
    <!-- Main React App -->
    <script type="module" src="/static/app.js"></script>
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
  console.log(`🚀 FULL Health Testing System running on http://0.0.0.0:${PORT}`);
  console.log(`📋 Health: http://0.0.0.0:${PORT}/api/health`);
  console.log(`📱 React App: http://0.0.0.0:${PORT}/`);
  console.log(`📁 Static files: http://0.0.0.0:${PORT}/static/`);
  
  // Check if static files exist
  const staticDir = path.join(__dirname, 'public', 'static');
  if (fs.existsSync(staticDir)) {
    const files = fs.readdirSync(staticDir);
    console.log(`📂 Static files found: ${files.join(', ')}`);
  } else {
    console.log('⚠️  Static directory not found - creating...');
    fs.mkdirSync(staticDir, { recursive: true });
  }
});