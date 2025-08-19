import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { getDB, getGridFSBucket } from '../lib/mongodb'
import { extractUserFromToken } from '../lib/supabase'
import { EmailService } from '../lib/email'
import { Employee, TimeSlot, User, TestResults, AttachedFile, ApiResponse, Event } from '../types'

const employees = new Hono()

// Get employees for an event (auth required)
employees.get('/:eventId', async (c) => {
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
    const status = c.req.query('status') // 'scheduled', 'waiting', 'tested', etc.

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')

    let query: any = { eventId }
    if (status) {
      query.status = status
    }

    const employees = await employeesCollection.find(query)
      .sort({ registrationDate: -1 })
      .toArray()

    // Enrich with time slot information
    const enrichedEmployees = await Promise.all(
      employees.map(async (employee) => {
        if (employee.timeSlotId) {
          const timeSlot = await timeSlotsCollection.findOne({
            _id: new ObjectId(employee.timeSlotId)
          })
          return { ...employee, timeSlot }
        }
        return employee
      })
    )

    return c.json<ApiResponse<typeof enrichedEmployees>>({
      success: true,
      data: enrichedEmployees
    })

  } catch (error) {
    console.error('Employees fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Move employee from waiting list to scheduled slot
employees.post('/:employeeId/schedule', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const employeeId = c.req.param('employeeId')
    const { timeSlotId } = await c.req.json()

    if (!timeSlotId) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Time slot ID is required'
      }, 400)
    }

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')

    // Verify employee exists and is in waiting status
    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId),
      status: 'waiting'
    })

    if (!employee) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Employee not found or not in waiting status'
      }, 404)
    }

    // Verify time slot is available
    const timeSlot = await timeSlotsCollection.findOne({
      _id: new ObjectId(timeSlotId),
      eventId: employee.eventId,
      slotType: 'available',
      participantId: { $exists: false }
    })

    if (!timeSlot) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Time slot not available'
      }, 400)
    }

    // Update both collections in a transaction-like manner
    await timeSlotsCollection.updateOne(
      { _id: new ObjectId(timeSlotId) },
      { 
        $set: { 
          participantId: employeeId,
          slotType: 'occupied'
        }
      }
    )

    await employeesCollection.updateOne(
      { _id: new ObjectId(employeeId) },
      { 
        $set: { 
          status: 'scheduled',
          timeSlotId: timeSlotId
        }
      }
    )

    // Send scheduling notification email
    try {
      await sendSchedulingNotification(employee, timeSlot)
    } catch (emailError) {
      console.error('Failed to send scheduling notification:', emailError)
      // Don't fail the scheduling if email fails
    }

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Employee scheduled successfully'
    })

  } catch (error) {
    console.error('Employee scheduling error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Move employee from scheduled to waiting list
employees.post('/:employeeId/unschedule', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const employeeId = c.req.param('employeeId')

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')

    // Verify employee exists and is scheduled
    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId),
      status: 'scheduled'
    })

    if (!employee) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Employee not found or not scheduled'
      }, 404)
    }

    // Free up the time slot
    if (employee.timeSlotId) {
      await timeSlotsCollection.updateOne(
        { _id: new ObjectId(employee.timeSlotId) },
        { 
          $unset: { participantId: 1 },
          $set: { slotType: 'available' }
        }
      )
    }

    // Update employee status
    await employeesCollection.updateOne(
      { _id: new ObjectId(employeeId) },
      { 
        $set: { status: 'waiting' },
        $unset: { timeSlotId: 1 }
      }
    )

    // TODO: Send notification email to employee
    // await sendUnscheduleNotification(employee.email)

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Employee moved to waiting list'
    })

  } catch (error) {
    console.error('Employee unscheduling error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Record test results for employee
employees.post('/:employeeId/test-results', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const employeeId = c.req.param('employeeId')
    const formData = await c.req.formData()

    const medicalResults = formData.get('medicalResults') as string
    const businessDetails = formData.get('businessDetails') as string
    const transactionAmount = parseFloat(formData.get('transactionAmount') as string) || 0

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')
    const usersCollection = db.collection<User>('users')

    // Verify employee exists
    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId)
    })

    if (!employee) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Employee not found'
      }, 404)
    }

    // Get current user for testedBy field
    const currentUser = await usersCollection.findOne({ 
      supabaseUserId: userInfo.userId 
    })

    if (!currentUser) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'User not found'
      }, 404)
    }

    // Process attached files
    const attachedFiles: AttachedFile[] = []
    const fileFields = Array.from(formData.keys()).filter(key => key.startsWith('file_'))

    for (const fieldName of fileFields) {
      const file = formData.get(fieldName) as File
      if (file && file.size > 0) {
        // Convert file to base64
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')

        attachedFiles.push({
          filename: file.name,
          contentType: file.type,
          data: base64,
          size: file.size
        })
      }
    }

    const testResults: TestResults = {
      medicalResults,
      businessDetails,
      transactionAmount,
      attachedFiles,
      testedBy: currentUser._id?.toString() || '',
      testDate: new Date()
    }

    // Update employee with test results
    await employeesCollection.updateOne(
      { _id: new ObjectId(employeeId) },
      { 
        $set: { 
          status: 'tested',
          testResults
        }
      }
    )

    return c.json<ApiResponse<null>>({
      success: true,
      message: 'Test results recorded successfully'
    })

  } catch (error) {
    console.error('Test results error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Get test results for an employee
employees.get('/:employeeId/test-results', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const employeeId = c.req.param('employeeId')

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')

    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId),
      status: 'tested'
    })

    if (!employee || !employee.testResults) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Test results not found'
      }, 404)
    }

    return c.json<ApiResponse<TestResults>>({
      success: true,
      data: employee.testResults
    })

  } catch (error) {
    console.error('Test results fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Download attached file
employees.get('/:employeeId/files/:fileIndex', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    if (!userInfo) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Unauthorized'
      }, 401)
    }

    const employeeId = c.req.param('employeeId')
    const fileIndex = parseInt(c.req.param('fileIndex'))

    const db = getDB()
    const employeesCollection = db.collection<Employee>('employees')

    const employee = await employeesCollection.findOne({
      _id: new ObjectId(employeeId),
      status: 'tested'
    })

    if (!employee || !employee.testResults?.attachedFiles?.[fileIndex]) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'File not found'
      }, 404)
    }

    const file = employee.testResults.attachedFiles[fileIndex]
    const fileBuffer = Buffer.from(file.data, 'base64')

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Content-Length': file.size.toString()
      }
    })

  } catch (error) {
    console.error('File download error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Send reminder emails for upcoming appointments
employees.post('/send-reminders/:eventId', async (c) => {
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
    const employeesCollection = db.collection<Employee>('employees')
    const eventsCollection = db.collection<Event>('events')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')

    // Get event and verify it's tomorrow or today
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(eventId) 
    })

    if (!event) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Event not found'
      }, 404)
    }

    const eventDate = new Date(event.eventDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Check if event is today or tomorrow
    const isToday = eventDate.toDateString() === today.toDateString()
    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString()

    if (!isToday && !isTomorrow) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'Reminders can only be sent for today or tomorrow\'s events'
      }, 400)
    }

    // Get all scheduled employees for this event
    const scheduledEmployees = await employeesCollection.find({
      eventId,
      status: 'scheduled',
      timeSlotId: { $exists: true }
    }).toArray()

    if (scheduledEmployees.length === 0) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'No scheduled employees found for this event'
      }, 400)
    }

    let emailsSent = 0
    let emailsFailed = 0

    // Send reminder emails to all scheduled employees
    for (const employee of scheduledEmployees) {
      try {
        if (employee.timeSlotId) {
          const timeSlot = await timeSlotsCollection.findOne({ 
            _id: new ObjectId(employee.timeSlotId) 
          })
          
          if (timeSlot) {
            await sendReminderNotification(employee, event, timeSlot)
            emailsSent++
          }
        }
      } catch (error) {
        console.error(`Failed to send reminder to ${employee.email}:`, error)
        emailsFailed++
      }
    }

    return c.json<ApiResponse<{ sent: number; failed: number }>>({
      success: true,
      data: { sent: emailsSent, failed: emailsFailed },
      message: `Reminder emails sent: ${emailsSent}, Failed: ${emailsFailed}`
    })

  } catch (error) {
    console.error('Send reminders error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

// Helper function to send scheduling notification email
async function sendSchedulingNotification(
  employee: Employee,
  timeSlot: TimeSlot
): Promise<void> {
  try {
    const db = getDB()
    const systemCollection = db.collection('systemSettings')
    const eventsCollection = db.collection<Event>('events')
    
    const settings = await systemCollection.findOne({})
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(employee.eventId) 
    })
    
    if (!settings || !event || !settings.smtpSettings || !settings.emailTemplates) {
      console.log('Email settings or event not found, skipping notification email')
      return
    }

    // Don't send email if SMTP not properly configured
    if (!settings.smtpSettings.host || !settings.smtpSettings.username) {
      console.log('SMTP not configured, skipping notification email')
      return
    }

    const emailService = new EmailService(settings.smtpSettings)
    
    const eventDate = new Date(event.eventDate).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeSlotText = `${timeSlot.startTime} - ${timeSlot.endTime}`

    // Create a custom notification message
    const notificationTemplate = {
      subject: 'עדכון זמן בדיקה - {organizationName}',
      body: 'שלום {employeeName},\n\nשמחים לעדכן שזמן הבדיקה שלך נקבע!\n\nפרטי הבדיקה:\nתאריך: {eventDate}\nשעה: {timeSlot}\nמיקום: {organizationName}\n\nנא להגיע בזמן.\n\nבברכה,\n{systemName}'
    }

    await emailService.sendConfirmationEmail(
      employee.email,
      employee.fullName,
      event.organizationName,
      eventDate,
      timeSlotText,
      notificationTemplate,
      settings.systemName || 'מערכת ניהול בדיקות'
    )

    console.log(`Scheduling notification sent to ${employee.email}`)
  } catch (error) {
    console.error('Error sending scheduling notification:', error)
    throw error
  }
}

// Helper function to send reminder notification email
async function sendReminderNotification(
  employee: Employee,
  event: Event,
  timeSlot: TimeSlot
): Promise<void> {
  try {
    const db = getDB()
    const systemCollection = db.collection('systemSettings')
    const settings = await systemCollection.findOne({})
    
    if (!settings || !settings.smtpSettings || !settings.emailTemplates) {
      console.log('Email settings not found, skipping reminder email')
      return
    }

    // Don't send email if SMTP not properly configured
    if (!settings.smtpSettings.host || !settings.smtpSettings.username) {
      console.log('SMTP not configured, skipping reminder email')
      return
    }

    const emailService = new EmailService(settings.smtpSettings)
    
    const eventDate = new Date(event.eventDate).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeSlotText = `${timeSlot.startTime} - ${timeSlot.endTime}`

    await emailService.sendReminderEmail(
      employee.email,
      employee.fullName,
      event.organizationName,
      eventDate,
      timeSlotText,
      settings.emailTemplates,
      settings.systemName || 'מערכת ניהול בדיקות'
    )

    console.log(`Reminder email sent to ${employee.email}`)
  } catch (error) {
    console.error('Error sending reminder email:', error)
    throw error
  }
}

export default employees