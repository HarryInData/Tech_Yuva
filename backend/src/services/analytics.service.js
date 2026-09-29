const { supabaseAdmin, isConfigured } = require('../config/supabase');
const { generateCsv } = require('../utils/csvExport');
const ApiError = require('../utils/ApiError');

async function getPublicImpactStats() {
  if (!isConfigured) {
    return {
      activeMembers: 520,
      eventsHosted: 24,
      prototypesBuilt: 86,
      buildersImpacted: 1150,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    // 1. Check system_metrics table for baseline/curated metrics
    const { data: metrics } = await supabaseAdmin
      .from('system_metrics')
      .select('key, numeric_value');

    const metricMap = {};
    if (metrics) {
      metrics.forEach((m) => {
        metricMap[m.key] = m.numeric_value;
      });
    }

    // 2. Fetch live counts from database
    const [
      { count: liveProfilesCount },
      { count: liveEventsCount },
      { count: liveApplicationsCount },
      { count: liveRegistrationsCount },
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('events').select('id', { count: 'exact', head: true }).neq('status', 'draft'),
      supabaseAdmin.from('community_applications').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }),
    ]);

    const activeMembers = Math.max(
      metricMap['active_members'] || 500,
      (liveProfilesCount || 0) + (liveApplicationsCount || 0)
    );

    const eventsHosted = Math.max(
      metricMap['events_hosted'] || 20,
      liveEventsCount || 0
    );

    const prototypesBuilt = metricMap['prototypes_built'] || 80;

    const buildersImpacted = Math.max(
      metricMap['builders_impacted'] || 1000,
      activeMembers + (liveRegistrationsCount || 0)
    );

    return {
      activeMembers,
      eventsHosted,
      prototypesBuilt,
      buildersImpacted,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    // Graceful fallback to guaranteed baseline numbers
    return {
      activeMembers: 500,
      eventsHosted: 20,
      prototypesBuilt: 80,
      buildersImpacted: 1000,
      lastUpdated: new Date().toISOString(),
    };
  }
}

async function getAdminOverview() {
  if (!isConfigured) {
    return {
      totalUsers: 142,
      totalApplications: 68,
      pendingApplications: 24,
      approvedApplications: 41,
      totalEvents: 3,
      totalRegistrations: 252,
      interestsBreakdown: {
        AI: 45,
        Web3: 32,
        'Cyber Security': 28,
        'Web Dev': 38,
        Startups: 22,
      },
    };
  }

  const [
    { count: totalUsers },
    { count: totalApplications },
    { count: pendingApplications },
    { count: approvedApplications },
    { count: totalEvents },
    { count: totalRegistrations },
    { data: applications },
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('community_applications').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('community_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('community_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('events').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('event_registrations').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('community_applications').select('interests').limit(500),
  ]);

  // Aggregate interest tags
  const interestsBreakdown = {};
  if (applications) {
    applications.forEach((app) => {
      if (Array.isArray(app.interests)) {
        app.interests.forEach((interest) => {
          interestsBreakdown[interest] = (interestsBreakdown[interest] || 0) + 1;
        });
      }
    });
  }

  return {
    totalUsers: totalUsers || 0,
    totalApplications: totalApplications || 0,
    pendingApplications: pendingApplications || 0,
    approvedApplications: approvedApplications || 0,
    totalEvents: totalEvents || 0,
    totalRegistrations: totalRegistrations || 0,
    interestsBreakdown,
  };
}

async function exportAttendeesCsv(eventId) {
  let attendees = [];
  if (!isConfigured) {
    attendees = [
      {
        fullName: 'Lakshay Soni',
        email: 'founder@techyuva.org',
        phone: '+919876543210',
        college: 'Tech Yuva Guild',
        teamName: 'Core',
        status: 'confirmed',
        registeredAt: new Date().toISOString(),
      },
    ];
  } else {
    const { data, error } = await supabaseAdmin
      .from('event_registrations')
      .select('full_name, email, phone, college, team_name, status, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, `Failed to fetch attendees: ${error.message}`);
    attendees = (data || []).map((a) => ({
      fullName: a.full_name,
      email: a.email,
      phone: a.phone,
      college: a.college || 'N/A',
      teamName: a.team_name || 'Individual',
      status: a.status,
      registeredAt: a.created_at,
    }));
  }

  const fields = ['fullName', 'email', 'phone', 'college', 'teamName', 'status', 'registeredAt'];
  return generateCsv(attendees, fields);
}

async function exportApplicationsCsv(cohortId = null) {
  let applications = [];
  if (!isConfigured) {
    applications = [
      {
        fullName: 'Aarav Sharma',
        email: 'aarav@example.com',
        phone: '+919988776655',
        college: 'Delhi Technological University',
        city: 'New Delhi',
        interests: 'AI, Web3',
        status: 'pending',
        appliedAt: new Date().toISOString(),
      },
    ];
  } else {
    let query = supabaseAdmin
      .from('community_applications')
      .select('full_name, email, phone, college, city, interests, github_url, status, created_at')
      .order('created_at', { ascending: false });

    if (cohortId) {
      query = query.eq('cohort_id', cohortId);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, `Failed to fetch applications: ${error.message}`);
    applications = (data || []).map((app) => ({
      fullName: app.full_name,
      email: app.email,
      phone: app.phone,
      college: app.college,
      city: app.city,
      interests: Array.isArray(app.interests) ? app.interests.join('; ') : '',
      githubUrl: app.github_url || '',
      status: app.status,
      appliedAt: app.created_at,
    }));
  }

  const fields = ['fullName', 'email', 'phone', 'college', 'city', 'interests', 'githubUrl', 'status', 'appliedAt'];
  return generateCsv(applications, fields);
}

module.exports = {
  getPublicImpactStats,
  getAdminOverview,
  exportAttendeesCsv,
  exportApplicationsCsv,
};
