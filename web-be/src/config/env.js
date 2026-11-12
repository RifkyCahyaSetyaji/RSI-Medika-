import 'dotenv/config';

const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.warn(`[env] Variabel berikut belum di-set di .env: ${missing.join(', ')}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};
