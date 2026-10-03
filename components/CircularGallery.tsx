'use client';

import React from 'react';
import EventGalleryMarquee from '@/components/EventGalleryMarquee';
import { EventGalleryItem } from '@/data/eventsData';

const SHOWCASE_ITEMS: EventGalleryItem[] = [
  {
    src: '/events/drophack-26/drophack-02-team.webp',
    alt: 'Tech Yuva team and participants at the Paytm office reception in Noida',
    caption: 'The Tech Yuva team',
  },
  {
    src: '/events/cyber-intelligence-workshop-26/cyber-01-auditorium.webp',
    alt: 'Participants seated in the Mini Auditorium during the workshop',
    caption: 'Full session at the Mini Auditorium',
  },
  {
    src: '/events/drophack-26/drophack-04-coding-floor.webp',
    alt: 'Participants coding on laptops across rows of desks',
    caption: '10 hours of building',
  },
  {
    src: '/events/cyber-intelligence-workshop-26/cyber-03-memento.webp',
    alt: 'A memento being presented on stage during the workshop',
    caption: 'Memento presentation',
  },
  {
    src: '/events/drophack-26/drophack-06-session.webp',
    alt: 'A speaker presenting to participants in front of a projector screen',
    caption: 'Session with participants',
  },
  {
    src: '/events/cyber-intelligence-workshop-26/cyber-04-group.webp',
    alt: 'Group photo of organisers and guests on stage after the session',
    caption: 'Group photo',
  },
];

export default function CircularGallery() {
  return (
    <section className="circular-gallery-section" id="showcase">
      <div className="container">
        <div className="section-header reveal-up">
          <span className="section-eyebrow">Community Showcase</span>
          <h2 className="section-heading">
            Empowerment.<br />
            Ecosystem. Community.
          </h2>
          <p className="section-sub">
            Explore our builder ecosystem, flagship hackathons, and student innovation showcase.
          </p>
        </div>

        <div className="showcase-marquee-wrap reveal-up">
          <EventGalleryMarquee
            items={SHOWCASE_ITEMS}
            eventTitle="Tech Yuva Ecosystem Showcase"
            eventSlug="ecosystem-showcase"
            direction="ltr"
            speedSeconds={44}
          />
        </div>
      </div>
    </section>
  );
}
