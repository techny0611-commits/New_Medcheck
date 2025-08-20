// Main React Application
const { useState, useEffect, useContext, createContext, useCallback } = React;
const { createRoot } = ReactDOM;

// API Base URL
const API_BASE = '/api';

// Authentication Context
const AuthContext = createContext({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

// Supabase configuration (these should be set as environment variables in production)
const SUPABASE_URL = window.env?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.env?.SUPABASE_ANON_KEY || '';

// Icons component helper
const Icon = ({ name, className = "w-5 h-5" }) => {
  const iconPaths = {
    // Navigation icons
    'home': 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    'chart-bar': 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    'calendar-days': 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    'document-text': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    'cog-6-tooth': 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'arrow-right-on-rectangle': 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
    
    // Action icons  
    'plus': 'M12 4.5v15m7.5-7.5h-15',
    'pencil': 'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    'trash': 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
    'eye': 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'check-circle': 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'x-circle': 'M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    
    // Status icons
    'clock': 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    'exclamation-triangle': 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    'information-circle': 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
    
    // Data icons
    'users': 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
    'building-office': 'M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3zM9 8.25h1.5M9 11.25h1.5m0 3h-1.5m1.5-6h3m-3 3h3m-3 3h3M9 21v-7.5h6V21',
    'banknotes': 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    
    // Additional icons needed
    'arrow-path': 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.5 0v2.25',
    'arrow-trending-up': 'm2.25 18 8.954-8.955c.44-.439 1.152-.439 1.591 0L17.25 14.5 22.5 9M15 3v12m0 0-3-3m3 3 3-3',
    'bars-3': 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    'x-mark': 'M6 18L18 6M6 6l12 12',
    'link': 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    'document-arrow-down': 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.06-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    
    // Settings icons
    'envelope': 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
    'adjustments-horizontal': 'M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m6-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75',
    'magnifying-glass': 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
  };

  return React.createElement(
    'svg',
    {
      className: className,
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      strokeWidth: 1.5
    },
    React.createElement('path', {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      d: iconPaths[name] || iconPaths['information-circle']
    })
  );
};

// Authentication Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token and get user profile
      const response = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // This should integrate with Supabase auth
      // For now, we'll use a simple email/password flow
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('auth_token', token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      return { success: false, error: 'שגיאה בהתחברות' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        login,
        logout,
        updateUser
      }
    },
    children
  );
};

// Landing Page Component (for non-authenticated users)
const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(loginForm.email, loginForm.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    // This will be implemented with Supabase
    window.location.href = `${API_BASE}/auth/google`;
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-pastel-mint to-pastel-blue flex items-center justify-center px-4'
  }, [
    React.createElement('div', {
      key: 'container',
      className: 'max-w-md w-full space-y-8'
    }, [
      // Header
      React.createElement('div', {
        key: 'header',
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg'
        }, React.createElement(Icon, { name: 'building-office', className: 'w-8 h-8 text-pastel-mint' })),
        
        React.createElement('h1', {
          key: 'title',
          className: 'text-4xl font-bold text-gray-900 mb-2'
        }, 'מערכת ניהול בדיקות'),
        
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-lg text-gray-600'
        }, 'פלטפורמה מתקדמת לניהול אירועי בדיקות רפואיות ומכירות')
      ]),

      // Login Card
      React.createElement('div', {
        key: 'card',
        className: 'bg-white rounded-xl shadow-2xl p-8 glass-effect'
      }, [
        React.createElement('div', {
          key: 'card-content',
          className: 'space-y-6'
        }, [
          !showLogin ? [
            // Welcome message
            React.createElement('div', {
              key: 'welcome',
              className: 'text-center'
            }, [
              React.createElement('h2', {
                key: 'welcome-title',
                className: 'text-2xl font-semibold text-gray-900 mb-4'
              }, 'ברוכים הבאים'),
              
              React.createElement('p', {
                key: 'welcome-text',
                className: 'text-gray-600 mb-6'
              }, 'התחברו למערכת כדי להתחיל לנהל אירועים ולעקוב אחר תוצאות')
            ]),

            // Login buttons
            React.createElement('div', {
              key: 'buttons',
              className: 'space-y-3'
            }, [
              React.createElement('button', {
                key: 'login-btn',
                onClick: () => setShowLogin(true),
                className: 'w-full btn-primary py-3 px-4 rounded-lg font-medium hover-lift'
              }, 'התחברות'),
              
              React.createElement('button', {
                key: 'google-btn',
                onClick: handleGoogleLogin,
                className: 'w-full bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium hover-lift flex items-center justify-center space-x-2'
              }, [
                React.createElement('span', { key: 'google-text' }, 'התחברות עם Google'),
                React.createElement('svg', {
                  key: 'google-icon',
                  className: 'w-5 h-5 mr-2',
                  viewBox: '0 0 24 24'
                }, [
                  React.createElement('path', {
                    key: 'google-path',
                    fill: '#4285F4',
                    d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  }),
                  React.createElement('path', {
                    key: 'google-path2',
                    fill: '#34A853',
                    d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  }),
                  React.createElement('path', {
                    key: 'google-path3',
                    fill: '#FBBC05',
                    d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  }),
                  React.createElement('path', {
                    key: 'google-path4',
                    fill: '#EA4335',
                    d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  })
                ])
              ])
            ])
          ] : [
            // Login form
            React.createElement('form', {
              key: 'login-form',
              onSubmit: handleLogin,
              className: 'space-y-4'
            }, [
              React.createElement('div', {
                key: 'form-header',
                className: 'text-center mb-6'
              }, [
                React.createElement('button', {
                  key: 'back-btn',
                  type: 'button',
                  onClick: () => setShowLogin(false),
                  className: 'text-sm text-gray-500 hover:text-gray-700 mb-2'
                }, '← חזרה'),
                
                React.createElement('h2', {
                  key: 'form-title',
                  className: 'text-xl font-semibold text-gray-900'
                }, 'התחברות למערכת')
              ]),

              error && React.createElement('div', {
                key: 'error',
                className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm'
              }, error),

              React.createElement('div', {
                key: 'email-field'
              }, [
                React.createElement('label', {
                  key: 'email-label',
                  className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'כתובת מייל'),
                
                React.createElement('input', {
                  key: 'email-input',
                  type: 'email',
                  value: loginForm.email,
                  onChange: (e) => setLoginForm(prev => ({ ...prev, email: e.target.value })),
                  className: 'form-input w-full px-3 py-2 rounded-lg focus-ring',
                  required: true,
                  disabled: isLoading
                })
              ]),

              React.createElement('div', {
                key: 'password-field'
              }, [
                React.createElement('label', {
                  key: 'password-label',
                  className: 'block text-sm font-medium text-gray-700 mb-1'
                }, 'סיסמה'),
                
                React.createElement('input', {
                  key: 'password-input',
                  type: 'password',
                  value: loginForm.password,
                  onChange: (e) => setLoginForm(prev => ({ ...prev, password: e.target.value })),
                  className: 'form-input w-full px-3 py-2 rounded-lg focus-ring',
                  required: true,
                  disabled: isLoading
                })
              ]),

              React.createElement('button', {
                key: 'submit-btn',
                type: 'submit',
                disabled: isLoading,
                className: 'w-full btn-primary py-3 px-4 rounded-lg font-medium hover-lift disabled:opacity-50 flex items-center justify-center'
              }, isLoading ? [
                React.createElement('div', { key: 'spinner', className: 'spinner mr-2' }),
                React.createElement('span', { key: 'loading-text' }, 'מתחבר...')
              ] : 'התחברות')
            ])
          ]
        ])
      ])
    ])
  ]);
};

