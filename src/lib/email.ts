// Email service for automated notifications
export interface EmailSettings {
  host: string
  port: number
  username: string
  password: string
  useAuth: boolean
  useTLS: boolean
}

export interface EmailTemplate {
  subject: string
  body: string
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private settings: EmailSettings

  constructor(settings: EmailSettings) {
    this.settings = settings
  }

  // Replace template variables with actual values
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processed = template
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`
      processed = processed.replace(new RegExp(placeholder, 'g'), value)
    }
    return processed
  }

  // Convert plain text to HTML
  private textToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/, '<p>$1</p>')
  }

  // Send email using Web Fetch API (compatible with Cloudflare Workers)
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // For Cloudflare Workers, we'll use a simulated email sending
      // In a real implementation, you would use an email service API like:
      // - SendGrid API
      // - Mailgun API 
      // - AWS SES API
      // - Resend API

      console.log('Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        settings: {
          host: this.settings.host,
          port: this.settings.port,
          username: this.settings.username,
          useAuth: this.settings.useAuth,
          useTLS: this.settings.useTLS
        }
      })

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100))

      // Return true to indicate success
      // In real implementation, return the actual result from the email API
      return true

    } catch (error) {
      console.error('Email sending error:', error)
      return false
    }
  }

  // Send confirmation email to employee
  async sendConfirmationEmail(
    employeeEmail: string,
    employeeName: string,
    organizationName: string,
    eventDate: string,
    timeSlot: string,
    template: EmailTemplate,
    systemName: string = 'מערכת ניהול בדיקות'
  ): Promise<boolean> {
    const variables = {
      employeeName,
      organizationName,
      eventDate,
      timeSlot,
      systemName
    }

    const subject = this.processTemplate(template.subject, variables)
    const textBody = this.processTemplate(template.body, variables)
    const htmlBody = this.textToHtml(textBody)

    return await this.sendEmail({
      to: employeeEmail,
      subject,
      text: textBody,
      html: htmlBody
    })
  }

  // Send reminder email to employee
  async sendReminderEmail(
    employeeEmail: string,
    employeeName: string,
    organizationName: string,
    eventDate: string,
    timeSlot: string,
    template: EmailTemplate,
    systemName: string = 'מערכת ניהול בדיקות'
  ): Promise<boolean> {
    const variables = {
      employeeName,
      organizationName,
      eventDate,
      timeSlot,
      systemName
    }

    const subject = this.processTemplate(template.subject, variables)
    const textBody = this.processTemplate(template.body, variables)
    const htmlBody = this.textToHtml(textBody)

    return await this.sendEmail({
      to: employeeEmail,
      subject,
      text: textBody,
      html: htmlBody
    })
  }

  // Send test email
  async sendTestEmail(recipientEmail: string): Promise<boolean> {
    const testEmailData: EmailData = {
      to: recipientEmail,
      subject: 'בדיקת חיבור SMTP - מערכת ניהול בדיקות',
      text: 'זהו מייל בדיקה מהמערכת. החיבור פועל כראוי!',
      html: '<div dir="rtl"><h2>בדיקת חיבור SMTP</h2><p>זהו מייל בדיקה מהמערכת.</p><p><strong>החיבור פועל כראוי! ✅</strong></p></div>'
    }

    return await this.sendEmail(testEmailData)
  }
}

// Get email service instance with settings from database
export async function getEmailService(): Promise<EmailService | null> {
  try {
    // This would be called from your API routes to get configured email settings
    // For now, return null to indicate email service is not configured
    return null
  } catch (error) {
    console.error('Failed to create email service:', error)
    return null
  }
}

// Email queue for scheduled sending (future enhancement)
export interface EmailQueueItem {
  id: string
  to: string
  subject: string
  html: string
  text?: string
  scheduledFor: Date
  attempts: number
  status: 'pending' | 'sent' | 'failed'
  createdAt: Date
}

export class EmailQueue {
  // Add email to queue for later sending
  static async addToQueue(emailData: EmailData, scheduledFor: Date = new Date()): Promise<string> {
    // Implementation would add to database queue
    const queueItem: EmailQueueItem = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...emailData,
      scheduledFor,
      attempts: 0,
      status: 'pending',
      createdAt: new Date()
    }

    console.log('Email added to queue:', queueItem.id)
    return queueItem.id
  }

  // Process pending emails in queue
  static async processQueue(): Promise<void> {
    // Implementation would:
    // 1. Get pending emails from database
    // 2. Send emails that are due
    // 3. Update status and attempts
    // 4. Handle failed emails with retry logic
    console.log('Processing email queue...')
  }
}