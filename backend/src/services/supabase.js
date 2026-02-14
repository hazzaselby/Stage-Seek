const { createClient } = require('@supabase/supabase-js');

// Public client — respects Row Level Security
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client — bypasses RLS, only used server-side for admin tasks
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = { supabase, supabaseAdmin };
