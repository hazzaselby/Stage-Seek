const cron = require('node-cron');
const { syncTicketmaster } = require('./ticketmaster');

function startScheduler() {
  console.log('Scheduler started');

  // Sync Ticketmaster every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled Ticketmaster sync...');
    await syncTicketmaster();
  });
}

module.exports = { startScheduler };
