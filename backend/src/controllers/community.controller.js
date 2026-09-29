const { supabaseAdmin, isConfigured } = require('../config/supabase');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

// Fallback in-memory store if credentials are placeholder
const mockApplications = [];

async function joinCommunity(req, res, next) {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      city,
      interests,
      githubUrl,
      portfolioUrl,
      statementOfPurpose,
      cohortYear,
    } = req.body;

    const userId = req.user?.id || null;

    if (!isConfigured) {
      const existing = mockApplications.find((a) => a.email === email && a.cohort_year === cohortYear);
      if (existing) {
        throw ApiError.conflict('An application with this email already exists for this cohort.');
      }

      const application = {
        id: `app-${Date.now()}`,
        user_id: userId,
        full_name: fullName,
        email,
        phone,
        college,
        city,
        interests,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
        statement_of_purpose: statementOfPurpose,
        cohort_year: cohortYear,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      mockApplications.push(application);

      // Trigger welcome email asynchronously
      emailService
        .sendWelcomeEmail({
          to: email,
          name: fullName,
          cohortName: `New Cohort ${cohortYear}`,
          interests,
        })
        .catch((err) => logger.warn(`[JoinCommunity] Email dispatch error: ${err.message}`));

      return res.status(201).json(
        ApiResponse.created(
          { applicationId: application.id, status: 'pending' },
          'Application submitted successfully! Please check your email for confirmation.'
        )
      );
    }

    // 1. Fetch current active cohort
    const { data: activeCohort, error: cohortError } = await supabaseAdmin
      .from('cohorts')
      .select('id, name, is_admissions_open, year')
      .eq('is_admissions_open', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cohortError || !activeCohort) {
      throw ApiError.badRequest('Admissions are currently closed. Please check back soon.');
    }

    // 2. Check for duplicate application for this cohort
    const { data: existingApp } = await supabaseAdmin
      .from('community_applications')
      .select('id')
      .eq('cohort_id', activeCohort.id)
      .eq('email', email)
      .single();

    if (existingApp) {
      throw ApiError.conflict('An application with this email has already been submitted for the current cohort.');
    }

    // 3. Store application
    const { data: application, error: insertError } = await supabaseAdmin
      .from('community_applications')
      .insert([
        {
          user_id: userId,
          cohort_id: activeCohort.id,
          full_name: fullName,
          email,
          phone,
          college,
          city,
          interests,
          github_url: githubUrl || null,
          portfolio_url: portfolioUrl || null,
          statement_of_purpose: statementOfPurpose || null,
          cohort_year: activeCohort.year,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new ApiError(500, `Failed to submit application: ${insertError.message}`);
    }

    // 4. Send welcome email via Nodemailer
    emailService
      .sendWelcomeEmail({
        to: email,
        name: fullName,
        cohortName: activeCohort.name,
        interests,
      })
      .then(() => {
        supabaseAdmin
          .from('community_applications')
          .update({ welcome_email_sent: true })
          .eq('id', application.id)
          .then();
      })
      .catch((err) => logger.warn(`[JoinCommunity] Welcome email failed: ${err.message}`));

    res.status(201).json(
      ApiResponse.created(
        { applicationId: application.id, status: application.status },
        'Application submitted successfully! Welcome email sent.'
      )
    );
  } catch (error) {
    next(error);
  }
}

async function getMyApplication(req, res, next) {
  try {
    if (!req.user) throw ApiError.unauthorized();

    if (!isConfigured) {
      const app = mockApplications.find((a) => a.email === req.user.email || a.user_id === req.user.id);
      return res.json(ApiResponse.success(app || null));
    }

    const { data, error } = await supabaseAdmin
      .from('community_applications')
      .select('*, cohorts(name, badge_label)')
      .or(`user_id.eq.${req.user.id},email.eq.${req.user.email}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(500, error.message);
    }

    res.json(ApiResponse.success(data || null));
  } catch (error) {
    next(error);
  }
}

async function getPublicMembers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    if (!isConfigured) {
      return res.json(
        ApiResponse.success({
          members: [
            {
              id: 'm1',
              fullName: 'Lakshay Soni',
              role: 'admin',
              college: 'Tech Yuva Guild',
              interests: ['AI', 'Systems', 'Web3'],
              avatarUrl: '/assets/founder.jpg',
            },
          ],
          total: 1,
        })
      );
    }

    const { data, count, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role, avatar_url, bio, college, city, interests, github_url, linkedin_url', {
        count: 'exact',
      })
      .eq('is_public', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, error.message);

    res.json(ApiResponse.success({ members: data || [], total: count || 0 }));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  joinCommunity,
  getMyApplication,
  getPublicMembers,
};
