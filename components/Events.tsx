export default function Events() {
  return (
    <section className="events-section" id="hackathon">
      <div className="container">
        <div className="section-header reveal-up">
          <span className="section-eyebrow">Upcoming Event</span>
          <h2 className="section-heading">HACK. BUILD. SHIP.</h2>
        </div>
        <div className="event-showcase">
          <div className="event-poster-wrap reveal-up">
            <img
              src="/assets/drophack.png"
              alt="DropHack'26 — SIEC Community Hackathon, Tech Yuva as Community Partner"
              className="event-poster"
            />
            <div className="event-badge">
              <span className="badge-dot"></span>
              Community Partner
            </div>
          </div>
          <div className="event-info reveal-up">
            <span className="event-partner-tag">SIEC × Tech Yuva</span>
            <h3 className="event-title">
              DROP<span className="accent-red">HACK</span>&apos;26
            </h3>
            <p className="event-tagline">
              Unknown Problems. Unstoppable Minds. 10 Hours. Zero Excuses.
            </p>

            <div className="event-meta">
              <div className="meta-item">
                <span className="meta-label">Date</span>
                <span className="meta-value">29 August 2026</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Duration</span>
                <span className="meta-value">10 Hours Offline</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Prize Pool</span>
                <span className="meta-value">₹50,000+</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Team Size</span>
                <span className="meta-value">2–4 Members</span>
              </div>
            </div>

            <div className="event-themes">
              <span className="theme-pill">FinTech</span>
              <span className="theme-pill">AI</span>
              <span className="theme-pill">Web3</span>
              <span className="theme-pill">Cybersecurity</span>
              <span className="theme-pill">Healthcare</span>
            </div>

            <div className="event-stages">
              <div className="stage-item">
                <span className="stage-num">1</span>
                <div>
                  <strong>Online Qualifier</strong>
                  <br />
                  <span className="muted">15 Aug 2026</span>
                </div>
              </div>
              <div className="stage-line"></div>
              <div className="stage-item">
                <span className="stage-num stage-num-alt">2</span>
                <div>
                  <strong>Offline Finale</strong>
                  <br />
                  <span className="muted">29 Aug 2026</span>
                </div>
              </div>
            </div>

            <a
              href="https://unstop.com/hackathons/drophack-siec-community-1701822"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-white event-cta-btn"
            >
              Register on Unstop <span>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
