const { renderBaseLayout } = require('./baseLayout');
const env = require('../../config/env');

function welcomeEmailTemplate({ name, cohortName, interests = [] }) {
  const interestsList = interests.length
    ? `<div class="info-card">
         <div class="info-item"><strong>Your Technical Interests:</strong> ${interests.join(', ')}</div>
         <div class="info-item"><strong>Applied Cohort:</strong> ${cohortName || 'New Cohort 2026'}</div>
         <div class="info-item"><strong>Admission Status:</strong> Application Received (Review in Progress)</div>
       </div>`
    : '';

  const bodyContent = `
    <h2>Welcome to the Guild, ${name}!</h2>
    <p>Your application to join <strong>Tech Yuva (${cohortName || 'New Cohort 2026'})</strong> has been successfully received.</p>
    <p>Tech Yuva is a student-led innovation guild empowering ambitious young engineers to build real production systems, compete in high-stakes hackathons, and ship code alongside experienced mentors.</p>
    
    ${interestsList}

    <p>While the admissions committee reviews your profile, here is how you can jump in right now:</p>
    <ul>
      <li style="margin-bottom: 8px;"><strong>Join the Discord HQ:</strong> Introduce yourself in the <code>#introduce-yourself</code> channel.</li>
      <li style="margin-bottom: 8px;"><strong>Explore DropHack'26:</strong> Check out our upcoming flagship hackathon.</li>
      <li style="margin-bottom: 8px;"><strong>Follow GitHub Repos:</strong> Collaborate on open-source community tooling.</li>
    </ul>
    <p>We'll notify you via email as soon as your cohort application status updates.</p>
  `;

  return renderBaseLayout({
    title: 'Welcome to Tech Yuva — Application Received',
    previewText: `Welcome to Tech Yuva, ${name}! Your cohort application has been received.`,
    bodyContent,
    ctaText: 'Enter Discord HQ',
    ctaUrl: env.DISCORD_INVITE_URL,
  });
}

module.exports = { welcomeEmailTemplate };
