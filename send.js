// api/send.js
// Called by the mobile upload page to store the image in Vercel KV
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, ts } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Missing image' });
    }

    // Store in KV — key is 'daap:latest', overwrites each time
    // TTL of 3600 seconds (1 hour) so old images clean themselves up
    await kv.set('daap:latest', { image, ts: ts || Date.now() }, { ex: 3600 });

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
