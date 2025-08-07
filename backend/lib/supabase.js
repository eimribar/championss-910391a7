const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Initialize Supabase (for auth and realtime features)
let supabase = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

module.exports = {
  prisma,
  supabase
};