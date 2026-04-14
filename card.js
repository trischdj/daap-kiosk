// api/card.js
// Returns the latest saved card image for card.html to display
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const data = await redis.get('daap:card');
    if (!data) return res.status(404).json({ error: 'No card found' });
    return res.status(200).json(data);
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
