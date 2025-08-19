import { Hono } from 'hono'
import { ObjectId } from 'mongodb'
import { getDB } from '../lib/mongodb'
import { EmailService } from '../lib/email'
import { Event, TimeSlot, Employee, ApiResponse } from '../types'

const registration = new Hono()

// Get event data for registration (no auth required)
registration.get('/:eventId', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    const db = getDB()
    const eventsCollection = db.collection<Event>('events')
    
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(eventId),
      status: { $in: ['preparing', 'planned'] }
    })
    
    if (!event) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'אירוע לא נמצא או לא זמין לרישום'
      }, 404)
    }

    // Return only necessary data for registration (hide sensitive info)
    const publicEventData = {
      _id: event._id,
      organizationName: event.organizationName,
      eventDate: event.eventDate,
      relevantIssues: event.relevantIssues,
      marketingMessage: event.marketingMessage,
      colorPalette: event.colorPalette,
      iconName: event.iconName,
      bannerImage: event.bannerImage,
      // Don't return eventPassword here for security
    }

    return c.json<ApiResponse<any>>({
      success: true,
      data: publicEventData
    })

  } catch (error) {
    console.error('Event fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'שגיאה בטעינת פרטי האירוע'
    }, 500)
  }
})

// Get available time slots for event (no auth required)
registration.get('/:eventId/slots', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    const db = getDB()
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')
    
    const availableSlots = await timeSlotsCollection.find({
      eventId,
      slotType: 'available',
      participantId: { $exists: false } // Not occupied
    }).toArray()

    return c.json<ApiResponse<TimeSlot[]>>({
      success: true,
      data: availableSlots
    })

  } catch (error) {
    console.error('Slots fetch error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'שגיאה בטעינת זמנים זמינים'
    }, 500)
  }
})

// Register employee for event (no auth required)
registration.post('/:eventId/register', async (c) => {
  try {
    const eventId = c.req.param('eventId')
    const {
      eventPassword,
      fullName,
      email,
      phoneNumber,
      hasRelevantIssues,
      relevantIssuesSelected,
      timeSlotId
    } = await c.req.json()

    // Validate required fields
    if (!eventPassword || !fullName || !email || !phoneNumber) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'אנא מלא את כל השדות הנדרשים'
      }, 400)
    }

    const db = getDB()
    const eventsCollection = db.collection<Event>('events')
    const employeesCollection = db.collection<Employee>('employees')
    const timeSlotsCollection = db.collection<TimeSlot>('timeSlots')

    // Verify event exists and password is correct
    const event = await eventsCollection.findOne({ 
      _id: new ObjectId(eventId),
      status: { $in: ['preparing', 'planned'] }
    })

    if (!event) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'אירוע לא נמצא או לא זמין לרישום'
      }, 404)
    }

    if (event.eventPassword !== eventPassword) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'סיסמת האירוע שגויה'
      }, 400)
    }

    // Check if employee already registered
    const existingEmployee = await employeesCollection.findOne({
      eventId,
      $or: [
        { email },
        { phoneNumber }
      ]
    })

    if (existingEmployee) {
      return c.json<ApiResponse<null>>({
        success: false,
        error: 'כבר קיימת רישום עם המייל או מספר הטלפון הזה'
      }, 400)
    }

    let finalStatus: Employee['status'] = 'waiting'
    let finalTimeSlotId: string | undefined = undefined

    // If employee selected a time slot, try to book it
    if (timeSlotId && hasRelevantIssues) {
      const slot = await timeSlotsCollection.findOne({
        _id: new ObjectId(timeSlotId),
        eventId,
        slotType: 'available',
        participantId: { $exists: false }
      })

      if (slot) {
        // Book the slot
        await timeSlotsCollection.updateOne(
          { _id: new ObjectId(timeSlotId) },
          { 
            $set: { 
              participantId: 'temp', // Will be updated after employee creation
              slotType: 'occupied' 
            }
          }
        )
        finalStatus = 'scheduled'
        finalTimeSlotId = timeSlotId
      }
    }

    // Create employee record
    const newEmployee: Employee = {
      eventId,
      fullName,
      email,
      phoneNumber,
      hasRelevantIssues,
      relevantIssuesSelected: relevantIssuesSelected || [],
      status: finalStatus,
      timeSlotId: finalTimeSlotId,
      registrationDate: new Date()
    }

    const result = await employeesCollection.insertOne(newEmployee)
    const employeeId = result.insertedId.toString()

    // Update time slot with actual employee ID if booked
    let bookedSlot = null
    if (finalTimeSlotId) {
      await timeSlotsCollection.updateOne(
        { _id: new ObjectId(finalTimeSlotId) },
        { $set: { participantId: employeeId } }
      )
      
      // Get the booked slot details for email
      bookedSlot = await timeSlotsCollection.findOne({ 
        _id: new ObjectId(finalTimeSlotId) 
      })
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(email, fullName, event, bookedSlot)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the registration if email fails
    }

    return c.json<ApiResponse<{ employeeId: string; status: string }>>({
      success: true,
      data: {
        employeeId,
        status: finalStatus
      },
      message: finalStatus === 'scheduled' 
        ? 'רישום הושלם בהצלחה! זמן הבדיקה נקבע.'
        : 'רישום הושלם בהצלחה! הצטרפת לרשימת ההמתנה.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return c.json<ApiResponse<null>>({
      success: false,
      error: 'שגיאה ברישום - נסה שוב מאוחר יותר'
    }, 500)
  }
})

// Helper function to send confirmation email
async function sendConfirmationEmail(
  email: string, 
  fullName: string, 
  event: Event, 
  timeSlot: TimeSlot | null
): Promise<void> {
  try {
    const db = getDB()
    const systemCollection = db.collection('systemSettings')
    const settings = await systemCollection.findOne({})
    
    if (!settings || !settings.smtpSettings || !settings.emailTemplates) {
      console.log('Email settings not configured, skipping confirmation email')
      return
    }

    // Don't send email if SMTP not properly configured
    if (!settings.smtpSettings.host || !settings.smtpSettings.username) {
      console.log('SMTP not configured, skipping confirmation email')
      return
    }

    const emailService = new EmailService(settings.smtpSettings)
    
    const eventDate = new Date(event.eventDate).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const timeSlotText = timeSlot 
      ? `${timeSlot.startTime} - ${timeSlot.endTime}`
      : 'יתואם בהמשך (הצטרפת לרשימת המתנה)'

    await emailService.sendConfirmationEmail(
      email,
      fullName,
      event.organizationName,
      eventDate,
      timeSlotText,
      settings.emailTemplates,
      settings.systemName || 'מערכת ניהול בדיקות'
    )

    console.log(`Confirmation email sent to ${email}`)
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}

export default registration