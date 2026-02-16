const { createClient } = require('@supabase/supabase-js');

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

const SUPABASE_URL = requireEnv('SUPABASE_URL');

// Public client — respects Row Level Security (RLS)
const supabase = createClient(
  SUPABASE_URL,
  requireEnv('SUPABASE_ANON_KEY')
);

// Admin client — bypasses RLS, only used server-side
const supabaseAdmin = createClient(
  SUPABASE_URL,
  requireEnv('SUPABASE_SERVICE_KEY'),
  {
    auth: { persistSession: false },
  }
);

module.exports = { supabase, supabaseAdmin };