// Event Management Component
const EventManagementView = ({ eventId, onBack }) => {
  const [eventData, setEventData] = useState(null);
  const [employees, setEmployees] = useState({ scheduled: [], waiting: [], tested: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showTestResults, setShowTestResults] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    loadEventData();
    loadEmployees();
    loadAvailableSlots();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEventData(response.data.data);
      } else {
        setError('שגיאה בטעינת פרטי האירוע');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Load employees by status
      const statuses = ['scheduled', 'waiting', 'tested'];
      const employeeData = {};

      for (const status of statuses) {
        const response = await axios.get(`${API_BASE}/employees/${eventId}?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          employeeData[status] = response.data.data;
        }
      }

      setEmployees(employeeData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/${eventId}/slots`);
      if (response.data.success) {
        setAvailableSlots(response.data.data);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  const handleScheduleEmployee = async (employeeId, timeSlotId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/employees/${employeeId}/schedule`, 
        { timeSlotId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadEmployees();
        loadAvailableSlots();
        alert('עובד שובץ בהצלחה');
      } else {
        alert('שגיאה בשיבוץ העובד');
      }
    } catch (error) {
      alert('שגיאה בחיבור לשרת');
    }
  };

  const handleUnscheduleEmployee = async (employeeId) => {
    if (!window.confirm('האם אתה בטוח שברצונך להעביר את העובד לרשימת ההמתנה?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/employees/${employeeId}/unschedule`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        loadEmployees();
        loadAvailableSlots();
        alert('עובד הועבר לרשימת ההמתנה');
      } else {
        alert('שגיאה בהעברת העובד');
      }
    } catch (error) {
      alert('שגיאה בחיבור לשרת');
    }
  };

  const handleRecordTestResults = (employee) => {
    setSelectedEmployee(employee);
    setShowTestResults(true);
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/register/${eventId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('קישור הרישום הועתק ללוח');
    });
  };

  const sendReminders = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך לשלוח תזכורות לכל העובדים המשובצים?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/employees/send-reminders/${eventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const { sent, failed } = response.data.data;
        alert(`תזכורות נשלחו בהצלחה!\nנשלחו: ${sent}\nכשלו: ${failed}`);
      } else {
        alert('שגיאה בשליחת התזכורות: ' + (response.data.error || 'שגיאה לא ידועה'));
      }
    } catch (error) {
      alert('שגיאה בחיבור לשרת');
    }
  };

  const exportEventData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/reports/event-employees/export?eventName=${eventData?.organizationName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventData?.organizationName}-data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('שגיאה בייצוא הנתונים');
    }
  };

  if (isLoading) {
    return React.createElement('div', {
      className: 'animate-fade-in flex items-center justify-center py-12'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'spinner mx-auto'
      }),
      React.createElement('span', {
        key: 'text',
        className: 'mr-3 text-gray-600'
      }, 'טוען נתוני אירוע...')
    ]);
  }

  if (error) {
    return React.createElement('div', {
      className: 'animate-fade-in'
    }, React.createElement('div', {
      className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
    }, error));
  }

  const totalRegistered = (employees.scheduled?.length || 0) + (employees.waiting?.length || 0) + (employees.tested?.length || 0);
  const totalTested = employees.tested?.length || 0;
  const totalRevenue = employees.tested?.reduce((sum, emp) => sum + (emp.testResults?.transactionAmount || 0), 0) || 0;

  return React.createElement('div', {
    className: 'animate-fade-in space-y-6'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'title-section',
        className: 'flex items-center'
      }, [
        React.createElement('button', {
          key: 'back-btn',
          onClick: onBack,
          className: 'p-2 hover:bg-gray-100 rounded-lg ml-3'
        }, React.createElement(Icon, { name: 'arrow-right', className: 'w-5 h-5' })),
        
        React.createElement('div', {
          key: 'title-content'
        }, [
          React.createElement('h1', {
            key: 'title',
            className: 'text-2xl font-bold text-gray-900'
          }, eventData?.organizationName),
          
          React.createElement('p', {
            key: 'subtitle',
            className: 'text-gray-600 mt-1'
          }, new Date(eventData?.eventDate).toLocaleDateString('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }))
        ])
      ]),

      React.createElement('div', {
        key: 'actions',
        className: 'flex items-center space-x-3'
      }, [
        React.createElement('button', {
          key: 'export',
          onClick: exportEventData,
          className: 'btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2'
        }, [
          React.createElement(Icon, {
            key: 'export-icon',
            name: 'document-arrow-down',
            className: 'w-4 h-4'
          }),
          React.createElement('span', {
            key: 'export-text'
          }, 'ייצא נתונים')
        ]),

        React.createElement('button', {
          key: 'copy-link',
          onClick: copyRegistrationLink,
          className: 'btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2'
        }, [
          React.createElement(Icon, {
            key: 'link-icon',
            name: 'link',
            className: 'w-4 h-4'
          }),
          React.createElement('span', {
            key: 'link-text'
          }, 'העתק קישור')
        ]),

        React.createElement('button', {
          key: 'send-reminders',
          onClick: sendReminders,
          className: 'btn-primary px-4 py-2 rounded-lg flex items-center space-x-2'
        }, [
          React.createElement(Icon, {
            key: 'email-icon',
            name: 'envelope',
            className: 'w-4 h-4'
          }),
          React.createElement('span', {
            key: 'email-text'
          }, 'שלח תזכורות')
        ])
      ])
    ]),

    // Statistics
    React.createElement('div', {
      key: 'stats-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
    }, [
      React.createElement(StatsCard, {
        key: 'total-registered',
        title: 'סך נרשמים',
        value: totalRegistered,
        icon: 'users',
        color: 'pastel-blue'
      }),
      
      React.createElement(StatsCard, {
        key: 'scheduled',
        title: 'משובצים',
        value: employees.scheduled?.length || 0,
        icon: 'calendar-days',
        color: 'pastel-green'
      }),
      
      React.createElement(StatsCard, {
        key: 'waiting',
        title: 'ממתינים',
        value: employees.waiting?.length || 0,
        icon: 'clock',
        color: 'pastel-yellow'
      }),
      
      React.createElement(StatsCard, {
        key: 'tested',
        title: 'נבדקו',
        value: totalTested,
        subtitle: `הכנסות: ₪${totalRevenue.toLocaleString()}`,
        icon: 'check-circle',
        color: 'pastel-mint'
      })
    ]),

    // Tabs
    React.createElement('div', {
      key: 'tabs',
      className: 'bg-white rounded-lg shadow-sm border'
    }, [
      React.createElement('div', {
        key: 'tab-header',
        className: 'border-b'
      }, React.createElement('nav', {
        className: 'flex space-x-8 px-6'
      }, [
        React.createElement('button', {
          key: 'scheduled-tab',
          onClick: () => setActiveTab('scheduled'),
          className: `py-4 px-2 border-b-2 font-medium text-sm ${
            activeTab === 'scheduled'
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, `משובצים (${employees.scheduled?.length || 0})`),
        
        React.createElement('button', {
          key: 'waiting-tab',
          onClick: () => setActiveTab('waiting'),
          className: `py-4 px-2 border-b-2 font-medium text-sm ${
            activeTab === 'waiting'
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, `רשימת המתנה (${employees.waiting?.length || 0})`),
        
        React.createElement('button', {
          key: 'tested-tab',
          onClick: () => setActiveTab('tested'),
          className: `py-4 px-2 border-b-2 font-medium text-sm ${
            activeTab === 'tested'
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, `נבדקו (${employees.tested?.length || 0})`)
      ])),

      React.createElement('div', {
        key: 'tab-content',
        className: 'p-6'
      }, React.createElement(EmployeesList, {
        employees: employees[activeTab] || [],
        type: activeTab,
        availableSlots: availableSlots,
        onSchedule: handleScheduleEmployee,
        onUnschedule: handleUnscheduleEmployee,
        onRecordResults: handleRecordTestResults
      }))
    ]),

    // Test Results Modal
    showTestResults && React.createElement(TestResultsModal, {
      key: 'test-results-modal',
      isOpen: showTestResults,
      employee: selectedEmployee,
      onClose: () => {
        setShowTestResults(false);
        setSelectedEmployee(null);
      },
      onSuccess: () => {
        loadEmployees();
        setShowTestResults(false);
        setSelectedEmployee(null);
      }
    })
  ]);
};

// Employees List Component  
const EmployeesList = ({ employees, type, availableSlots, onSchedule, onUnschedule, onRecordResults }) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');

  const handleScheduleClick = (employee) => {
    setSelectedEmployee(employee);
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = () => {
    if (selectedEmployee && selectedSlot) {
      onSchedule(selectedEmployee._id, selectedSlot);
      setShowScheduleModal(false);
      setSelectedEmployee(null);
      setSelectedSlot('');
    }
  };

  if (!employees || employees.length === 0) {
    return React.createElement('div', {
      className: 'text-center py-8 text-gray-500'
    }, `אין עובדים ב${type === 'scheduled' ? 'רשימת המשובצים' : type === 'waiting' ? 'רשימת ההמתנה' : 'רשימת הנבדקים'}`);
  }

  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('div', {
      key: 'employees-list',
      className: 'space-y-3'
    }, employees.map(employee => 
      React.createElement('div', {
        key: employee._id,
        className: 'border border-gray-200 rounded-lg p-4 hover:bg-gray-50'
      }, React.createElement('div', {
        className: 'flex items-center justify-between'
      }, [
        React.createElement('div', {
          key: 'employee-info',
          className: 'flex-1'
        }, [
          React.createElement('h4', {
            key: 'name',
            className: 'font-medium text-gray-900'
          }, employee.fullName),
          
          React.createElement('div', {
            key: 'details',
            className: 'text-sm text-gray-500 mt-1'
          }, [
            React.createElement('span', {
              key: 'phone'
            }, employee.phoneNumber),
            
            React.createElement('span', {
              key: 'separator',
              className: 'mx-2'
            }, '•'),
            
            React.createElement('span', {
              key: 'email'
            }, employee.email),

            employee.timeSlot && React.createElement('span', {
              key: 'time',
              className: 'mx-2 text-blue-600'
            }, `• ${employee.timeSlot.startTime}-${employee.timeSlot.endTime}`)
          ])
        ]),

        React.createElement('div', {
          key: 'actions',
          className: 'flex items-center space-x-2'
        }, type === 'waiting' ? [
          React.createElement('button', {
            key: 'schedule',
            onClick: () => handleScheduleClick(employee),
            className: 'btn-primary px-3 py-2 rounded-lg text-sm'
          }, 'שבץ לבדיקה')
        ] : type === 'scheduled' ? [
          React.createElement('button', {
            key: 'record-results',
            onClick: () => onRecordResults(employee),
            className: 'btn-primary px-3 py-2 rounded-lg text-sm'
          }, 'הזן תוצאות'),
          
          React.createElement('button', {
            key: 'unschedule',
            onClick: () => onUnschedule(employee._id),
            className: 'btn-secondary px-3 py-2 rounded-lg text-sm'
          }, 'העבר להמתנה')
        ] : type === 'tested' ? [
          React.createElement('div', {
            key: 'amount',
            className: 'text-right'
          }, [
            React.createElement('div', {
              key: 'transaction',
              className: 'font-semibold text-gray-900'
            }, `₪${(employee.testResults?.transactionAmount || 0).toLocaleString()}`),
            
            React.createElement('div', {
              key: 'date',
              className: 'text-xs text-gray-500'
            }, new Date(employee.testResults?.testDate).toLocaleDateString('he-IL'))
          ])
        ] : [])
      ]))
    )),

    // Schedule Modal
    showScheduleModal && React.createElement('div', {
      key: 'schedule-modal',
      className: 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop'
    }, React.createElement('div', {
      className: 'bg-white rounded-lg shadow-2xl max-w-xs sm:max-w-md w-full mx-2 sm:mx-4'
    }, [
      React.createElement('div', {
        key: 'modal-header',
        className: 'p-6 border-b'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold'
        }, 'שיבוץ לזמן בדיקה'),
        
        React.createElement('p', {
          key: 'employee-name',
          className: 'text-gray-600 mt-1'
        }, selectedEmployee?.fullName)
      ]),

      React.createElement('div', {
        key: 'modal-body',
        className: 'p-6'
      }, [
        React.createElement('label', {
          key: 'slot-label',
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'בחר זמן פנוי'),
        
        React.createElement('select', {
          key: 'slot-select',
          value: selectedSlot,
          onChange: (e) => setSelectedSlot(e.target.value),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          required: true
        }, [
          React.createElement('option', { key: 'empty', value: '' }, 'בחר זמן...'),
          ...availableSlots.map(slot =>
            React.createElement('option', {
              key: slot._id,
              value: slot._id
            }, `${slot.startTime} - ${slot.endTime}`)
          )
        ])
      ]),

      React.createElement('div', {
        key: 'modal-footer',
        className: 'flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50'
      }, [
        React.createElement('button', {
          key: 'cancel',
          onClick: () => setShowScheduleModal(false),
          className: 'btn-secondary px-4 py-2 rounded-lg'
        }, 'ביטול'),
        
        React.createElement('button', {
          key: 'confirm',
          onClick: handleScheduleSubmit,
          disabled: !selectedSlot,
          className: 'btn-primary px-4 py-2 rounded-lg disabled:opacity-50'
        }, 'שבץ')
      ])
    ]))
  ]);
};

// Test Results Modal Component
const TestResultsModal = ({ isOpen, employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    medicalResults: '',
    businessDetails: '',
    transactionAmount: 0
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const formDataObj = new FormData();
      
      formDataObj.append('medicalResults', formData.medicalResults);
      formDataObj.append('businessDetails', formData.businessDetails);
      formDataObj.append('transactionAmount', formData.transactionAmount.toString());

      files.forEach((file, index) => {
        formDataObj.append(`file_${index}`, file);
      });

      const response = await axios.post(`${API_BASE}/employees/${employee._id}/test-results`, formDataObj, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.error || 'שגיאה בשמירת התוצאות');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop'
  }, React.createElement('div', {
    className: 'bg-white rounded-lg shadow-2xl max-w-xs sm:max-w-md md:max-w-2xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-6 border-b'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold'
      }, 'הזנת תוצאות בדיקה'),
      
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        className: 'p-2 hover:bg-gray-100 rounded-lg'
      }, React.createElement(Icon, { name: 'x-mark', className: 'w-5 h-5' }))
    ]),

    React.createElement('form', {
      key: 'form',
      onSubmit: handleSubmit,
      className: 'p-6 space-y-6'
    }, [
      React.createElement('div', {
        key: 'employee-info',
        className: 'bg-gray-50 rounded-lg p-4'
      }, [
        React.createElement('h3', {
          key: 'name',
          className: 'font-medium text-gray-900'
        }, employee?.fullName),
        
        React.createElement('p', {
          key: 'contact',
          className: 'text-sm text-gray-600 mt-1'
        }, `${employee?.phoneNumber} • ${employee?.email}`)
      ]),

      error && React.createElement('div', {
        key: 'error',
        className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
      }, error),

      React.createElement('div', {
        key: 'medical-results'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'תוצאות בדיקה רפואיות'),
        
        React.createElement('textarea', {
          value: formData.medicalResults,
          onChange: (e) => setFormData(prev => ({ ...prev, medicalResults: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          rows: 4,
          placeholder: 'תיאור ממצאי הבדיקה הרפואית'
        })
      ]),

      React.createElement('div', {
        key: 'business-details'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'פרטי עסקה'),
        
        React.createElement('textarea', {
          value: formData.businessDetails,
          onChange: (e) => setFormData(prev => ({ ...prev, businessDetails: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          rows: 3,
          placeholder: 'פרטי העסקה שבוצעה (אם בוצעה)'
        })
      ]),

      React.createElement('div', {
        key: 'transaction-amount'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'סכום עסקה (₪)'),
        
        React.createElement('input', {
          type: 'number',
          value: formData.transactionAmount,
          onChange: (e) => setFormData(prev => ({ ...prev, transactionAmount: parseFloat(e.target.value) || 0 })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          min: 0,
          step: 0.01,
          placeholder: '0.00'
        })
      ]),

      React.createElement('div', {
        key: 'file-upload'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'קבצים מצורפים (תמונות או PDF)'),
        
        React.createElement('input', {
          type: 'file',
          onChange: handleFileChange,
          className: 'form-input w-full px-3 py-2 rounded-lg',
          multiple: true,
          accept: '.pdf,.jpg,.jpeg,.png'
        }),
        
        files.length > 0 && React.createElement('div', {
          className: 'mt-2 text-sm text-gray-600'
        }, `${files.length} קבצים נבחרו`)
      ])
    ]),

    React.createElement('div', {
      key: 'footer',
      className: 'flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50'
    }, [
      React.createElement('button', {
        key: 'cancel',
        type: 'button',
        onClick: onClose,
        className: 'btn-secondary px-4 py-2 rounded-lg'
      }, 'ביטול'),
      
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        disabled: isSubmitting,
        className: 'btn-primary px-6 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2'
      }, isSubmitting ? [
        React.createElement('div', { key: 'spinner', className: 'spinner mr-2' }),
        React.createElement('span', { key: 'text' }, 'שומר...')
      ] : 'שמור תוצאות')
    ])
  ]));
};

// Main App Component (for authenticated users)
const MainApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    // Listen for event navigation
    const handleEventNavigation = (e) => {
      setSelectedEventId(e.detail);
      setCurrentView('event-management');
    };

    window.addEventListener('navigate-to-event', handleEventNavigation);
    return () => window.removeEventListener('navigate-to-event', handleEventNavigation);
  }, []);

  // Navigation items based on user role
  const navigationItems = [
    ...(user?.role === 'admin' ? [{
      id: 'dashboard',
      name: 'מבט על',
      icon: 'chart-bar',
      description: 'סקירה כללית של המערכת'
    }] : []),
    {
      id: 'events',
      name: 'ניהול אירועים',
      icon: 'calendar-days',
      description: 'צפייה וניהול אירועים'
    },
    ...(user?.role === 'admin' ? [
      {
        id: 'reports',
        name: 'דוחות',
        icon: 'document-text',
        description: 'דוחות וסטטיסטיקות'
      },
      {
        id: 'settings',
        name: 'הגדרות מערכת',
        icon: 'cog-6-tooth',
        description: 'הגדרות כלליות ומשתמשים'
      }
    ] : [])
  ];

  // Render current view
  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return React.createElement(DashboardView);
      case 'events':
        return React.createElement(EventsView);
      case 'event-management':
        return React.createElement(EventManagementView, {
          eventId: selectedEventId,
          onBack: () => {
            setCurrentView('events');
            setSelectedEventId(null);
          }
        });
      case 'reports':
        return React.createElement(ReportsView);
      case 'settings':
        return React.createElement(SettingsView);
      default:
        return React.createElement(DashboardView);
    }
  };

  return React.createElement('div', {
    className: 'flex h-screen bg-gray-50'
  }, [
    // Sidebar
    React.createElement('div', {
      key: 'sidebar',
      className: `${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`
    }, [
      // Header
      React.createElement('div', {
        key: 'sidebar-header',
        className: 'flex items-center justify-between p-4 border-b'
      }, [
        sidebarOpen && React.createElement('div', {
          key: 'header-content',
          className: 'flex items-center space-x-3'
        }, [
          React.createElement('div', {
            key: 'header-icon',
            className: 'w-8 h-8 bg-pastel-mint rounded-lg flex items-center justify-center'
          }, React.createElement(Icon, { name: 'building-office', className: 'w-5 h-5 text-green-700' })),
          
          React.createElement('div', {
            key: 'header-text'
          }, [
            React.createElement('h1', {
              key: 'header-title',
              className: 'font-semibold text-gray-900'
            }, 'מערכת בדיקות'),
            
            React.createElement('p', {
              key: 'header-user',
              className: 'text-xs text-gray-500'
            }, user?.name)
          ])
        ]),

        React.createElement('button', {
          key: 'sidebar-toggle',
          onClick: () => setSidebarOpen(!sidebarOpen),
          className: 'p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
        }, React.createElement(Icon, { 
          name: sidebarOpen ? 'x-mark' : 'bars-3', 
          className: 'w-5 h-5 text-gray-500' 
        }))
      ]),

      // Navigation
      React.createElement('nav', {
        key: 'navigation',
        className: 'flex-1 px-2 py-4 space-y-1'
      }, navigationItems.map(item => 
        React.createElement('button', {
          key: item.id,
          onClick: () => setCurrentView(item.id),
          className: `sidebar-item w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
            currentView === item.id ? 'active' : 'text-gray-600 hover:text-gray-900'
          }`,
          title: !sidebarOpen ? item.description : ''
        }, [
          React.createElement(Icon, {
            key: 'nav-icon',
            name: item.icon,
            className: 'w-5 h-5 flex-shrink-0'
          }),
          
          sidebarOpen && React.createElement('span', {
            key: 'nav-text',
            className: 'mr-3'
          }, item.name)
        ])
      )),

      // Logout
      React.createElement('div', {
        key: 'sidebar-footer',
        className: 'p-2 border-t'
      }, React.createElement('button', {
        onClick: logout,
        className: 'sidebar-item w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-red-600 hover:text-red-800',
        title: !sidebarOpen ? 'יציאה מהמערכת' : ''
      }, [
        React.createElement(Icon, {
          key: 'logout-icon',
          name: 'arrow-right-on-rectangle',
          className: 'w-5 h-5 flex-shrink-0'
        }),
        
        sidebarOpen && React.createElement('span', {
          key: 'logout-text',
          className: 'mr-3'
        }, 'יציאה')
      ]))
    ]),

    // Main content
    React.createElement('div', {
      key: 'main-content',
      className: 'flex-1 flex flex-col overflow-hidden'
    }, [
      // Top bar
      React.createElement('header', {
        key: 'top-bar',
        className: 'bg-white shadow-sm border-b px-6 py-4'
      }, React.createElement('div', {
        className: 'flex items-center justify-between'
      }, [
        React.createElement('div', {
          key: 'top-bar-title'
        }, [
          React.createElement('h1', {
            key: 'page-title',
            className: 'text-2xl font-semibold text-gray-900'
          }, navigationItems.find(item => item.id === currentView)?.name || 'מערכת ניהול בדיקות'),
          
          React.createElement('p', {
            key: 'page-description',
            className: 'text-sm text-gray-500 mt-1'
          }, navigationItems.find(item => item.id === currentView)?.description || '')
        ]),

        React.createElement('div', {
          key: 'top-bar-actions',
          className: 'flex items-center space-x-4'
        }, [
          React.createElement('div', {
            key: 'user-info',
            className: 'flex items-center space-x-2 text-sm'
          }, [
            React.createElement('div', {
              key: 'user-avatar',
              className: 'w-8 h-8 bg-pastel-purple rounded-full flex items-center justify-center'
            }, React.createElement('span', {
              className: 'text-white font-medium'
            }, user?.name?.charAt(0) || 'U')),
            
            React.createElement('div', {
              key: 'user-details',
              className: 'text-right'
            }, [
              React.createElement('div', {
                key: 'user-name',
                className: 'font-medium text-gray-900'
              }, user?.name),
              
              React.createElement('div', {
                key: 'user-role',
                className: 'text-xs text-gray-500'
              }, user?.role === 'admin' ? 'מנהל מערכת' : 'בודק/מוכר')
            ])
          ])
        ])
      ])),

      // Page content
      React.createElement('main', {
        key: 'page-content',
        className: 'flex-1 overflow-auto p-6'
      }, renderCurrentView())
    ])
  ]);
};

// Dashboard Statistics Card Component
const StatsCard = ({ title, value, icon, subtitle, color = 'pastel-mint' }) => {
  return React.createElement('div', {
    className: 'bg-white rounded-lg shadow-sm border p-6 hover-lift'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between mb-4'
    }, [
      React.createElement('div', {
        key: 'icon-container',
        className: `w-12 h-12 bg-${color} rounded-lg flex items-center justify-center`
      }, React.createElement(Icon, { name: icon, className: 'w-6 h-6 text-gray-700' })),
      
      React.createElement('div', {
        key: 'stats',
        className: 'text-right'
      }, [
        React.createElement('div', {
          key: 'value',
          className: 'text-2xl font-bold text-gray-900'
        }, value),
        subtitle && React.createElement('div', {
          key: 'subtitle',
          className: 'text-sm text-gray-500'
        }, subtitle)
      ])
    ]),
    
    React.createElement('h3', {
      key: 'title',
      className: 'text-sm font-medium text-gray-600'
    }, title)
  ]);
};

// Recent Events List Component
const RecentEventsList = ({ events, onEventClick }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      preparing: { text: 'בהכנה', class: 'status-preparing' },
      planned: { text: 'מתוכנן', class: 'status-planned' },
      completed: { text: 'הסתיים', class: 'status-completed' },
      cancelled: { text: 'בוטל', class: 'status-cancelled' },
      postponed: { text: 'נדחה', class: 'status-postponed' }
    };
    
    const config = statusConfig[status] || statusConfig.preparing;
    
    return React.createElement('span', {
      className: `status-badge ${config.class}`
    }, config.text);
  };

  return React.createElement('div', {
    className: 'bg-white rounded-lg shadow-sm border'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'px-6 py-4 border-b'
    }, React.createElement('h3', {
      className: 'text-lg font-semibold text-gray-900'
    }, 'אירועים אחרונים')),
    
    React.createElement('div', {
      key: 'list',
      className: 'divide-y'
    }, events.length > 0 ? events.map(event => 
      React.createElement('div', {
        key: event._id,
        onClick: () => onEventClick && onEventClick(event),
        className: 'px-6 py-4 table-row cursor-pointer'
      }, [
        React.createElement('div', {
          key: 'content',
          className: 'flex items-center justify-between'
        }, [
          React.createElement('div', {
            key: 'main-info',
            className: 'flex-1'
          }, [
            React.createElement('div', {
              key: 'name-status',
              className: 'flex items-center space-x-3 mb-1'
            }, [
              React.createElement('h4', {
                key: 'name',
                className: 'font-medium text-gray-900'
              }, event.organizationName),
              
              getStatusBadge(event.status)
            ]),
            
            React.createElement('div', {
              key: 'details',
              className: 'text-sm text-gray-600'
            }, [
              React.createElement('span', {
                key: 'date'
              }, new Date(event.eventDate).toLocaleDateString('he-IL')),
              
              React.createElement('span', {
                key: 'separator',
                className: 'mx-2'
              }, '•'),
              
              React.createElement('span', {
                key: 'registered'
              }, `${event.totalRegistered} נרשמים`),
              
              React.createElement('span', {
                key: 'separator2',
                className: 'mx-2'
              }, '•'),
              
              React.createElement('span', {
                key: 'tested'
              }, `${event.totalTested} נבדקו`)
            ])
          ]),
          
          React.createElement('div', {
            key: 'revenue',
            className: 'text-left'
          }, [
            React.createElement('div', {
              key: 'amount',
              className: 'font-semibold text-gray-900'
            }, `₪${event.totalRevenue.toLocaleString()}`),
            
            React.createElement('div', {
              key: 'waiting',
              className: 'text-sm text-gray-500'
            }, `${event.totalWaiting} ממתינים`)
          ])
        ])
      ])
    ) : React.createElement('div', {
      key: 'empty',
      className: 'px-6 py-8 text-center text-gray-500'
    }, 'אין אירועים עדיין'))
  ]);
};

// Main Dashboard View Component
const DashboardView = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('אין הרשאה גישה');
        return;
      }

      const response = await axios.get(`${API_BASE}/events/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.error || 'שגיאה בטעינת הנתונים');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (event) => {
    // Navigate to event management
    window.dispatchEvent(new CustomEvent('navigate-to-event', { detail: event._id }));
  };

  if (isLoading) {
    return React.createElement('div', {
      className: 'animate-fade-in flex items-center justify-center py-12'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'spinner mx-auto'
      }),
      React.createElement('span', {
        key: 'text',
        className: 'mr-3 text-gray-600'
      }, 'טוען נתונים...')
    ]);
  }

  if (error) {
    return React.createElement('div', {
      className: 'animate-fade-in'
    }, React.createElement('div', {
      className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
    }, error));
  }

  if (!dashboardData) {
    return React.createElement('div', {
      className: 'animate-fade-in text-center py-12'
    }, React.createElement('p', {
      className: 'text-gray-600'
    }, 'אין נתונים להצגה'));
  }

  const { currentMonth, recentEvents } = dashboardData;

  return React.createElement('div', {
    className: 'animate-fade-in space-y-6'
  }, [
    // Page header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'title-section'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, 'מבט על'),
        
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-600 mt-1'
        }, `נתוני החודש הנוכחי - ${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}`)
      ]),
      
      React.createElement('button', {
        key: 'refresh',
        onClick: loadDashboardData,
        className: 'btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2'
      }, [
        React.createElement(Icon, {
          key: 'refresh-icon',
          name: 'arrow-path',
          className: 'w-4 h-4'
        }),
        React.createElement('span', {
          key: 'refresh-text'
        }, 'רענן')
      ])
    ]),

    // Statistics cards grid
    React.createElement('div', {
      key: 'stats-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6'
    }, [
      React.createElement(StatsCard, {
        key: 'total-events',
        title: 'סך אירועים',
        value: currentMonth.totalEvents,
        icon: 'calendar-days',
        color: 'pastel-blue'
      }),
      
      React.createElement(StatsCard, {
        key: 'completed-events',
        title: 'אירועים שהסתיימו',
        value: currentMonth.completedEvents,
        icon: 'check-circle',
        color: 'pastel-green'
      }),
      
      React.createElement(StatsCard, {
        key: 'upcoming-events',
        title: 'אירועים צפויים',
        value: currentMonth.upcomingEvents,
        icon: 'clock',
        color: 'pastel-yellow'
      }),
      
      React.createElement(StatsCard, {
        key: 'total-revenue',
        title: 'הכנסות כוללות',
        value: `₪${currentMonth.totalRevenue.toLocaleString()}`,
        icon: 'banknotes',
        color: 'pastel-mint'
      }),
      
      React.createElement(StatsCard, {
        key: 'average-transaction',
        title: 'ממוצע עסקה',
        value: `₪${Math.round(currentMonth.averageTransaction).toLocaleString()}`,
        icon: 'chart-bar',
        color: 'pastel-purple'
      }),
      
      React.createElement(StatsCard, {
        key: 'test-to-sale-ratio',
        title: 'יחס בדיקות/עסקאות',
        value: `${Math.round(currentMonth.testToSaleRatio)}%`,
        subtitle: `מתוך ${currentMonth.totalEvents} בדיקות`,
        icon: 'arrow-trending-up',
        color: 'pastel-pink'
      })
    ]),

    // Recent events
    React.createElement(RecentEventsList, {
      key: 'recent-events',
      events: recentEvents,
      onEventClick: handleEventClick
    })
  ]);
};

