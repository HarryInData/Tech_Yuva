'use client';

import React, { useMemo } from 'react';
import { EVENTS_DATA, getEventStatus, EventItem } from '@/data/eventsData';
import EventGalleryMarquee from '@/components/EventGalleryMarquee';
import { JOIN_FORM_URL } from '@/config/joinForm';

export default function Events() {
  // Auto-sort: derive status from date field
  const { pastEvents, upcomingEvents } = useMemo(() => {
    const past: EventItem[] = [];
    const upcoming: EventItem[] = [];

    EVENTS_DATA.forEach((event) => {
      const status = getEventStatus(event.date);
      if (status === 'past') {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    // Past events sorted newest first (23 Sep 2026 above 29 Aug 2026)
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { pastEvents: past, upcomingEvents: upcoming };
  }, []);

  const trackEvent = (eventName: string, params: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as {
      gtag?: (command: string, action: string, params?: Record<string, unknown>) => void;
      dataLayer?: Array<Record<string, unknown>>;
    };
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, params);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event: eventName, ...params });
    }
  };

  return (
    <>
      {/* Schema.org Structured Data for Past & Upcoming Events */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            [...pastEvents, ...upcomingEvents].map((event) => ({
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: event.title,
              startDate: event.date,
              eventAttendanceMode: event.location?.includes('Online')
                ? 'https://schema.org/OnlineEventAttendanceMode'
                : 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: 'https://schema.org/EventScheduled',
              location: event.location
                ? {
                    '@type': 'Place',
                    name: event.location,
                  }
                : undefined,
              description: event.description,
              image: event.gallery.map((g) => g.src),
              organizer: {
                '@type': 'Organization',
                name: event.organizer || 'Tech Yuva',
                url: 'https://www.techyuva.org',
              },
            }))
          ),
        }}
      />

      <section className="events-section" id="hackathon">
        <div className="container">
          {/* Section Header: Recast as Event Recap */}
          <div className="section-header reveal-up">
            <span className="section-eyebrow">Past Events · Recap &amp; Highlights</span>
            <h2 className="section-heading">HACK. BUILD. SHIP.</h2>
          </div>

          {/* Past Events List */}
          <div className="past-events-list">
            {pastEvents.map((event) => {
              return (
                <article
                  key={event.slug}
                  id={event.slug}
                  className="event-card-item"
                  aria-label={`${event.title} recap`}
                >
                  <div className="event-showcase">
                    {/* Event Poster Card */}
                    <div className="event-poster-wrap reveal-up">
                      <img
                        src={event.poster || event.gallery[0]?.src || '/assets/drophack.png'}
                        alt={`${event.title} — ${event.partner || 'Tech Yuva'}`}
                        className="event-poster"
                        loading="lazy"
                      />
                      {/* Completed / Past Event Pill (Calm blue/neutral with check icon) */}
                      <div className="event-badge--past">
                        <span className="badge-check">✓</span>
                        <span>PAST EVENT</span>
                      </div>
                    </div>

                    {/* Event Info Details */}
                    <div className="event-info reveal-up">
                      {event.partner && (
                        <span className="event-partner-tag">{event.partner}</span>
                      )}
                      <h3 className="event-title">
                        {event.slug === 'drophack-26' ? (
                          <>
                            DROP<span className="accent-red">HACK</span>&apos;26
                          </>
                        ) : (
                          event.title
                        )}
                      </h3>
                      <p className="event-tagline">{event.tagline}</p>

                      {/* Stat Cards Grid (Only render if values exist) */}
                      {event.stats && event.stats.length > 0 && (
                        <div className="event-meta">
                          {event.stats.map((stat) => (
                            <div key={stat.label} className="meta-item">
                              <span className="meta-label">{stat.label}</span>
                              <span className="meta-value">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tracks / Topics Pills */}
                      {event.tracks && event.tracks.length > 0 && (
                        <div className="event-themes">
                          {event.tracks.map((track) => (
                            <span key={track} className="theme-pill">
                              {track}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Event Journey (Past-tense steps marked as completed) */}
                      {event.journey && event.journey.length > 0 && (
                        <div className="event-stages" aria-label="Event stages">
                          {event.journey.map((step, idx) => (
                            <React.Fragment key={step.stage}>
                              {idx > 0 && <div className="stage-line"></div>}
                              <div className="stage-item">
                                <span
                                  className="stage-num stage-num--completed"
                                  title="Stage Completed"
                                >
                                  ✓
                                </span>
                                <div>
                                  <strong>{step.name}</strong>
                                  <br />
                                  <span className="muted">{step.date}</span>
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      {/* Single Action: View Highlights */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <a
                          href={`#${event.slug}-highlights`}
                          onClick={() => {
                            trackEvent('view_highlights_click', {
                              event_slug: event.slug,
                              event_title: event.title,
                            });
                          }}
                          className="btn btn-primary event-cta-btn"
                          style={{ width: 'auto', padding: '12px 28px' }}
                        >
                          View Highlights ↓
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* PART 2: KEY HIGHLIGHTS SECTION */}
                  <div
                    className="event-highlights-wrap reveal-up"
                    id={`${event.slug}-highlights`}
                    aria-label={`${event.title} key highlights and gallery`}
                  >
                    <div className="event-highlights-header">
                      <span className="event-highlights-eyebrow">
                        {event.shortTitle || event.title}
                      </span>
                      <h4 className="event-highlights-title">Key Highlights</h4>
                      {event.about && <p className="event-about-text">{event.about}</p>}
                    </div>

                    {/* Stat Cards (Only render if exists in data file) */}
                    {event.stats && event.stats.length > 0 && (
                      <div className="event-highlight-stats">
                        {event.stats.map((stat) => (
                          <div key={stat.label} className="highlight-stat-card">
                            <span className="highlight-stat-label">{stat.label}</span>
                            <span className="highlight-stat-value">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Auto-scrolling Photo Marquee (Part 3) */}
                    {event.gallery && event.gallery.length > 0 && (
                      <EventGalleryMarquee
                        items={event.gallery}
                        eventTitle={event.title}
                        eventSlug={event.slug}
                        speedSeconds={event.slug === 'drophack-26' ? 42 : 46}
                        direction="ltr"
                      />
                    )}

                    {/* Key Moments Bullets (Optional, only if provided) */}
                    {event.keyMoments && event.keyMoments.length > 0 && (
                      <div className="event-key-moments">
                        <h5 className="event-key-moments-title">
                          <span>⚡</span> Key Moments &amp; Outcomes
                        </h5>
                        <ul className="event-key-moments-list">
                          {event.keyMoments.map((moment, mIdx) => (
                            <li key={mIdx} className="event-moment-item">
                              <span className="event-moment-bullet">▸</span>
                              <span>{moment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Winners / Mentions (Optional, only rendered if data exists) */}
                    {event.winners && event.winners.length > 0 && (
                      <div className="event-winners-block">
                        {/* Empty by default - only renders when verified winners exist */}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Upcoming Events or Fallback Notice */}
          {upcomingEvents.length === 0 && (
            <div className="upcoming-events-empty-card reveal-up">
              <div className="upcoming-events-empty-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h4 className="upcoming-events-empty-title">New events coming soon</h4>
              <p className="upcoming-events-empty-desc">
                New events coming soon - join the community to get notified
              </p>
              <a
                href={JOIN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                Join Community <span>↗</span>
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
