import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { getDB } from '../lib/mongodb'
import { extractUserFromToken } from '../lib/supabase'
import { User, ApiResponse } from '../types'

const users = new Hono()

// Get all users (admin only)
users.get('/', async (c) => {
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

    const allUsers = await usersCollection.find({}).toArray()

    return c.json<ApiResponse<User[]>>({
      success: true,
      data: allUsers
    })

  } catch (error) {
    console.error('Users fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Update user (admin only)
users.put('/:userId', async (c) => {
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
    const { name, email, role } = await c.req.json()

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

    // Validate role if provided
    if (role && !['admin', 'tester'].includes(role)) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Invalid role. Must be "admin" or "tester"'
      }, 400)
    }

    const updateFields: Partial<User> = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (role) updateFields.role = role

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    )
    
    if (result.matchedCount === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('User update error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Delete user (admin only)
users.delete('/:userId', async (c) => {
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

    // Prevent admin from deleting themselves
    if (currentUser._id?.toString() === userId) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Cannot delete your own account'
      }, 400)
    }

    const result = await usersCollection.deleteOne({ _id: new ObjectId(userId) })
    
    if (result.deletedCount === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('User deletion error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

export default users