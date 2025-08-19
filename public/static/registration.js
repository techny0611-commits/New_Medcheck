// Employee Registration App (No authentication required)
const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

// API Base URL
const API_BASE = '/api';

// Icon component (simplified version for registration page)
const Icon = ({ name, className = "w-5 h-5" }) => {
  const iconPaths = {
    'heart': 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
    'shield-check': 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    'user-group': 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
    'calendar-days': 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    'check-circle': 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'exclamation-triangle': 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    'clock': 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    'map-pin': 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z'
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
      d: iconPaths[name] || iconPaths['heart']
    })
  );
};

// Time Slot Selection Component
const TimeSlotSelection = ({ availableSlots, selectedSlot, onSlotSelect }) => {
  if (!availableSlots || availableSlots.length === 0) {
    return React.createElement('div', {
      className: 'text-center py-8 text-gray-500'
    }, 'אין זמנים פנויים כרגע');
  }

  return React.createElement('div', {
    className: 'space-y-4'
  }, [
    React.createElement('h3', {
      key: 'title',
      className: 'text-lg font-semibold text-gray-900 mb-4'
    }, 'בחר זמן בדיקה'),
    
    React.createElement('div', {
      key: 'slots-grid',
      className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'
    }, availableSlots.map(slot => 
      React.createElement('button', {
        key: slot._id,
        onClick: () => onSlotSelect(slot),
        className: `p-3 border-2 rounded-lg transition-colors ${
          selectedSlot?._id === slot._id 
            ? 'border-pastel-mint bg-pastel-mint/10 text-green-700' 
            : 'border-gray-200 hover:border-pastel-mint hover:bg-pastel-mint/5'
        }`
      }, [
        React.createElement('div', {
          key: 'time',
          className: 'font-medium'
        }, `${slot.startTime} - ${slot.endTime}`),
        
        React.createElement('div', {
          key: 'icon',
          className: 'text-xs text-gray-500 mt-1 flex items-center justify-center'
        }, [
          React.createElement(Icon, {
            key: 'clock-icon',
            name: 'clock',
            className: 'w-3 h-3 mr-1'
          }),
          React.createElement('span', {
            key: 'text'
          }, 'פנוי')
        ])
      ])
    ))
  ]);
};

