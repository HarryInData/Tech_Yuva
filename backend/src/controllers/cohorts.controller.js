const { supabaseAdmin, isConfigured } = require('../config/supabase');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

let mockCohort = {
  id: 'c0000000-0000-0000-0000-000000002026',
  name: 'New Cohort 2026',
  code: 'cohort-2026',
  year: 2026,
  badge_label: 'Admission Open · New Cohort 2026',
  description: 'Student-led technology and innovation guild cohort.',
  is_admissions_open: true,
  max_capacity: 300,
  accepted_count: 145,
};

async function getCurrentCohort(req, res, next) {
  try {
    if (!isConfigured) {
      return res.json(
        ApiResponse.success({
          cohort: mockCohort,
          badgeLabel: mockCohort.is_admissions_open
            ? mockCohort.badge_label
            : 'Admissions Closed · Next Cohort Soon',
          isAdmissionsOpen: mockCohort.is_admissions_open,
        })
      );
    }

    const { data: cohort, error } = await supabaseAdmin
      .from('cohorts')
      .select('*')
      .order('year', { ascending: false })
      .limit(1)
      .single();

    if (error || !cohort) {
      return res.json(
        ApiResponse.success({
          cohort: null,
          badgeLabel: 'Admissions Opening Soon',
          isAdmissionsOpen: false,
        })
      );
    }

    res.json(
      ApiResponse.success({
        cohort,
        badgeLabel: cohort.is_admissions_open
          ? cohort.badge_label
          : 'Admissions Closed · Next Cohort Soon',
        isAdmissionsOpen: cohort.is_admissions_open,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function listCohorts(req, res, next) {
  try {
    if (!isConfigured) {
      return res.json(ApiResponse.success([mockCohort]));
    }

    const { data, error } = await supabaseAdmin
      .from('cohorts')
      .select('*')
      .order('year', { ascending: false });

    if (error) throw new ApiError(500, error.message);
    res.json(ApiResponse.success(data));
  } catch (error) {
    next(error);
  }
}

async function createCohort(req, res, next) {
  try {
    if (!isConfigured) {
      mockCohort = { id: `cohort-${Date.now()}`, ...req.body };
      return res.status(201).json(ApiResponse.created(mockCohort));
    }

    const { data, error } = await supabaseAdmin
      .from('cohorts')
      .insert([req.body])
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    res.status(201).json(ApiResponse.created(data, 'Cohort created successfully'));
  } catch (error) {
    next(error);
  }
}

async function toggleAdmission(req, res, next) {
  try {
    const { id } = req.params;
    const { isAdmissionsOpen, badgeLabel } = req.body;

    if (!isConfigured) {
      mockCohort.is_admissions_open = isAdmissionsOpen;
      if (badgeLabel) mockCohort.badge_label = badgeLabel;
      return res.json(ApiResponse.success(mockCohort, 'Admission status updated'));
    }

    const updatePayload = { is_admissions_open: isAdmissionsOpen };
    if (badgeLabel) updatePayload.badge_label = badgeLabel;

    const { data, error } = await supabaseAdmin
      .from('cohorts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(500, error.message);
    res.json(ApiResponse.success(data, 'Admission status updated successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentCohort,
  listCohorts,
  createCohort,
  toggleAdmission,
};
