const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../services/supabase');

// POST /api/submit — theatre submits a new listing
router.post('/', async (req, res) => {
  try {
    const {
      submitter_name,
      submitter_email,
      submitter_role,
      organisation,
      ...listingData
    } = req.body;

    // Basic validation
    if (!submitter_name || !submitter_email || !organisation) {
      return res.status(400).json({
        error: 'submitter_name, submitter_email and organisation are required'
      });
    }

    if (!listingData.title || !listingData.venue_name || !listingData.run_start || !listingData.run_end) {
      return res.status(400).json({
        error: 'title, venue_name, run_start and run_end are required'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('venue_submissions')
      .insert({
        submitter_name,
        submitter_email,
        submitter_role,
        organisation,
        raw_data: listingData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Submission received — thank you! We will review it within 2 working days.',
      submission_id: data.id
    });

  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Submission failed', details: err.message });
  }
});

module.exports = router;
