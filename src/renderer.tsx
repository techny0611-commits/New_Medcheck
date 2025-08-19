import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>מערכת ניהול בדיקות</title>
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Heroicons */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@heroicons/react@2.0.0/24/outline/index.css" />
        
        {/* Custom CSS */}
        <link href="/static/style.css" rel="stylesheet" />
        
        {/* Configure Tailwind for RTL */}
        <script dangerouslySetInnerHTML={{
          __html: `
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
          `
        }} />
        
        {/* Hebrew Font */}
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body class="font-sans bg-gray-50 text-gray-900" dir="rtl">
        {children}
        
        {/* React and ReactDOM */}
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        
        {/* Axios for HTTP requests */}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        {/* Main React App */}
        <script type="module" src="/static/app.js"></script>
      </body>
    </html>
  )
})
