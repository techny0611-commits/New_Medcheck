// MongoDB Initialization Script
// יוצר משתמש ו-database למערכת

// Switch to webapp database
db = db.getSiblingDB('webapp');

// Create application user
db.createUser({
  user: 'webappuser',
  pwd: 'webapppass123',
  roles: [
    {
      role: 'readWrite',
      db: 'webapp'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('events');
db.createCollection('timeslots');
db.createCollection('employees');
db.createCollection('testresults');
db.createCollection('systemsettings');

// Create indexes for better performance
db.users.createIndex({ "supabase_id": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.events.createIndex({ "createdAt": -1 });
db.events.createIndex({ "isActive": 1 });

db.timeslots.createIndex({ "eventId": 1 });
db.timeslots.createIndex({ "startTime": 1 });
db.timeslots.createIndex({ "isAvailable": 1 });

db.employees.createIndex({ "eventId": 1 });
db.employees.createIndex({ "email": 1 });
db.employees.createIndex({ "status": 1 });

db.testresults.createIndex({ "employeeId": 1 });
db.testresults.createIndex({ "eventId": 1 });
db.testresults.createIndex({ "createdAt": -1 });

// Insert default system settings
db.systemsettings.insertOne({
  _id: 'default',
  emailSettings: {
    smtpEnabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'מערכת ניהול בדיקות'
  },
  uiSettings: {
    primaryColor: '#a3e4d7',
    secondaryColor: '#fbb6ce',
    logoUrl: '',
    organizationName: 'מערכת ניהול בדיקות'
  },
  emailTemplates: {
    confirmation: {
      subject: 'אישור רישום לבדיקה',
      body: `שלום {{employeeName}},

רישומך לבדיקה אושר בהצלחה.

פרטי הבדיקה:
- אירוע: {{eventName}}
- תאריך: {{eventDate}}
- זמן: {{timeSlot}}
- מיקום: {{eventLocation}}

אנא הגע במועד הקבוע.

בברכה,
צוות הבדיקות`
    },
    reminder: {
      subject: 'תזכורת לבדיקה מחר',
      body: `שלום {{employeeName}},

מזכירים לך על הבדיקה המתוכננת מחר.

פרטי הבדיקה:
- אירוע: {{eventName}}
- תאריך: {{eventDate}}
- זמן: {{timeSlot}}
- מיקום: {{eventLocation}}

אנא הגע במועד הקבוע.

בברכה,
צוות הבדיקות`
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB initialized successfully for webapp');
print('Created user: webappuser');
print('Created collections with indexes');
print('Inserted default system settings');