const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');
const { welcomeEmailTemplate } = require('../templates/emails/welcomeEmail');
const { eventConfirmationEmailTemplate } = require('../templates/emails/eventConfirmationEmail');
const { passwordResetEmailTemplate, contactNotificationEmailTemplate } = require('../templates/emails/notificationEmails');

const isSmtpConfigured =
  env.SMTP_USER !== 'techyuva.org@gmail.com' ||
  (env.SMTP_PASS !== 'placeholder-app-password' && env.SMTP_PASS.length > 5);

let transporter = null;

if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  transporter.verify((error) => {
    if (error) {
      logger.warn(`[Nodemailer] SMTP connection warning: ${error.message}`);
    } else {
      logger.info('✅ [Nodemailer] SMTP transporter verified and ready to send emails.');
    }
  });
} else {
  logger.info('ℹ️  [Nodemailer] SMTP running in mock/preview mode. Outgoing emails will be logged to console.');
}

async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    logger.info(`📧 [MOCK EMAIL] TO: ${to} | SUBJECT: ${subject}`);
    logger.debug(`[MOCK EMAIL BODY]:\n${text || 'HTML Content (see template)'}`);
    return { messageId: `mock-${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    logger.info(`✅ Email dispatched to ${to} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
}

async function sendWelcomeEmail({ to, name, cohortName, interests }) {
  const html = welcomeEmailTemplate({ name, cohortName, interests });
  return sendMail({
    to,
    subject: `Welcome to Tech Yuva — Application Received (${cohortName || '2026 Cohort'})`,
    html,
    text: `Welcome to Tech Yuva, ${name}! Your application has been received.`,
  });
}

async function sendEventConfirmationEmail({ to, name, eventTitle, eventDate, mode, venue, registrationId }) {
  const html = eventConfirmationEmailTemplate({ name, eventTitle, eventDate, mode, venue, registrationId });
  return sendMail({
    to,
    subject: `Registration Confirmed: ${eventTitle} — Tech Yuva`,
    html,
    text: `Your registration for ${eventTitle} is confirmed! Pass ID: ${registrationId}`,
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const html = passwordResetEmailTemplate({ resetUrl, email: to });
  return sendMail({
    to,
    subject: 'Reset Your Password — Tech Yuva',
    html,
    text: `Click the link to reset your password: ${resetUrl}`,
  });
}

async function sendContactNotification({ name, email, subject, message }) {
  const html = contactNotificationEmailTemplate({ name, email, subject, message });
  return sendMail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `[Tech Yuva Web Inquiry] ${subject}`,
    html,
    text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
  });
}

module.exports = {
  sendMail,
  sendWelcomeEmail,
  sendEventConfirmationEmail,
  sendPasswordResetEmail,
  sendContactNotification,
};
