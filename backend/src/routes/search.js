const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');

// GET /api/search
// Query params:
//   from        (required) YYYY-MM-DD
//   to          (required) YYYY-MM-DD
//   lat         (optional) latitude
//   lng         (optional) longitude
//   radius      (optional) km, default 25
//   genres      (optional) comma-separated e.g. "musical,comedy"
//   venue_types (optional) comma-separated e.g. "west_end,fringe"
//   regions     (optional) comma-separated e.g. "london,south_east"
//   max_price   (optional) number
//   free_only   (optional) true/false
//   accessible  (optional) true/false

router.get('/', async (req, res) => {
  try {
    const {
      from,
      to,
      lat,
      lng,
      radius = 25,
      genres,
      venue_types,
      regions,
      max_price,
      free_only,
      accessible
    } = req.query;

    // Validate required fields
    if (!from || !to) {
      return res.status(400).json({
        error: 'from and to dates are required (YYYY-MM-DD format)'
      });
    }

    // Build the function call parameters
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
      accessible_only: accessible === 'true'
    };

    const { data, error } = await supabase.rpc('search_performances', params);

    if (error) throw error;

    res.json({
      results: data,
      count: data.length,
      query: { from, to, ...req.query }
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
