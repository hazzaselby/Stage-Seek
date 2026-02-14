const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');

// GET /api/productions/:slug — single production with all performances
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: production, error: prodError } = await supabase
      .from('productions')
      .select(`
        *,
        companies ( name, website, logo_url ),
        production_genres ( genre )
      `)
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (prodError) throw prodError;

    // Get all approved performances for this production
    const { data: performances, error: perfError } = await supabase
      .from('performances')
      .select(`
        *,
        venues (
          name, address_line1, city, postcode, region,
          has_wheelchair_access, has_hearing_loop, website
        ),
        performance_schedule (*)
      `)
      .eq('production_id', production.id)
      .eq('status', 'approved')
      .gte('run_end', new Date().toISOString().split('T')[0])
      .order('run_start');

    if (perfError) throw perfError;

    res.json({ production, performances });
  } catch (err) {
    console.error('Production error:', err);
    res.status(500).json({ error: 'Failed to fetch production', details: err.message });
  }
});

module.exports = router;
