require('dotenv').config();
const { supabase } = require('./src/services/supabase');

async function test() {
  console.log('Testing search_performances function...');
  
  const { data, error } = await supabase.rpc('search_performances', {
    search_from: '2026-02-14',
    search_to: '2026-03-14',
    regions_filter: ['london']
  });

  if (error) {
    console.log('ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS! Results:', data.length);
    if (data.length > 0) {
      console.log('First result:', data[0].title, '|', data[0].venue_name);
    }
  }
}

test();
