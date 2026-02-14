const axios = require('axios');
const { supabaseAdmin } = require('./supabase');

const TM_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY;

const GENRE_MAP = {
  'Theatre': 'drama',
  'Musical': 'musical',
  'Opera': 'opera',
  'Dance': 'dance',
  'Ballet': 'ballet',
  'Comedy': 'comedy',
  'Circus': 'circus',
  'Cabaret': 'cabaret',
};

const REGION_MAP = {
  'London': 'london',
  'Greater London': 'london',
  'South East England': 'south_east',
  'South West England': 'south_west',
  'East of England': 'east_of_england',
  'East Midlands': 'east_midlands',
  'West Midlands': 'west_midlands',
  'Yorkshire': 'yorkshire',
  'North West England': 'north_west',
  'North East England': 'north_east',
  'Scotland': 'scotland',
  'Wales': 'wales',
  'Northern Ireland': 'northern_ireland',
};

// Get date string in format Ticketmaster expects
function tmDate(date) {
  return date.toISOString().split('.')[0] + 'Z';
}

// Chunk date range into 2-week windows to stay within TM page limits
function getDateChunks(startDate, endDate, chunkDays = 14) {
  const chunks = [];
  let current = new Date(startDate);
  while (current < endDate) {
    const chunkEnd = new Date(current);
    chunkEnd.setDate(chunkEnd.getDate() + chunkDays);
    chunks.push({
      start: new Date(current),
      end: chunkEnd > endDate ? endDate : chunkEnd
    });
    current = new Date(chunkEnd);
  }
  return chunks;
}

async function syncTicketmaster() {
  console.log('Starting Ticketmaster sync...');

  let recordsCreated = 0;
  let recordsSkipped = 0;
  let totalFetched = 0;

  try {
    // Sync 6 months ahead in 2-week chunks
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    const chunks = getDateChunks(startDate, endDate);
    console.log(`Syncing ${chunks.length} date chunks...`);

    for (const chunk of chunks) {
      console.log(`Fetching ${chunk.start.toDateString()} to ${chunk.end.toDateString()}`);

      let page = 0;
      let totalPages = 1;

      while (page < totalPages && page < 5) {
        try {
          const response = await axios.get(`${TM_BASE_URL}/events.json`, {
            params: {
              apikey: API_KEY,
              countryCode: 'GB',
              segmentName: 'Arts & Theatre',
              startDateTime: tmDate(chunk.start),
              endDateTime: tmDate(chunk.end),
              size: 200,
              page,
              sort: 'date,asc',
            }
          });

          const data = response.data;

          if (!data._embedded?.events) {
            break;
          }

          totalPages = Math.min(data.page.totalPages, 5);
          const events = data._embedded.events;
          totalFetched += events.length;

          for (const event of events) {
            const result = await processEvent(event);
            if (result) recordsCreated++;
            else recordsSkipped++;
          }

          page++;
          await new Promise(r => setTimeout(r, 250));

        } catch (err) {
          if (err.response?.status === 400) {
            console.log('Page limit reached for this chunk, moving on');
            break;
          }
          throw err;
        }
      }
    }

    // Log success
    await supabaseAdmin.from('api_sync_log').insert({
      source: 'ticketmaster',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'success',
      records_fetched: totalFetched,
      records_created: recordsCreated,
      records_skipped: recordsSkipped,
    });

    console.log(`Sync complete. Fetched: ${totalFetched}, Created/Updated: ${recordsCreated}, Skipped: ${recordsSkipped}`);

  } catch (err) {
    console.error('Ticketmaster sync failed:', err.message);

    await supabaseAdmin.from('api_sync_log').insert({
      source: 'ticketmaster',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'failed',
      error_message: err.message,
    });
  }
}

async function processEvent(event) {
  try {
    const tmVenue = event._embedded?.venues?.[0];
    if (!tmVenue) return false;

    // 1. Upsert venue
    const venueData = {
      name: tmVenue.name,
      city: tmVenue.city?.name || 'Unknown',
      postcode: tmVenue.postalCode || '',
      region: REGION_MAP[tmVenue.state?.name] || 'london',
      country: 'United Kingdom',
      ticketmaster_venue_id: tmVenue.id,
      is_verified: true,
      venue_type: 'other',
    };

    if (tmVenue.location) {
      venueData.location = `POINT(${tmVenue.location.longitude} ${tmVenue.location.latitude})`;
    }

    const { data: venue } = await supabaseAdmin
      .from('venues')
      .upsert(venueData, { onConflict: 'ticketmaster_venue_id' })
      .select()
      .single();

    if (!venue) return false;

    // 2. Upsert production
    const tmGenre = event.classifications?.[0]?.genre?.name;
    const priceRange = event.priceRanges?.[0];

    const productionData = {
      title: event.name,
      slug: slugify(event.name + '-' + event.id),
      short_description: event.info || event.pleaseNote || null,
      poster_image_url: event.images?.find(i => i.ratio === '16_9' && i.width > 500)?.url || null,
      source: 'ticketmaster',
      source_id: event.id,
      source_url: event.url,
      status: 'approved',
    };

    const { data: production } = await supabaseAdmin
      .from('productions')
      .upsert(productionData, { onConflict: 'source_id' })
      .select()
      .single();

    if (!production) return false;

    // 3. Add genre
    if (tmGenre && GENRE_MAP[tmGenre]) {
      await supabaseAdmin
        .from('production_genres')
        .upsert(
          { production_id: production.id, genre: GENRE_MAP[tmGenre] },
          { onConflict: 'production_id,genre' }
        );
    }

    // 4. Upsert performance
    const dates = event.dates?.start;
    const endDate = event.dates?.end?.localDate || dates?.localDate;

    if (!dates?.localDate) return false;

    const performanceData = {
      production_id: production.id,
      venue_id: venue.id,
      run_start: dates.localDate,
      run_end: endDate,
      price_from: priceRange?.min || null,
      price_to: priceRange?.max || null,
      booking_url: event.url,
      booking_source: 'Ticketmaster',
      source: 'ticketmaster',
      source_id: event.id,
      last_synced_at: new Date().toISOString(),
      status: 'approved',
    };

    const { error } = await supabaseAdmin
      .from('performances')
      .upsert(performanceData, { onConflict: 'source_id' });

    return !error;

  } catch (err) {
    console.error('Error processing event:', event?.id, err.message);
    return false;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

module.exports = { syncTicketmaster };