// Event Form Modal Component
const EventFormModal = ({ isOpen, onClose, eventData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    minimumParticipants: 10,
    testDuration: 30,
    breakDuration: 10,
    customBreaks: [],
    relevantIssues: [],
    eventPassword: '',
    marketingMessage: '',
    colorPalette: {
      primary: '#a3e4d7',
      secondary: '#fbb6ce',
      accent: '#a78bfa',
      background: '#f1f5f9',
      text: '#334155'
    },
    iconName: 'heart',
    bannerImage: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventData) {
      setFormData({
        ...eventData,
        eventDate: new Date(eventData.eventDate).toISOString().split('T')[0]
      });
    }
  }, [eventData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('אין הרשאת גישה');
      }

      const url = eventData 
        ? `${API_BASE}/events/${eventData._id}`
        : `${API_BASE}/events`;
      
      const method = eventData ? 'put' : 'post';

      const response = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onSuccess && onSuccess(response.data.data);
        onClose();
      } else {
        setError(response.data.error || 'שגיאה בשמירת האירוע');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop'
  }, React.createElement('div', {
    className: 'bg-white rounded-lg shadow-2xl max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto'
  }, [
    // Modal Header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-6 border-b'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold'
      }, eventData ? 'עריכת אירוע' : 'יצירת אירוע חדש'),
      
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        className: 'p-2 hover:bg-gray-100 rounded-lg'
      }, React.createElement(Icon, { name: 'x-mark', className: 'w-5 h-5' }))
    ]),

    // Modal Body
    React.createElement('form', {
      key: 'form',
      id: 'event-form',
      onSubmit: handleSubmit,
      className: 'p-6 space-y-6'
    }, [
      error && React.createElement('div', {
        key: 'error',
        className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
      }, error),

      // Basic Info
      React.createElement('div', {
        key: 'basic-info',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
      }, [
        React.createElement('div', {
          key: 'org-name'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'שם הארגון *'),
          React.createElement('input', {
            type: 'text',
            value: formData.organizationName,
            onChange: (e) => setFormData(prev => ({ ...prev, organizationName: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            required: true
          })
        ]),

        React.createElement('div', {
          key: 'event-date'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'תאריך האירוע *'),
          React.createElement('input', {
            type: 'date',
            value: formData.eventDate,
            onChange: (e) => setFormData(prev => ({ ...prev, eventDate: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            required: true
          })
        ])
      ]),

      // Time Settings
      React.createElement('div', {
        key: 'time-settings',
        className: 'grid grid-cols-2 md:grid-cols-4 gap-6'
      }, [
        React.createElement('div', {
          key: 'start-time'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'שעת התחלה *'),
          React.createElement('input', {
            type: 'time',
            value: formData.startTime,
            onChange: (e) => setFormData(prev => ({ ...prev, startTime: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            required: true
          })
        ]),

        React.createElement('div', {
          key: 'end-time'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'שעת סיום *'),
          React.createElement('input', {
            type: 'time',
            value: formData.endTime,
            onChange: (e) => setFormData(prev => ({ ...prev, endTime: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            required: true
          })
        ]),

        React.createElement('div', {
          key: 'test-duration'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'משך בדיקה (דק\')'),
          React.createElement('input', {
            type: 'number',
            value: formData.testDuration,
            onChange: (e) => setFormData(prev => ({ ...prev, testDuration: parseInt(e.target.value) })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            min: 5,
            max: 120
          })
        ]),

        React.createElement('div', {
          key: 'break-duration'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'הפסקה בין בדיקות (דק\')'),
          React.createElement('input', {
            type: 'number',
            value: formData.breakDuration,
            onChange: (e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            min: 0,
            max: 60
          })
        ])
      ]),

      // Event Password and Marketing
      React.createElement('div', {
        key: 'marketing',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
      }, [
        React.createElement('div', {
          key: 'password'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'סיסמת אירוע *'),
          React.createElement('input', {
            type: 'text',
            value: formData.eventPassword,
            onChange: (e) => setFormData(prev => ({ ...prev, eventPassword: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            placeholder: 'סיסמה לרישום עובדים',
            required: true
          })
        ]),

        React.createElement('div', {
          key: 'min-participants'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'מינימום נרשמים'),
          React.createElement('input', {
            type: 'number',
            value: formData.minimumParticipants,
            onChange: (e) => setFormData(prev => ({ ...prev, minimumParticipants: parseInt(e.target.value) })),
            className: 'form-input w-full px-3 py-2 rounded-lg',
            min: 1
          })
        ])
      ]),

      React.createElement('div', {
        key: 'marketing-message'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'הודעה שיווקית'),
        React.createElement('textarea', {
          value: formData.marketingMessage,
          onChange: (e) => setFormData(prev => ({ ...prev, marketingMessage: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          rows: 4,
          placeholder: 'הודעה שתוצג לעובדים בדף הרישום'
        })
      ]),

      // Custom Breaks Schedule
      React.createElement('div', {
        key: 'custom-breaks-section',
        className: 'space-y-4'
      }, [
        React.createElement('div', {
          key: 'breaks-header',
          className: 'flex items-center justify-between'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium text-gray-900'
          }, 'הגדרת הפסקות במהלך היום'),
          React.createElement('button', {
            key: 'add-break',
            type: 'button',
            onClick: () => {
              const newBreak = {
                id: Date.now(),
                startTime: '12:00',
                endTime: '12:30',
                description: 'הפסקת צהריים'
              };
              setFormData(prev => ({
                ...prev,
                customBreaks: [...prev.customBreaks, newBreak]
              }));
            },
            className: 'btn-secondary px-3 py-1 text-sm rounded-lg flex items-center space-x-2'
          }, [
            React.createElement(Icon, { key: 'icon', name: 'plus', className: 'w-4 h-4' }),
            React.createElement('span', { key: 'text' }, 'הוסף הפסקה')
          ])
        ]),
        React.createElement('div', {
          key: 'breaks-list',
          className: 'space-y-3'
        }, formData.customBreaks.map(breakItem => 
          React.createElement('div', {
            key: breakItem.id,
            className: 'grid grid-cols-5 gap-4 items-center bg-gray-50 p-4 rounded-lg'
          }, [
            React.createElement('div', { key: 'start-time' }, [
              React.createElement('label', {
                className: 'block text-xs font-medium text-gray-600 mb-1'
              }, 'שעת התחלה'),
              React.createElement('input', {
                type: 'time',
                value: breakItem.startTime,
                onChange: (e) => {
                  setFormData(prev => ({
                    ...prev,
                    customBreaks: prev.customBreaks.map(b => 
                      b.id === breakItem.id ? { ...b, startTime: e.target.value } : b
                    )
                  }));
                },
                className: 'form-input w-full px-2 py-1 text-sm rounded'
              })
            ]),
            React.createElement('div', { key: 'end-time' }, [
              React.createElement('label', {
                className: 'block text-xs font-medium text-gray-600 mb-1'
              }, 'שעת סיום'),
              React.createElement('input', {
                type: 'time',
                value: breakItem.endTime,
                onChange: (e) => {
                  setFormData(prev => ({
                    ...prev,
                    customBreaks: prev.customBreaks.map(b => 
                      b.id === breakItem.id ? { ...b, endTime: e.target.value } : b
                    )
                  }));
                },
                className: 'form-input w-full px-2 py-1 text-sm rounded'
              })
            ]),
            React.createElement('div', {
              key: 'description',
              className: 'col-span-2'
            }, [
              React.createElement('label', {
                className: 'block text-xs font-medium text-gray-600 mb-1'
              }, 'תיאור ההפסקה'),
              React.createElement('input', {
                type: 'text',
                value: breakItem.description,
                onChange: (e) => {
                  setFormData(prev => ({
                    ...prev,
                    customBreaks: prev.customBreaks.map(b => 
                      b.id === breakItem.id ? { ...b, description: e.target.value } : b
                    )
                  }));
                },
                className: 'form-input w-full px-2 py-1 text-sm rounded',
                placeholder: 'למשל: הפסקת צהריים'
              })
            ]),
            React.createElement('div', {
              key: 'actions',
              className: 'flex justify-end'
            }, React.createElement('button', {
              type: 'button',
              onClick: () => {
                setFormData(prev => ({
                  ...prev,
                  customBreaks: prev.customBreaks.filter(b => b.id !== breakItem.id)
                }));
              },
              className: 'p-1 hover:bg-red-100 text-red-600 rounded'
            }, React.createElement(Icon, { name: 'trash', className: 'w-4 h-4' })))
          ])
        ))
      ]),

      // Participant Questions Section
      React.createElement('div', {
        key: 'questions-section',
        className: 'space-y-4'
      }, [
        React.createElement('div', {
          key: 'questions-header',
          className: 'flex items-center justify-between'
        }, [
          React.createElement('h3', {
            key: 'title',
            className: 'text-lg font-medium text-gray-900'
          }, 'שאלות מותאמות אישית לנבדקים'),
          React.createElement('button', {
            key: 'add-question',
            type: 'button',
            onClick: () => {
              const newQuestion = {
                id: Date.now(),
                question: '',
                type: 'text',
                required: false,
                options: []
              };
              setFormData(prev => ({
                ...prev,
                relevantIssues: [...prev.relevantIssues, newQuestion]
              }));
            },
            className: 'btn-secondary px-3 py-1 text-sm rounded-lg flex items-center space-x-2'
          }, [
            React.createElement(Icon, { key: 'icon', name: 'plus', className: 'w-4 h-4' }),
            React.createElement('span', { key: 'text' }, 'הוסף שאלה')
          ])
        ]),
        React.createElement('div', {
          key: 'questions-list',
          className: 'space-y-4'
        }, formData.relevantIssues.map((question, index) => 
          React.createElement('div', {
            key: question.id,
            className: 'bg-gray-50 p-4 rounded-lg space-y-3'
          }, [
            React.createElement('div', {
              key: 'question-header',
              className: 'flex items-center justify-between'
            }, [
              React.createElement('span', {
                className: 'font-medium text-gray-700'
              }, `שאלה ${index + 1}`),
              React.createElement('button', {
                type: 'button',
                onClick: () => {
                  setFormData(prev => ({
                    ...prev,
                    relevantIssues: prev.relevantIssues.filter(q => q.id !== question.id)
                  }));
                },
                className: 'p-1 hover:bg-red-100 text-red-600 rounded'
              }, React.createElement(Icon, { name: 'trash', className: 'w-4 h-4' }))
            ]),
            React.createElement('div', {
              key: 'question-content',
              className: 'grid grid-cols-1 md:grid-cols-3 gap-4'
            }, [
              React.createElement('div', {
                key: 'question-text',
                className: 'md:col-span-2'
              }, [
                React.createElement('label', {
                  className: 'block text-xs font-medium text-gray-600 mb-1'
                }, 'טקסט השאלה'),
                React.createElement('input', {
                  type: 'text',
                  value: question.question,
                  onChange: (e) => {
                    setFormData(prev => ({
                      ...prev,
                      relevantIssues: prev.relevantIssues.map(q => 
                        q.id === question.id ? { ...q, question: e.target.value } : q
                      )
                    }));
                  },
                  className: 'form-input w-full px-2 py-1 text-sm rounded',
                  placeholder: 'הזן את השאלה כאן...'
                })
              ]),
              React.createElement('div', {
                key: 'question-type'
              }, [
                React.createElement('label', {
                  className: 'block text-xs font-medium text-gray-600 mb-1'
                }, 'סוג השאלה'),
                React.createElement('select', {
                  value: question.type,
                  onChange: (e) => {
                    setFormData(prev => ({
                      ...prev,
                      relevantIssues: prev.relevantIssues.map(q => 
                        q.id === question.id ? { ...q, type: e.target.value } : q
                      )
                    }));
                  },
                  className: 'form-input w-full px-2 py-1 text-sm rounded'
                }, [
                  React.createElement('option', { key: 'text', value: 'text' }, 'טקסט חופשי'),
                  React.createElement('option', { key: 'select', value: 'select' }, 'בחירה מרשימה'),
                  React.createElement('option', { key: 'checkbox', value: 'checkbox' }, 'תיבות סימון'),
                  React.createElement('option', { key: 'radio', value: 'radio' }, 'בחירה יחידה')
                ])
              ])
            ]),
            React.createElement('div', {
              key: 'question-required',
              className: 'flex items-center'
            }, [
              React.createElement('input', {
                type: 'checkbox',
                checked: question.required,
                onChange: (e) => {
                  setFormData(prev => ({
                    ...prev,
                    relevantIssues: prev.relevantIssues.map(q => 
                      q.id === question.id ? { ...q, required: e.target.checked } : q
                    )
                  }));
                },
                className: 'rounded border-gray-300 text-pastel-mint focus:ring-pastel-mint mr-2'
              }),
              React.createElement('span', {
                className: 'text-sm text-gray-700'
              }, 'שאלה חובה')
            ])
          ])
        ))
      ]),

      // Registration Page Design
      React.createElement('div', {
        key: 'design-section',
        className: 'space-y-4'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'text-lg font-medium text-gray-900'
        }, 'עיצוב דף הרישום'),
        React.createElement('div', {
          key: 'design-content',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }, [
          // Color Palette
          React.createElement('div', {
            key: 'colors',
            className: 'space-y-4'
          }, [
            React.createElement('h4', {
              className: 'font-medium text-gray-800 mb-3'
            }, 'ערכת צבעים'),
            React.createElement('div', {
              className: 'space-y-3'
            }, [
              React.createElement('div', {
                key: 'primary-color',
                className: 'flex items-center space-x-3'
              }, [
                React.createElement('label', {
                  className: 'text-sm font-medium text-gray-700 w-20'
                }, 'צבע ראשי:'),
                React.createElement('input', {
                  type: 'color',
                  value: formData.colorPalette.primary,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, primary: e.target.value }
                  })),
                  className: 'w-12 h-8 rounded border border-gray-300'
                }),
                React.createElement('input', {
                  type: 'text',
                  value: formData.colorPalette.primary,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, primary: e.target.value }
                  })),
                  className: 'form-input flex-1 px-2 py-1 text-sm rounded',
                  placeholder: '#a3e4d7'
                })
              ]),
              React.createElement('div', {
                key: 'secondary-color',
                className: 'flex items-center space-x-3'
              }, [
                React.createElement('label', {
                  className: 'text-sm font-medium text-gray-700 w-20'
                }, 'צבע משני:'),
                React.createElement('input', {
                  type: 'color',
                  value: formData.colorPalette.secondary,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, secondary: e.target.value }
                  })),
                  className: 'w-12 h-8 rounded border border-gray-300'
                }),
                React.createElement('input', {
                  type: 'text',
                  value: formData.colorPalette.secondary,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, secondary: e.target.value }
                  })),
                  className: 'form-input flex-1 px-2 py-1 text-sm rounded',
                  placeholder: '#fbb6ce'
                })
              ]),
              React.createElement('div', {
                key: 'accent-color',
                className: 'flex items-center space-x-3'
              }, [
                React.createElement('label', {
                  className: 'text-sm font-medium text-gray-700 w-20'
                }, 'צבע הדגשה:'),
                React.createElement('input', {
                  type: 'color',
                  value: formData.colorPalette.accent,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, accent: e.target.value }
                  })),
                  className: 'w-12 h-8 rounded border border-gray-300'
                }),
                React.createElement('input', {
                  type: 'text',
                  value: formData.colorPalette.accent,
                  onChange: (e) => setFormData(prev => ({
                    ...prev,
                    colorPalette: { ...prev.colorPalette, accent: e.target.value }
                  })),
                  className: 'form-input flex-1 px-2 py-1 text-sm rounded',
                  placeholder: '#a78bfa'
                })
              ])
            ])
          ]),
          // Banner and Icon
          React.createElement('div', {
            key: 'banner-icon',
            className: 'space-y-4'
          }, [
            React.createElement('div', {
              key: 'banner'
            }, [
              React.createElement('label', {
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'תמונת באנר (URL)'),
              React.createElement('input', {
                type: 'url',
                value: formData.bannerImage,
                onChange: (e) => setFormData(prev => ({ ...prev, bannerImage: e.target.value })),
                className: 'form-input w-full px-3 py-2 rounded-lg',
                placeholder: 'https://example.com/banner.jpg'
              }),
              React.createElement('p', {
                className: 'text-xs text-gray-500 mt-1'
              }, 'תמונה שתוצג בחלק העליון של דף הרישום')
            ]),
            React.createElement('div', {
              key: 'icon'
            }, [
              React.createElement('label', {
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'אייקון'),
              React.createElement('select', {
                value: formData.iconName,
                onChange: (e) => setFormData(prev => ({ ...prev, iconName: e.target.value })),
                className: 'form-input w-full px-3 py-2 rounded-lg'
              }, [
                React.createElement('option', { key: 'heart', value: 'heart' }, '❤️ לב'),
                React.createElement('option', { key: 'building-office', value: 'building-office' }, '🏢 בניין'),
                React.createElement('option', { key: 'users', value: 'users' }, '👥 אנשים'),
                React.createElement('option', { key: 'calendar-days', value: 'calendar-days' }, '📅 לוח שנה'),
                React.createElement('option', { key: 'chart-bar', value: 'chart-bar' }, '📊 גרף'),
                React.createElement('option', { key: 'check-circle', value: 'check-circle' }, '✅ וי'),
                React.createElement('option', { key: 'cog-6-tooth', value: 'cog-6-tooth' }, '⚙️ הגדרות')
              ])
            ])
          ])
        ])
      ])
    ]),

    // Modal Footer
    React.createElement('div', {
      key: 'footer',
      className: 'flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50'
    }, [
      React.createElement('button', {
        key: 'cancel',
        type: 'button',
        onClick: onClose,
        className: 'btn-secondary px-4 py-2 rounded-lg'
      }, 'ביטול'),
      
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        disabled: isSubmitting,
        className: 'btn-primary px-6 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2',
        form: 'event-form'
      }, isSubmitting ? [
        React.createElement('div', { key: 'spinner', className: 'spinner mr-2' }),
        React.createElement('span', { key: 'text' }, 'שומר...')
      ] : (eventData ? 'עדכן אירוע' : 'צור אירוע'))
    ])
  ]));
};

