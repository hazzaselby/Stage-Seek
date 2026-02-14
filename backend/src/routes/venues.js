const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');

// GET /api/venues — list all verified venues
router.get('/', async (req, res) => {
  try {
    const { region, city, type } = req.query;

    let query = supabase
      .from('venues')
      .select('*')
      .eq('is_verified', true)
      .order('name');

    if (region) query = query.eq('region', region);
    if (city) query = query.ilike('city', `%${city}%`);
    if (type) query = query.eq('venue_type', type);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ venues: data, count: data.length });
  } catch (err) {
    console.error('Venues error:', err);
    res.status(500).json({ error: 'Failed to fetch venues', details: err.message });
  }
});

// GET /api/venues/:id — single venue with its upcoming performances
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (venueError) throw venueError;

    // Get upcoming performances at this venue
    const { data: performances, error: perfError } = await supabase
      .from('performances')
      .select(`
        *,
        productions (
          title, short_description, poster_image_url, duration_minutes
        )
      `)
      .eq('venue_id', id)
      .eq('status', 'approved')
      .gte('run_end', new Date().toISOString().split('T')[0])
      .order('run_start');

    if (perfError) throw perfError;

    res.json({ venue, upcoming_performances: performances });
  } catch (err) {
    console.error('Venue error:', err);
    res.status(500).json({ error: 'Failed to fetch venue', details: err.message });
  }
});

module.exports = router;
