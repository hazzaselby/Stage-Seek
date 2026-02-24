const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');

router.get('/', async (req, res) => {
  try {
const {
  from, to, lat, lng,
  radius = 25, genres, venue_types,
  regions, max_price, free_only, accessible,
  limit = 100,
  offset = 0
} = req.query;


    if (!from || !to) {
      return res.status(400).json({
        error: 'from and to dates are required (YYYY-MM-DD format)'
      });
    }

    const params = {
      search_from: from,
      search_to: to,
      search_lat: lat ? parseFloat(lat) : null,
      search_lng: lng ? parseFloat(lng) : null,
      radius_km: parseFloat(radius),
      genres_filter: genres ? genres.split(',') : null,
      venue_types: venue_types ? venue_types.split(',') : null,
      regions_filter: regions ? regions.split(',') : null,
      max_price: max_price ? parseFloat(max_price) : null,
      free_only: free_only === 'true',
      accessible_only: accessible === 'true',
      result_limit: Math.min(parseInt(limit, 10) || 100, 200),
      result_offset: Math.max(parseInt(offset, 10) || 0, 0),
    };

    const { data, error } = await supabaseAdmin.rpc('search_performances', params);

    if (error) throw error;

    const total = data && data.length > 0 ? data[0].total_count : 0;

    res.json({
     results: (data || []).map(({ total_count, ...row }) => row),
      count: data ? data.length : 0,
     total,
     query: { from, to, ...req.query }
});

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
