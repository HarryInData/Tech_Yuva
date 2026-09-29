const { renderBaseLayout } = require('./baseLayout');
const env = require('../../config/env');

function eventConfirmationEmailTemplate({ name, eventTitle, eventDate, mode, venue, registrationId }) {
  const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const bodyContent = `
    <h2>Registration Confirmed: ${eventTitle}</h2>
    <p>Hi ${name}, your seat has been reserved for <strong>${eventTitle}</strong>!</p>
    
    <div class="info-card">
      <div class="info-item"><strong>Event:</strong> ${eventTitle}</div>
      <div class="info-item"><strong>Date & Time:</strong> ${formattedDate}</div>
      <div class="info-item"><strong>Format / Mode:</strong> ${mode.toUpperCase()}</div>
      <div class="info-item"><strong>Venue / Link:</strong> ${venue}</div>
      <div class="info-item"><strong>Registration Pass ID:</strong> <code>${registrationId || 'TY-CONFIRMED'}</code></div>
    </div>

    <p>Please arrive 15 minutes before the scheduled time. Bring your laptop, charger, and builder mindset.</p>
    <p>If your plans change and you cannot make it, please cancel your registration so other builders on the waitlist can participate.</p>
  `;

  return renderBaseLayout({
    title: `Registration Confirmed: ${eventTitle}`,
    previewText: `Your pass for ${eventTitle} is confirmed!`,
    bodyContent,
    ctaText: 'View Event Details',
    ctaUrl: `${env.FRONTEND_URL}/#hackathon`,
  });
}

module.exports = { eventConfirmationEmailTemplate };
