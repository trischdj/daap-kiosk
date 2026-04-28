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
    const { image, ts, recip, message, program, hasPhoto } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image' });
    // Store with 1 hour TTL — enough time to scan and save
    await redis.set('daap:card', { image, ts: ts || Date.now() }, { ex: 3600 });

    // Analytics — fire-and-forget so a Redis hiccup never breaks the save
    try {
      const today = new Date().toISOString().slice(0, 10);
      const incrKeys = [
        'analytics:total_saves',
        `analytics:recipient:${recip}`,
        `analytics:message:${message}`,
        `analytics:program:${program}`,
        `analytics:saves:${today}`,
      ];
      if (hasPhoto) incrKeys.push('analytics:saves_with_photo');
      await Promise.all(incrKeys.map(k => redis.incr(k)));
    } catch(ae) {
      console.error('analytics error', ae);
    }

    return res.status(200).json({ ok: true });
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
