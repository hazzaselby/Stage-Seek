require('dotenv').config();
const { supabaseAdmin } = require('./src/services/supabase');

async function test() {
  const { data: venue } = await supabaseAdmin.from('venues').select('id').limit(1).single();
  console.log('Using venue:', venue.id);

  const { data: prod, error: prodError } = await supabaseAdmin
    .from('productions')
    .insert({ title: 'Test Show', slug: 'test-show-123', source: 'ticketmaster', source_id: 'test-123', status: 'approved' })
    .select().single();

  if (prodError) { console.log('PRODUCTIONS ERROR:', JSON.stringify(prodError, null, 2)); return; }
  console.log('Production OK:', prod.id);

  const { data: perf, error: perfError } = await supabaseAdmin
    .from('performances')
    .insert({ production_id: prod.id, venue_id: venue.id, run_start: '2026-03-01', run_end: '2026-03-31', source: 'ticketmaster', source_id: 'test-perf-123', status: 'approved' })
    .select().single();

  if (perfError) { console.log('PERFORMANCES ERROR:', JSON.stringify(perfError, null, 2)); }
  else { console.log('Performance OK:', perf.id); }

  await supabaseAdmin.from('performances').delete().eq('source_id', 'test-perf-123');
  await supabaseAdmin.from('productions').delete().eq('source_id', 'test-123');
  console.log('Cleaned up');
}

test();
