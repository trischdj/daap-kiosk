// api/card.js
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

    // Upstash may return already-parsed object or a string — handle both
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return res.status(200).json({ image: parsed.image, ts: parsed.ts });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
