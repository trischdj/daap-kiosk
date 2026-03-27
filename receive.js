// api/receive.js
// Called by the kiosk every 3 seconds to check for a new image
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await redis.get('daap:latest');

    if (!data) {
      return res.status(200).json({ image: null, ts: null });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
