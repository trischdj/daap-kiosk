// api/analytics.js
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url:   process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const STATIC_KEYS = [
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

function last30Days() {
  const dates = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (req.query.key !== 'daap2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const dates = last30Days();
    const dateKeys = dates.flatMap(d => [
      `analytics:saves:${d}`,
      `analytics:prints:${d}`,
      `analytics:uploads:${d}`,
    ]);

    const allKeys = [...STATIC_KEYS, ...dateKeys];
    const values = await redis.mget(...allKeys);

    const data = {};
    allKeys.forEach((key, i) => {
      data[key] = values[i] ? parseInt(values[i], 10) : 0;
    });

    return res.status(200).json(data);
  } catch(e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
