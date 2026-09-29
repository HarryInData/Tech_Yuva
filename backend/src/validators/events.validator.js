const { z } = require('zod');

const registerEventSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email')
    .toLowerCase()
    .trim(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .regex(/^[0-9+\s\-()]{7,20}$/, 'Valid phone required')
    .trim(),
  college: z.string().max(150).optional().or(z.literal('')),
  teamName: z.string().max(100).optional().or(z.literal('')),
  teamMembers: z.array(z.string()).optional().default([]),
});

const createEventSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case').trim(),
  tagline: z.string().max(250).optional(),
  description: z.string().min(10).trim(),
  date: z.string().datetime({ message: 'Must be a valid ISO datetime' }),
  duration: z.string().min(2).max(50).trim(),
  mode: z.enum(['online', 'offline', 'hybrid']).default('offline'),
  venue: z.string().min(2).max(250).trim(),
  capacity: z.number().int().positive().default(100),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  prizePool: z.string().optional(),
  teamSize: z.string().optional().default('Individual'),
  themes: z.array(z.string()).optional().default([]),
  stages: z.array(z.object({
    stage: z.number().int(),
    name: z.string(),
    date: z.string(),
  })).optional().default([]),
  registrationLink: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
  isFeatured: z.boolean().default(false),
});

const updateEventSchema = createEventSchema.partial();

module.exports = {
  registerEventSchema,
  createEventSchema,
  updateEventSchema,
};
