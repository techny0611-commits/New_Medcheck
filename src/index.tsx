import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { connectToMongoDB } from './lib/mongodb'
import { initializeSupabase } from './lib/supabase'
import { renderer } from './renderer'

// Import API routes
import authRoutes from './routes/auth'
import eventsRoutes from './routes/events'
import usersRoutes from './routes/users'
import reportsRoutes from './routes/reports'
import systemRoutes from './routes/system'

const app = new Hono()

// Initialize connections on startup
app.use('*', async (c, next) => {
  try {
    // Initialize MongoDB
    await connectToMongoDB();
    
    // Initialize Supabase (will use environment variables)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      initializeSupabase();
    }
  } catch (error) {
    console.error('Failed to initialize connections:', error);
  }
  
  await next();
});

// Enable CORS for API routes
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Use renderer for React pages
app.use(renderer)

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/events', eventsRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/reports', reportsRoutes)
app.route('/api/system', systemRoutes)

// Main app page (React SPA)
app.get('/', (c) => {
  return c.render(
    <div id="root"></div>
  )
})

// Registration page for employees (no auth required)
app.get('/register/:eventId', async (c) => {
  const eventId = c.req.param('eventId')
  
  return c.render(
    <div id="registration-root" data-event-id={eventId}></div>
  )
})

// Catch all other routes and serve React app
app.get('*', (c) => {
  return c.render(
    <div id="root"></div>
  )
})

export default app
