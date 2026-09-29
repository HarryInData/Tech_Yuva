const dotenv = require('dotenv');
const path = require('path');
const { z } = require('zod');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_VERSION: z.string().default('v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://127.0.0.1:3000'),

  SUPABASE_URL: z.string().url().default('https://example.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-role-key'),

  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587').transform((val) => parseInt(val, 10)),
  SMTP_SECURE: z.string().default('false').transform((val) => val === 'true'),
  SMTP_USER: z.string().default('techyuva.org@gmail.com'),
  SMTP_PASS: z.string().default('placeholder-app-password'),
  EMAIL_FROM: z.string().default('Tech Yuva Guild Council <noreply@techyuva.org>'),

  ADMIN_NOTIFICATION_EMAIL: z.string().email().default('techyuva.org@gmail.com'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  DISCORD_INVITE_URL: z.string().default('https://discord.gg/techyuva'),
  WHATSAPP_COMMUNITY_URL: z.string().default('https://chat.whatsapp.com/'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment validation failed:', parsedEnv.error.format());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Invalid environment configuration in production');
  }
}

module.exports = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
