const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const isConfigured = 
  env.SUPABASE_URL !== 'https://example.supabase.co' &&
  env.SUPABASE_SERVICE_ROLE_KEY !== 'placeholder-service-role-key';

if (!isConfigured) {
  console.warn('⚠️  [Supabase] Running with placeholder credentials. Configure .env with actual Supabase keys for live database interactions.');
}

// Server-side admin client using service_role key (bypasses RLS)
const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Client with user's JWT to enforce Row Level Security
function createScopedClient(token) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}

module.exports = {
  supabaseAdmin,
  createScopedClient,
  isConfigured,
};