// Main Registration Component
const RegistrationApp = () => {
  const [eventData, setEventData] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Details, 2: Slot selection, 3: Confirmation
  
  const [formData, setFormData] = useState({
    eventPassword: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    hasRelevantIssues: false,
    relevantIssuesSelected: []
  });
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Get event ID from data attribute
  const eventId = document.getElementById('registration-root')?.getAttribute('data-event-id');

  useEffect(() => {
    if (eventId) {
      loadEventData();
      loadAvailableSlots();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/registration/${eventId}`);
      if (response.data.success) {
        setEventData(response.data.data);
        
        // Apply event styling
        applyEventStyling(response.data.data.colorPalette);
      } else {
        setError('אירוע לא נמצא');
      }
    } catch (error) {
      setError('שגיאה בטעינת פרטי האירוע');
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
    } finally {
      setIsLoading(false);
    }
  };

  const applyEventStyling = (colorPalette) => {
    // Apply custom color palette to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--event-primary', colorPalette.primary);
    root.style.setProperty('--event-secondary', colorPalette.secondary);
    root.style.setProperty('--event-accent', colorPalette.accent);
    root.style.setProperty('--event-background', colorPalette.background);
    root.style.setProperty('--event-text', colorPalette.text);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    // Validate event password
    if (formData.eventPassword !== eventData?.eventPassword) {
      setError('סיסמת האירוע שגויה');
      return;
    }

    // Check if has relevant issues for direct scheduling
    if (formData.hasRelevantIssues && formData.relevantIssuesSelected.length > 0) {
      setStep(2); // Go to slot selection
    } else {
      // Register to waiting list
      submitRegistration(false);
    }
  };

  const handleStep2Submit = () => {
    if (!selectedSlot) {
      setError('אנא בחר זמן בדיקה');
      return;
    }
    submitRegistration(true);
  };

  const submitRegistration = async (withSlot = false) => {
    setIsSubmitting(true);
    setError('');

    try {
      const registrationData = {
        ...formData,
        timeSlotId: withSlot ? selectedSlot?._id : null
      };

      const response = await axios.post(`${API_BASE}/registration/${eventId}/register`, registrationData);
      
      if (response.data.success) {
        setRegistrationComplete(true);
        setStep(3);
      } else {
        setError(response.data.error || 'שגיאה ברישום');
      }
    } catch (error) {
      setError('שגיאה בחיבור לשרת');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueToggle = (issue) => {
    setFormData(prev => {
      const isSelected = prev.relevantIssuesSelected.includes(issue);
      const newSelected = isSelected 
        ? prev.relevantIssuesSelected.filter(i => i !== issue)
        : [...prev.relevantIssuesSelected, issue];
      
      return {
        ...prev,
        relevantIssuesSelected: newSelected,
        hasRelevantIssues: newSelected.length > 0
      };
    });
  };

  if (isLoading) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'
    }, [
      React.createElement('div', {
        key: 'spinner',
        className: 'text-center'
      }, [
        React.createElement('div', {
          key: 'icon',
          className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'
        }),
        React.createElement('p', {
          key: 'text',
          className: 'text-gray-600'
        }, 'טוען...')
      ])
    ]);
  }

  if (error && !eventData) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100'
    }, React.createElement('div', {
      className: 'bg-white rounded-lg shadow-lg p-8 max-w-md text-center'
    }, [
      React.createElement(Icon, {
        key: 'error-icon',
        name: 'exclamation-triangle',
        className: 'w-16 h-16 text-red-500 mx-auto mb-4'
      }),
      React.createElement('h2', {
        key: 'error-title',
        className: 'text-xl font-semibold text-gray-900 mb-2'
      }, 'שגיאה'),
      React.createElement('p', {
        key: 'error-text',
        className: 'text-gray-600'
      }, error)
    ]));
  }

  if (registrationComplete) {
    return React.createElement('div', {
      className: 'min-h-screen flex items-center justify-center',
      style: { 
        background: `linear-gradient(to bottom right, ${eventData?.colorPalette?.background || '#f1f5f9'}, ${eventData?.colorPalette?.primary || '#a3e4d7'})` 
      }
    }, React.createElement('div', {
      className: 'bg-white rounded-xl shadow-2xl p-8 max-w-md text-center'
    }, [
      React.createElement(Icon, {
        key: 'success-icon',
        name: 'check-circle',
        className: 'w-20 h-20 text-green-500 mx-auto mb-6'
      }),
      
      React.createElement('h2', {
        key: 'success-title',
        className: 'text-2xl font-bold text-gray-900 mb-4'
      }, 'הרישום הושלם בהצלחה!'),
      
      React.createElement('div', {
        key: 'success-details',
        className: 'space-y-4 text-right'
      }, [
        React.createElement('div', {
          key: 'event-info',
          className: 'bg-gray-50 rounded-lg p-4'
        }, [
          React.createElement('h3', {
            key: 'event-title',
            className: 'font-semibold text-gray-900 mb-2'
          }, eventData?.organizationName),
          
          React.createElement('p', {
            key: 'event-date',
            className: 'text-gray-600 text-sm'
          }, [
            React.createElement(Icon, {
              key: 'date-icon',
              name: 'calendar-days',
              className: 'w-4 h-4 inline ml-1'
            }),
            new Date(eventData?.eventDate).toLocaleDateString('he-IL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          ])
        ]),

        selectedSlot ? React.createElement('div', {
          key: 'slot-info',
          className: 'bg-green-50 border border-green-200 rounded-lg p-4'
        }, [
          React.createElement('h4', {
            key: 'slot-title',
            className: 'font-semibold text-green-800 mb-2'
          }, 'זמן הבדיקה שלך'),
          
          React.createElement('p', {
            key: 'slot-time',
            className: 'text-green-700'
          }, [
            React.createElement(Icon, {
              key: 'time-icon',
              name: 'clock',
              className: 'w-4 h-4 inline ml-1'
            }),
            `${selectedSlot.startTime} - ${selectedSlot.endTime}`
          ])
        ]) : React.createElement('div', {
          key: 'waiting-info',
          className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4'
        }, [
          React.createElement('h4', {
            key: 'waiting-title',
            className: 'font-semibold text-yellow-800 mb-2'
          }, 'הצטרפת לרשימת ההמתנה'),
          
          React.createElement('p', {
            key: 'waiting-text',
            className: 'text-yellow-700 text-sm'
          }, 'נציג יפנה אליך לשיבוץ בימים הקרובים')
        ])
      ]),

      React.createElement('div', {
        key: 'contact-info',
        className: 'mt-6 text-sm text-gray-500 border-t pt-4'
      }, [
        React.createElement('p', {
          key: 'email-sent'
        }, 'הודעת אישור נשלחה למייל שלך'),
        
        React.createElement('p', {
          key: 'questions'
        }, 'לשאלות נוספות, פנה לנציג החברה')
      ])
    ]));
  }

  // Render main registration form
  const currentStyle = {
    background: `linear-gradient(to bottom right, ${eventData?.colorPalette?.background || '#f1f5f9'}, ${eventData?.colorPalette?.primary || '#a3e4d7'})`
  };

  return React.createElement('div', {
    className: 'min-h-screen flex items-center justify-center px-4 py-8',
    style: currentStyle
  }, React.createElement('div', {
    className: 'bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden'
  }, [
    // Header with banner and event info
    React.createElement('div', {
      key: 'header',
      className: 'relative',
      style: { backgroundColor: eventData?.colorPalette?.primary || '#a3e4d7' }
    }, [
      // Banner image if exists
      eventData?.bannerImage && React.createElement('img', {
        key: 'banner',
        src: eventData.bannerImage,
        alt: 'באנר אירוע',
        className: 'w-full h-32 object-cover'
      }),
      
      React.createElement('div', {
        key: 'header-content',
        className: 'p-6'
      }, [
        React.createElement('div', {
          key: 'icon-title',
          className: 'flex items-center mb-4'
        }, [
          React.createElement('div', {
            key: 'icon-container',
            className: 'w-12 h-12 bg-white rounded-full flex items-center justify-center ml-3'
          }, React.createElement(Icon, { 
            name: eventData?.iconName || 'heart', 
            className: 'w-6 h-6',
            style: { color: eventData?.colorPalette?.primary || '#a3e4d7' }
          })),
          
          React.createElement('div', {
            key: 'title-info'
          }, [
            React.createElement('h1', {
              key: 'title',
              className: 'text-2xl font-bold text-white'
            }, eventData?.organizationName || 'אירוע בדיקות'),
            
            React.createElement('p', {
              key: 'date',
              className: 'text-white/80'
            }, new Date(eventData?.eventDate).toLocaleDateString('he-IL'))
          ])
        ]),

        eventData?.marketingMessage && React.createElement('div', {
          key: 'marketing',
          className: 'bg-white/10 rounded-lg p-4'
        }, React.createElement('p', {
          className: 'text-white text-sm leading-relaxed'
        }, eventData.marketingMessage))
      ])
    ]),

    // Form content
    React.createElement('div', {
      key: 'content',
      className: 'p-6'
    }, [
      // Progress indicator
      React.createElement('div', {
        key: 'progress',
        className: 'flex items-center justify-center mb-6'
      }, [
        React.createElement('div', {
          key: 'step1',
          className: `flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`
        }, [
          React.createElement('div', {
            className: `w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 1 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
            }`
          }, step > 1 ? React.createElement(Icon, { name: 'check-circle', className: 'w-4 h-4' }) : '1'),
          React.createElement('span', {
            className: 'mr-2 text-sm'
          }, 'פרטים')
        ]),

        React.createElement('div', {
          key: 'separator1',
          className: `w-8 h-0.5 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`
        }),

        React.createElement('div', {
          key: 'step2',
          className: `flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`
        }, [
          React.createElement('div', {
            className: `w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 2 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
            }`
          }, step > 2 ? React.createElement(Icon, { name: 'check-circle', className: 'w-4 h-4' }) : '2'),
          React.createElement('span', {
            className: 'mr-2 text-sm'
          }, 'שיבוץ')
        ]),

        React.createElement('div', {
          key: 'separator2',
          className: `w-8 h-0.5 mx-2 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`
        }),

        React.createElement('div', {
          key: 'step3',
          className: `flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`
        }, [
          React.createElement('div', {
            className: `w-8 h-8 rounded-full border-2 flex items-center justify-center ${
              step >= 3 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
            }`
          }, step > 3 ? React.createElement(Icon, { name: 'check-circle', className: 'w-4 h-4' }) : '3'),
          React.createElement('span', {
            className: 'mr-2 text-sm'
          }, 'אישור')
        ])
      ]),

      // Error message
      error && React.createElement('div', {
        key: 'error',
        className: 'bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6'
      }, error),

      // Step 1: Personal Details
      step === 1 && React.createElement('form', {
        key: 'step1-form',
        onSubmit: handleStep1Submit,
        className: 'space-y-6'
      }, [
        React.createElement('div', {
          key: 'password-field'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'סיסמת אירוע *'),
          React.createElement('input', {
            type: 'password',
            value: formData.eventPassword,
            onChange: (e) => setFormData(prev => ({ ...prev, eventPassword: e.target.value })),
            className: 'form-input w-full px-4 py-3 rounded-lg border border-gray-300',
            placeholder: 'הזן את סיסמת האירוע',
            required: true
          })
        ]),

        React.createElement('div', {
          key: 'personal-details',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }, [
          React.createElement('div', {
            key: 'full-name'
          }, [
            React.createElement('label', {
              className: 'block text-sm font-medium text-gray-700 mb-2'
            }, 'שם מלא *'),
            React.createElement('input', {
              type: 'text',
              value: formData.fullName,
              onChange: (e) => setFormData(prev => ({ ...prev, fullName: e.target.value })),
              className: 'form-input w-full px-4 py-3 rounded-lg border border-gray-300',
              placeholder: 'שם פרטי ומשפחה',
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
              className: 'form-input w-full px-4 py-3 rounded-lg border border-gray-300',
              placeholder: 'example@domain.com',
              required: true
            })
          ])
        ]),

        React.createElement('div', {
          key: 'phone'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'מספר טלפון *'),
          React.createElement('input', {
            type: 'tel',
            value: formData.phoneNumber,
            onChange: (e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value })),
            className: 'form-input w-full px-4 py-3 rounded-lg border border-gray-300',
            placeholder: '050-1234567',
            required: true
          })
        ]),

        // Relevant health issues
        eventData?.relevantIssues && eventData.relevantIssues.length > 0 && React.createElement('div', {
          key: 'health-issues'
        }, [
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-4'
          }, 'בעיות רלוונטיות (סמן אם רלוונטי)'),
          
          React.createElement('div', {
            className: 'space-y-3'
          }, eventData.relevantIssues.map(issue => 
            React.createElement('label', {
              key: issue,
              className: 'flex items-center'
            }, [
              React.createElement('input', {
                key: 'checkbox',
                type: 'checkbox',
                checked: formData.relevantIssuesSelected.includes(issue),
                onChange: () => handleIssueToggle(issue),
                className: 'form-checkbox h-4 w-4 rounded border-gray-300',
                style: { accentColor: eventData?.colorPalette?.primary || '#a3e4d7' }
              }),
              React.createElement('span', {
                key: 'label',
                className: 'mr-3 text-sm text-gray-700'
              }, issue)
            ])
          ))
        ]),

        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          disabled: isSubmitting,
          className: 'w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50',
          style: { backgroundColor: eventData?.colorPalette?.primary || '#a3e4d7' }
        }, isSubmitting ? 'מעבד...' : 'המשך לרישום')
      ]),

      // Step 2: Slot Selection
      step === 2 && React.createElement('div', {
        key: 'step2-content',
        className: 'space-y-6'
      }, [
        React.createElement(TimeSlotSelection, {
          key: 'slot-selection',
          availableSlots: availableSlots,
          selectedSlot: selectedSlot,
          onSlotSelect: setSelectedSlot
        }),

        React.createElement('div', {
          key: 'step2-actions',
          className: 'flex items-center justify-between pt-6 border-t'
        }, [
          React.createElement('button', {
            key: 'back',
            onClick: () => setStep(1),
            className: 'px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
          }, 'חזור'),

          React.createElement('button', {
            key: 'continue',
            onClick: handleStep2Submit,
            disabled: !selectedSlot || isSubmitting,
            className: 'px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50',
            style: { backgroundColor: eventData?.colorPalette?.primary || '#a3e4d7' }
          }, isSubmitting ? 'רושם...' : 'אשר רישום')
        ])
      ])
    ])
  ]));
};

// Initialize the registration app
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('registration-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(React.createElement(RegistrationApp));
  }
});

window.RegistrationApp = RegistrationApp;