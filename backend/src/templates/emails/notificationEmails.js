const { renderBaseLayout } = require('./baseLayout');

function passwordResetEmailTemplate({ resetUrl, email }) {
  const bodyContent = `
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password for your Tech Yuva account (<strong>${email}</strong>).</p>
    <p>Click the button below to choose a new, secure password. This link will expire in 60 minutes.</p>
    
    <div class="info-card">
      <div class="info-item"><strong>Security Tip:</strong> Tech Yuva will never ask for your password over email or Discord. If you did not initiate this request, you can safely ignore this message.</div>
    </div>
  `;

  return renderBaseLayout({
    title: 'Reset Your Tech Yuva Password',
    previewText: 'Reset your Tech Yuva account password',
    bodyContent,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
  });
}

function contactNotificationEmailTemplate({ name, email, subject, message }) {
  const bodyContent = `
    <h2>New Contact Form Inquiry</h2>
    <p>A new visitor sent a message through the Tech Yuva website:</p>
    
    <div class="info-card">
      <div class="info-item"><strong>Sender:</strong> ${name} &lt;${email}&gt;</div>
      <div class="info-item"><strong>Subject:</strong> ${subject}</div>
      <div class="info-item"><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</div>
    </div>
  `;

  return renderBaseLayout({
    title: `[Tech Yuva Contact] ${subject}`,
    previewText: `New message from ${name}: ${subject}`,
    bodyContent,
    ctaText: 'Reply by Email',
    ctaUrl: `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`,
  });
}

module.exports = { passwordResetEmailTemplate, contactNotificationEmailTemplate };
