// api/receive.js
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
    const data = await redis.get('daap:latest');

    if (!data) {
      return res.status(200).json({ image: null, ts: null });
    }

    // If the client already has this image, skip sending it again
    const clientTs = parseInt(req.query.ts, 10);
    if (clientTs && clientTs === data.ts) {
      return res.status(200).json({ same: true });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
