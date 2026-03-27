// api/send.js
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

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image' });
    }

    await redis.set('daap:latest', { image, ts: ts || Date.now() }, { ex: 3600 });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