// Events List Component
const EventsView = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    month: 'all',
    year: new Date().getFullYear().toString(),
    status: 'all'
  });

  const { user } = useContext(AuthContext);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('אין הרשאת גישה');
        return;
      }

      const response = await axios.get(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError(response.data.error || 'שגיאה בטעינת האירועים');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filters.month !== 'all' && filters.year !== 'all') {
      const targetMonth = parseInt(filters.month) - 1; // JavaScript months are 0-based
      const targetYear = parseInt(filters.year);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate.getMonth() === targetMonth && eventDate.getFullYear() === targetYear;
      });
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    setFilteredEvents(filtered);
  };

  const handleEventSuccess = () => {
    loadEvents();
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את האירוע?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(`${API_BASE}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        loadEvents();
      } else {
        alert('שגיאה במחיקת האירוע');
      }
    } catch (error) {
      alert('שגיאה בחיבור לשרת');
    }
  };

  const copyRegistrationLink = (event) => {
    const link = `${window.location.origin}/register/${event._id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('הקישור הועתק ללוח');
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      preparing: { text: 'בהכנה', class: 'status-preparing' },
      planned: { text: 'מתוכנן', class: 'status-planned' },
      completed: { text: 'הסתיים', class: 'status-completed' },
      cancelled: { text: 'בוטל', class: 'status-cancelled' },
      postponed: { text: 'נדחה', class: 'status-postponed' }
    };
    
    const config = statusConfig[status] || statusConfig.preparing;
    
    return React.createElement('span', {
      className: `status-badge ${config.class}`
    }, config.text);
  };

  if (isLoading) {
    return React.createElement('div', {
      className: 'animate-fade-in flex items-center justify-center py-12'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'spinner mx-auto'
      }),
      React.createElement('span', {
        key: 'text',
        className: 'mr-3 text-gray-600'
      }, 'טוען אירועים...')
    ]);
  }

  return React.createElement('div', {
    className: 'animate-fade-in space-y-6'
  }, [
    // Header with create button
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'title-section'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, 'ניהול אירועים'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-600 mt-1'
        }, `${filteredEvents.length} אירועים מתוך ${events.length}`)
      ]),

      user?.role === 'admin' && React.createElement('button', {
        key: 'create-btn',
        onClick: () => {
          setSelectedEvent(null);
          setShowEventForm(true);
        },
        className: 'btn-primary px-4 py-2 rounded-lg flex items-center space-x-2'
      }, [
        React.createElement(Icon, {
          key: 'plus-icon',
          name: 'plus',
          className: 'w-5 h-5'
        }),
        React.createElement('span', {
          key: 'text'
        }, 'צור אירוע חדש')
      ])
    ]),

    // Filters
    React.createElement('div', {
      key: 'filters',
      className: 'bg-white rounded-lg shadow-sm border p-4'
    }, React.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-4 gap-4'
    }, [
      React.createElement('div', {
        key: 'year-filter'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-1'
        }, 'שנה'),
        React.createElement('select', {
          value: filters.year,
          onChange: (e) => setFilters(prev => ({ ...prev, year: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        }, [
          React.createElement('option', { key: 'all-years', value: 'all' }, 'כל השנים'),
          React.createElement('option', { key: '2024', value: '2024' }, '2024'),
          React.createElement('option', { key: '2025', value: '2025' }, '2025')
        ])
      ]),

      React.createElement('div', {
        key: 'month-filter'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-1'
        }, 'חודש'),
        React.createElement('select', {
          value: filters.month,
          onChange: (e) => setFilters(prev => ({ ...prev, month: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        }, [
          React.createElement('option', { key: 'all-months', value: 'all' }, 'כל החודשים'),
          React.createElement('option', { key: '1', value: '1' }, 'ינואר'),
          React.createElement('option', { key: '2', value: '2' }, 'פברואר'),
          React.createElement('option', { key: '3', value: '3' }, 'מרץ'),
          React.createElement('option', { key: '4', value: '4' }, 'אפריל'),
          React.createElement('option', { key: '5', value: '5' }, 'מאי'),
          React.createElement('option', { key: '6', value: '6' }, 'יוני'),
          React.createElement('option', { key: '7', value: '7' }, 'יולי'),
          React.createElement('option', { key: '8', value: '8' }, 'אוגוסט'),
          React.createElement('option', { key: '9', value: '9' }, 'ספטמבר'),
          React.createElement('option', { key: '10', value: '10' }, 'אוקטובר'),
          React.createElement('option', { key: '11', value: '11' }, 'נובמבר'),
          React.createElement('option', { key: '12', value: '12' }, 'דצמבר')
        ])
      ]),

      React.createElement('div', {
        key: 'status-filter'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-1'
        }, 'סטטוס'),
        React.createElement('select', {
          value: filters.status,
          onChange: (e) => setFilters(prev => ({ ...prev, status: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        }, [
          React.createElement('option', { key: 'all-status', value: 'all' }, 'כל הסטטוסים'),
          React.createElement('option', { key: 'preparing', value: 'preparing' }, 'בהכנה'),
          React.createElement('option', { key: 'planned', value: 'planned' }, 'מתוכנן'),
          React.createElement('option', { key: 'completed', value: 'completed' }, 'הסתיים'),
          React.createElement('option', { key: 'cancelled', value: 'cancelled' }, 'בוטל'),
          React.createElement('option', { key: 'postponed', value: 'postponed' }, 'נדחה')
        ])
      ]),

      React.createElement('div', {
        key: 'refresh-btn',
        className: 'flex items-end'
      }, React.createElement('button', {
        onClick: loadEvents,
        className: 'btn-secondary w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2'
      }, [
        React.createElement(Icon, {
          key: 'refresh-icon',
          name: 'arrow-path',
          className: 'w-4 h-4'
        }),
        React.createElement('span', {
          key: 'text'
        }, 'רענן')
      ]))
    ])),

    // Events table
    error ? React.createElement('div', {
      key: 'error',
      className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
    }, error) : React.createElement('div', {
      key: 'events-table',
      className: 'bg-white rounded-lg shadow-sm border overflow-hidden'
    }, filteredEvents.length > 0 ? [
      React.createElement('div', {
        key: 'table-header',
        className: 'px-6 py-3 border-b bg-gray-50 hidden md:block'
      }, React.createElement('div', {
        className: 'grid grid-cols-12 gap-4 text-sm font-medium text-gray-700'
      }, [
        React.createElement('div', { key: 'col1', className: 'col-span-3' }, 'ארגון'),
        React.createElement('div', { key: 'col2', className: 'col-span-2' }, 'תאריך'),
        React.createElement('div', { key: 'col3', className: 'col-span-2' }, 'סטטוס'),
        React.createElement('div', { key: 'col4', className: 'col-span-1 text-center' }, 'נרשמים'),
        React.createElement('div', { key: 'col5', className: 'col-span-1 text-center' }, 'נבדקו'),
        React.createElement('div', { key: 'col6', className: 'col-span-1 text-center' }, 'ממתינים'),
        React.createElement('div', { key: 'col7', className: 'col-span-2' }, 'פעולות')
      ])),

      React.createElement('div', {
        key: 'table-body',
        className: 'divide-y'
      }, filteredEvents.map(event => 
        React.createElement('div', {
          key: event._id,
          className: 'px-6 py-4 table-row'
        }, React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-12 gap-4'
        }, [
          React.createElement('div', {
            key: 'org-name',
            className: 'md:col-span-3'
          }, [
            React.createElement('div', {
              className: 'font-medium text-gray-900'
            }, event.organizationName),
            React.createElement('div', {
              className: 'md:hidden text-sm text-gray-500 mt-1'
            }, new Date(event.eventDate).toLocaleDateString('he-IL'))
          ]),

          React.createElement('div', {
            key: 'date',
            className: 'md:col-span-2 hidden md:block text-gray-600'
          }, new Date(event.eventDate).toLocaleDateString('he-IL')),

          React.createElement('div', {
            key: 'status',
            className: 'md:col-span-2'
          }, getStatusBadge(event.status)),

          React.createElement('div', {
            key: 'registered',
            className: 'md:col-span-1 text-center'
          }, React.createElement('span', {
            className: 'inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium'
          }, '12')), // This should come from API

          React.createElement('div', {
            key: 'tested',
            className: 'md:col-span-1 text-center'
          }, React.createElement('span', {
            className: 'inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full text-sm font-medium'
          }, '8')), // This should come from API

          React.createElement('div', {
            key: 'waiting',
            className: 'md:col-span-1 text-center'
          }, React.createElement('span', {
            className: 'inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full text-sm font-medium'
          }, '4')), // This should come from API

          React.createElement('div', {
            key: 'actions',
            className: 'md:col-span-2 flex items-center space-x-2'
          }, [
            React.createElement('button', {
              key: 'manage',
              onClick: () => {
                window.dispatchEvent(new CustomEvent('navigate-to-event', { detail: event._id }));
              },
              className: 'p-2 hover:bg-gray-100 rounded-lg',
              title: 'נהל אירוע'
            }, React.createElement(Icon, { name: 'cog-6-tooth', className: 'w-4 h-4 text-gray-600' })),

            React.createElement('button', {
              key: 'copy-link',
              onClick: () => copyRegistrationLink(event),
              className: 'p-2 hover:bg-gray-100 rounded-lg',
              title: 'העתק קישור רישום'
            }, React.createElement(Icon, { name: 'link', className: 'w-4 h-4 text-gray-600' })),

            user?.role === 'admin' && React.createElement('button', {
              key: 'edit',
              onClick: () => handleEditEvent(event),
              className: 'p-2 hover:bg-gray-100 rounded-lg',
              title: 'ערוך אירוע'
            }, React.createElement(Icon, { name: 'pencil', className: 'w-4 h-4 text-gray-600' })),

            user?.role === 'admin' && React.createElement('button', {
              key: 'delete',
              onClick: () => handleDeleteEvent(event._id),
              className: 'p-2 hover:bg-red-100 rounded-lg',
              title: 'מחק אירוע'
            }, React.createElement(Icon, { name: 'trash', className: 'w-4 h-4 text-red-600' }))
          ])
        ]))
      ))
    ] : React.createElement('div', {
      key: 'no-events',
      className: 'px-6 py-12 text-center text-gray-500'
    }, [
      React.createElement(Icon, {
        key: 'icon',
        name: 'calendar-days',
        className: 'w-12 h-12 mx-auto mb-4 text-gray-400'
      }),
      React.createElement('p', {
        key: 'text'
      }, 'אין אירועים להצגה')
    ])),

    // Event Form Modal
    React.createElement(EventFormModal, {
      key: 'event-form-modal',
      isOpen: showEventForm,
      onClose: () => {
        setShowEventForm(false);
        setSelectedEvent(null);
      },
      eventData: selectedEvent,
      onSuccess: handleEventSuccess
    })
  ]);
};

