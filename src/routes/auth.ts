import { Hono } from 'hono'
import { getDB } from '../lib/mongodb'
import { getSupabaseClient, extractUserFromToken } from '../lib/supabase'
import { User, ApiResponse } from '../types'

const auth = new Hono()

// Register new user (after Supabase auth)
auth.post('/register', async (c) => {
  try {
    const { email, name, supabaseUserId } = await c.req.json()
    
    if (!email || !name || !supabaseUserId) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required fields: email, name, supabaseUserId'
      }, 400)
    }

    const db = getDB()
    const usersCollection = db.collection<User>('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [{ email }, { supabaseUserId }] 
    })
    
    if (existingUser) {
      return c.json<ApiResponse<User>>({
        success: true,
        data: existingUser,
        message: 'User already exists'
      })
    }

    // Create new user with default admin role (first user) or regular user role
    const userCount = await usersCollection.countDocuments()
    const newUser: User = {
      email,
      name,
      supabaseUserId,
      role: userCount === 0 ? 'admin' : 'tester', // First user is admin
      createdAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser)
    newUser._id = result.insertedId.toString()

    return c.json<ApiResponse<User>>({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get current user profile
auth.get('/profile', async (c) => {
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
    
    const user = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!user) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json<ApiResponse<User>>({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Update user profile
auth.put('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const { name } = await c.req.json()
    
    if (!name) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Name is required'
      }, 400)
    }

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    
    const result = await usersCollection.updateOne(
      { supabaseUserId: userInfo.userId },
      { $set: { name } }
    )
    
    if (result.matchedCount === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Admin only: Get all users
auth.get('/users', async (c) => {
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
    
    // Check if current user is admin
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    const users = await usersCollection.find({}).toArray()

    return c.json<ApiResponse<User[]>>({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Admin only: Update user role
auth.put('/users/:userId/role', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const userId = c.req.param('userId')
    const { role } = await c.req.json()
    
    if (!role || !['admin', 'tester'].includes(role)) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid role. Must be "admin" or "tester"'
      }, 400)
    }

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    
    // Check if current user is admin
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    const result = await usersCollection.updateOne(
      { _id: userId },
      { $set: { role } }
    )
    
    if (result.matchedCount === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'User role updated successfully'
    })

  } catch (error) {
    console.error('User role update error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

export default auth