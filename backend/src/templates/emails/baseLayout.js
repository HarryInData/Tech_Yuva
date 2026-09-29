/**
 * Navy-themed base email template
 * Palette:
 * - Background: #050B18
 * - Card/Surface: #0F1A30
 * - Border: #1E3358
 * - Electric Blue: #1E90FF / #2F80ED
 * - Text: #FFFFFF, Muted: #9FB0CC
 */
function renderBaseLayout({ title, previewText, bodyContent, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #050B18;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #050B18;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #0F1A30;
      border: 1px solid #1E3358;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 32px rgba(5, 11, 24, 0.8);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #1E3358;
      background: linear-gradient(180deg, #13233F 0%, #0F1A30 100%);
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #FFFFFF;
      text-transform: uppercase;
      text-decoration: none;
    }
    .brand-accent {
      color: #1E90FF;
    }
    .tagline {
      font-size: 13px;
      color: #9FB0CC;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #E2E8F0;
    }
    .content h1, .content h2 {
      color: #FFFFFF;
      margin-top: 0;
      font-size: 22px;
      font-weight: 700;
    }
    .content p {
      margin: 0 0 16px;
      color: #CBD5E1;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #1E90FF 0%, #2F80ED 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 13px 30px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(30, 144, 255, 0.35);
    }
    .info-card {
      background-color: #13233F;
      border: 1px solid #1E3358;
      border-radius: 10px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .info-item {
      margin: 6px 0;
      font-size: 14px;
      color: #9FB0CC;
    }
    .info-item strong {
      color: #FFFFFF;
    }
    .footer {
      padding: 24px 32px;
      border-top: 1px solid #1E3358;
      text-align: center;
      background-color: #0A1120;
    }
    .footer p {
      margin: 4px 0;
      font-size: 12px;
      color: #9FB0CC;
    }
    .footer-links a {
      color: #1E90FF;
      text-decoration: none;
      margin: 0 8px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#050B18;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText || title}
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">TECH <span class="brand-accent">YUVA</span></div>
        <div class="tagline">Where Youth Meet to Build Future Tech</div>
      </div>
      <div class="content">
        ${bodyContent}
        ${
          ctaText && ctaUrl
            ? `<div class="btn-container">
                 <a href="${ctaUrl}" class="btn" target="_blank" rel="noopener noreferrer">${ctaText}</a>
               </div>`
            : ''
        }
      </div>
      <div class="footer">
        <p>Tech Yuva — Guild Council &bull; New Delhi NCR, India</p>
        <p class="footer-links">
          <a href="https://www.techyuva.org">Website</a> &bull;
          <a href="https://discord.gg/techyuva">Discord HQ</a> &bull;
          <a href="https://www.linkedin.com/in/techyuva/">LinkedIn</a>
        </p>
        <p style="margin-top: 12px; color: #64748B;">You received this email because you signed up or interacted with Tech Yuva.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { renderBaseLayout };
