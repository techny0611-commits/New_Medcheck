const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const PORT = 3001;

// MongoDB configuration
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/webapp?authSource=admin';
let db = null;

// Initialize MongoDB connection
async function connectDB() {
  if (!db) {
    try {
      const client = new MongoClient(MONGO_URI);
      await client.connect();
      db = client.db();
      console.log('Connected to MongoDB');
      
      // Create default admin user if no users exist
      await createDefaultAdmin();
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }
  return db;
}

// Create default admin user if database is empty
async function createDefaultAdmin() {
  try {
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    
    if (userCount === 0) {
      // Create default admin user
      const defaultAdmin = {
        _id: new ObjectId(),
        email: 'admin@health.system',
        name: 'מנהל מערכת',
        password: hashPassword('admin123'), // Default password
        role: 'admin',
        createdAt: new Date(),
        isActive: true
      };
      
      await usersCollection.insertOne(defaultAdmin);
      console.log('✅ Default admin user created:');
      console.log('📧 Email: admin@health.system');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Simple password hashing
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate JWT-like token (simple version for demonstration)
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify and decode token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
}

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
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(content);
    return true;
  }
  return false;
}

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`${new Date().toISOString()} - ${method} ${pathname}`);
  
  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Health Testing and Sales Management System is running',
      features: ['Authentication', 'Events', 'Users', 'Reports', 'MongoDB', 'React SPA'],
      mongodb: db ? 'Connected' : 'Disconnected'
    }));
    return;
  }

  // Authentication endpoints
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { email, password } = await parseBody(req);
      
      if (!email || !password) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרש מייל וסיסמה'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      
      if (!user || !verifyPassword(password, user.password)) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מייל או סיסמה שגויים'
        }));
        return;
      }

      if (!user.isActive) {
        res.writeHead(403, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'המשתמש לא פעיל'
        }));
        return;
      }

      const token = generateToken(user);
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: {
          token,
          user: userWithoutPassword
        }
      }));
      
    } catch (error) {
      console.error('Login error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית'
      }));
    }
    return;
  }

  // Get user profile
  if (pathname === '/api/auth/profile' && method === 'GET') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'לא מורשה'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (!decoded) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'טוקן לא תקין'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ 
        _id: new ObjectId(decoded.userId) 
      });
      
      if (!user) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'משתמש לא נמצא'
        }));
        return;
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: userWithoutPassword
      }));
      
    } catch (error) {
      console.error('Profile error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית'
      }));
    }
    return;
  }

  // Register new user (admin can register testers)
  if (pathname === '/api/auth/register' && method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'לא מורשה'
        }));
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (!decoded) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'טוקן לא תקין'
        }));
        return;
      }

      // Check if current user is admin
      const usersCollection = db.collection('users');
      const currentUser = await usersCollection.findOne({ 
        _id: new ObjectId(decoded.userId) 
      });
      
      if (!currentUser || currentUser.role !== 'admin') {
        res.writeHead(403, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרשות הרשאות מנהל'
        }));
        return;
      }

      const { email, name, password, role } = await parseBody(req);
      
      if (!email || !name || !password) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרש מייל, שם וסיסמה'
        }));
        return;
      }

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ 
        email: email.toLowerCase() 
      });
      
      if (existingUser) {
        res.writeHead(409, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'משתמש עם מייל זה כבר קיים'
        }));
        return;
      }

      const newUser = {
        _id: new ObjectId(),
        email: email.toLowerCase(),
        name,
        password: hashPassword(password),
        role: role || 'tester',
        createdAt: new Date(),
        isActive: true
      };

      await usersCollection.insertOne(newUser);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: userWithoutPassword,
        message: 'משתמש נוצר בהצלחה'
      }));
      
    } catch (error) {
      console.error('Registration error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית'
      }));
    }
    return;
  }

  // Serve static files
  if (pathname.startsWith('/static/')) {
    if (serveStaticFile(req, res, pathname)) {
      return;
    }
  }
  
  // Other API endpoints (placeholders for now)
  if (pathname.startsWith('/api/')) {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      success: true,
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
              colors: {
                'pastel-mint': '#E8F5E8',
                'pastel-blue': '#E8F4FD',
                'pastel-pink': '#FDE8F4',
                'pastel-yellow': '#FDF4E8',
                'pastel-purple': '#F4E8FD',
                'pastel-orange': '#FDF0E8',
                'pastel-green': '#E8FDF0',
                'pastel-teal': '#E8FDFA',
                'soft-mint': '#B8E6B8',
                'soft-blue': '#B8E0F8',
                'soft-pink': '#F8B8E0',
                'soft-yellow': '#F8E0B8',
                'soft-purple': '#E0B8F8',
                'soft-orange': '#F8D0B8',
                'soft-green': '#B8F8D0',
                'soft-teal': '#B8F8F0'
              }
            }
          }
        }
    </script>
    
    <!-- React and ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Axios for HTTP requests -->
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    
    <!-- Lodash utilities -->
    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
    
    <!-- Day.js for date handling -->
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/customParseFormat.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/he.min.js"></script>
    
    <!-- Chart.js for analytics -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
      .glass-effect {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .hover-lift {
        transition: transform 0.2s ease;
      }
      
      .hover-lift:hover {
        transform: translateY(-2px);
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #B8E6B8, #B8E0F8);
        color: #1f2937;
        border: none;
        transition: all 0.3s ease;
      }
      
      .btn-primary:hover {
        background: linear-gradient(135deg, #A0D8A0, #A0D0F0);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .form-input {
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
      }
      
      .form-input:focus {
        border-color: #B8E6B8;
        box-shadow: 0 0 0 3px rgba(184, 230, 184, 0.1);
        outline: none;
      }
      
      .focus-ring:focus {
        box-shadow: 0 0 0 3px rgba(184, 230, 184, 0.3);
        border-color: #B8E6B8;
        outline: none;
      }

      /* Admin Info Banner Styles */
      .admin-info-banner {
        background: linear-gradient(135deg, #FDF4E8, #F8D0B8);
        border: 2px solid #F8D0B8;
        border-radius: 12px;
        padding: 16px;
        margin: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: slideDown 0.5s ease-out;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .admin-credentials {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        padding: 12px;
        font-family: 'Courier New', monospace;
        direction: ltr;
        text-align: left;
      }
    </style>
</head>
<body class="bg-gradient-to-br from-pastel-mint via-pastel-blue to-pastel-pink min-h-screen">
    <!-- Admin Info Banner -->
    <div class="admin-info-banner">
        <div class="flex items-start space-x-3 rtl:space-x-reverse">
            <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                    🔐 פרטי התחברות למנהל המערכת
                </h3>
                <p class="text-gray-700 mb-3">
                    נוצר משתמש מנהל ראשוני במערכת. אנא השתמשו בפרטים הבאים להתחברות:
                </p>
                <div class="admin-credentials">
                    <div class="mb-2">
                        <strong>📧 Email:</strong> admin@health.system
                    </div>
                    <div class="mb-2">
                        <strong>🔑 Password:</strong> admin123
                    </div>
                </div>
                <div class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p class="text-sm text-yellow-800">
                        <strong>⚠️ חשוב:</strong> אנא שנו את הסיסמה לאחר ההתחברות הראשונה למערכת לצורכי אבטחה.
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <div id="root"></div>
    
    <!-- Load React application -->
    <script src="/static/app.js"></script>
    
    <script>
        // Initialize Day.js
        if (typeof dayjs !== 'undefined') {
            dayjs.extend(dayjs_plugin_relativeTime);
            dayjs.extend(dayjs_plugin_customParseFormat);
            dayjs.locale('he');
        }
        
        // Initialize React app
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
            const root = ReactDOM.createRoot(document.getElementById('root'));
            if (typeof App !== 'undefined') {
                root.render(React.createElement(App));
            } else {
                root.render(React.createElement('div', {
                    className: 'flex items-center justify-center min-h-screen'
                }, React.createElement('div', {
                    className: 'text-center'
                }, [
                    React.createElement('h1', {
                        key: 'title',
                        className: 'text-2xl font-bold text-gray-900 mb-4'
                    }, 'מערכת ניהול בדיקות'),
                    React.createElement('p', {
                        key: 'loading',
                        className: 'text-gray-600'
                    }, 'טוען את האפליקציה...')
                ])));
            }
        }
    </script>
</body>
</html>`;

  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
});

// Initialize database connection and start server
connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Health Testing and Sales Management System running on port ${PORT}`);
    console.log(`📱 Access at: http://localhost:${PORT}`);
    console.log(`🌐 Docker access at: http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('🔐 Default Admin Credentials:');
    console.log('📧 Email: admin@health.system'); 
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');
    console.log('');
    console.log('📊 Features: Authentication, Events, Users, Reports, MongoDB, React SPA');
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});