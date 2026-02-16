require('dotenv').config();
const axios = require('axios');

async function run() {
  const url = 'http://localhost:3000/api/search?from=2026-02-14&to=2026-03-14&regions=london&limit=9999';
  const r = await axios.get(url);
  console.log('count', r.data.count);
}

run().catch(e => {
  console.log(e.response?.data || e.message);
});
