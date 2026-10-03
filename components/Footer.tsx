import { JOIN_FORM_URL } from '@/config/joinForm';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col footer-brand-col">
            <div className="footer-logo-row">
              <img src="/assets/logo.jpg" alt="Tech Yuva" className="footer-logo-img" />
              <span className="footer-brand">
                <span className="brand-tech">TECH</span> <span className="brand-yuva">YUVA</span>
              </span>
            </div>
            <p className="footer-tagline">Where Youth Meet to Build Future Tech</p>
            <p className="footer-location">📍 New Delhi NCR, India</p>
          </div>
          <div className="footer-col">
            <h4>Ecosystem</h4>
            <ul>
              <li><a href="#pillars">Systems Engineering</a></li>
              <li><a href="#pillars">AI &amp; GenAI Bootcamps</a></li>
              <li><a href="#pillars">Web3 &amp; Blockchain</a></li>
              <li><a href="#pillars">Open Source Hub</a></li>
              <li><a href="#pillars">PitchCraft Accelerator</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Community</h4>
            <ul>
              <li>
                <a
                  href={JOIN_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Community
                </a>
              </li>
              <li><a href="#hackathon">Events &amp; Hackathons</a></li>
              <li><a href="https://www.techyuva.org/" target="_blank" rel="noopener noreferrer">Partner With Us</a></li>
              <li><a href="https://www.techyuva.org/" target="_blank" rel="noopener noreferrer">Become a Sponsor</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="mailto:techyuva.org@gmail.com">techyuva.org@gmail.com</a></li>
              <li><a href="https://www.instagram.com/techyuva_" target="_blank" rel="noopener noreferrer">Instagram @techyuva_</a></li>
              <li><a href="https://www.linkedin.com/in/techyuva/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              <li><a href="https://www.techyuva.org/" target="_blank" rel="noopener noreferrer">techyuva.org</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Tech Yuva — Guild Council. All rights reserved.</p>
          <p className="footer-sub">Built with ❤️ by Harry</p>
        </div>
      </div>
    </footer>
  );
}
