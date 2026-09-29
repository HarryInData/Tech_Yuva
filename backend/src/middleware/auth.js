const { supabaseAdmin, isConfigured } = require('../config/supabase');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies['sb-access-token'] || req.cookies.access_token)) {
      token = req.cookies['sb-access-token'] || req.cookies.access_token;
    }

    if (!token) {
      return next(ApiError.unauthorized('No authentication token provided'));
    }

    if (!isConfigured) {
      // Allow mock user in development if Supabase credentials are placeholders
      logger.warn('[Auth] Mocking user session since Supabase credentials are placeholder');
      req.user = {
        id: 'mock-user-id',
        email: 'dev@techyuva.org',
        role: 'admin',
        token,
      };
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return next(ApiError.unauthorized('Invalid or expired authentication session'));
    }

    // Fetch user profile from public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'student',
      profile: profile || null,
      token,
    };

    next();
  } catch (error) {
    logger.error(`[Auth Middleware] Verification failed: ${error.message}`);
    next(ApiError.unauthorized('Authentication failed'));
  }
}

// Optional auth: parses token if present, but doesn't block unauthenticated requests
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && (req.cookies['sb-access-token'] || req.cookies.access_token)) {
      token = req.cookies['sb-access-token'] || req.cookies.access_token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    if (!isConfigured) {
      req.user = { id: 'mock-user-id', email: 'dev@techyuva.org', role: 'student', token };
      return next();
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'student',
        profile: profile || null,
        token,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

module.exports = { auth, optionalAuth };