const ReportsView = () => {
  const [activeReport, setActiveReport] = useState('monthly');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: 'all',
    eventName: 'all',
    status: 'all'
  });

  useEffect(() => {
    if (activeReport === 'monthly') {
      loadMonthlyReport();
    } else {
      loadEventEmployeeReport();
    }
  }, [activeReport, filters]);

  const loadMonthlyReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filters.year !== 'all') params.append('year', filters.year);
      if (filters.month !== 'all') params.append('month', filters.month);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await axios.get(`${API_BASE}/reports/monthly?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading monthly report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventEmployeeReport = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filters.year !== 'all') params.append('year', filters.year);
      if (filters.month !== 'all') params.append('month', filters.month);
      if (filters.eventName !== 'all') params.append('eventName', filters.eventName);

      const response = await axios.get(`${API_BASE}/reports/event-employees?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error loading employee report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (filters.year !== 'all') params.append('year', filters.year);
      if (filters.month !== 'all') params.append('month', filters.month);
      if (filters.eventName !== 'all') params.append('eventName', filters.eventName);

      const response = await axios.get(`${API_BASE}/reports/event-employees/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('שגיאה בייצוא הדוח');
    }
  };

  return React.createElement('div', {
    className: 'animate-fade-in space-y-6'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'title-section'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, 'דוחות'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-600 mt-1'
        }, 'דוחות וסטטיסטיקות מפורטים')
      ]),

      React.createElement('button', {
        key: 'export',
        onClick: exportReport,
        disabled: activeReport === 'monthly',
        className: 'btn-primary px-4 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2'
      }, [
        React.createElement(Icon, {
          key: 'export-icon',
          name: 'document-arrow-down',
          className: 'w-4 h-4'
        }),
        React.createElement('span', {
          key: 'export-text'
        }, 'ייצא CSV')
      ])
    ]),

    // Report Tabs
    React.createElement('div', {
      key: 'tabs',
      className: 'bg-white rounded-lg shadow-sm border'
    }, [
      React.createElement('div', {
        key: 'tab-header',
        className: 'border-b'
      }, React.createElement('nav', {
        className: 'flex space-x-8 px-6'
      }, [
        React.createElement('button', {
          key: 'monthly-tab',
          onClick: () => setActiveReport('monthly'),
          className: `py-4 px-2 border-b-2 font-medium text-sm ${
            activeReport === 'monthly'
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, 'סיכום חודשי'),
        
        React.createElement('button', {
          key: 'employees-tab',
          onClick: () => setActiveReport('employees'),
          className: `py-4 px-2 border-b-2 font-medium text-sm ${
            activeReport === 'employees'
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, 'רשימת עובדים')
      ])),

      // Filters
      React.createElement('div', {
        key: 'filters',
        className: 'p-6 border-b bg-gray-50'
      }, React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-4 gap-4'
      }, [
        React.createElement('div', {
          key: 'year-filter'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-1'
          }, 'שנה'),
          React.createElement('select', {
            value: filters.year,
            onChange: (e) => setFilters(prev => ({ ...prev, year: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg'
          }, [
            React.createElement('option', { key: 'all-years', value: 'all' }, 'כל השנים'),
            React.createElement('option', { key: '2024', value: '2024' }, '2024'),
            React.createElement('option', { key: '2025', value: '2025' }, '2025')
          ])
        ]),

        React.createElement('div', {
          key: 'month-filter'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-1'
          }, 'חודש'),
          React.createElement('select', {
            value: filters.month,
            onChange: (e) => setFilters(prev => ({ ...prev, month: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg'
          }, [
            React.createElement('option', { key: 'all-months', value: 'all' }, 'כל החודשים'),
            React.createElement('option', { key: '1', value: '1' }, 'ינואר'),
            React.createElement('option', { key: '2', value: '2' }, 'פברואר'),
            React.createElement('option', { key: '3', value: '3' }, 'מרץ'),
            React.createElement('option', { key: '4', value: '4' }, 'אפריל'),
            React.createElement('option', { key: '5', value: '5' }, 'מאי'),
            React.createElement('option', { key: '6', value: '6' }, 'יוני'),
            React.createElement('option', { key: '7', value: '7' }, 'יולי'),
            React.createElement('option', { key: '8', value: '8' }, 'אוגוסט'),
            React.createElement('option', { key: '9', value: '9' }, 'ספטמבר'),
            React.createElement('option', { key: '10', value: '10' }, 'אוקטובר'),
            React.createElement('option', { key: '11', value: '11' }, 'נובמבר'),
            React.createElement('option', { key: '12', value: '12' }, 'דצמבר')
          ])
        ]),

        activeReport === 'monthly' && React.createElement('div', {
          key: 'status-filter'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-1'
          }, 'סטטוס'),
          React.createElement('select', {
            value: filters.status,
            onChange: (e) => setFilters(prev => ({ ...prev, status: e.target.value })),
            className: 'form-input w-full px-3 py-2 rounded-lg'
          }, [
            React.createElement('option', { key: 'all-status', value: 'all' }, 'כל הסטטוסים'),
            React.createElement('option', { key: 'preparing', value: 'preparing' }, 'בהכנה'),
            React.createElement('option', { key: 'planned', value: 'planned' }, 'מתוכנן'),
            React.createElement('option', { key: 'completed', value: 'completed' }, 'הסתיים'),
            React.createElement('option', { key: 'cancelled', value: 'cancelled' }, 'בוטל'),
            React.createElement('option', { key: 'postponed', value: 'postponed' }, 'נדחה')
          ])
        ])
      ])),

      // Content
      React.createElement('div', {
        key: 'report-content',
        className: 'p-6'
      }, isLoading ? React.createElement('div', {
        className: 'text-center py-8'
      }, [
        React.createElement('div', {
          key: 'spinner',
          className: 'spinner mx-auto mb-4'
        }),
        React.createElement('p', {
          key: 'loading-text',
          className: 'text-gray-600'
        }, 'טוען דוח...')
      ]) : activeReport === 'monthly' && reportData ? React.createElement(MonthlyReportDisplay, {
        key: 'monthly-report',
        data: reportData
      }) : activeReport === 'employees' && reportData ? React.createElement(EmployeesReportDisplay, {
        key: 'employees-report',
        data: reportData
      }) : React.createElement('div', {
        key: 'no-data',
        className: 'text-center py-8 text-gray-500'
      }, 'אין נתונים להצגה'))
    ])
  ]);
};

// Monthly Report Display Component
const MonthlyReportDisplay = ({ data }) => {
  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    // Summary stats
    React.createElement('div', {
      key: 'summary',
      className: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'
    }, [
      React.createElement(StatsCard, {
        key: 'total-events',
        title: 'סך אירועים',
        value: data.totalEvents,
        icon: 'calendar-days',
        color: 'pastel-blue'
      }),
      
      React.createElement(StatsCard, {
        key: 'total-registered',
        title: 'סך נרשמים',
        value: data.totalRegistered,
        icon: 'users',
        color: 'pastel-purple'
      }),
      
      React.createElement(StatsCard, {
        key: 'total-tested',
        title: 'סך נבדקים',
        value: data.totalTested,
        icon: 'check-circle',
        color: 'pastel-green'
      }),
      
      React.createElement(StatsCard, {
        key: 'total-revenue',
        title: 'סך הכנסות',
        value: `₪${data.totalRevenue.toLocaleString()}`,
        icon: 'banknotes',
        color: 'pastel-mint'
      }),
      
      React.createElement(StatsCard, {
        key: 'avg-transaction',
        title: 'ממוצע עסקה',
        value: `₪${Math.round(data.averageTransactionAmount).toLocaleString()}`,
        icon: 'chart-bar',
        color: 'pastel-yellow'
      }),
      
      React.createElement(StatsCard, {
        key: 'test-ratio',
        title: 'יחס בדיקות/עסקאות',
        value: `${Math.round(data.testToSaleRatio)}%`,
        icon: 'arrow-trending-up',
        color: 'pastel-pink'
      })
    ]),

    // Events by status
    React.createElement('div', {
      key: 'events-by-status',
      className: 'bg-gray-50 rounded-lg p-6'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold mb-4'
      }, 'פילוח אירועים לפי סטטוס'),
      
      React.createElement('div', {
        key: 'status-grid',
        className: 'grid grid-cols-2 md:grid-cols-5 gap-4'
      }, [
        React.createElement('div', {
          key: 'preparing',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-2xl font-bold text-yellow-600'
          }, data.eventsByStatus.preparing),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'בהכנה')
        ]),
        
        React.createElement('div', {
          key: 'planned',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-2xl font-bold text-blue-600'
          }, data.eventsByStatus.planned),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'מתוכנן')
        ]),
        
        React.createElement('div', {
          key: 'completed',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-2xl font-bold text-green-600'
          }, data.eventsByStatus.completed),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'הסתיים')
        ]),
        
        React.createElement('div', {
          key: 'cancelled',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-2xl font-bold text-red-600'
          }, data.eventsByStatus.cancelled),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'בוטל')
        ]),
        
        React.createElement('div', {
          key: 'postponed',
          className: 'text-center'
        }, [
          React.createElement('div', {
            key: 'value',
            className: 'text-2xl font-bold text-purple-600'
          }, data.eventsByStatus.postponed),
          React.createElement('div', {
            key: 'label',
            className: 'text-sm text-gray-600'
          }, 'נדחה')
        ])
      ])
    ])
  ]);
};

// Employees Report Display Component  
const EmployeesReportDisplay = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.map(eventReport => ({
        ...eventReport,
        employees: eventReport.employees.filter(emp => 
          emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(eventReport => eventReport.employees.length > 0);
      
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    // Search
    React.createElement('div', {
      key: 'search',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'search-input',
        className: 'relative flex-1 max-w-md'
      }, [
        React.createElement('input', {
          key: 'input',
          type: 'text',
          placeholder: 'חפש לפי שם, מייל או ארגון...',
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value),
          className: 'form-input w-full pl-10 pr-3 py-2 rounded-lg'
        }),
        React.createElement('div', {
          key: 'icon',
          className: 'absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none'
        }, React.createElement(Icon, {
          name: 'magnifying-glass',
          className: 'w-5 h-5 text-gray-400'
        }))
      ])
    ]),

    // Events list
    React.createElement('div', {
      key: 'events-list',
      className: 'space-y-6'
    }, filteredData.map(eventReport => 
      React.createElement('div', {
        key: eventReport.eventId,
        className: 'bg-white border rounded-lg overflow-hidden'
      }, [
        React.createElement('div', {
          key: 'event-header',
          className: 'bg-gray-50 px-6 py-4 border-b'
        }, [
          React.createElement('h3', {
            key: 'event-name',
            className: 'text-lg font-semibold text-gray-900'
          }, eventReport.eventName),
          React.createElement('p', {
            key: 'event-date',
            className: 'text-sm text-gray-600 mt-1'
          }, [
            new Date(eventReport.eventDate).toLocaleDateString('he-IL'),
            ` • ${eventReport.employees.length} עובdים`
          ])
        ]),

        React.createElement('div', {
          key: 'employees-table',
          className: 'overflow-x-auto'
        }, React.createElement('table', {
          className: 'min-w-full divide-y divide-gray-200'
        }, [
          React.createElement('thead', {
            key: 'table-header',
            className: 'bg-gray-50'
          }, React.createElement('tr', {}, [
            React.createElement('th', {
              key: 'name',
              className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
            }, 'שם'),
            React.createElement('th', {
              key: 'email',
              className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
            }, 'מייל'),
            React.createElement('th', {
              key: 'tested',
              className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
            }, 'נבדק'),
            React.createElement('th', {
              key: 'amount',
              className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
            }, 'סכום עסקה')
          ])),

          React.createElement('tbody', {
            key: 'table-body',
            className: 'bg-white divide-y divide-gray-200'
          }, eventReport.employees.map(employee => 
            React.createElement('tr', {
              key: `${eventReport.eventId}-${employee.email}`,
              className: 'hover:bg-gray-50'
            }, [
              React.createElement('td', {
                key: 'name',
                className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
              }, employee.fullName),
              
              React.createElement('td', {
                key: 'email',
                className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
              }, employee.email),
              
              React.createElement('td', {
                key: 'tested',
                className: 'px-6 py-4 whitespace-nowrap text-center'
              }, React.createElement('span', {
                className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  employee.wasTested 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`
              }, employee.wasTested ? 'כן' : 'לא')),
              
              React.createElement('td', {
                key: 'amount',
                className: 'px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900'
              }, employee.transactionAmount > 0 ? `₪${employee.transactionAmount.toLocaleString()}` : '-')
            ])
          ))
        ]))
      ])
    ))
  ]);
};

