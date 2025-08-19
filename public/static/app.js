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
    'banknotes': 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
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

// Main App Component (for authenticated users)
const MainApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);

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

// Placeholder view components (to be implemented)
const DashboardView = () => {
  return React.createElement('div', {
    className: 'animate-fade-in'
  }, [
    React.createElement('div', {
      key: 'dashboard-placeholder',
      className: 'bg-white rounded-lg shadow p-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold mb-4'
      }, 'לוח הבקרה'),
      
      React.createElement('p', {
        key: 'description',
        className: 'text-gray-600'
      }, 'כאן יוצגו נתונים סטטיסטיים ומידע כללי על המערכת')
    ])
  ]);
};

const EventsView = () => {
  return React.createElement('div', {
    className: 'animate-fade-in'
  }, [
    React.createElement('div', {
      key: 'events-placeholder',
      className: 'bg-white rounded-lg shadow p-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold mb-4'
      }, 'ניהול אירועים'),
      
      React.createElement('p', {
        key: 'description',
        className: 'text-gray-600'
      }, 'כאן יוצגו כל האירועים במערכת ויהיה ניתן לנהל אותם')
    ])
  ]);
};

const ReportsView = () => {
  return React.createElement('div', {
    className: 'animate-fade-in'
  }, [
    React.createElement('div', {
      key: 'reports-placeholder',
      className: 'bg-white rounded-lg shadow p-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold mb-4'
      }, 'דוחות'),
      
      React.createElement('p', {
        key: 'description',
        className: 'text-gray-600'
      }, 'כאן יוצגו דוחות וסטטיסטיקות מפורטים')
    ])
  ]);
};

const SettingsView = () => {
  return React.createElement('div', {
    className: 'animate-fade-in'
  }, [
    React.createElement('div', {
      key: 'settings-placeholder',
      className: 'bg-white rounded-lg shadow p-6'
    }, [
      React.createElement('h2', {
        key: 'title',
        className: 'text-xl font-semibold mb-4'
      }, 'הגדרות מערכת'),
      
      React.createElement('p', {
        key: 'description',
        className: 'text-gray-600'
      }, 'כאן ניתן לערוך הגדרות כלליות של המערכת ולנהל משתמשים')
    ])
  ]);
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