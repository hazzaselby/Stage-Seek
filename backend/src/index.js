const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/search', require('./routes/search'));
app.use('/api/venues', require('./routes/venues'));
app.use('/api/productions', require('./routes/productions'));
app.use('/api/submit', require('./routes/submit'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start scheduler (syncs Ticketmaster every 6 hours)
const { startScheduler } = require('./services/scheduler');
startScheduler();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stage Seek API running on port ${PORT}`);
});

module.exports = app;
