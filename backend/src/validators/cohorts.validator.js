const { z } = require('zod');

const createCohortSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  code: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).trim(),
  year: z.number().int().min(2024).max(2035),
  badgeLabel: z.string().min(5).max(100).default('Admission Open · New Cohort 2026'),
  description: z.string().max(1000).optional(),
  isAdmissionsOpen: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
  maxCapacity: z.number().int().positive().default(250),
});

const updateCohortSchema = createCohortSchema.partial();

const toggleAdmissionSchema = z.object({
  isAdmissionsOpen: z.boolean(),
  badgeLabel: z.string().max(100).optional(),
});

module.exports = {
  createCohortSchema,
  updateCohortSchema,
  toggleAdmissionSchema,
};
