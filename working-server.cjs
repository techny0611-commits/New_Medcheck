const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

const PORT = process.env.PORT || 3001;

// MongoDB configuration - will work with Docker or external MongoDB
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/webapp?authSource=admin';
let db = null;
let client = null;

// Initialize MongoDB connection
async function connectDB() {
  if (!db) {
    try {
      client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        connectTimeoutMS: 5000
      });
      await client.connect();
      db = client.db();
      console.log('✅ Connected to MongoDB successfully');
      
      // Initialize collections and indexes
      await initializeDatabase();
      
      // Create default admin user if no users exist
      await createDefaultAdmin();
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      // Continue without database - will show appropriate errors to user
    }
  }
  return db;
}

// Initialize database collections and indexes
async function initializeDatabase() {
  try {
    if (!db) return;

    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('events').createIndex({ eventDate: 1 });
    await db.collection('events').createIndex({ status: 1 });
    await db.collection('employees').createIndex({ eventId: 1 });
    await db.collection('employees').createIndex({ email: 1 });
    
    console.log('📊 Database indexes created');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Create default admin user and sample data if database is empty
async function createDefaultAdmin() {
  try {
    if (!db) return;
    
    const usersCollection = db.collection('users');
    const eventsCollection = db.collection('events');
    const settingsCollection = db.collection('settings');
    
    const userCount = await usersCollection.countDocuments();
    
    if (userCount === 0) {
      // Create default admin
      const defaultAdmin = {
        _id: new ObjectId(),
        email: 'admin@health.system',
        name: 'מנהל מערכת',
        password: hashPassword('admin123'),
        role: 'admin',
        createdAt: new Date(),
        isActive: true
      };
      
      await usersCollection.insertOne(defaultAdmin);
      console.log('👤 Default admin user created');
      
      // Create sample testers
      const testers = [
        {
          _id: new ObjectId(),
          email: 'tester1@health.system',
          name: 'בודק ראשון',
          password: hashPassword('tester123'),
          role: 'tester',
          createdAt: new Date(),
          isActive: true
        },
        {
          _id: new ObjectId(),
          email: 'tester2@health.system',
          name: 'בודק שני',
          password: hashPassword('tester123'),
          role: 'tester',
          createdAt: new Date(),
          isActive: true
        }
      ];
      
      await usersCollection.insertMany(testers);
      console.log('👥 Sample testers created');
      
      // Create sample events
      const sampleEvents = [
        {
          _id: new ObjectId(),
          eventName: 'בדיקות בריאות - חברת ABC',
          eventDate: new Date(),
          location: 'תל אביב, רחוב דיזנגוף 123',
          description: 'בדיקות בריאות שנתיות לעובדי החברה',
          status: 'completed',
          maxCapacity: 50,
          testDuration: 30,
          breakBetweenTests: 5,
          dailyBreaks: [
            { startTime: '10:00', endTime: '10:15', description: 'הפסקת בוקר' },
            { startTime: '13:00', endTime: '14:00', description: 'הפסקת צהריים' }
          ],
          questions: [
            { question: 'האם אתה צם 12 שעות?', type: 'boolean', required: true },
            { question: 'האם יש לך אלרגיות ידועות?', type: 'text', required: false }
          ],
          registrationDesign: {
            primaryColor: '#4F46E5',
            backgroundColor: '#F8FAFC',
            headerText: 'רישום לבדיקות בריאות',
            logoUrl: ''
          },
          totalRegistered: 45,
          totalTested: 42,
          totalRevenue: 12600,
          createdAt: new Date(Date.now() - 7*86400000)
        },
        {
          _id: new ObjectId(),
          eventName: 'יום בדיקות - משרדי ממשלה',
          eventDate: new Date(Date.now() + 86400000),
          location: 'ירושלים, קריית הממשלה',
          description: 'בדיקות בריאות לעובדי משרדי הממשלה',
          status: 'planned',
          maxCapacity: 40,
          testDuration: 25,
          breakBetweenTests: 5,
          dailyBreaks: [
            { startTime: '11:00', endTime: '11:15', description: 'הפסקה' },
            { startTime: '13:30', endTime: '14:30', description: 'צהריים' }
          ],
          questions: [
            { question: 'מספר זהות', type: 'text', required: true },
            { question: 'מספר טלפון', type: 'phone', required: true }
          ],
          registrationDesign: {
            primaryColor: '#059669',
            backgroundColor: '#ECFDF5',
            headerText: 'רישום לבדיקות - משרדי ממשלה',
            logoUrl: ''
          },
          totalRegistered: 38,
          totalTested: 0,
          totalRevenue: 0,
          createdAt: new Date(Date.now() - 3*86400000)
        },
        {
          _id: new ObjectId(),
          eventName: 'בדיקות בכירים - חברת XYZ',
          eventDate: new Date(Date.now() - 2*86400000),
          location: 'חיפה, אזור התעשייה',
          description: 'בדיקות מקיפות לבכירי החברה',
          status: 'completed',
          maxCapacity: 30,
          testDuration: 45,
          breakBetweenTests: 10,
          dailyBreaks: [
            { startTime: '10:30', endTime: '10:45', description: 'קפה' },
            { startTime: '12:30', endTime: '13:30', description: 'ארוחת צהריים' }
          ],
          questions: [
            { question: 'האם אתה צם?', type: 'boolean', required: true },
            { question: 'תרופות שאתה נוטל', type: 'text', required: false },
            { question: 'בעיות בריאות ידועות', type: 'text', required: false }
          ],
          registrationDesign: {
            primaryColor: '#DC2626',
            backgroundColor: '#FEF2F2',
            headerText: 'רישום לבדיקות בכירים',
            logoUrl: ''
          },
          totalRegistered: 25,
          totalTested: 25,
          totalRevenue: 18750,
          createdAt: new Date(Date.now() - 10*86400000)
        }
      ];
      
      await eventsCollection.insertMany(sampleEvents);
      console.log('📅 Sample events created');
      
      // Create default system settings
      const defaultSettings = {
        _id: new ObjectId(),
        systemName: 'מערכת ניהול בדיקות בריאות',
        companyName: 'חברת הבדיקות הרפואיות',
        supportEmail: 'support@health.system',
        supportPhone: '03-1234567',
        emailSettings: {
          smtpHost: '',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          fromEmail: '',
          fromName: ''
        },
        notificationSettings: {
          sendConfirmationEmails: true,
          sendReminderEmails: true,
          reminderHoursBefore: 24
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await settingsCollection.insertOne(defaultSettings);
      console.log('⚙️ Default system settings created');
    }
  } catch (error) {
    console.error('Error creating default data:', error);
  }
}

// Password hashing
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'health_system_salt').digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// Generate simple JWT-like token
function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Middleware to check authentication
async function requireAuth(req, res, corsHeaders) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      error: 'לא מורשה - נדרש טוקן אימות'
    }));
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    res.writeHead(401, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      error: 'טוקן לא תקין או פג תוקפו'
    }));
    return null;
  }

  return decoded;
}

