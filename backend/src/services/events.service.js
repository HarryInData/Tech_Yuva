const { supabaseAdmin, isConfigured } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const logger = require('../utils/logger');

// In-memory fallback if Supabase credentials are placeholder during testing/mocking
const mockEvents = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    title: "DROP HACK'26",
    slug: 'drophack-26',
    tagline: 'Unknown Problems. Unstoppable Minds. 10 Hours. Zero Excuses.',
    description: "SIEC Community Hackathon with Tech Yuva as Community Partner. 10 hours offline, 5 tracks, intense problem solving, fast deployment, and ₹50,000+ prize pool.",
    date: '2026-08-29T09:00:00Z',
    duration: '10 Hours Offline',
    mode: 'offline',
    venue: 'Paytm Office, Noida',
    capacity: 200,
    registered_count: 188,
    banner_url: '/assets/drophack.png',
    prize_pool: '₹50,000+',
    team_size: '2–4 Members',
    themes: ['FinTech', 'AI', 'Web3', 'Cybersecurity', 'Healthcare'],
    stages: [
      { stage: 1, name: 'Online Qualifier', date: '15 Aug 2026' },
      { stage: 2, name: 'Offline Finale', date: '29 Aug 2026' },
    ],
    registration_link: null,
    status: 'past',
    is_featured: true,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000000',
    title: 'Workshop on "Cyber Intelligence & Digital Defence"',
    slug: 'cyber-intelligence-workshop-26',
    tagline: 'Analyze. Detect. Protect.',
    description: 'A workshop on how Open Source Intelligence (OSINT) strengthens Dark Web investigations and intelligence-driven cybercrime detection with Vikas Kumar.',
    date: '2026-09-23T14:00:00+05:30',
    duration: '1.5 Hours',
    mode: 'offline',
    venue: 'Mini Auditorium IMS Ghaziabad',
    capacity: 150,
    registered_count: 150,
    banner_url: '/events/cyber-intelligence-workshop-26/cyber-intelligence-poster.webp',
    prize_pool: null,
    team_size: null,
    themes: ['OSINT', 'Dark Web Investigations', 'Threat Actor Profiling', 'Digital Forensics', 'OPSEC'],
    stages: [],
    registration_link: null,
    status: 'past',
    is_featured: true,
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    title: 'Production Systems & Scalable APIs Bootcamp',
    slug: 'production-systems-bootcamp',
    tagline: 'Architecting high-concurrency microservices, caching, and database scaling.',
    description: 'Hands-on engineering workshop where students build production-grade backends.',
    date: '2026-10-15T14:00:00Z',
    duration: '4 Hours Hands-on',
    mode: 'hybrid',
    venue: 'Tech Yuva Discord HQ / Delhi Lab',
    capacity: 120,
    registered_count: 64,
    banner_url: null,
    prize_pool: 'Certificates & Cloud Packs',
    team_size: 'Individual',
    themes: ['Backend', 'PostgreSQL', 'Docker', 'Systems Architecture'],
    stages: [{ stage: 1, name: 'Live Coding & Architecture Review', date: '15 Oct 2026' }],
    status: 'upcoming',
    is_featured: false,
  },
];

const mockRegistrations = [];

async function listEvents({ status, mode, limit = 20, offset = 0 } = {}) {
  if (!isConfigured) {
    let result = [...mockEvents];
    if (status) result = result.filter((e) => e.status === status);
    if (mode) result = result.filter((e) => e.mode === mode);
    return { events: result, total: result.length };
  }

  let query = supabaseAdmin
    .from('events')
    .select('*', { count: 'exact' })
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (mode) query = query.eq('mode', mode);

  const { data, count, error } = await query;
  if (error) throw new ApiError(500, `Failed to fetch events: ${error.message}`);

  return { events: data || [], total: count || 0 };
}

async function getEventBySlug(slug) {
  if (!isConfigured) {
    const event = mockEvents.find((e) => e.slug === slug || e.id === slug);
    if (!event) throw ApiError.notFound('Event not found');
    return event;
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) throw ApiError.notFound('Event not found');
  return data;
}

