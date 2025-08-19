import { Hono } from 'hono'
import { getDB } from '../lib/mongodb'
import { extractUserFromToken } from '../lib/supabase'
import { Event, Employee, User, ApiResponse, MonthlyActivityReport, EventEmployeeReport } from '../types'

const reports = new Hono()

// Get monthly activity report (admin only)
reports.get('/monthly', async (c) => {
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

    // Get query parameters for filtering
    const yearParam = c.req.query('year')
    const monthParam = c.req.query('month')
    const statusParam = c.req.query('status')
    
    const currentDate = new Date()
    const year = yearParam ? parseInt(yearParam) : currentDate.getFullYear()
    const month = monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1
    
    // Create date range for the specified month
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Build event query
    let eventQuery: any = {
      eventDate: { $gte: startDate, $lte: endDate }
    }
    
    if (statusParam && statusParam !== 'all') {
      eventQuery.status = statusParam
    }

    // Get events for the month
    const monthEvents = await eventsCollection.find(eventQuery).toArray()
    
    // Calculate statistics
    let totalEvents = monthEvents.length
    let totalRegistered = 0
    let totalTested = 0
    let totalRevenue = 0
    let totalTransactions = 0
    
    const eventsByStatus = {
      preparing: 0,
      planned: 0,
      completed: 0,
      cancelled: 0,
      postponed: 0
    }

    // Process each event
    for (const event of monthEvents) {
      // Count by status
      eventsByStatus[event.status]++
      
      // Get employees for this event
      const eventEmployees = await employeesCollection.find({
        eventId: event._id?.toString()
      }).toArray()
      
      totalRegistered += eventEmployees.length
      
      const testedEmployees = eventEmployees.filter(emp => emp.status === 'tested')
      totalTested += testedEmployees.length
      
      // Calculate revenue from tested employees with transactions
      for (const employee of testedEmployees) {
        if (employee.testResults?.transactionAmount) {
          totalRevenue += employee.testResults.transactionAmount
          totalTransactions++
        }
      }
    }

    const testToSaleRatio = totalTested > 0 ? (totalTransactions / totalTested) * 100 : 0
    const averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    const report: MonthlyActivityReport = {
      year,
      month,
      totalEvents,
      totalRegistered,
      totalTested,
      totalRevenue,
      testToSaleRatio,
      averageTransactionAmount,
      eventsByStatus
    }

    return c.json<ApiResponse<MonthlyActivityReport>>({
      success: true,
      data: report
    })

  } catch (error) {
    console.error('Monthly report error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get event employees report (admin only)
reports.get('/event-employees', async (c) => {
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

    // Get query parameters
    const yearParam = c.req.query('year')
    const monthParam = c.req.query('month') 
    const eventName = c.req.query('eventName')
    
    // Build query for events
    let eventQuery: any = {}
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam)
      const month = parseInt(monthParam)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      eventQuery.eventDate = { $gte: startDate, $lte: endDate }
    }
    
    if (eventName && eventName !== 'all') {
      eventQuery.organizationName = { $regex: eventName, $options: 'i' }
    }

    // Get matching events
    const events = await eventsCollection.find(eventQuery).toArray()
    
    const reports: EventEmployeeReport[] = []

    for (const event of events) {
      // Get all employees for this event
      const employees = await employeesCollection.find({
        eventId: event._id?.toString()
      }).toArray()

      const employeeData = employees.map(employee => ({
        fullName: employee.fullName,
        email: employee.email,
        organizationName: event.organizationName,
        wasTested: employee.status === 'tested',
        transactionAmount: employee.testResults?.transactionAmount || 0,
        medicalResults: employee.testResults?.medicalResults,
        businessDetails: employee.testResults?.businessDetails
      }))

      reports.push({
        eventId: event._id?.toString() || '',
        eventName: event.organizationName,
        eventDate: event.eventDate,
        employees: employeeData
      })
    }

    return c.json<ApiResponse<EventEmployeeReport[]>>({
      success: true,
      data: reports
    })

  } catch (error) {
    console.error('Event employees report error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Export event employees report as CSV (admin only)
reports.get('/event-employees/export', async (c) => {
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

    // Get query parameters (same as above)
    const yearParam = c.req.query('year')
    const monthParam = c.req.query('month') 
    const eventName = c.req.query('eventName')
    
    let eventQuery: any = {}
    
    if (yearParam && monthParam) {
      const year = parseInt(yearParam)
      const month = parseInt(monthParam)
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999)
      eventQuery.eventDate = { $gte: startDate, $lte: endDate }
    }
    
    if (eventName && eventName !== 'all') {
      eventQuery.organizationName = { $regex: eventName, $options: 'i' }
    }

    const events = await eventsCollection.find(eventQuery).toArray()
    
    // Build CSV content
    let csvContent = 'Event Name,Event Date,Full Name,Email,Organization,Was Tested,Transaction Amount,Medical Results,Business Details\n'
    
    for (const event of events) {
      const employees = await employeesCollection.find({
        eventId: event._id?.toString()
      }).toArray()

      for (const employee of employees) {
        const row = [
          `"${event.organizationName}"`,
          `"${event.eventDate.toLocaleDateString()}"`,
          `"${employee.fullName}"`,
          `"${employee.email}"`,
          `"${event.organizationName}"`,
          employee.status === 'tested' ? 'Yes' : 'No',
          employee.testResults?.transactionAmount || 0,
          `"${employee.testResults?.medicalResults || ''}"`,
          `"${employee.testResults?.businessDetails || ''}"`
        ]
        csvContent += row.join(',') + '\n'
      }
    }

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="event-employees-report.csv"'
      }
    })

  } catch (error) {
    console.error('CSV export error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

export default reports