// Middleware to check admin role
async function requireAdmin(userInfo, res, corsHeaders) {
  if (!userInfo || userInfo.role !== 'admin') {
    res.writeHead(403, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      error: 'נדרשות הרשאות מנהל'
    }));
    return false;
  }
  return true;
}

// Serve static files
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
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  // Connect to database
  await connectDB();
  
  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Health Testing and Sales Management System',
      mongodb: db ? 'Connected' : 'Disconnected',
      features: ['Authentication', 'Events', 'Users', 'Reports', 'Employee Registration']
    }));
    return;
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================
  
  // Login endpoint
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

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ 
        email: email.toLowerCase(),
        isActive: true
      });
      
      if (!user || !verifyPassword(password, user.password)) {
        res.writeHead(401, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מייל או סיסמה שגויים'
        }));
        return;
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: {
          token,
          user: userWithoutPassword
        },
        message: 'התחברות בוצעה בהצלחה'
      }));
      
    } catch (error) {
      console.error('Login error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Get user profile
  if (pathname === '/api/auth/profile' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ 
        _id: new ObjectId(userInfo.userId),
        isActive: true
      });
      
      if (!user) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'משתמש לא נמצא'
        }));
        return;
      }

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
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // ==================== USER MANAGEMENT ENDPOINTS ====================
  
  // Get all users (admin only)
  if (pathname === '/api/users' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const users = await usersCollection.find({}).toArray();
      
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: safeUsers
      }));
      
    } catch (error) {
      console.error('Users fetch error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Create new user (admin only)
  if (pathname === '/api/users' && method === 'POST') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const { email, name, password, role } = await parseBody(req);
      
      if (!email || !name || !password) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרש מייל, שם וסיסמה'
        }));
        return;
      }

      if (password.length < 6) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'הסיסמה חייבת להכיל לפחות 6 תווים'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      
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
        name: name.trim(),
        password: hashPassword(password),
        role: role || 'tester',
        createdAt: new Date(),
        isActive: true
      };

      await usersCollection.insertOne(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: userWithoutPassword,
        message: 'משתמש נוצר בהצלחה'
      }));
      
    } catch (error) {
      console.error('User creation error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Update user (admin only)
  if (pathname.startsWith('/api/users/') && method === 'PUT') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const userId = pathname.split('/')[3];
      const updates = await parseBody(req);
      
      if (!ObjectId.isValid(userId)) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מזהה משתמש לא תקין'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      
      // Prepare update object
      const updateData = {};
      if (updates.name) updateData.name = updates.name.trim();
      if (updates.role) updateData.role = updates.role;
      if (updates.password) updateData.password = hashPassword(updates.password);
      if (updates.hasOwnProperty('isActive')) updateData.isActive = updates.isActive;
      
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'משתמש לא נמצא'
        }));
        return;
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'משתמש עודכן בהצלחה'
      }));
      
    } catch (error) {
      console.error('User update error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Delete user (admin only)
  if (pathname.startsWith('/api/users/') && method === 'DELETE') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const userId = pathname.split('/')[3];
      
      if (!ObjectId.isValid(userId)) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מזהה משתמש לא תקין'
        }));
        return;
      }

      // Can't delete yourself
      if (userId === userInfo.userId) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'לא ניתן למחוק את עצמך'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const usersCollection = db.collection('users');
      const result = await usersCollection.deleteOne({ 
        _id: new ObjectId(userId) 
      });
      
      if (result.deletedCount === 0) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'משתמש לא נמצא'
        }));
        return;
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'משתמש נמחק בהצלחה'
      }));
      
    } catch (error) {
      console.error('User deletion error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // ==================== SYSTEM SETTINGS ENDPOINTS ====================
  
  // Get system settings
  if (pathname === '/api/system/settings' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const settingsCollection = db.collection('settings');
      const settings = await settingsCollection.findOne({});
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: settings || {}
      }));
      
    } catch (error) {
      console.error('Settings fetch error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Save system settings
  if (pathname === '/api/system/settings' && method === 'POST') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const settingsData = await parseBody(req);

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const settingsCollection = db.collection('settings');
      
      // Update or create settings
      const updateData = {
        ...settingsData,
        updatedAt: new Date()
      };
      
      await settingsCollection.updateOne(
        {},
        { $set: updateData },
        { upsert: true }
      );
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'הגדרות נשמרו בהצלחה'
      }));
      
    } catch (error) {
      console.error('Settings save error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה בשמירת ההגדרות'
      }));
    }
    return;
  }

  // ==================== SYSTEM SETTINGS ENDPOINTS ====================
  
  // Get system settings
  if (pathname === '/api/system/settings' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const settingsCollection = db.collection('settings');
      let settings = await settingsCollection.findOne({});
      
      if (!settings) {
        // Create default settings if none exist
        settings = {
          systemName: 'מערכת ניהול בדיקות בריאות',
          companyName: 'חברת הבדיקות הרפואיות',
          supportEmail: 'support@health.system',
          supportPhone: '03-1234567',
          emailSettings: {
            smtpHost: '',
            smtpPort: 587,
            smtpUser: '',
            smtpPassword: '',
            fromEmail: '',
            fromName: ''
          },
          notificationSettings: {
            sendConfirmationEmails: true,
            sendReminderEmails: true,
            reminderHoursBefore: 24
          }
        };
        
        await settingsCollection.insertOne(settings);
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: settings
      }));
      
    } catch (error) {
      console.error('Settings fetch error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Save system settings
  if (pathname === '/api/system/settings' && method === 'POST') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const settingsData = await parseBody(req);

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const settingsCollection = db.collection('settings');
      
      // Update or create settings
      const result = await settingsCollection.replaceOne(
        {},
        { ...settingsData, updatedAt: new Date() },
        { upsert: true }
      );

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'הגדרות נשמרו בהצלחה'
      }));
      
    } catch (error) {
      console.error('Settings save error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה בשמירת ההגדרות'
      }));
    }
    return;
  }

  // ==================== EVENTS ENDPOINTS ====================
  
  // Create new event
  if (pathname === '/api/events' && method === 'POST') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const eventData = await parseBody(req);
      
      // Validate required fields
      if (!eventData.eventName || !eventData.eventDate || !eventData.location) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרש שם אירוע, תאריך ומיקום'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      
      const newEvent = {
        _id: new ObjectId(),
        eventName: eventData.eventName,
        eventDate: new Date(eventData.eventDate),
        location: eventData.location,
        description: eventData.description || '',
        status: eventData.status || 'planned',
        maxCapacity: parseInt(eventData.maxCapacity) || 50,
        testDuration: parseInt(eventData.testDuration) || 30,
        breakBetweenTests: parseInt(eventData.breakBetweenTests) || 5,
        dailyBreaks: eventData.dailyBreaks || [],
        questions: eventData.questions || [],
        registrationDesign: eventData.registrationDesign || {
          primaryColor: '#4F46E5',
          backgroundColor: '#F8FAFC',
          headerText: 'רישום לבדיקות בריאות',
          logoUrl: ''
        },
        totalRegistered: 0,
        totalTested: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        createdBy: userInfo.userId
      };

      await eventsCollection.insertOne(newEvent);

      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: newEvent,
        message: 'אירוע נוצר בהצלחה'
      }));
      
    } catch (error) {
      console.error('Event creation error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה ביצירת האירוע'
      }));
    }
    return;
  }
  
  // Get dashboard data
  if (pathname === '/api/events/dashboard' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      
      // Get current month events
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyEvents = await eventsCollection.find({
        eventDate: { $gte: startOfMonth, $lte: endOfMonth }
      }).toArray();

      // Calculate statistics
      const totalEvents = monthlyEvents.length;
      const completedEvents = monthlyEvents.filter(e => e.status === 'completed').length;
      const upcomingEvents = monthlyEvents.filter(e => 
        e.status === 'planned' && new Date(e.eventDate) > now
      ).length;
      
      const totalRevenue = monthlyEvents.reduce((sum, e) => sum + (e.totalRevenue || 0), 0);
      const averageTransaction = totalEvents > 0 ? totalRevenue / totalEvents : 0;
      
      const totalTested = monthlyEvents.reduce((sum, e) => sum + (e.totalTested || 0), 0);
      const totalRegistered = monthlyEvents.reduce((sum, e) => sum + (e.totalRegistered || 0), 0);
      const testToSaleRatio = totalRegistered > 0 ? (totalTested / totalRegistered) * 100 : 0;

      // Get recent events
      const recentEvents = await eventsCollection.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      const dashboardData = {
        currentMonth: {
          totalEvents,
          completedEvents,
          upcomingEvents,
          totalRevenue,
          averageTransaction: Math.round(averageTransaction),
          testToSaleRatio: Math.round(testToSaleRatio)
        },
        recentEvents
      };

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: dashboardData
      }));
      
    } catch (error) {
      console.error('Dashboard error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Get all events
  if (pathname === '/api/events' && method === 'GET') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      const events = await eventsCollection.find({})
        .sort({ eventDate: -1 })
        .toArray();

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: events
      }));
      
    } catch (error) {
      console.error('Events fetch error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה פנימית בשרת'
      }));
    }
    return;
  }

  // Create new event
  if (pathname === '/api/events' && method === 'POST') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const eventData = await parseBody(req);
      
      // Validate required fields
      if (!eventData.eventName || !eventData.eventDate || !eventData.location) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'נדרש שם אירוע, תאריך ומיקום'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      
      const newEvent = {
        _id: new ObjectId(),
        eventName: eventData.eventName,
        eventDate: new Date(eventData.eventDate),
        location: eventData.location,
        description: eventData.description || '',
        status: 'preparing',
        maxCapacity: parseInt(eventData.maxCapacity) || 50,
        testDuration: parseInt(eventData.testDuration) || 30,
        breakBetweenTests: parseInt(eventData.breakBetweenTests) || 5,
        dailyBreaks: eventData.dailyBreaks || [],
        questions: eventData.questions || [],
        registrationDesign: eventData.registrationDesign || {
          primaryColor: '#4F46E5',
          backgroundColor: '#F8FAFC',
          headerText: 'רישום לבדיקות בריאות',
          logoUrl: ''
        },
        totalRegistered: 0,
        totalTested: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        createdBy: userInfo.userId
      };

      await eventsCollection.insertOne(newEvent);
      
      res.writeHead(201, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: newEvent,
        message: 'אירוע נוצר בהצלחה'
      }));
      
    } catch (error) {
      console.error('Event creation error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה ביצירת האירוע'
      }));
    }
    return;
  }

  // Update event
  if (pathname.startsWith('/api/events/') && method === 'PUT') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const eventId = pathname.split('/')[3];
      const updates = await parseBody(req);
      
      if (!ObjectId.isValid(eventId)) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מזהה אירוע לא תקין'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      if (updateData.eventDate) {
        updateData.eventDate = new Date(updateData.eventDate);
      }
      
      const result = await eventsCollection.updateOne(
        { _id: new ObjectId(eventId) },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'אירוע לא נמצא'
        }));
        return;
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'אירוע עודכן בהצלחה'
      }));
      
    } catch (error) {
      console.error('Event update error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה בעדכון האירוע'
      }));
    }
    return;
  }

  // Delete event
  if (pathname.startsWith('/api/events/') && method === 'DELETE') {
    try {
      const userInfo = await requireAuth(req, res, corsHeaders);
      if (!userInfo) return;
      
      if (!(await requireAdmin(userInfo, res, corsHeaders))) return;

      const eventId = pathname.split('/')[3];
      
      if (!ObjectId.isValid(eventId)) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'מזהה אירוע לא תקין'
        }));
        return;
      }

      if (!db) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'שגיאה בחיבור למסד הנתונים'
        }));
        return;
      }

      const eventsCollection = db.collection('events');
      const result = await eventsCollection.deleteOne({ 
        _id: new ObjectId(eventId) 
      });
      
      if (result.deletedCount === 0) {
        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({
          success: false,
          error: 'אירוע לא נמצא'
        }));
        return;
      }

      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        message: 'אירוע נמחק בהצלחה'
      }));
      
    } catch (error) {
      console.error('Event deletion error:', error);
      res.writeHead(500, corsHeaders);
      res.end(JSON.stringify({
        success: false,
        error: 'שגיאה במחיקת האירוע'
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
  
  // Other API endpoints - placeholder
  if (pathname.startsWith('/api/')) {
    res.writeHead(501, corsHeaders);
    res.end(JSON.stringify({
      success: false,
      error: `אינדפוינט ${pathname} עדיין לא מומש`,
      endpoint: pathname,
      method: method
    }));
    return;
  }
  
  // Main React SPA page
  const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>מערכת ניהול בדיקות בריאות</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
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
    
    <!-- Day.js for date handling -->
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/he.min.js"></script>
    
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
      
      .btn-delete {
        background: linear-gradient(135deg, #FDE8F4, #F8B8E0);
        color: #dc2626;
        border: none;
        transition: all 0.3s ease;
      }
      
      .btn-delete:hover {
        background: linear-gradient(135deg, #F8B8E0, #F87FA3);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
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
      
      .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid #f3f4f6;
        border-top: 3px solid #B8E6B8;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
</head>
<body class="bg-gradient-to-br from-pastel-mint via-pastel-blue to-pastel-pink min-h-screen">
    <div id="root"></div>
    
    <!-- Load React application -->
    <script src="/static/app.js"></script>
    
    <script>
        // Initialize Day.js
        if (typeof dayjs !== 'undefined') {
            dayjs.extend(dayjs_plugin_relativeTime);
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
                }, [
                    React.createElement('div', {
                        key: 'loading',
                        className: 'text-center'
                    }, [
                        React.createElement('div', {
                            key: 'spinner',
                            className: 'spinner mx-auto mb-4'
                        }),
                        React.createElement('p', {
                            key: 'text',
                            className: 'text-gray-600'
                        }, 'טוען את המערכת...')
                    ])
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (client) {
    await client.close();
    console.log('📊 MongoDB connection closed');
  }
  process.exit(0);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Health Testing and Sales Management System');
  console.log(`📱 Server running on port ${PORT}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
  console.log('');
});

// Connect to database in background (non-blocking)
connectDB().then(() => {
  if (db) {
    console.log('✅ Database: Connected');
  } else {
    console.log('❌ Database: Disconnected - some features may not work');
  }
}).catch(error => {
  console.error('❌ Database connection failed:', error);
  console.log('❌ Database: Disconnected - some features may not work');
});