const SettingsView = () => {
  const [settings, setSettings] = useState({
    systemName: 'מערכת ניהול בדיקות',
    organizationName: '',
    adminEmail: '',
    smtpSettings: {
      host: '',
      port: 587,
      username: '',
      password: '',
      useAuth: true,
      useTLS: true
    },
    emailTemplates: {
      confirmationSubject: 'אישור רישום לבדיקה - {organizationName}',
      confirmationBody: 'שלום {employeeName},\n\nרישומך לבדיקה באירוע {organizationName} אושר בהצלחה.\n\nפרטי הבדיקה:\nתאריך: {eventDate}\nשעה: {timeSlot}\n\nתודה!',
      reminderSubject: 'תזכורת - בדיקה מחר ב{organizationName}',
      reminderBody: 'שלום {employeeName},\n\nמזכירים לך שיש לך בדיקה מחר:\n\nתאריך: {eventDate}\nשעה: {timeSlot}\nמיקום: {organizationName}\n\nבברכה!'
    },
    systemSettings: {
      defaultTestDuration: 30,
      defaultBreakDuration: 10,
      allowWalkIns: true,
      requirePhoneValidation: true,
      maxParticipantsPerEvent: 500,
      advanceBookingDays: 30
    }
  });
  
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/system/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/system/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('הגדרות נשמרו בהצלחה');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'שגיאה בשמירת ההגדרות');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailConnection = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE}/system/test-email`, 
        { smtpSettings: settings.smtpSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('חיבור SMTP תקין! מייל בדיקה נשלח.');
      } else {
        alert('שגיאה בחיבור SMTP: ' + (response.data.error || 'שגיאה לא ידועה'));
      }
    } catch (error) {
      alert('שגיאה בבדיקת חיבור המייל');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSubmit = async (userData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = selectedUser 
        ? `${API_BASE}/users/${selectedUser._id}`
        : `${API_BASE}/users`;
      
      const method = selectedUser ? 'put' : 'post';
      const response = await axios[method](url, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        loadUsers();
        setShowUserForm(false);
        setSelectedUser(null);
        setSuccess(selectedUser ? 'משתמש עודכן בהצלחה' : 'משתמש נוצר בהצלחה');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'שגיאה בשמירת המשתמש');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        loadUsers();
        setSuccess('משתמש נמחק בהצלחה');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'שגיאה במחיקת המשתמש');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    }
  };

  const tabs = [
    { id: 'general', name: 'כללי', icon: 'cog-6-tooth' },
    { id: 'email', name: 'הגדרות מייל', icon: 'envelope' },
    { id: 'templates', name: 'תבניות מייל', icon: 'document-text' },
    { id: 'system', name: 'הגדרות מערכת', icon: 'adjustments-horizontal' },
    { id: 'users', name: 'ניהול משתמשים', icon: 'users' }
  ];

  if (isLoading) {
    return React.createElement('div', {
      className: 'animate-fade-in flex items-center justify-center py-12'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'spinner mx-auto'
      }),
      React.createElement('span', {
        key: 'text',
        className: 'mr-3 text-gray-600'
      }, 'טוען הגדרות...')
    ]);
  }

  return React.createElement('div', {
    className: 'animate-fade-in space-y-6'
  }, [
    // Header
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('div', {
        key: 'title-section'
      }, [
        React.createElement('h1', {
          key: 'title',
          className: 'text-2xl font-bold text-gray-900'
        }, 'הגדרות מערכת'),
        React.createElement('p', {
          key: 'subtitle',
          className: 'text-gray-600 mt-1'
        }, 'ניהול הגדרות כלליות ומשתמשי המערכת')
      ]),

      React.createElement('button', {
        key: 'save',
        onClick: saveSettings,
        disabled: isSaving,
        className: 'btn-primary px-6 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2'
      }, isSaving ? [
        React.createElement('div', { key: 'spinner', className: 'spinner mr-2' }),
        React.createElement('span', { key: 'text' }, 'שומר...')
      ] : [
        React.createElement(Icon, { key: 'icon', name: 'check-circle', className: 'w-4 h-4' }),
        React.createElement('span', { key: 'text' }, 'שמור הגדרות')
      ])
    ]),

    // Status messages
    error && React.createElement('div', {
      key: 'error',
      className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
    }, error),

    success && React.createElement('div', {
      key: 'success',
      className: 'bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg'
    }, success),

    // Settings Tabs
    React.createElement('div', {
      key: 'tabs',
      className: 'bg-white rounded-lg shadow-sm border'
    }, [
      React.createElement('div', {
        key: 'tab-header',
        className: 'border-b'
      }, React.createElement('nav', {
        className: 'flex space-x-8 px-6 overflow-x-auto'
      }, tabs.map(tab => 
        React.createElement('button', {
          key: tab.id,
          onClick: () => setActiveTab(tab.id),
          className: `py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
            activeTab === tab.id
              ? 'border-pastel-mint text-pastel-mint'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`
        }, [
          React.createElement(Icon, {
            key: 'icon',
            name: tab.icon,
            className: 'w-4 h-4'
          }),
          React.createElement('span', { key: 'text' }, tab.name)
        ])
      ))),

      React.createElement('div', {
        key: 'tab-content',
        className: 'p-6'
      }, React.createElement(SettingsTabContent, {
        activeTab,
        settings,
        setSettings,
        users,
        onTestEmail: testEmailConnection,
        onUserSubmit: handleUserSubmit,
        onDeleteUser: handleDeleteUser,
        showUserForm,
        setShowUserForm,
        selectedUser,
        setSelectedUser
      }))
    ])
  ]);
};

// Settings Tab Content Component
const SettingsTabContent = ({ activeTab, settings, setSettings, users, onTestEmail, onUserSubmit, onDeleteUser, showUserForm, setShowUserForm, selectedUser, setSelectedUser }) => {
  switch(activeTab) {
    case 'general':
      return React.createElement(GeneralSettingsTab, { settings, setSettings });
    case 'email':
      return React.createElement(EmailSettingsTab, { settings, setSettings, onTestEmail });
    case 'templates':
      return React.createElement(EmailTemplatesTab, { settings, setSettings });
    case 'system':
      return React.createElement(SystemSettingsTab, { settings, setSettings });
    case 'users':
      return React.createElement(UsersManagementTab, { 
        users, 
        onUserSubmit, 
        onDeleteUser, 
        showUserForm, 
        setShowUserForm, 
        selectedUser, 
        setSelectedUser 
      });
    default:
      return React.createElement('div', { className: 'text-center py-8 text-gray-500' }, 'בחר טאב');
  }
};

// General Settings Tab
const GeneralSettingsTab = ({ settings, setSettings }) => {
  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('div', {
      key: 'form',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
    }, [
      React.createElement('div', {
        key: 'system-name'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'שם המערכת'),
        React.createElement('input', {
          type: 'text',
          value: settings.systemName,
          onChange: (e) => setSettings(prev => ({ ...prev, systemName: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'שם המערכת שיוצג למשתמשים'
        })
      ]),

      React.createElement('div', {
        key: 'org-name'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'שם הארגון'),
        React.createElement('input', {
          type: 'text',
          value: settings.organizationName,
          onChange: (e) => setSettings(prev => ({ ...prev, organizationName: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'שם הארגון הראשי'
        })
      ]),

      React.createElement('div', {
        key: 'admin-email',
        className: 'md:col-span-2'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'כתובת מייל ראשית'),
        React.createElement('input', {
          type: 'email',
          value: settings.adminEmail,
          onChange: (e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'admin@company.com'
        })
      ])
    ])
  ]);
};

// Email Settings Tab
const EmailSettingsTab = ({ settings, setSettings, onTestEmail }) => {
  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold'
      }, 'הגדרות שרת SMTP'),
      
      React.createElement('button', {
        key: 'test',
        onClick: onTestEmail,
        className: 'btn-secondary px-4 py-2 rounded-lg flex items-center space-x-2'
      }, [
        React.createElement(Icon, { key: 'icon', name: 'envelope', className: 'w-4 h-4' }),
        React.createElement('span', { key: 'text' }, 'בדוק חיבור')
      ])
    ]),

    React.createElement('div', {
      key: 'form',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
    }, [
      React.createElement('div', {
        key: 'host'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'שרת SMTP'),
        React.createElement('input', {
          type: 'text',
          value: settings.smtpSettings.host,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            smtpSettings: { ...prev.smtpSettings, host: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'smtp.gmail.com'
        })
      ]),

      React.createElement('div', {
        key: 'port'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'פורט'),
        React.createElement('input', {
          type: 'number',
          value: settings.smtpSettings.port,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            smtpSettings: { ...prev.smtpSettings, port: parseInt(e.target.value) }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: '587'
        })
      ]),

      React.createElement('div', {
        key: 'username'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'שם משתמש'),
        React.createElement('input', {
          type: 'text',
          value: settings.smtpSettings.username,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            smtpSettings: { ...prev.smtpSettings, username: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'your-email@gmail.com'
        })
      ]),

      React.createElement('div', {
        key: 'password'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'סיסמה'),
        React.createElement('input', {
          type: 'password',
          value: settings.smtpSettings.password,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            smtpSettings: { ...prev.smtpSettings, password: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          placeholder: 'הזן סיסמה או אפ פסוורד'
        })
      ]),

      React.createElement('div', {
        key: 'checkboxes',
        className: 'md:col-span-2 space-y-3'
      }, [
        React.createElement('label', {
          key: 'use-auth',
          className: 'flex items-center'
        }, [
          React.createElement('input', {
            type: 'checkbox',
            checked: settings.smtpSettings.useAuth,
            onChange: (e) => setSettings(prev => ({
              ...prev,
              smtpSettings: { ...prev.smtpSettings, useAuth: e.target.checked }
            })),
            className: 'rounded border-gray-300 text-pastel-mint focus:ring-pastel-mint mr-2'
          }),
          React.createElement('span', { className: 'text-sm text-gray-700' }, 'השתמש באימות')
        ]),

        React.createElement('label', {
          key: 'use-tls',
          className: 'flex items-center'
        }, [
          React.createElement('input', {
            type: 'checkbox',
            checked: settings.smtpSettings.useTLS,
            onChange: (e) => setSettings(prev => ({
              ...prev,
              smtpSettings: { ...prev.smtpSettings, useTLS: e.target.checked }
            })),
            className: 'rounded border-gray-300 text-pastel-mint focus:ring-pastel-mint mr-2'
          }),
          React.createElement('span', { className: 'text-sm text-gray-700' }, 'השתמש ב-TLS')
        ])
      ])
    ])
  ]);
};

// Email Templates Tab
const EmailTemplatesTab = ({ settings, setSettings }) => {
  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('div', {
      key: 'confirmation',
      className: 'space-y-4'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold'
      }, 'מייל אישור רישום'),
      
      React.createElement('div', {
        key: 'subject'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'נושא המייל'),
        React.createElement('input', {
          type: 'text',
          value: settings.emailTemplates.confirmationSubject,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            emailTemplates: { ...prev.emailTemplates, confirmationSubject: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        })
      ]),
      
      React.createElement('div', {
        key: 'body'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'תוכן המייל'),
        React.createElement('textarea', {
          rows: 6,
          value: settings.emailTemplates.confirmationBody,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            emailTemplates: { ...prev.emailTemplates, confirmationBody: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        })
      ])
    ]),

    React.createElement('div', {
      key: 'reminder',
      className: 'space-y-4 pt-6 border-t'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold'
      }, 'מייל תזכורת'),
      
      React.createElement('div', {
        key: 'subject'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'נושא המייל'),
        React.createElement('input', {
          type: 'text',
          value: settings.emailTemplates.reminderSubject,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            emailTemplates: { ...prev.emailTemplates, reminderSubject: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        })
      ]),
      
      React.createElement('div', {
        key: 'body'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'תוכן המייל'),
        React.createElement('textarea', {
          rows: 6,
          value: settings.emailTemplates.reminderBody,
          onChange: (e) => setSettings(prev => ({
            ...prev,
            emailTemplates: { ...prev.emailTemplates, reminderBody: e.target.value }
          })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        })
      ])
    ]),

    React.createElement('div', {
      key: 'variables',
      className: 'bg-blue-50 border border-blue-200 rounded-lg p-4'
    }, [
      React.createElement('h4', {
        key: 'title',
        className: 'font-medium text-blue-900 mb-2'
      }, 'משתנים זמינים'),
      
      React.createElement('div', {
        key: 'list',
        className: 'text-sm text-blue-800 space-y-1'
      }, [
        React.createElement('div', { key: 'var1' }, '{employeeName} - שם העובד'),
        React.createElement('div', { key: 'var2' }, '{organizationName} - שם הארגון'),
        React.createElement('div', { key: 'var3' }, '{eventDate} - תאריך האירוע'),
        React.createElement('div', { key: 'var4' }, '{timeSlot} - זמן הבדיקה'),
        React.createElement('div', { key: 'var5' }, '{systemName} - שם המערכת')
      ])
    ])
  ]);
};

// System Settings Tab
const SystemSettingsTab = ({ settings, setSettings }) => {
  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('div', {
      key: 'empty-placeholder',
      className: 'text-center py-8 text-gray-500'
    }, 'מחכה להגדרות מערכת לפי מסמך הדרישות')
  ]);
};

// Users Management Tab
const UsersManagementTab = ({ users, onUserSubmit, onDeleteUser, showUserForm, setShowUserForm, selectedUser, setSelectedUser }) => {
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between'
    }, [
      React.createElement('h3', {
        key: 'title',
        className: 'text-lg font-semibold'
      }, 'משתמשי המערכת'),
      
      React.createElement('button', {
        key: 'create',
        onClick: handleCreateUser,
        className: 'btn-primary px-4 py-2 rounded-lg flex items-center space-x-2'
      }, [
        React.createElement(Icon, { key: 'icon', name: 'plus', className: 'w-4 h-4' }),
        React.createElement('span', { key: 'text' }, 'הוסף משתמש')
      ])
    ]),

    React.createElement('div', {
      key: 'users-table',
      className: 'bg-gray-50 rounded-lg overflow-hidden'
    }, users.length > 0 ? React.createElement('table', {
      className: 'min-w-full'
    }, [
      React.createElement('thead', {
        key: 'header',
        className: 'bg-gray-100'
      }, React.createElement('tr', {}, [
        React.createElement('th', {
          key: 'name',
          className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'
        }, 'שם'),
        React.createElement('th', {
          key: 'email',
          className: 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'
        }, 'מייל'),
        React.createElement('th', {
          key: 'role',
          className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'
        }, 'תפקיד'),
        React.createElement('th', {
          key: 'created',
          className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'
        }, 'נוצר'),
        React.createElement('th', {
          key: 'actions',
          className: 'px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'
        }, 'פעולות')
      ])),

      React.createElement('tbody', {
        key: 'body',
        className: 'bg-white divide-y divide-gray-200'
      }, users.map(user => 
        React.createElement('tr', {
          key: user._id,
          className: 'hover:bg-gray-50'
        }, [
          React.createElement('td', {
            key: 'name',
            className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'
          }, user.name),
          
          React.createElement('td', {
            key: 'email',
            className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
          }, user.email),
          
          React.createElement('td', {
            key: 'role',
            className: 'px-6 py-4 whitespace-nowrap text-center'
          }, React.createElement('span', {
            className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`
          }, user.role === 'admin' ? 'מנהל' : 'בודק')),
          
          React.createElement('td', {
            key: 'created',
            className: 'px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500'
          }, new Date(user.createdAt).toLocaleDateString('he-IL')),
          
          React.createElement('td', {
            key: 'actions',
            className: 'px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2'
          }, [
            React.createElement('button', {
              key: 'edit',
              onClick: () => handleEditUser(user),
              className: 'text-blue-600 hover:text-blue-900'
            }, 'ערוך'),
            
            React.createElement('button', {
              key: 'delete',
              onClick: () => onDeleteUser(user._id),
              className: 'text-red-600 hover:text-red-900'
            }, 'מחק')
          ])
        ])
      ))
    ]) : React.createElement('div', {
      key: 'empty',
      className: 'text-center py-8 text-gray-500'
    }, 'אין משתמשים במערכת')),

    // User Form Modal
    showUserForm && React.createElement(UserFormModal, {
      key: 'user-form',
      isOpen: showUserForm,
      onClose: () => setShowUserForm(false),
      onSubmit: onUserSubmit,
      userData: selectedUser
    })
  ]);
};

