const { z } = require('zod');

const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100).trim(),
  email: z.string().email('Please provide a valid email').toLowerCase().trim(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000).trim(),
});

const newsletterSubscribeSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

module.exports = {
  contactMessageSchema,
  newsletterSubscribeSchema,
};
