// api/save.js
// Stores the generated card image so card.html can retrieve it
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { image, ts } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image' });
    // Store with 1 hour TTL — enough time to scan and save
    await redis.set('daap:card', { image, ts: ts || Date.now() }, { ex: 3600 });
    return res.status(200).json({ ok: true });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