// User Form Modal Component
const UserFormModal = ({ isOpen, onClose, onSubmit, userData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'tester',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        role: userData.role || 'tester',
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'tester',
        password: '',
        confirmPassword: ''
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userData && formData.password !== formData.confirmPassword) {
      setError('הסיסמאות אינן זהות');
      return;
    }

    if (!userData && formData.password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(formData.password && { password: formData.password })
      });
    } catch (error) {
      setError('שגיאה בשמירת המשתמש');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center modal-backdrop'
  }, React.createElement('div', {
    className: 'bg-white rounded-lg shadow-2xl max-w-md w-full mx-4'
  }, [
    React.createElement('div', {
      key: 'header',
      className: 'flex items-center justify-between p-6 border-b'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold'
      }, userData ? 'עריכת משתמש' : 'הוספת משתמש חדש'),
      
      React.createElement('button', {
        key: 'close',
        onClick: onClose,
        className: 'p-2 hover:bg-gray-100 rounded-lg'
      }, React.createElement(Icon, { name: 'x-mark', className: 'w-5 h-5' }))
    ]),

    React.createElement('form', {
      key: 'form',
      id: 'user-form',
      onSubmit: handleSubmit,
      className: 'p-6 space-y-4'
    }, [
      error && React.createElement('div', {
        key: 'error',
        className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg'
      }, error),

      React.createElement('div', {
        key: 'name'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'שם מלא *'),
        React.createElement('input', {
          type: 'text',
          value: formData.name,
          onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          required: true
        })
      ]),

      React.createElement('div', {
        key: 'email'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'כתובת מייל *'),
        React.createElement('input', {
          type: 'email',
          value: formData.email,
          onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          required: true
        })
      ]),

      React.createElement('div', {
        key: 'role'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'תפקיד'),
        React.createElement('select', {
          value: formData.role,
          onChange: (e) => setFormData(prev => ({ ...prev, role: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg'
        }, [
          React.createElement('option', { key: 'tester', value: 'tester' }, 'בודק/מוכר'),
          React.createElement('option', { key: 'admin', value: 'admin' }, 'מנהל מערכת')
        ])
      ]),

      React.createElement('div', {
        key: 'password'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, userData ? 'סיסמה חדשה (אופציונלי)' : 'סיסמה *'),
        React.createElement('input', {
          type: 'password',
          value: formData.password,
          onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          required: !userData,
          minLength: 6
        })
      ]),

      !userData && React.createElement('div', {
        key: 'confirm-password'
      }, [
        React.createElement('label', {
          className: 'block text-sm font-medium text-gray-700 mb-2'
        }, 'אישור סיסמה *'),
        React.createElement('input', {
          type: 'password',
          value: formData.confirmPassword,
          onChange: (e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value })),
          className: 'form-input w-full px-3 py-2 rounded-lg',
          required: true,
          minLength: 6
        })
      ])
    ]),

    React.createElement('div', {
      key: 'footer',
      className: 'flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50'
    }, [
      React.createElement('button', {
        key: 'cancel',
        type: 'button',
        onClick: onClose,
        className: 'btn-secondary px-4 py-2 rounded-lg'
      }, 'ביטול'),
      
      React.createElement('button', {
        key: 'submit',
        type: 'submit',
        disabled: isSubmitting,
        className: 'btn-primary px-6 py-2 rounded-lg disabled:opacity-50 flex items-center space-x-2',
        form: 'user-form'
      }, isSubmitting ? [
        React.createElement('div', { key: 'spinner', className: 'spinner mr-2' }),
        React.createElement('span', { key: 'text' }, 'שומר...')
      ] : (userData ? 'עדכן משתמש' : 'צור משתמש'))
    ])
  ]));
};

// Main App Router Component
const App = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gray-50'
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
          key: 'loading-text',
          className: 'text-gray-600'
        }, 'טוען...')
      ])
    ]);
  }

  if (!user) {
    return React.createElement(LandingPage);
  }

  return React.createElement(MainApp);
};

// Initialize the application
const AppRoot = () => {
  return React.createElement(
    AuthProvider,
    null,
    React.createElement(App)
  );
};

// Mount the application
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(React.createElement(AppRoot));
  }
});

// Export for potential use in other files
window.App = AppRoot;