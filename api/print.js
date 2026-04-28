// api/print.js
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
    const { hasPhoto } = req.body;
    const incrKeys = ['analytics:total_prints'];
    if (hasPhoto) incrKeys.push('analytics:prints_with_photo');
    await Promise.all(incrKeys.map(k => redis.incr(k)));
    return res.status(200).json({ ok: true });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
