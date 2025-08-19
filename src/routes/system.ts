import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { getDB, getGridFSBucket } from '../lib/mongodb'
import { extractUserFromToken } from '../lib/supabase'
import { SystemSettings, User, ApiResponse } from '../types'

const system = new Hono()

// Get system settings
system.get('/settings', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const db = getDB()
    const systemCollection = db.collection<SystemSettings>('systemSettings')
    
    // Get current settings or return defaults
    const settings = await systemCollection.findOne({})
    
    const defaultSettings: SystemSettings = {
      systemName: 'מערכת ניהול בדיקות',
      menuColorPalette: {
        primary: '#a3e4d7',     // Soft mint
        secondary: '#fbb6ce',   // Soft pink  
        accent: '#a78bfa',      // Soft purple
        background: '#f1f5f9',  // Light gray
        text: '#334155'         // Dark gray
      },
      logoPosition: 'left',
      emailProvider: 'gmail',
      emailSettings: {
        gmail: {
          email: '',
          appPassword: ''
        }
      },
      updatedAt: new Date(),
      updatedBy: userInfo.userId
    }

    return c.json<ApiResponse<SystemSettings>>({
      success: true,
      data: settings || defaultSettings
    })

  } catch (error) {
    console.error('System settings fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Update system settings (admin only)
system.put('/settings', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    const systemCollection = db.collection<SystemSettings>('systemSettings')
    
    // Check if user is admin
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    const settingsData = await c.req.json()
    
    const updatedSettings = {
      ...settingsData,
      updatedAt: new Date(),
      updatedBy: currentUser._id?.toString()
    }

    // Upsert settings (update if exists, insert if not)
    const result = await systemCollection.replaceOne(
      {},
      updatedSettings,
      { upsert: true }
    )

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'System settings updated successfully'
    })

  } catch (error) {
    console.error('System settings update error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Upload file (logo, background image, etc.)
system.post('/upload', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    
    // Check if user is admin
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'logo' | 'background' | 'banner'
    
    if (!file) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'No file provided'
      }, 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
      }, 400)
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      }, 400)
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const base64DataUrl = `data:${file.type};base64,${base64}`

    return c.json<ApiResponse<{ base64: string; filename: string }>>({
      success: true,
      data: {
        base64: base64DataUrl,
        filename: file.name
      },
      message: 'File uploaded successfully'
    })

  } catch (error) {
    console.error('File upload error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get default color palettes
system.get('/color-palettes', async (c) => {
  const palettes = [
    {
      name: 'פסטלים רכים',
      colors: {
        primary: '#a3e4d7',     // Soft mint
        secondary: '#fbb6ce',   // Soft pink  
        accent: '#a78bfa',      // Soft purple
        background: '#f1f5f9',  // Light gray
        text: '#334155'         // Dark gray
      }
    },
    {
      name: 'כחול מקצועי',
      colors: {
        primary: '#93c5fd',     // Light blue
        secondary: '#c7d2fe',   // Light indigo
        accent: '#fde68a',      // Light yellow
        background: '#f8fafc',  // Very light gray
        text: '#1e293b'         // Dark blue-gray
      }
    },
    {
      name: 'ירוק טבעי',
      colors: {
        primary: '#86efac',     // Light green
        secondary: '#bfdbfe',   // Light blue
        accent: '#fbbf24',      // Soft yellow
        background: '#f0fdf4',  // Very light green
        text: '#166534'         // Dark green
      }
    },
    {
      name: 'אפור מינימלי',
      colors: {
        primary: '#cbd5e1',     // Light gray
        secondary: '#e2e8f0',   // Very light gray
        accent: '#f59e0b',      // Orange accent
        background: '#ffffff',  // White
        text: '#374151'         // Dark gray
      }
    },
    {
      name: 'סגול אלגנטי',
      colors: {
        primary: '#c4b5fd',     // Light purple
        secondary: '#fca5a5',   // Light pink
        accent: '#34d399',      // Light green accent
        background: '#faf5ff',  // Very light purple
        text: '#581c87'         // Dark purple
      }
    }
  ]

  return c.json<ApiResponse<typeof palettes>>({
    success: true,
    data: palettes
  })
})

// Get available icons list
system.get('/icons', async (c) => {
  const icons = [
    'heart',
    'shield-check',
    'user-group',
    'building-office',
    'calendar-days',
    'clipboard-document-check',
    'chart-bar',
    'cog-6-tooth',
    'bell',
    'check-circle',
    'information-circle',
    'exclamation-triangle',
    'plus-circle',
    'minus-circle',
    'x-circle',
    'arrow-right',
    'arrow-left',
    'home',
    'document',
    'folder',
    'envelope',
    'phone',
    'map-pin',
    'clock',
    'star',
    'fire',
    'light-bulb',
    'academic-cap',
    'briefcase',
    'truck'
  ]

  return c.json<ApiResponse<string[]>>({
    success: true,
    data: icons
  })
})

export default system