const { supabaseAdmin, isConfigured } = require('../config/supabase');
const analyticsService = require('../services/analytics.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

async function getOverview(req, res, next) {
  try {
    const overview = await analyticsService.getAdminOverview();
    res.json(ApiResponse.success(overview));
  } catch (error) {
    next(error);
  }
}

async function getApplications(req, res, next) {
  try {
    const { status, cohortId, limit = 50, offset = 0 } = req.query;

    if (!isConfigured) {
      return res.json(
        ApiResponse.success({
          applications: [
            {
              id: 'app-sample',
              full_name: 'Aarav Sharma',
              email: 'aarav@example.com',
              phone: '+919988776655',
              college: 'Delhi Technological University',
              city: 'New Delhi',
              interests: ['AI', 'Web3'],
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          ],
          total: 1,
        })
      );
    }

    let query = supabaseAdmin
      .from('community_applications')
      .select('*, cohorts(name, code)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10) - 1);

    if (status) query = query.eq('status', status);
    if (cohortId) query = query.eq('cohort_id', cohortId);

    const { data, count, error } = await query;
    if (error) throw new ApiError(500, error.message);

    res.json(ApiResponse.success({ applications: data || [], total: count || 0 }));
  } catch (error) {
    next(error);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.user?.id;

    if (!isConfigured) {
      return res.json(ApiResponse.success({ id, status, reviewNotes }, 'Application updated'));
    }

    const { data, error } = await supabaseAdmin
      .from('community_applications')
      .update({
        status,
        review_notes: reviewNotes || null,
        reviewed_by: reviewerId || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json(ApiResponse.success(data, `Application status updated to ${status}`));
  } catch (error) {
    next(error);
  }
}

async function exportAttendeesCsv(req, res, next) {
  try {
    const { eventId } = req.params;
    const csvData = await analyticsService.exportAttendeesCsv(eventId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendees-${eventId}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}

async function exportApplicationsCsv(req, res, next) {
  try {
    const { cohortId } = req.query;
    const csvData = await analyticsService.exportApplicationsCsv(cohortId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cohort-applications.csv"');
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    if (!isConfigured) {
      return res.json(ApiResponse.success({ users: [], total: 0 }));
    }

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10) - 1)
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

    const { data, count, error } = await query;
    if (error) throw new ApiError(500, error.message);

    res.json(ApiResponse.success({ users: data || [], total: count || 0 }));
  } catch (error) {
    next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'mentor', 'admin'].includes(role)) {
      throw ApiError.badRequest("Role must be 'student', 'mentor', or 'admin'");
    }

    if (!isConfigured) {
      return res.json(ApiResponse.success({ id, role }, 'Role updated'));
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);

    res.json(ApiResponse.success(data, `User role changed to ${role}`));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getApplications,
  updateApplicationStatus,
  exportAttendeesCsv,
  exportApplicationsCsv,
  getUsers,
  updateUserRole,
};
