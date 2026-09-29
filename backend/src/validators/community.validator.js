const { z } = require('zod');

const ALLOWED_INTERESTS = [
  'AI',
  'Web3',
  'Cyber Security',
  'Web Dev',
  'Startups',
  'Systems Engineering',
  'Open Source',
  'Cloud & DevOps',
];

const joinCommunitySchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Please provide a valid phone number')
    .trim(),
  college: z
    .string({ required_error: 'College or school name is required' })
    .min(2, 'College name must be at least 2 characters')
    .max(150)
    .trim(),
  city: z
    .string({ required_error: 'City is required' })
    .min(2, 'City must be at least 2 characters')
    .max(100)
    .trim(),
  interests: z
    .array(z.string())
    .min(1, 'Please select at least one technical interest')
    .max(8, 'Maximum 8 interests allowed'),
  githubUrl: z
    .string()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  statementOfPurpose: z
    .string()
    .max(1000, 'Statement of purpose cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  cohortYear: z
    .number()
    .int()
    .default(2026),
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'], {
    required_error: 'Status must be pending, approved, or rejected',
  }),
  reviewNotes: z.string().max(500).optional(),
});

module.exports = {
  joinCommunitySchema,
  updateApplicationStatusSchema,
  ALLOWED_INTERESTS,
};
