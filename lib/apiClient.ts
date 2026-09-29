/**
 * Tech Yuva API Client for Express Backend Integration
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:5000/api/v1');

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token if present in localStorage or cookies
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ty_auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = json.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.errors = json.errors || [];
    throw error;
  }

  return json.data !== undefined ? json.data : json;
}

export const apiClient = {
  // Cohorts & Admission Status
  getCurrentCohort: async () => {
    try {
      return await request('/cohorts/current');
    } catch {
      // Safe fallback if backend is booting
      return {
        badgeLabel: 'Admission Open · New Cohort 2026',
        isAdmissionsOpen: true,
      };
    }
  },

  // Live Dynamic Stats
  getStats: async () => {
    try {
      return await request('/stats');
    } catch {
      return {
        activeMembers: 500,
        eventsHosted: 20,
        prototypesBuilt: 80,
        buildersImpacted: 1000,
      };
    }
  },

  // Events
  getEvents: async () => {
    try {
      return await request('/events');
    } catch {
      return { events: [], total: 0 };
    }
  },

  getEvent: async (slug: string) => {
    return request(`/events/${slug}`);
  },

  registerForEvent: async (eventId: string, data: any) => {
    return request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Community Join / Application
  joinCommunity: async (applicationData: {
    fullName: string;
    email: string;
    phone: string;
    college: string;
    city: string;
    interests: string[];
    githubUrl?: string;
    portfolioUrl?: string;
    statementOfPurpose?: string;
    cohortYear?: number;
  }) => {
    return request('/community/join', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Contact Form
  submitContact: async (data: { name: string; email: string; subject: string; message: string }) => {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Newsletter
  subscribeNewsletter: async (email: string) => {
    return request('/contact/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
