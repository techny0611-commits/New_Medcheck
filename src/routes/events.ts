import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { getDB } from '../lib/mongodb'
import { generateRegistrationLink, generateTimeSlots } from '../lib/mongodb'
import { extractUserFromToken } from '../lib/supabase'
import { Event, TimeSlot, Employee, User, ApiResponse, DashboardStats } from '../types'

const events = new Hono()

// Get dashboard statistics (admin only)
events.get('/dashboard', async (c) => {
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
    const eventsCollection = db.collection<Event>('events')
    const employeesCollection = db.collection<Employee>('employees')
    
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

    // Calculate current month statistics
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Total events this month
    const totalEvents = await eventsCollection.countDocuments({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
    })

    // Completed events this month
    const completedEvents = await eventsCollection.countDocuments({
      status: 'completed',
      eventDate: { $gte: currentMonthStart, $lte: currentMonthEnd }
    })

    // Upcoming events this month
    const upcomingEvents = await eventsCollection.countDocuments({
      status: 'planned',
      eventDate: { $gte: currentDate }
    })

    // Get revenue and transaction data
    const thisMonthEvents = await eventsCollection.find({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
    }).toArray()

    let totalRevenue = 0
    let totalTransactions = 0
    let totalTested = 0

    for (const event of thisMonthEvents) {
      const employees = await employeesCollection.find({
        eventId: event._id?.toString(),
        status: 'tested',
        'testResults.transactionAmount': { $exists: true, $gt: 0 }
      }).toArray()

      const eventRevenue = employees.reduce((sum, emp) => 
        sum + (emp.testResults?.transactionAmount || 0), 0
      )
      
      totalRevenue += eventRevenue
      totalTransactions += employees.filter(emp => 
        emp.testResults?.transactionAmount && emp.testResults.transactionAmount > 0
      ).length

      const eventTested = await employeesCollection.countDocuments({
        eventId: event._id?.toString(),
        status: 'tested'
      })
      totalTested += eventTested
    }

    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const testToSaleRatio = totalTested > 0 ? (totalTransactions / totalTested) * 100 : 0

    // Get recent events
    const recentEvents = await eventsCollection.find({})
      .sort({ eventDate: -1 })
      .limit(10)
      .toArray()

    const recentEventsWithStats = await Promise.all(
      recentEvents.map(async (event) => {
        const totalRegistered = await employeesCollection.countDocuments({
          eventId: event._id?.toString()
        })
        
        const totalTestedCount = await employeesCollection.countDocuments({
          eventId: event._id?.toString(),
          status: 'tested'
        })

        const totalWaiting = await employeesCollection.countDocuments({
          eventId: event._id?.toString(),
          status: 'waiting'
        })

        const eventEmployees = await employeesCollection.find({
          eventId: event._id?.toString(),
          status: 'tested',
          'testResults.transactionAmount': { $exists: true, $gt: 0 }
        }).toArray()

        const eventRevenue = eventEmployees.reduce((sum, emp) => 
          sum + (emp.testResults?.transactionAmount || 0), 0
        )

        return {
          _id: event._id?.toString() || '',
          organizationName: event.organizationName,
          eventDate: event.eventDate,
          status: event.status,
          totalRegistered,
          totalTested: totalTestedCount,
          totalWaiting,
          totalRevenue: eventRevenue
        }
      })
    )

    const stats: DashboardStats = {
      currentMonth: {
        totalEvents,
        completedEvents,
        upcomingEvents,
        totalRevenue,
        averageTransaction,
        testToSaleRatio
      },
      recentEvents: recentEventsWithStats
    }

    return c.json<ApiResponse<DashboardStats>>({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get all events (with role-based filtering)
events.get('/', async (c) => {
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
    const eventsCollection = db.collection<Event>('events')
    
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    // Build query based on role
    let query = {}
    if (currentUser.role === 'tester') {
      // Testers can only see planned and preparing events
      query = { status: { $in: ['planned', 'preparing'] } }
    }
    // Admins can see all events

    // Get date filters from query params
    const month = c.req.query('month')
    const year = c.req.query('year')
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      query = { ...query, eventDate: { $gte: startDate, $lte: endDate } }
    }

    const allEvents = await eventsCollection.find(query)
      .sort({ eventDate: -1 })
      .toArray()

    return c.json<ApiResponse<Event[]>>({
      success: true,
      data: allEvents
    })

  } catch (error) {
    console.error('Events fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get single event by ID
events.get('/:eventId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const eventId = c.req.param('eventId')
    const db = getDB()
    const eventsCollection = db.collection<Event>('events')
    
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) })
    
    if (!event) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Event not found'
      }, 404)
    }

    return c.json<ApiResponse<Event>>({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Event fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Create new event (admin only)
events.post('/', async (c) => {
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
    const eventsCollection = db.collection<Event>('events')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')
    
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    const eventData = await c.req.json()
    
    // Validate required fields
    const requiredFields = [
      'organizationName', 'eventDate', 'startTime', 'endTime', 
      'minimumParticipants', 'testDuration', 'breakDuration',
      'eventPassword', 'marketingMessage', 'colorPalette', 'iconName'
    ]
    
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return c.json<ApiResponse<null>>({
          success: false,
          error: `Missing required field: ${field}`
        }, 400)
      }
    }

    const newEvent: Event = {
      ...eventData,
      eventDate: new Date(eventData.eventDate),
      customBreaks: eventData.customBreaks || [],
      relevantIssues: eventData.relevantIssues || [],
      status: 'preparing' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: currentUser._id?.toString() || '',
      registrationLink: '' // Will be set after insertion
    }

    const result = await eventsCollection.insertOne(newEvent)
    const eventId = result.insertedId.toString()
    
    // Generate registration link
    const registrationLink = generateRegistrationLink(eventId)
    
    // Update event with registration link
    await eventsCollection.updateOne(
      { _id: result.insertedId },
      { $set: { registrationLink } }
    )

    // Generate time slots
    const timeSlots = generateTimeSlots(
      newEvent.eventDate,
      newEvent.startTime,
      newEvent.endTime,
      newEvent.testDuration,
      newEvent.breakDuration,
      newEvent.customBreaks
    )

    // Insert time slots
    const timeSlotsToInsert = timeSlots.map(slot => ({
      eventId,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotType: slot.slotType === 'break' ? 'break' : 'available',
      createdAt: new Date()
    }))

    if (timeSlotsToInsert.length > 0) {
      await timeSlotsCollection.insertMany(timeSlotsToInsert)
    }

    newEvent._id = eventId
    newEvent.registrationLink = registrationLink

    return c.json<ApiResponse<Event>>({
      success: true,
      data: newEvent,
      message: 'Event created successfully'
    })

  } catch (error) {
    console.error('Event creation error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Update event (admin only)
events.put('/:eventId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const eventId = c.req.param('eventId')
    const updateData = await c.req.json()

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    const eventsCollection = db.collection<Event>('events')
    
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    // Prepare update data
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    }

    // Convert eventDate to Date if provided
    if (updateData.eventDate) {
      updateFields.eventDate = new Date(updateData.eventDate)
    }

    const result = await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: updateFields }
    )
    
    if (result.matchedCount === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Event not found'
      }, 404)
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Event update error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Delete event (admin only)
events.delete('/:eventId', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const eventId = c.req.param('eventId')

    const db = getDB()
    const usersCollection = db.collection<User>('users')
    const eventsCollection = db.collection<Event>('events')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')
    const employeesCollection = db.collection<Employee>('employees')
    
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })
    
    if (!currentUser || currentUser.role !== 'admin') {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Admin access required'
      }, 403)
    }

    // Delete event and related data
    await Promise.all([
      eventsCollection.deleteOne({ _id: new ObjectId(eventId) }),
      timeSlotsCollection.deleteMany({ eventId }),
      employeesCollection.deleteMany({ eventId })
    ])

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Event deletion error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

export default events