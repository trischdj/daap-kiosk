// api/analytics.js
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const KEYS = [
  'analytics:total_saves',
  'analytics:total_prints',
  'analytics:total_uploads',
  'analytics:saves_with_photo',
  'analytics:prints_with_photo',
  'analytics:recipient:student',
  'analytics:recipient:faculty',
  'analytics:recipient:friend',
  'analytics:recipient:alumni',
  'analytics:message:THANKS!',
  'analytics:message:KUDOS!',
  'analytics:message:BRAVO!',
  'analytics:message:PROUD!',
  'analytics:program:fashion',
  'analytics:program:comdes',
  'analytics:program:inddes',
  'analytics:program:mdes',
];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (req.query.key !== 'daap2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const values = await redis.mget(...KEYS);
    const data = {};
    KEYS.forEach((key, i) => {
      data[key] = values[i] ? parseInt(values[i], 10) : 0;
    });
    return res.status(200).json(data);
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
