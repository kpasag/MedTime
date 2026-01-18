import nodemailer from 'nodemailer';

// Create transporter - configure with your email service
// For production, use environment variables for credentials
const createTransporter = () => {
  // Check if email configuration exists
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

// Email templates for different notification types
const emailTemplates = {
  upcoming: (medicationName, dosage, time) => ({
    subject: `Upcoming Medication: ${medicationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Upcoming Medication Reminder</h2>
        <p>This is a reminder that you have an upcoming medication:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Medication:</strong> ${medicationName}</p>
          <p style="margin: 8px 0 0;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 8px 0 0;"><strong>Scheduled Time:</strong> ${time}</p>
        </div>
        <p>Please prepare to take your medication at the scheduled time.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          - MedTime Team
        </p>
      </div>
    `
  }),

  pending: (medicationName, dosage, time) => ({
    subject: `Time to Take: ${medicationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Time to Take Your Medication</h2>
        <p>It's time to take your medication:</p>
        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Medication:</strong> ${medicationName}</p>
          <p style="margin: 8px 0 0;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 8px 0 0;"><strong>Scheduled Time:</strong> ${time}</p>
        </div>
        <p>Please take your medication now and mark it as taken in the app.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          - MedTime Team
        </p>
      </div>
    `
  }),

  taken: (medicationName, dosage, time) => ({
    subject: `Medication Taken: ${medicationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Medication Taken Successfully</h2>
        <p>Great job! You've marked your medication as taken:</p>
        <div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Medication:</strong> ${medicationName}</p>
          <p style="margin: 8px 0 0;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 8px 0 0;"><strong>Scheduled Time:</strong> ${time}</p>
        </div>
        <p>Keep up the great work with your medication routine!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          - MedTime Team
        </p>
      </div>
    `
  }),

  missed: (medicationName, dosage, time) => ({
    subject: `Missed Medication: ${medicationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Missed Medication Alert</h2>
        <p>You may have missed taking your medication:</p>
        <div style="background: #fee2e2; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>Medication:</strong> ${medicationName}</p>
          <p style="margin: 8px 0 0;"><strong>Dosage:</strong> ${dosage}</p>
          <p style="margin: 8px 0 0;"><strong>Scheduled Time:</strong> ${time}</p>
        </div>
        <p>If you haven't taken this medication yet, please consult with your healthcare provider about what to do.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
          - MedTime Team
        </p>
      </div>
    `
  })
};

/**
 * Send a notification email
 * @param {string} to - Recipient email address
 * @param {string} type - Notification type: 'upcoming', 'pending', 'taken', 'missed'
 * @param {string} medicationName - Name of the medication
 * @param {string} dosage - Dosage information
 * @param {string} time - Scheduled time
 * @returns {Promise<boolean>} - Whether email was sent successfully
 */
export const sendNotificationEmail = async (to, type, medicationName, dosage, time) => {
  if (!transporter) {
    console.log('Email service not configured, skipping email send');
    return false;
  }

  const template = emailTemplates[type];
  if (!template) {
    console.error(`Unknown email template type: ${type}`);
    return false;
  }

  const { subject, html } = template(medicationName, dosage, time);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    });
    console.log(`Email sent successfully to ${to} for ${type} notification`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default { sendNotificationEmail };