async function registerForEvent(eventId, registrationData, userId = null) {
  const { fullName, email, phone, college, teamName, teamMembers } = registrationData;

  if (!isConfigured) {
    const event = mockEvents.find((e) => e.id === eventId || e.slug === eventId);
    if (!event) throw ApiError.notFound('Event not found');

    const existing = mockRegistrations.find((r) => r.event_id === event.id && r.email === email);
    if (existing) throw ApiError.conflict('You are already registered for this event');

    const newReg = {
      id: `reg-${Date.now()}`,
      event_id: event.id,
      user_id: userId,
      full_name: fullName,
      email,
      phone,
      college,
      team_name: teamName,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
    mockRegistrations.push(newReg);
    event.registered_count = (event.registered_count || 0) + 1;

    // Send confirmation email asynchronously
    emailService.sendEventConfirmationEmail({
      to: email,
      name: fullName,
      eventTitle: event.title,
      eventDate: event.date,
      mode: event.mode,
      venue: event.venue,
      registrationId: newReg.id,
    }).catch((err) => logger.warn(`Email notice error: ${err.message}`));

    return newReg;
  }

  // 1. Fetch event to verify capacity and status
  const { data: event, error: eventErr } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventErr || !event) throw ApiError.notFound('Event not found');
  if (event.status !== 'upcoming') throw ApiError.badRequest('This event is not accepting registrations');
  if (event.registered_count >= event.capacity) {
    throw ApiError.badRequest('This event has reached full capacity');
  }

  // 2. Check for duplicate registration
  const { data: existingReg } = await supabaseAdmin
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('email', email)
    .single();

  if (existingReg) {
    throw ApiError.conflict('You have already registered for this event');
  }

  // 3. Insert registration
  const { data: registration, error: regErr } = await supabaseAdmin
    .from('event_registrations')
    .insert([
      {
        event_id: eventId,
        user_id: userId,
        full_name: fullName,
        email,
        phone,
        college,
        team_name: teamName,
        team_members: teamMembers || [],
        status: 'confirmed',
      },
    ])
    .select()
    .single();

  if (regErr) throw new ApiError(500, `Failed to register for event: ${regErr.message}`);

  // 4. Dispatch confirmation email
  emailService.sendEventConfirmationEmail({
    to: email,
    name: fullName,
    eventTitle: event.title,
    eventDate: event.date,
    mode: event.mode,
    venue: event.venue,
    registrationId: registration.id,
  }).catch((err) => logger.warn(`Confirmation email warning: ${err.message}`));

  return registration;
}

async function cancelEventRegistration(eventId, identifier) {
  if (!isConfigured) {
    const idx = mockRegistrations.findIndex(
      (r) => r.event_id === eventId && (r.email === identifier || r.user_id === identifier)
    );
    if (idx === -1) throw ApiError.notFound('Registration not found');
    mockRegistrations.splice(idx, 1);
    return { success: true, message: 'Registration cancelled successfully' };
  }

  const query = supabaseAdmin
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId);

  if (identifier.includes('@')) {
    query.eq('email', identifier);
  } else {
    query.eq('user_id', identifier);
  }

  const { data, error } = await query.select();
  if (error) throw new ApiError(500, `Failed to cancel registration: ${error.message}`);
  if (!data || data.length === 0) throw ApiError.notFound('Registration not found');

  return { success: true, message: 'Registration cancelled successfully' };
}

async function getEventAttendees(eventId) {
  if (!isConfigured) {
    return mockRegistrations.filter((r) => r.event_id === eventId);
  }

  const { data, error } = await supabaseAdmin
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(500, `Failed to fetch attendees: ${error.message}`);
  return data || [];
}

async function createEvent(eventData, authorId) {
  if (!isConfigured) {
    const newEvent = {
      id: `e0000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
      ...eventData,
      created_by: authorId,
      registered_count: 0,
      created_at: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert([{ ...eventData, created_by: authorId }])
    .select()
    .single();

  if (error) throw new ApiError(500, `Failed to create event: ${error.message}`);
  return data;
}

async function updateEvent(eventId, updateData) {
  if (!isConfigured) {
    const event = mockEvents.find((e) => e.id === eventId || e.slug === eventId);
    if (!event) throw ApiError.notFound('Event not found');
    Object.assign(event, updateData);
    return event;
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw new ApiError(500, `Failed to update event: ${error.message}`);
  return data;
}

async function deleteEvent(eventId) {
  if (!isConfigured) {
    const idx = mockEvents.findIndex((e) => e.id === eventId || e.slug === eventId);
    if (idx === -1) throw ApiError.notFound('Event not found');
    mockEvents.splice(idx, 1);
    return { success: true };
  }

  const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId);
  if (error) throw new ApiError(500, `Failed to delete event: ${error.message}`);
  return { success: true };
}

module.exports = {
  listEvents,
  getEventBySlug,
  registerForEvent,
  cancelEventRegistration,
  getEventAttendees,
  createEvent,
  updateEvent,
  deleteEvent,
};
