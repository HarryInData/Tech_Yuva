export interface EventStat {
  label: string;
  value: string;
}

export interface EventGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface EventJourneyStep {
  stage: number;
  name: string;
  date: string;
  status: 'Completed' | 'Upcoming';
}

export interface EventWinner {
  place: string;
  name: string;
  project?: string;
}

export interface EventItem {
  slug: string;
  title: string;
  shortTitle?: string;
  organizer?: string;
  partner?: string;
  partnerBadge?: string;
  date: string; // ISO date string: 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ssZ'
  tagline: string;
  description: string;
  about?: string;
  location?: string;
  duration?: string;
  prizePool?: string;
  teamSize?: string;
  speaker?: string;
  tracks?: string[];
  stats?: EventStat[];
  journey?: EventJourneyStep[];
  keyMoments?: string[];
  winners?: EventWinner[];
  poster?: string;
  gallery: EventGalleryItem[];
  registrationUrl?: string;
}

/**
 * Derives whether an event is 'past' or 'upcoming' based on the event date vs today.
 */
export function getEventStatus(dateStr: string): 'upcoming' | 'past' {
  const eventDate = new Date(dateStr);
  const now = new Date();
  return eventDate < now ? 'past' : 'upcoming';
}

export const EVENTS_DATA: EventItem[] = [
  {
    slug: 'cyber-intelligence-workshop-26',
    title: 'Workshop on "Cyber Intelligence & Digital Defence"',
    shortTitle: 'Cyber Intelligence & Digital Defence',
    organizer: 'Tech Yuva × Code Catalyst Club, IMS Ghaziabad',
    partner: 'Code Catalyst Club IMS Ghaziabad',
    partnerBadge: 'Hands-on Workshop',
    date: '2026-09-23T14:00:00+05:30',
    tagline: 'Analyze. Detect. Protect.',
    description:
      'A workshop on how Open Source Intelligence (OSINT) strengthens Dark Web investigations and intelligence-driven cybercrime detection with Vikas Kumar.',
    about:
      'A workshop on how Open Source Intelligence (OSINT) strengthens Dark Web investigations and intelligence-driven cybercrime detection. Participants explored digital footprint analysis, threat actor profiling, infrastructure mapping, AI-assisted investigations, OPSEC, and legal considerations, with practical methodologies drawn from real-world case studies.',
    location: 'Mini Auditorium, IMS Ghaziabad',
    duration: '1.5 Hours',
    speaker: 'Vikas Kumar (Cybersecurity Consultant, works with law enforcement agencies)',
    tracks: ['OSINT', 'Dark Web Investigations', 'Threat Actor Profiling', 'Digital Forensics', 'OPSEC'],
    stats: [
      { label: 'Duration', value: '1.5 Hours' },
      { label: 'Venue', value: 'Mini Auditorium IMS Ghaziabad' },
      { label: 'Speaker', value: 'Vikas Kumar' },
    ],
    keyMoments: [
      'Expert-led session by Vikas Kumar',
      'Hands-on OSINT, digital footprint analysis and threat actor profiling',
      'Real-world case studies in cyber threat intelligence and digital forensics',
      'Live audience Q&A',
      'Speaker felicitation on stage',
    ],
    winners: [],
    poster: '/events/cyber-intelligence-workshop-26/cyber-intelligence-poster.webp',
    gallery: [
      {
        src: '/events/cyber-intelligence-workshop-26/cyber-01-auditorium.webp',
        alt: 'Participants seated in the Mini Auditorium during the workshop',
        caption: 'Full session at the Mini Auditorium',
      },
      {
        src: '/events/cyber-intelligence-workshop-26/cyber-03-memento.webp',
        alt: 'A memento being presented on stage during the workshop',
        caption: 'Memento presentation',
      },
      {
        src: '/events/cyber-intelligence-workshop-26/cyber-04-group.webp',
        alt: 'Group photo of organisers and guests on stage after the session',
        caption: 'Group photo',
      },
    ],
  },
  {
    slug: 'drophack-26',
    title: "DROP HACK'26",
    shortTitle: "DropHack'26",
    partner: 'SIEC × Tech Yuva',
    partnerBadge: 'Community Partner',
    date: '2026-08-29T09:00:00+05:30',
    tagline: 'Unknown Problems. Unstoppable Minds. 10 Hours. Zero Excuses.',
    description:
      'SIEC Community Hackathon with Tech Yuva as Community Partner. 10 hours offline, 5 tracks, intense problem solving, fast deployment, and ₹50,000+ prize pool.',
    about:
      'DropHack\'26 was a high-intensity, two-stage community hackathon organized in partnership with SIEC and hosted offline at Paytm Office, Noida. The sprint challenged 150-200 student builders across five mission-critical tracks to ideate, build, and deploy production-grade software solutions in a single 10-hour offline sprint.',
    location: 'Paytm Office, Noida',
    duration: '10 Hours Offline',
    prizePool: '₹50,000+',
    teamSize: '2–4 Members',
    tracks: ['FinTech', 'AI', 'Web3', 'Cybersecurity', 'Healthcare'],
    stats: [
      { label: 'Venue', value: 'Paytm Office, Noida' },
      { label: 'Participants', value: '150-200' },
      { label: 'Duration', value: '10 Hours Offline' },
      { label: 'Date', value: '29 August 2026' },
      { label: 'Prize Pool', value: '₹50,000+' },
      { label: 'Team Size', value: '2–4 Members' },
    ],
    journey: [
      { stage: 1, name: 'Online Qualifier', date: '15 Aug 2026', status: 'Completed' },
      { stage: 2, name: 'Offline Finale', date: '29 Aug 2026', status: 'Completed' },
    ],
    keyMoments: [
      'Two-stage competitive format starting with the online qualification round on 15 August 2026.',
      '10-hour intensive offline finals hosted at Paytm Office, Noida with 150-200 participating builders.',
      'Cross-domain technical tracks covering AI, Web3, FinTech, Cybersecurity, and Healthcare.',
      'Live architecture evaluations, prototype demonstrations, and community mentoring sessions.',
    ],
    winners: [],
    poster: '/assets/drophack.png',
    gallery: [
      {
        src: '/events/drophack-26/drophack-02-team.webp',
        alt: 'Tech Yuva team and participants at the Paytm office reception in Noida',
        caption: 'The Tech Yuva team',
      },
      {
        src: '/events/drophack-26/drophack-04-coding-floor.webp',
        alt: 'Participants coding on laptops across rows of desks',
        caption: '10 hours of building',
      },
      {
        src: '/events/drophack-26/drophack-06-session.webp',
        alt: 'A speaker presenting to participants in front of a projector screen',
        caption: 'Session with participants',
      },
    ],
  },
];
